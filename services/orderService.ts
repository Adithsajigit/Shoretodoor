import { OrderSummary, CustomerDetails } from '../types';
import { collection, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { markLinkAsUsed } from '../lib/orderLinks';

export const submitOrder = async (orderData: { 
  summary: OrderSummary; 
  customer: CustomerDetails;
  orderToken?: string;
  remarks?: string;
}) => {
  try {
    // Save order to Firebase Firestore
    const ordersRef = collection(db, 'orders');
    const orderDoc = await addDoc(ordersRef, {
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        companyName: orderData.customer.companyName,
        address: orderData.customer.address
      },
      items: orderData.summary.items.map(item => ({
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
        totalWeight: orderData.summary.totalWeight,
        subtotal: orderData.summary.subtotal,
        tier: orderData.summary.tier
      },
      remarks: orderData.remarks || '',
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      orderToken: orderData.orderToken || null
    });

    // Mark the order link as used if a token was provided
    if (orderData.orderToken) {
      await markLinkAsUsed(orderData.orderToken);
    }

    // Send order confirmation email to customer via API route
    try {
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: orderData.customer.name,
          customerEmail: orderData.customer.email,
          customerPhone: orderData.customer.phone, // Add phone number for WhatsApp
          orderId: orderDoc.id,
          orderDocId: orderDoc.id, // Pass the document ID to save invoice URL
          orderTotal: orderData.summary.subtotal,
          totalWeight: orderData.summary.totalWeight,
          tier: orderData.summary.tier,
          items: orderData.summary.items.map(item => ({
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
          
          // Log WhatsApp status
          if (emailResult.whatsappSent) {
            console.log('WhatsApp message sent successfully');
          }
        } catch (updateError) {
          console.warn('Failed to save invoice URL client-side:', updateError);
        }
      }
      console.log('Order confirmation email request sent');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    // Also send to API endpoint if needed
    try {
      await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
    } catch (apiError) {
      console.log('API call failed, but order saved to Firebase:', apiError);
    }

    return { 
      success: true, 
      orderId: orderDoc.id,
      message: 'Order placed successfully' 
    };
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};