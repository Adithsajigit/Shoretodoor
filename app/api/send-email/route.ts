import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/emailService';
import { sendWhatsAppInvoice, sendOrderInvoiceTemplate } from '@/lib/whatsappService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { customerName, customerEmail, customerPhone, orderId, orderTotal, totalWeight, tier, items, orderDocId } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !orderId || !orderTotal || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendOrderConfirmationEmail({
      customerName,
      customerEmail,
      orderId,
      orderTotal,
      totalWeight,
      tier,
      items
    });

    // Send WhatsApp message with invoice if phone number is provided
    let whatsappResult = null;
    if (customerPhone) {
      try {
        // Format phone number: remove +, spaces, hyphens
        const formattedPhone = customerPhone.replace(/[\s\-\+]/g, '');
        
        // Use template-based message (works without 24-hour window)
        whatsappResult = await sendOrderInvoiceTemplate({
          customerName,
          customerPhone: formattedPhone,
          orderId,
          orderTotal,
          totalWeight,
          tier,
          invoiceUrl: result.invoiceUrl || '', // Not used in template version
          items: items
        });
        
        if (whatsappResult.success) {
          console.log('WhatsApp template sent successfully:', whatsappResult.data);
        } else {
          console.warn('WhatsApp template sending failed:', whatsappResult.error);
        }
      } catch (whatsappError) {
        console.error('WhatsApp error (continuing):', whatsappError);
        // Don't fail the whole request if WhatsApp fails
      }
    }

    // Best-effort: update order document with invoice URL if provided
    if (orderDocId && result.invoiceUrl) {
      try {
        const orderRef = doc(db, 'orders', orderDocId);
        await updateDoc(orderRef, {
          invoiceUrl: result.invoiceUrl,
          invoiceGeneratedAt: new Date()
        });
      } catch (firestoreError) {
        console.warn('Failed to attach invoice URL to order document (continuing):', firestoreError);
        // Continue responding success so the client can handle the update if needed
      }
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      invoiceUrl: result.invoiceUrl,
      whatsappSent: whatsappResult?.success || false
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
