# WhatsApp Business API Setup Guide

## Overview
This system sends invoice PDFs via WhatsApp when customers place orders, using the official Meta WhatsApp Business API (Cloud API).

## Prerequisites
- Meta Business Account
- WhatsApp Business Account
- Facebook Developer Account

## Step-by-Step Setup

### 1. Create a Meta App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as app type
4. Fill in app details and create

### 2. Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Select your Business Portfolio (or create one)

### 3. Get Your Credentials

#### A. Phone Number ID
1. Go to WhatsApp → Getting Started
2. You'll see a test phone number (starts with +1)
3. Copy the **Phone Number ID** (not the phone number itself)
   - Example: `123456789012345`
4. Add to `.env.local`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   ```

#### B. Access Token (Temporary for Testing)
1. In the same page, you'll see a **Temporary Access Token**
2. Copy this token
3. Add to `.env.local`:
   ```
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
   ```

**Note:** This token expires in 24 hours. For production, you need a permanent token (see Step 5).

#### C. Business Account ID
1. Go to WhatsApp → API Setup
2. Copy your **WhatsApp Business Account ID**
3. Add to `.env.local`:
   ```
   WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
   ```

### 4. Test with the Test Number

The test number can send messages to up to **5 verified numbers**:

1. In WhatsApp → Getting Started
2. Click "Send Message" 
3. Enter your phone number in international format (e.g., +919539087341)
4. You'll receive a code on WhatsApp
5. Enter the code to verify

Now you can test by placing an order with that verified phone number!

### 5. Get a Permanent Access Token (For Production)

#### Option A: Using System User (Recommended)
1. Go to [Meta Business Settings](https://business.facebook.com/settings/)
2. Click "Users" → "System Users"
3. Click "Add" → Create a system user
4. Click on the system user → "Add Assets"
5. Select your app → Give full control
6. Click "Generate Token"
7. Select permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
8. Copy the token (this never expires!)
9. Replace in `.env.local`:
   ```
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
   ```

#### Option B: Using Long-Lived User Token
1. Get a short-lived token from Graph API Explorer
2. Exchange it for a long-lived token (60 days)
3. Not recommended for production

### 6. Add Your Own Phone Number (Production)

1. Go to WhatsApp → Phone Numbers
2. Click "Add Phone Number"
3. Follow Meta's verification process:
   - You need a business phone number (not personal)
   - Verify via SMS or call
   - Complete business verification
4. Once approved, you can send to any number

**Note:** Business verification can take 1-3 days.

### 7. Pricing (As of December 2024)

WhatsApp charges **per conversation**:
- **User-initiated conversations**: FREE for 24 hours
- **Business-initiated conversations**: 
  - First 1,000 conversations/month: FREE
  - After that: ~$0.05 - $0.10 per conversation (varies by country)

**For India:**
- Authentication: ₹0.25 per conversation
- Marketing: ₹0.40 per conversation  
- Service: ₹0.15 per conversation
- Utility (like invoices): ₹0.15 per conversation

Your order confirmations count as **Utility conversations** = ₹0.15 each.

### 8. Environment Variables Summary

Add these to your `.env.local` file:

```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 9. Testing

1. Verify a test phone number (max 5 numbers)
2. Place an order with that phone number
3. Check server logs for:
   ```
   WhatsApp media uploaded, ID: xxx
   WhatsApp message sent: xxx
   ```
4. Customer receives WhatsApp with:
   - Order details
   - Invoice PDF attachment

### 10. Phone Number Format

The code automatically formats phone numbers, but customers should enter:
- **With country code**: +91 9539087341
- **Without +**: 919539087341
- **With spaces/hyphens**: +91-953-908-7341 (auto-cleaned)

All formats work!

### 11. Production Checklist

Before going live:
- [ ] Replace temporary token with permanent token
- [ ] Add your business phone number
- [ ] Complete Meta business verification
- [ ] Test with real customer phone numbers
- [ ] Monitor WhatsApp conversation usage in Meta Business Manager
- [ ] Set up billing in Meta Business Settings

### 12. Monitoring & Costs

Monitor usage:
1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Click "WhatsApp Manager"
3. View conversation analytics
4. Check billing under "Payment Settings"

### 13. Troubleshooting

**Error: "Access token expired"**
- Get a permanent token (see Step 5)

**Error: "Recipient phone number not a WhatsApp user"**
- Verify the number is using WhatsApp
- For test number, verify it first (Step 4)

**Error: "Media upload failed"**
- Check invoice file exists in `/public/invoices/`
- Verify file size < 100MB

**No message sent but no error**
- Check phone number format (should be: 919539087341)
- Verify WhatsApp credentials in `.env.local`

### 14. Useful Links

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [Meta Business Manager](https://business.facebook.com/)

---

## How It Works

1. Customer places order with phone number
2. System generates invoice PDF
3. Sends email with invoice
4. Uploads PDF to WhatsApp servers
5. Sends WhatsApp message with PDF attachment
6. Customer receives message with invoice

All automatic! No manual intervention needed. 🎉
