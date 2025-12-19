# Orders Dashboard Guide

## Overview
The Orders Dashboard allows you to view, manage, and track all customer orders in one centralized location.

## Accessing the Orders Dashboard

### URL
- **Development**: http://localhost:3001/admin/orders
- Navigate from Admin Dashboard or Customers page using the "Orders" button in the header

### Authentication Required
- Only admin users (admin@shoretodoor.uk) can access the orders dashboard
- Must be logged in to the admin panel

## Features

### 1. **Overview Statistics**
Four key metrics displayed at the top:
- **Total Orders**: Count of filtered orders
- **Total Revenue**: Sum of all order subtotals (£)
- **Total Weight**: Combined weight of all orders (kg)
- **Pending Orders**: Count of orders awaiting processing

### 2. **Search & Filters**

#### Search Bar
Search orders by:
- Customer name
- Email address
- Phone number
- Company name
- Order ID

#### Status Filter
Filter orders by status:
- **All Status**: View all orders
- **Pending**: Newly placed orders
- **Processing**: Orders being prepared
- **Out for Delivery**: Orders in transit
- **Delivered**: Completed orders
- **Cancelled**: Cancelled orders

#### Refresh Button
- Manually reload orders from Firebase
- Shows spinning icon during refresh

### 3. **Order Cards**

Each order displays:

#### Header Section
- Customer name with status badge
- Company name, email, and phone
- Order ID (for reference)
- Total amount (£)
- Total weight (kg) and pricing tier
- Order creation date/time

#### Status Badge
Color-coded status indicators:
- 🟡 **Pending**: Yellow
- 🔵 **Processing**: Blue
- 🟣 **Out for Delivery**: Purple
- 🟢 **Delivered**: Green
- 🔴 **Cancelled**: Red

#### Quick Actions
- **Status Dropdown**: Change order status instantly
- **View/Hide Items**: Toggle order details
- **Delete**: Remove order (with confirmation)

### 4. **Order Details (Expandable)**

Click "View Items" to see:

#### Items List
For each product:
- Product name (English & Malayalam)
- Packaging type (Thermal/Vacuum)
- Quantity ordered (kg)
- Price per kg (£)
- Line total (£)

#### Delivery Address
Complete shipping address for the order

## Order Status Workflow

Recommended status progression:
1. **Pending** → New order placed by customer
2. **Processing** → Order confirmed, preparing items
3. **Out for Delivery** → Order shipped/dispatched
4. **Delivered** → Order successfully delivered
5. **Cancelled** → Order cancelled (any stage)

## Managing Orders

### Changing Order Status
1. Locate the order in the list
2. Click the status dropdown
3. Select new status
4. Changes save automatically to Firebase

### Viewing Order Details
1. Click "View Items" button
2. Review all products in the order
3. Check delivery address
4. Click "Hide Items" to collapse

### Deleting Orders
1. Click "Delete" button on order card
2. Confirm deletion in popup
3. Order permanently removed from Firebase
⚠️ **Warning**: This action cannot be undone!

## Data Structure

### Order Object in Firebase
```javascript
{
  id: "auto-generated",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+44 1234 567890",
    companyName: "ABC Ltd",
    address: "123 Main St, London"
  },
  items: [
    {
      productId: "product_123",
      productName: "King Fish",
      malayalamName: "നെയ്മീൻ",
      packaging: "Thermal",
      quantity: 5.5,
      price: 12.50,
      lineTotal: 68.75
    }
  ],
  summary: {
    totalWeight: 150.5,
    subtotal: 2450.00,
    tier: "Gold",
    totalSavings: 245.50
  },
  status: "pending",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Navigation

### Header Menu
- **Dashboard**: Return to main admin dashboard
- **Customers**: View customer management
- **Logout**: Sign out of admin panel

### Quick Links
All pages interconnected for easy navigation

## Tips for Efficient Management

### Daily Workflow
1. **Morning**: Review all pending orders
2. **Throughout Day**: Update statuses as orders progress
3. **Evening**: Confirm deliveries completed

### Using Filters
- Use status filter to focus on specific stages
- Search by customer name for quick lookups
- Sort by date (newest first by default)

### Performance
- Dashboard loads orders in descending date order
- Real-time data from Firebase Firestore
- Automatic local state updates after changes
- Use refresh button to sync with latest data

## Common Tasks

### Processing New Orders
1. Filter by "Pending" status
2. Review order details
3. Change status to "Processing"
4. Prepare items for shipment

### Tracking Deliveries
1. Filter by "Out for Delivery"
2. Monitor delivery completion
3. Update to "Delivered" when confirmed

### Handling Issues
1. Search for customer by name/email
2. Review order history
3. Update status or cancel if needed
4. Contact customer (email/phone shown)

## Future Enhancements

Planned features:
- [ ] Export orders to CSV/Excel
- [ ] Print packing slips
- [ ] Order notes and comments
- [ ] Email notifications
- [ ] Analytics and reporting
- [ ] Bulk status updates
- [ ] Filter by date range
- [ ] Revenue charts
- [ ] Customer order history view
- [ ] Inventory tracking integration

## Troubleshooting

### Orders Not Loading
- Check internet connection
- Verify Firebase rules are published
- Ensure logged in as admin
- Click "Refresh" button
- Check browser console for errors

### Cannot Update Status
- Verify admin authentication
- Check Firestore security rules
- Ensure order ID is valid
- Try refreshing the page

### Missing Order Data
- Some older orders may have incomplete data
- New fields added over time
- Null values handled gracefully in UI

## Security

### Access Control
- Only authenticated admins can access
- Firebase security rules enforce permissions
- Read/write operations logged in Firebase

### Data Protection
- Customer data encrypted in transit
- Stored securely in Firebase Firestore
- Only authorized users can view/modify

## Support

For issues or questions:
1. Check FIRESTORE_SETUP.md for configuration
2. Review ORDER_SYSTEM_GUIDE.md for order flow
3. Check Firebase Console for data/errors
4. Verify authentication and permissions

---

**Happy Order Management!** 📦✨
