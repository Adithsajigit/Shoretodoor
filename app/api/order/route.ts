import { NextResponse } from 'next/server';
import { OrderSummary, CustomerDetails } from '../../../types';
import { collection, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { markLinkAsUsed } from '../../../lib/orderLinks';

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
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          orderId: orderDoc.id,
          orderDocId: orderDoc.id,
          orderTotal: summary.subtotal,
          totalWeight: summary.totalWeight,
          tier: summary.tier,
          items: summary.items.map(item => ({
            productName: item.product.englishName,
            malayalamName: item.product.malayalamName,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.lineTotal
          }))
        }),
      });
      
      const emailResult = await emailResponse.json().catch(() => ({ success: false }));

      if (emailResponse.ok && emailResult?.invoiceUrl) {
        try {
          await updateDoc(doc(db, 'orders', orderDoc.id), {
            invoiceUrl: emailResult.invoiceUrl,
            invoiceGeneratedAt: Timestamp.now()
          });
          console.log('Invoice URL saved to order document');
          
          if (emailResult.whatsappSent) {
            console.log('WhatsApp message sent successfully');
          }
        } catch (updateError) {
          console.warn('Failed to save invoice URL:', updateError);
        }
      }
      console.log('Order confirmation email request sent');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderDoc.id,
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
