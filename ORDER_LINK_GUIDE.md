# Order Link System - Complete Guide

## 🔗 How the Order Link System Works

### Overview
The order link system allows you to generate unique, time-limited links for specific customers to access the order form. Each link:
- Is unique and secure (32-character random token)
- Has a customizable expiration time (minutes, hours, or days)
- **Can only be used ONCE** - automatically becomes invalid after one order is placed
- Is tied to a specific customer
- Can be manually deactivated
- Is tracked in Firebase Firestore

---

## 📋 Step-by-Step Usage

### 1. Generate an Order Link for a Customer

1. **Login to Admin Panel**: Go to `/admin/login`
2. **Navigate to Customers**: Click "Customers" in the sidebar
3. **Find Your Customer**: Use search or scroll through the list
4. **Click "Generate Link"**: Click the link icon button next to the customer
5. **Set Duration**: 
   - Enter a number (e.g., 2, 24, 30)
   - Choose unit: Minutes, Hours, or Days
   - Example: "24 hours" or "2 days" or "30 minutes"
6. **Generate**: Click "Generate New Link" button
7. **Copy Link**: Click the "Copy" button to copy the link
8. **Share**: Send the link to your customer via email, WhatsApp, etc.

### 2. What the Customer Sees

When a customer clicks the link:
- **Valid Link**: They see the order form with their details pre-filled
- **After Placing Order**: The link is automatically marked as "used" and becomes invalid
- **Expired Link**: They see an error: "This link has expired"
- **Used Link**: They see an error: "This link has already been used"
- **Invalid Link**: They see an error: "Invalid link"

⚠️ **Important**: Each link can only be used to place ONE order. If the customer needs to place another order, you must generate a new link.

### 3. Link Management

**View Previous Links:**
- Click "Generate Link" on any customer
- Scroll down to see "Previous Links"
- See status: Active, Expired, Used, or Deactivated
- Copy active links again if needed

**Link Statuses:**
- 🟢 **Active**: Link is valid and can be used
- 🟡 **Expired**: Time limit has passed
- ⚫ **Used**: Customer has already placed an order (link automatically disabled)
- 🔴 **Deactivated**: Manually disabled by admin

---

## 🗄️ Database Structure

### Firebase Collections

**Collection: `orderLinks`**
```javascript
{
  customerId: "customer-id-123",
  customerName: "Rajesh Kumar",
  customerEmail: "rajesh@example.com",
  token: "aBc123xYz...32chars", // Unique random token
  expiresAt: Timestamp,
  createdAt: Timestamp,
  createdBy: "admin@shoretodoor.uk",
  isUsed: false,
  usedAt: null, // Set when customer places order
  isActive: true // Can be set to false to manually disable
}
```

---

## 🔒 Security Features

1. **Unique Tokens**: Each link has a 32-character random token (62^32 combinations)
2. **Time-Limited**: Links automatically expire after the set duration
3. **Single-Use Protection**: Links automatically become invalid after one order is placed
4. **Customer-Specific**: Each link is tied to a specific customer
5. **Admin-Only Generation**: Only admins can create links
6. **Manual Deactivation**: Admins can disable links anytime
7. **Audit Trail**: Track who created each link and when
8. **Automatic Link Invalidation**: When a customer places an order:
   - The `isUsed` field is set to `true`
   - The `usedAt` timestamp is recorded
   - Future validation checks reject the link
   - Customer sees "This link has already been used" error

---

## 🌐 Link Format

```
https://yourdomain.com/order/aBc123xYz789...32chars
```

**Example:**
```
http://localhost:3000/order/kJ8hNm2pQ5wX9vR3sT6uY4zA1bC7dE0f
```

---

## 📊 Common Use Cases

### Case 1: Regular Customer - 24 Hour Link
```
Duration: 24 hours
Use: Give customer a day to review and place order
Note: Link becomes invalid after first order is placed
```

### Case 2: Quick Order - 30 Minute Link
```
Duration: 30 minutes
Use: For customers on phone who want to order immediately
Note: Link becomes invalid after first order is placed
```

### Case 3: Event/Bulk Order - 7 Day Link
```
Duration: 7 days
Use: For customers planning large orders or events
Note: Link becomes invalid after first order is placed
```

### Case 4: Multiple Orders from Same Customer
```
Solution: Generate a NEW link for each order
Process: 
1. Customer places first order (link becomes invalid)
2. Admin generates new link for second order
3. Customer receives new link and places second order
4. Repeat as needed
```

---

## 🛠️ Future Enhancements (Coming Soon)

- ✅ Email integration: Automatically send links via email
- ✅ WhatsApp integration: Share links directly to WhatsApp
- ✅ Link usage analytics: Track click rates and conversion
- ✅ Bulk link generation: Create links for multiple customers
- ✅ Link templates: Preset durations (1 hour, 24 hours, 7 days)
- ✅ SMS notifications: Send links via SMS
- ✅ Link renewal: Extend expiration of active links

---

## 🐛 Troubleshooting

### Link Not Working?

**Check:**
1. Has the link expired? (Check expiration time)
2. Has the link been used already? (Customer placed an order)
3. Was the link deactivated manually?
4. Is the customer copying the full link? (All 32 characters)

**Solution for "Link Already Used":**
- Generate a NEW link for the customer if they need to place another order
- Each link can only be used once for security reasons

### Can't Generate Link?

**Check:**
1. Are you logged in as admin?
2. Are Firestore security rules set up correctly?
3. Is the customer record complete?

### Customer Can't Place Order?

**Check:**
1. Is the link still active and not used?
2. Is the link expired?
3. Are items added to the cart?
4. Is Firebase connection working?

**Note**: After successfully placing one order, the link will become invalid. Generate a new link for subsequent orders.
3. Is there an internet connection?
4. Check browser console for errors

### Customer Can't Access Link?

**Verify:**
1. Full link was shared (not truncated)
2. Link hasn't expired yet
3. Customer is using a modern browser
4. No firewall blocking the domain

---

## 📱 Mobile Access

Links work perfectly on mobile devices:
- ✅ Smartphones (iOS/Android)
- ✅ Tablets
- ✅ Desktop browsers
- ✅ Email clients
- ✅ WhatsApp/Telegram/other messaging apps

---

## 💡 Best Practices

1. **Set Appropriate Durations**:
   - New customers: 48-72 hours
   - Regular customers: 24 hours
   - Urgent orders: 1-2 hours

2. **Track Link Usage**:
   - Check "Previous Links" regularly
   - Monitor which customers use links vs let them expire

3. **Secure Sharing**:
   - Share links through secure channels (email, WhatsApp)
   - Don't post links publicly

4. **Clean Up**:
   - Old expired links are kept for records
   - No need to manually delete them

5. **Customer Communication**:
   - Tell customers the link expiration time
   - Mention it's a one-time use link
   - Provide support contact if issues arise

---

## 🔄 Integration with Order System

Once customer accesses valid link:
1. Link is validated
2. Customer info is loaded
3. Customer sees personalized order form
4. After order placement, link is marked as "used"
5. Same link can't be used again

---

## 📈 Analytics (Future)

Track:
- Total links generated
- Links used vs expired
- Average time to use link
- Most popular link durations
- Customer order completion rate

---

For support or questions, contact: admin@shoretodoor.uk
