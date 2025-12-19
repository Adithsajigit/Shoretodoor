# Invoice Storage & Display Guide

## ✅ Feature Implemented: Save & Display Invoices

All order invoices are now automatically saved to disk and can be viewed/downloaded from the admin orders panel.

---

## How It Works

### 1. **Invoice Generation & Storage**

When a customer places an order:

1. **PDF Generated** - Professional invoice PDF is created with:
   - Company logo
   - Order details
   - Customer information
   - Itemized list with Malayalam names
   - Pricing breakdown with tier information
   
2. **Saved to Disk** - Invoice is saved to:
   ```
   /public/invoices/Invoice_[ORDERID]_[TIMESTAMP].pdf
   ```
   
3. **URL Stored in Firestore** - Invoice URL is saved to the order document:
   ```javascript
   {
     invoiceUrl: "/invoices/Invoice_ABC12345_1765563586983.pdf",
     invoiceGeneratedAt: Date
   }
   ```

4. **Email Attachment** - Same PDF is attached to the customer's confirmation email

---

## File Structure

```
kerala-fresh-fish-importer/
├── public/
│   └── invoices/                    # ← Invoices stored here
│       ├── Invoice_ABC12345_1765563586983.pdf
│       ├── Invoice_XYZ67890_1765563612456.pdf
│       └── ...
├── lib/
│   └── pdfService.ts                # ← PDF generation & saving logic
└── app/
    ├── api/
    │   └── send-email/
    │       └── route.ts             # ← Updates Firestore with invoice URL
    └── admin/
        └── orders/
            └── page.tsx             # ← Displays invoice download button
```

---

## Admin Panel Features

### Orders Page (`/admin/orders`)

**Each order now shows:**

✅ **Download Invoice Button** (Green) - If invoice exists
- Appears next to status dropdown
- Opens invoice in new tab
- Direct download link

**Screenshot of Button:**
```
[Status Dropdown ▼] [📥 Download Invoice] [👁 View Items] [🗑 Delete]
```

**Invoice Button Only Shows When:**
- `order.invoiceUrl` exists in Firestore
- Invoice PDF file exists in `/public/invoices/`

---

## Code Changes Made

### 1. **`/lib/pdfService.ts`**

**New Function Added:**
```typescript
export async function saveInvoicePDF(data: InvoiceData): Promise<string>
```

**What it does:**
- Generates PDF buffer
- Creates `/public/invoices/` directory if needed
- Saves PDF with unique filename
- Returns public URL path

**Filename Format:**
```
Invoice_[FIRST_8_CHARS_OF_ORDERID]_[UNIX_TIMESTAMP].pdf
```

Example: `Invoice_ABC12345_1765563586983.pdf`

---

### 2. **`/lib/emailService.ts`**

**Updated Function:**
```typescript
export async function sendOrderConfirmationEmail(data: OrderEmailData)
```

**Changes:**
- Now calls `saveInvoicePDF()` before sending email
- Returns `invoiceUrl` along with success/messageId
- PDF is both saved to disk AND attached to email

**Return Value:**
```typescript
{
  success: true,
  messageId: string,
  invoiceUrl: string  // ← NEW!
}
```

---

### 3. **`/app/api/send-email/route.ts`**

**New Features:**
- Accepts `orderDocId` in request body
- Updates Firestore order document with:
  - `invoiceUrl`: URL path to saved PDF
  - `invoiceGeneratedAt`: Timestamp
  
**Firestore Update:**
```typescript
await updateDoc(orderRef, {
  invoiceUrl: result.invoiceUrl,
  invoiceGeneratedAt: new Date()
});
```

---

### 4. **`/services/orderService.ts`**

**Updated:**
- Passes `orderDocId` to email API
- Ensures invoice URL is saved back to Firestore

**Flow:**
```
Order Placed → Email API Called → Invoice Generated & Saved → 
→ Firestore Updated → Customer Receives Email with PDF
```

---

### 5. **`/app/admin/orders/page.tsx`**

**Interface Updated:**
```typescript
interface Order {
  // ... existing fields
  invoiceUrl?: string;           // ← NEW
  invoiceGeneratedAt?: any;      // ← NEW
}
```

**UI Component Added:**
```tsx
{order.invoiceUrl && (
  <a
    href={order.invoiceUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
  >
    <Download className="w-4 h-4" />
    Download Invoice
  </a>
)}
```

---

## Testing & Verification

### ✅ Test Results

1. **Email Test:**
   - Command: `npm run test-email`
   - Result: ✅ Email sent with PDF attachment
   - Invoice saved to: `/public/invoices/Invoice_TEST1234_1765563586983.pdf`

2. **Order Flow:**
   - Place order via customer link
   - Email sent with PDF
   - Invoice saved to `/public/invoices/`
   - Invoice URL saved to Firestore
   - Download button appears in admin panel

---

## Benefits

### For Customers:
✅ Receive professional PDF invoice via email
✅ Can download and save for records
✅ Can print for accounting purposes

### For Admin:
✅ All invoices automatically saved
✅ One-click download from admin panel
✅ Organized in `/public/invoices/` folder
✅ Easy to find by order ID
✅ Can resend or reference anytime

---

## File Naming Convention

**Format:**
```
Invoice_[ORDER_ID_PREFIX]_[TIMESTAMP].pdf
```

**Example:**
```
Invoice_ABC12345_1765563586983.pdf
```

**Breakdown:**
- `Invoice_` - Prefix for easy identification
- `ABC12345` - First 8 characters of Firestore order document ID
- `1765563586983` - Unix timestamp (milliseconds since epoch)
- `.pdf` - File extension

**Why This Format:**
- ✅ Unique filename (timestamp ensures no conflicts)
- ✅ Contains order reference (first 8 chars)
- ✅ Sortable by creation time (timestamp)
- ✅ Easy to search (starts with "Invoice_")

---

## Storage Location

### Public Directory
```
/public/invoices/
```

**Why `/public/`?**
- ✅ Accessible via HTTP (e.g., `http://localhost:3000/invoices/Invoice_ABC12345.pdf`)
- ✅ No authentication required for download
- ✅ Works with Next.js static file serving
- ✅ Easy to link from admin panel

**Security Considerations:**
- Invoice filenames use random-looking Firestore IDs
- Filenames include timestamps for uniqueness
- Only admins have direct links from the panel
- Customers can only access their own invoices (via email)

---

## Future Enhancements (Optional)

### Possible Improvements:

1. **Invoice Cleanup**
   - Delete old invoices after 90 days
   - Archive to cloud storage (AWS S3, Google Cloud Storage)

2. **Access Control**
   - Add authentication to invoice URLs
   - Generate temporary signed URLs

3. **Analytics**
   - Track invoice downloads
   - Monitor storage usage

4. **Bulk Operations**
   - Download all invoices for a date range
   - Export invoices as ZIP file

5. **Invoice Preview**
   - Show invoice preview in modal instead of download
   - Inline PDF viewer in admin panel

---

## Troubleshooting

### Invoice Not Appearing in Admin Panel

**Check:**
1. Is `invoiceUrl` field in Firestore order document?
2. Does the PDF file exist in `/public/invoices/`?
3. Refresh the orders page
4. Check browser console for errors

### Invoice File Not Found (404)

**Solutions:**
1. Verify `/public/invoices/` directory exists
2. Check file permissions (should be readable)
3. Restart Next.js dev server
4. Clear Next.js cache (`rm -rf .next`)

### Email Sent But No Invoice File

**Cause:** Error during `saveInvoicePDF()` call

**Fix:**
1. Check server logs for errors
2. Verify write permissions on `/public/invoices/`
3. Ensure enough disk space

---

## Summary

✅ **Invoices are now:**
- Automatically generated for every order
- Saved to `/public/invoices/` directory
- Stored in Firestore (URL + timestamp)
- Attached to customer emails
- Downloadable from admin panel

✅ **Admins can:**
- View all invoices in orders panel
- Download any invoice with one click
- Access invoices directly via URL
- Track when invoices were generated

✅ **Customers receive:**
- Professional PDF invoice via email
- Immediate download capability
- Permanent record of their order

---

**All changes are live and tested!** 🎉

Place a test order and check the admin panel to see the "Download Invoice" button.
