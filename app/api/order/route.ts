import { NextResponse } from 'next/server';
import { OrderSummary, CustomerDetails } from '../../../types';
import { collection, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { markLinkAsUsed } from '../../../lib/orderLinks';
import { sendOrderConfirmationEmail } from '../../../lib/emailService';
import { sendOrderInvoiceTemplate } from '../../../lib/whatsappService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summary, customer, orderToken, remarks } = body as { 
      summary: OrderSummary; 
      customer: CustomerDetails;
      orderToken?: string;
      remarks?: string;
    };

    console.log('--- SERVER SIDE ORDER RECEIVED ---');
    console.log('Customer:', customer.email);
    console.log('Total Items:', summary.items.length);
    console.log('Total Weight:', summary.totalWeight);
    console.log('Order Token:', orderToken);

    // Save order to Firebase Firestore (server-side with admin privileges)
    const ordersRef = collection(db, 'orders');
    const orderDoc = await addDoc(ordersRef, {
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName,
        address: customer.address
      },
      items: summary.items.map(item => ({
        productId: item.productId,
        productName: item.product.englishName,
        malayalamName: item.product.malayalamName,
        preparation: item.product.preparation,
        packaging: item.product.packaging,
        quantity: item.quantity,
        price: item.price,
        lineTotal: item.lineTotal
      })),
      summary: {
        totalWeight: summary.totalWeight,
        subtotal: summary.subtotal,
        tier: summary.tier
      },
      remarks: remarks || '',
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      orderToken: orderToken || null
    });

    console.log('Order saved to Firestore with ID:', orderDoc.id);

    // Mark the order link as used if a token was provided
    if (orderToken) {
      try {
        await markLinkAsUsed(orderToken);
        console.log('Order link marked as used');
      } catch (linkError) {
        console.error('Failed to mark link as used:', linkError);
        // Don't fail the order if marking link fails
      }
    }

    // Send order confirmation email to customer
    let invoiceUrl = '';
    let whatsappSent = false;
    
    console.log('=== Starting Email & WhatsApp Process ===');
    console.log('Customer Email:', customer.email);
    console.log('Customer Phone:', customer.phone);
    console.log('SMTP_USER configured:', !!process.env.SMTP_USER);
    console.log('SMTP_PASS configured:', !!process.env.SMTP_PASS);
    console.log('WHATSAPP_ACCESS_TOKEN configured:', !!process.env.WHATSAPP_ACCESS_TOKEN);
    
    try {
      console.log('Calling sendOrderConfirmationEmail...');
      const emailResult = await sendOrderConfirmationEmail({
        customerName: customer.name,
        customerEmail: customer.email,
        orderId: orderDoc.id,
        orderTotal: summary.subtotal,
        totalWeight: summary.totalWeight,
        tier: summary.tier,
        items: summary.items.map(item => ({
          productName: item.product.englishName,
          malayalamName: item.product.malayalamName || '',
          quantity: item.quantity,
          price: item.price,
          lineTotal: item.lineTotal
        }))
      });

      if (emailResult.success && emailResult.invoiceUrl) {
        invoiceUrl = emailResult.invoiceUrl;
        console.log('Email sent successfully, invoice URL:', invoiceUrl);
        
        // Update order document with invoice URL
        try {
          await updateDoc(doc(db, 'orders', orderDoc.id), {
            invoiceUrl: invoiceUrl,
            invoiceGeneratedAt: Timestamp.now()
          });
          console.log('Invoice URL saved to order document');
        } catch (updateError) {
          console.warn('Failed to save invoice URL:', updateError);
        }

        // Send WhatsApp message if phone number is provided
        if (customer.phone) {
          try {
            console.log('Sending WhatsApp message...');
            const whatsappResult = await sendOrderInvoiceTemplate({
              customerName: customer.name,
              customerPhone: customer.phone,
              orderId: orderDoc.id,
              orderTotal: summary.subtotal,
              totalWeight: summary.totalWeight,
              tier: summary.tier,
              invoiceUrl: invoiceUrl,
              items: summary.items.map(item => ({
                productName: item.product.englishName,
                malayalamName: item.product.malayalamName || '',
                quantity: item.quantity,
                price: item.price,
                lineTotal: item.lineTotal
              }))
            });

            if (whatsappResult.success) {
              whatsappSent = true;
              console.log('WhatsApp message sent successfully');
            } else {
              console.warn('WhatsApp sending failed:', whatsappResult.error);
            }
          } catch (whatsappError) {
            console.error('WhatsApp error (continuing):', whatsappError);
          }
        }
      }
    } catch (emailError: any) {
      console.error('=== EMAIL ERROR ===');
      console.error('Error Type:', emailError.constructor.name);
      console.error('Error Message:', emailError.message);
      console.error('Error Stack:', emailError.stack);
      console.error('Full Error:', JSON.stringify(emailError, null, 2));
      // Don't fail the order if email fails
    }

    console.log('=== Email & WhatsApp Process Complete ===');
    console.log('Invoice URL:', invoiceUrl || 'NOT GENERATED');
    console.log('WhatsApp Sent:', whatsappSent);

    return NextResponse.json({ 
      success: true, 
      orderId: orderDoc.id,
      invoiceUrl: invoiceUrl,
      whatsappSent: whatsappSent,
      message: 'Order processed successfully' 
    });

  } catch (error) {
    console.error('Order processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process order';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
