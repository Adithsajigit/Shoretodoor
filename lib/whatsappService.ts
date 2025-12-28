import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface WhatsAppMessageData {
  customerName: string;
  customerPhone: string; // Should be in format: 919539087341 (country code + number, no + or spaces)
  orderId: string;
  orderTotal: number;
  totalWeight: number;
  tier: string;
  invoiceUrl: string; // Local file path to invoice PDF
  items?: Array<{
    productName: string;
    malayalamName?: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
}

interface WhatsAppTemplateData {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: Array<{ type: string; text: string }>;
}

const formatPhoneNumber = (phone: string) =>
  phone.replace(/[^0-9]/g, '');

export async function sendWhatsAppInvoice(data: WhatsAppMessageData) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return { success: false, error: 'WhatsApp credentials missing' };
    }

    console.log('Sending WhatsApp to:', data.customerPhone);

    // Step 1: Upload the invoice PDF to WhatsApp
    // In production (Vercel), invoiceUrl is the actual file path in /tmp
    // In local development, it's a public URL path
    let invoiceFilePath: string;
    
    if (data.invoiceUrl.startsWith('/tmp/')) {
      // Production: Direct file path
      invoiceFilePath = data.invoiceUrl;
    } else {
      // Local development: Convert public URL to file path
      invoiceFilePath = path.join(process.cwd(), 'public', data.invoiceUrl.replace(/^\//, ''));
    }
    
    console.log('[WhatsApp] Invoice file path:', invoiceFilePath);
    
    if (!fs.existsSync(invoiceFilePath)) {
      console.error('[WhatsApp] Invoice file not found:', invoiceFilePath);
      return { success: false, error: 'Invoice file not found' };
    }

    console.log('[WhatsApp] Uploading invoice from:', invoiceFilePath);

    // Upload media to WhatsApp
    const formData = new FormData();
    formData.append('file', fs.createReadStream(invoiceFilePath));
    formData.append('type', 'application/pdf');
    formData.append('messaging_product', 'whatsapp');

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const mediaId = uploadResponse.data.id;
    console.log('[WhatsApp] Media uploaded, ID:', mediaId);

    // Step 2: Send message with the invoice PDF
    // Using a simple text message first, then the document
    // This approach works better with WhatsApp Business API limits
    
    // Construct a beautiful caption
    let caption = `*🌊 Shore to Door - Order Confirmation*\n\n`;
    caption += `Hi *${data.customerName}*! 👋\n`;
    caption += `Thank you for choosing us! Here is your order summary:\n\n`;
    caption += `*🆔 Order ID:* \`${data.orderId}\`\n`;
    
    if (data.items && data.items.length > 0) {
      caption += `\n*🛒 Your Items:*\n`;
      data.items.forEach(item => {
        const name = item.malayalamName 
          ? `${item.productName} (${item.malayalamName})`
          : item.productName;
        caption += `• ${name}\n  ${item.quantity}kg x £${item.price.toFixed(2)} = £${item.lineTotal.toFixed(2)}\n`;
      });
    }

    caption += `\n*📊 Summary:*\n`;
    caption += `📦 Total Weight: *${data.totalWeight}kg*\n`;
    caption += `🏷️ Tier: *${data.tier}*\n`;
    caption += `💰 *Grand Total: £${data.orderTotal.toFixed(2)}*\n\n`;
    caption += `Your detailed invoice is attached below. 📄`;

    const messagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: data.customerPhone,
      type: 'document',
      document: {
        id: mediaId,
        filename: `Invoice_${data.orderId}.pdf`,
        caption: caption,
      },
    };

    const messageResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log('WhatsApp message sent successfully:', messageResponse.data);

    return {
      success: true,
      messageId: messageResponse.data.messages[0].id,
      mediaId: mediaId,
    };

  } catch (error: any) {
    console.error('WhatsApp sending failed:', error.response?.data || error.message);
    
    // Provide more helpful error messages
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      console.error('WhatsApp Error Details:', {
        code: errorData.code,
        message: errorData.message,
        type: errorData.type,
        errorSubcode: errorData.error_subcode,
        fbtrace_id: errorData.fbtrace_id
      });
    }
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      errorDetails: error.response?.data
    };
  }
}

export async function sendWhatsAppTemplate(data: WhatsAppTemplateData) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return { success: false, error: 'WhatsApp credentials missing' };
    }

    const messagePayload: any = {
      messaging_product: 'whatsapp',
      to: data.to,
      type: 'template',
      template: {
        name: data.templateName,
        language: {
          code: data.languageCode || 'en_US'
        }
      }
    };

    // Add parameters if provided
    if (data.parameters && data.parameters.length > 0) {
      messagePayload.template.components = [
        {
          type: 'body',
          parameters: data.parameters
        }
      ];
    }

  console.log('[WhatsApp] Template payload:', JSON.stringify(messagePayload));

    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log('[WhatsApp] Template send success:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorPayload = error.response?.data || error.message;
    const err = error.response?.data?.error;
    console.error('[WhatsApp] Template sending failed:', errorPayload);
    if (err) {
      console.error('[WhatsApp] Error details:', {
        code: err.code,
        message: err.message,
        type: err.type,
        subcode: err.error_subcode,
        fbtrace_id: err.fbtrace_id
      });
    }
    return { success: false, error: err?.message || error.message, rawError: err || errorPayload };
  }
}

export async function sendOrderInvoiceTemplate(data: WhatsAppMessageData) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return { success: false, error: 'WhatsApp credentials missing' };
    }

    const formattedPhone = formatPhoneNumber(data.customerPhone);
    console.log('[WhatsApp] Preparing template send');
    console.log('[WhatsApp] Raw phone:', data.customerPhone);
    console.log('[WhatsApp] Formatted phone:', formattedPhone);
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'purchase_receipt_1';
  const primaryLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';
  const fallbackLanguages = ['en_US', 'en_GB', 'en', 'en_IN'];
  const languagesToTry = Array.from(new Set([primaryLanguage, ...fallbackLanguages]));
    console.log('[WhatsApp] Template:', templateName);
    console.log('[WhatsApp] Languages to try:', languagesToTry);
    console.log('[WhatsApp] Parameters:', {
      name: data.customerName,
      orderId: data.orderId,
      total: data.orderTotal,
      weight: data.totalWeight,
      tier: data.tier
    });

    let lastResult: any = null;
    for (const language of languagesToTry) {
      console.log(`[WhatsApp] Attempting template send with language ${language}...`);
      const attempt = await sendWhatsAppTemplate({
        to: formattedPhone,
        templateName,
        languageCode: language,
        parameters: [
          { type: 'text', text: data.customerName },
          { type: 'text', text: data.orderId },
          { type: 'text', text: data.orderTotal.toFixed(2) },
          { type: 'text', text: data.totalWeight.toString() },
          { type: 'text', text: data.tier }
        ]
      });

      console.log(`[WhatsApp] Result for language ${language}:`, attempt);
      if (attempt.success) {
        return attempt;
      }

      lastResult = attempt;
      const errorCode = attempt.rawError?.code;
      const errorMessage: string = attempt.rawError?.message || '';
      const missingTranslation = errorCode === 132001 || /does not exist in/i.test(errorMessage);
      if (!missingTranslation) {
        console.log('[WhatsApp] Non-translation error encountered, stopping retries.');
        break;
      }
    }

    console.log('[WhatsApp] All template language attempts failed.');
    return lastResult || { success: false, error: 'Template send failed with all languages' };

  } catch (error: any) {
    console.error('WhatsApp template sending failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}
