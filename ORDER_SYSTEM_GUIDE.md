# Order Management System

## 🛒 How Orders Work

### 1. Customer Places Order
When a customer with a valid order link clicks "Place Order":

**Order Data Saved to Firebase:**
```javascript
{
  customer: {
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 98765 43210",
    companyName: "Kumar Seafood Ltd",
    address: "123 Marine Drive, Kochi, Kerala - 682001"
  },
  items: [
    {
      productId: "1",
      productName: "King Fish",
      malayalamName: "നെയ്മീൻ",
      packaging: "Thermal Box",
      quantity: 5,
      price: 18,
      lineTotal: 90
    }
  ],
  summary: {
    totalWeight: 25.5,
    subtotal: 450.00,
    tier: "Gold",
    totalSavings: 25.50
  },
  status: "pending",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. Success Popup
After successful order placement, customer sees:
- ✅ **"Order Placed Successfully! 🎉"**
- Order total amount
- "What's Next?" message
- Close button

### 3. Order Storage
Orders are automatically saved to Firebase Firestore in the `orders` collection with:
- Complete customer details
- All order items with quantities and prices
- Order summary (weight, total, tier, savings)
- Status: "pending" (default)
- Timestamps (created and updated)

---

## 📊 Order Data Structure

### Collection: `orders`

| Field | Type | Description |
|-------|------|-------------|
| customer | Object | Full customer information |
| items | Array | List of ordered products |
| summary | Object | Order totals and tier info |
| status | String | Order status (pending, processing, completed, cancelled) |
| createdAt | Timestamp | When order was placed |
| updatedAt | Timestamp | Last modification time |

---

## 🔐 Security Rules

**Updated Firestore Rules Required:**

```javascript
// Orders collection
match /orders/{orderId} {
  allow read, update, delete: if isAdmin();
  allow create: if true; // Customers can create orders
}
```

This allows:
- ✅ Anyone to create orders (place orders)
- ✅ Only admins to read/update/delete orders
- ✅ Secure order data storage

---

## 🎯 Use Cases for Order Data

### 1. Order Management Dashboard
- View all orders
- Filter by status, customer, date
- Update order status
- Track order history

### 2. Customer History
- See what each customer has ordered
- Analyze buying patterns
- Offer personalized recommendations

### 3. Inventory Management
- Track popular products
- Monitor stock levels
- Forecast demand

### 4. Sales Analytics
- Revenue tracking
- Tier analysis
- Customer lifetime value

### 5. Delivery Planning
- Group orders by area
- Schedule deliveries
- Optimize routes

---

## 📋 Order Status Flow

```
pending → processing → out_for_delivery → delivered
          ↓
       cancelled
```

**Status Definitions:**
- **pending**: Order received, awaiting processing
- **processing**: Order being prepared
- **out_for_delivery**: Order dispatched
- **delivered**: Order completed
- **cancelled**: Order cancelled

---

## 🚀 Next Steps for Admin Panel

### View Orders Page (Future Enhancement)
```
/admin/orders
- List all orders
- Search and filter
- Update status
- View order details
- Print invoices
```

### Order Details View
```
/admin/orders/[orderId]
- Full order information
- Customer details
- Product list
- Status history
- Actions (update status, cancel, etc.)
```

### Analytics Dashboard
```
/admin/analytics
- Total revenue
- Orders by status
- Top products
- Customer insights
```

---

## 💾 Data Retention

All order data is:
- ✅ Permanently stored in Firestore
- ✅ Timestamped for tracking
- ✅ Linked to customer records
- ✅ Available for reporting and analysis
- ✅ Secure and backed up by Firebase

---

## 🔧 Testing

**To test order placement:**

1. Generate an order link for a customer
2. Open the link and add products to cart
3. Click "Place Order"
4. See success popup
5. Check Firebase Console → Firestore → `orders` collection
6. Verify order data is saved correctly

---

## 📞 Support

For order system questions: admin@shoretodoor.uk
