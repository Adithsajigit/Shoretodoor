import nodemailer from 'nodemailer';
import { generateInvoicePDF, saveInvoicePDF } from './pdfService';

// Create reusable transporter (lazy initialization)
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error('SMTP credentials not configured. Check your .env.local file.');
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false // For development/testing
      }
    });
  }
  return transporter;
};

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderTotal: number;
  totalWeight: number;
  tier: string;
  items: Array<{
    productName: string;
    malayalamName: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    console.log('[EmailService] Starting sendOrderConfirmationEmail');
    console.log('[EmailService] Data received:', {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      orderId: data.orderId,
      orderTotal: data.orderTotal,
      itemsCount: data.items.length
    });

    console.log('[EmailService] Getting transporter...');
    const transporter = getTransporter();
    console.log('[EmailService] Transporter obtained');
    
    // Generate PDF invoice and save it
    console.log('[EmailService] Saving invoice PDF...');
    const invoiceUrl = await saveInvoicePDF({
      orderId: data.orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      orderDate: new Date(),
      items: data.items,
      totalWeight: data.totalWeight,
      subtotal: data.orderTotal,
      tier: data.tier
    });
    
    console.log('[EmailService] Invoice PDF saved:', invoiceUrl);
    
    // Generate PDF buffer for email attachment
    console.log('[EmailService] Generating PDF buffer for attachment...');
    const pdfBuffer = await generateInvoicePDF({
      orderId: data.orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      orderDate: new Date(),
      items: data.items,
      totalWeight: data.totalWeight,
      subtotal: data.orderTotal,
      tier: data.tier
    });

    console.log('[EmailService] PDF buffer generated, size:', pdfBuffer.length, 'bytes');
    console.log('[EmailService] Building email HTML...');

    const itemsHtml = data.items.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px;">
          <strong>${item.productName}</strong><br>
          <span style="color: #64748b; font-size: 14px;">${item.malayalamName}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center;">${item.quantity} kg</td>
        <td style="padding: 12px 8px; text-align: right;">£${item.price.toFixed(2)}/kg</td>
        <td style="padding: 12px 8px; text-align: right;"><strong>£${item.lineTotal.toFixed(2)}</strong></td>
      </tr>
    `).join('');

    const mailOptions = {
      from: {
        name: 'Shore to Door',
        address: process.env.SMTP_USER || 'noreply@shoretodoor.uk'
      },
      to: data.customerEmail,
      subject: `Order Confirmation - Thank You! (Order #${data.orderId.slice(0, 8).toUpperCase()})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                      <img src="cid:logo" alt="Shore to Door Logo" style="max-width: 120px; height: auto; margin-bottom: 20px;" />
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Order Placed Successfully!</h1>
                      <p style="margin: 10px 0 0 0; color: #e0f2fe; font-size: 16px;">Thank you for your order, ${data.customerName}!</p>
                    </td>
                  </tr>

                  <!-- Success Message -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f0fdfa; border-bottom: 3px solid #14b8a6;">
                      <div style="display: inline-block; background-color: #14b8a6; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">✓</div>
                      <p style="margin: 0 0 8px 0; color: #0f766e; font-size: 18px; font-weight: 600;">Your order has been received and is being processed</p>
                      <p style="margin: 0; color: #14b8a6; font-size: 14px;">📎 Invoice PDF is attached to this email</p>
                    </td>
                  </tr>

                  <!-- Order Summary -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Order Summary</h2>
                      
                      <table style="width: 100%; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 8px 0; color: #64748b;">Order ID:</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1e293b;">#${data.orderId.slice(0, 8).toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b;">Total Weight:</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1e293b;">${data.totalWeight.toFixed(1)} kg</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b;">Pricing Tier:</td>
                          <td style="padding: 8px 0; text-align: right;">
                            <span style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 14px;">${data.tier}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; font-size: 18px; font-weight: 600;">Total Amount:</td>
                          <td style="padding: 8px 0; text-align: right; font-size: 28px; font-weight: bold; color: #0ea5e9;">£${data.orderTotal.toFixed(2)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Order Items</h3>
                      <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #e2e8f0;">
                            <th style="padding: 12px 8px; text-align: left; color: #475569; font-size: 14px;">Product</th>
                            <th style="padding: 12px 8px; text-align: center; color: #475569; font-size: 14px;">Quantity</th>
                            <th style="padding: 12px 8px; text-align: right; color: #475569; font-size: 14px;">Price</th>
                            <th style="padding: 12px 8px; text-align: right; color: #475569; font-size: 14px;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <!-- Invoice PDF Note -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">📎 Your detailed invoice is attached to this email as a PDF</p>
                        <p style="margin: 8px 0 0 0; color: #3b82f6; font-size: 14px;">Please save it for your records</p>
                      </div>
                    </td>
                  </tr>

                  <!-- What's Next Section -->
                  <tr>
                    <td style="padding: 30px; background-color: #eff6ff; border-top: 2px solid #bfdbfe;">
                      <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 20px;">📦 What's Next?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8;">
                        <li>We'll review your order and confirm availability</li>
                        <li>Our team will prepare your fresh fish order</li>
                        <li>You'll receive delivery details via email</li>
                        <li>We'll contact you if we need any clarification</li>
                      </ul>
                    </td>
                  </tr>

                  <!-- Contact Section -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f8fafc;">
                      <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">Need help with your order?</p>
                      <p style="margin: 0; color: #0ea5e9; font-weight: 600; font-size: 16px;">
                        📧 ${process.env.SMTP_USER}<br>
                        📱 Contact your sales representative
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white;">
                      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Shore to Door</p>
                      <p style="margin: 0; color: #94a3b8; font-size: 14px;">Premium Kerala Fresh Fish Importer</p>
                      <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">
                        This is an automated confirmation email. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Order Placed Successfully!

Thank you for your order, ${data.customerName}!

═══════════════════════════════════════════════════════════
                         INVOICE
Order #${data.orderId.slice(0, 8).toUpperCase()}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
Status: PENDING
═══════════════════════════════════════════════════════════

BILL TO:
${data.customerName}
${data.customerEmail}

───────────────────────────────────────────────────────────
ITEM DESCRIPTION                QTY      RATE        AMOUNT
───────────────────────────────────────────────────────────
${data.items.map(item => 
  `${item.productName} (${item.malayalamName})
                                ${item.quantity} kg   £${item.price.toFixed(2)}/kg   £${item.lineTotal.toFixed(2)}`
).join('\n\n')}
───────────────────────────────────────────────────────────

INVOICE SUMMARY:
Subtotal:              £${data.orderTotal.toFixed(2)}
Total Weight:          ${data.totalWeight.toFixed(1)} kg
Pricing Tier:          ${data.tier}

═══════════════════════════════════════════════════════════
TOTAL AMOUNT:          £${data.orderTotal.toFixed(2)}
═══════════════════════════════════════════════════════════

PAYMENT TERMS:
Payment details and terms will be provided separately.
This invoice is for your records.

NOTES:
- All prices are in GBP (£)
- Fresh fish products subject to availability
- We will contact you to confirm your order

───────────────────────────────────────────────────────────

WHAT'S NEXT?
------------
- We'll review your order and confirm availability
- Our team will prepare your fresh fish order
- You'll receive delivery details via email
- We'll contact you if we need any clarification

Need help? Contact us at ${process.env.SMTP_USER}

Shore to Door - Premium Kerala Fresh Fish Importer
      `,
      attachments: [
        {
          filename: `Invoice_${data.orderId.slice(0, 8).toUpperCase()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        },
        {
          filename: 'logo.png',
          path: './logo.PNG',
          cid: 'logo' // Content ID for embedding in email
        }
      ]
    };

    console.log('[EmailService] Sending email to:', data.customerEmail);
    console.log('[EmailService] Email subject:', mailOptions.subject);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Email sent successfully! MessageId:', info.messageId);
    console.log('[EmailService] Response:', info.response);
    
    return { success: true, messageId: info.messageId, invoiceUrl };
  } catch (error: any) {
    console.error('[EmailService] ERROR sending email:');
    console.error('[EmailService] Error Type:', error.constructor?.name);
    console.error('[EmailService] Error Message:', error.message);
    console.error('[EmailService] Error Code:', error.code);
    console.error('[EmailService] Error Stack:', error.stack);
    throw error;
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('SMTP connection successful');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}
