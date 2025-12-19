# Quick Start Guide: Pricing Packages 🚀

## What You Need to Know

You now have a **Pricing Packages System** that lets you:
- ✅ Create multiple price lists for the same 78 products
- ✅ Assign different pricing to different customers
- ✅ Easily duplicate and modify prices

## 3-Minute Setup

### 1️⃣ Update Firestore Rules (Required!)

**Go to:** https://console.firebase.google.com/
1. Select project: `olx-demo-a7683`
2. Click "Firestore Database"
3. Click "Rules" tab
4. Add these rules:

```javascript
// Pricing Packages
match /pricingPackages/{packageId} {
  allow read: if true;
  allow write: if isAdmin();
}

// Package Prices
match /packagePrices/{priceId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

5. Click "Publish"
6. Wait 20 seconds

### 2️⃣ Create Your First Package

**Navigate to:** http://localhost:3001/admin/pricing-packages

1. Click **"Create Default Package"** button
2. Wait for migration (~30 seconds for 78 products)
3. You'll see "Default Package" created with all products

### 3️⃣ Create Pack 1 and Pack 2

1. On the Default Package card, click **"Duplicate Package"**
2. Enter name: `Pack 1`
3. Enter description: `Premium customer pricing`
4. Click **"Create"**
5. Wait for completion

Repeat for Pack 2:
1. Click **"Duplicate Package"** again
2. Name: `Pack 2`
3. Description: `Standard customer pricing`
4. Click **"Create"**

### 4️⃣ Edit Prices (Optional)

1. Click **"Edit Prices"** on Pack 1
2. Modify any prices you want to change
3. Click **"Save X Changes"** when done

### 5️⃣ Assign to Customers

**Navigate to:** http://localhost:3001/admin/customers

1. Click **"Add Customer"** or edit existing
2. Scroll to **"Pricing Package"** dropdown
3. Select "Pack 1" or "Pack 2"
4. Save customer

## Done! 🎉

Your customers will now see prices based on their assigned package!

## What's Next?

- Create more packages for different customer types
- Adjust prices seasonally
- Assign packages to all customers
- Test by generating an order link for a customer with a custom package

## Common Commands

```bash
# Start dev server
npm run dev

# Access admin panel
http://localhost:3001/admin/dashboard

# Pricing packages
http://localhost:3001/admin/pricing-packages
```

## File Structure

```
New Files Created:
├── app/admin/pricing-packages/
│   ├── page.tsx                    # Main packages page
│   └── [id]/page.tsx              # Edit package prices
├── PRICING_PACKAGES_GUIDE.md      # Full documentation
├── FIRESTORE_RULES_UPDATE.md      # Security rules
└── QUICK_START_PRICING.md         # This file

Updated Files:
├── components/AdminSidebar.tsx    # Added "Pricing Packages" link
└── app/admin/customers/page.tsx   # Added pricing package selector
```

## Video Walkthrough

1. **Create packages:** Default → Pack 1 → Pack 2
2. **Edit prices:** Change prices in Pack 1 to be lower
3. **Assign customer:** Customer A gets Pack 1, Customer B gets Pack 2
4. **Test order:** Generate order link and verify different prices

## Support

- Full guide: `PRICING_PACKAGES_GUIDE.md`
- Rules update: `FIRESTORE_RULES_UPDATE.md`

---

**Time to complete:** 3-5 minutes
**Difficulty:** Easy ⭐
**Impact:** High 🚀
