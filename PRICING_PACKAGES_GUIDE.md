# Pricing Packages System 📦💰

## Overview

The pricing packages system allows you to create multiple price lists for the same products and assign different pricing to different customers.

## How It Works

### 1. **Pricing Packages**
- Each package contains the same 78 products but with different prices
- You can create unlimited packages (Pack 1, Pack 2, Premium, Wholesale, etc.)
- One package can be marked as "Default" for new customers

### 2. **Customer Assignment**
- When adding a customer, you can assign them a specific pricing package
- Customers without an assigned package use the default pricing
- Each customer sees only the prices from their assigned package

### 3. **Package Management**
Located at: `/admin/pricing-packages`

**Features:**
- ✅ View all pricing packages
- ✅ Create default package from existing products
- ✅ Duplicate any package to create variations
- ✅ Edit prices for each package
- ✅ Delete packages (except default)

## Getting Started

### Step 1: Create Default Package

1. Navigate to **Pricing Packages** in the admin sidebar
2. Click **"Create Default Package"**
3. This will copy all 78 products from your current product list
4. All four pricing tiers (Diamond, Platinum, Gold, Silver) are included

### Step 2: Create Additional Packages

1. Click **"Duplicate Package"** on the default package
2. Enter a name (e.g., "Pack 1", "Wholesale Pricing", "Premium Customers")
3. Optionally add a description
4. Click **"Create"**

### Step 3: Edit Package Prices

1. Click **"Edit Prices"** on any package
2. You'll see a table with all 78 products
3. Edit any price by typing in the input fields
4. Changes are highlighted in yellow
5. Click **"Save X Changes"** to save

**Features:**
- 🔍 Search products by name or code
- 📊 Real-time change tracking
- 💾 Batch save all changes
- 📈 Summary statistics

### Step 4: Assign to Customers

1. Go to **Customers** page
2. Click **"Add Customer"** or edit existing customer
3. Select a pricing package from the dropdown
4. Save the customer

## Use Cases

### Example 1: Tiered Customer Pricing
```
Pack 1 (Premium Customers)    → 10% discount
Pack 2 (Regular Customers)     → Standard pricing
Pack 3 (Bulk/Wholesale)        → 20% discount
```

### Example 2: Geographic Pricing
```
Kerala Package    → Standard prices
Tamil Nadu        → +5% for transport
Karnataka         → +8% for transport
```

### Example 3: Business Type
```
Restaurants       → Restaurant pricing
Retailers         → Retail pricing
Distributors      → Wholesale pricing
```

## Package Duplication Process

When you duplicate a package:
1. ✅ Creates new package with your chosen name
2. ✅ Copies all 78 product prices
3. ✅ Includes all 4 pricing tiers per product
4. ✅ Ready to edit immediately
5. ✅ Independent from source package

## Data Structure

### Firestore Collections

**pricingPackages**
```javascript
{
  id: "auto-generated",
  name: "Pack 1",
  description: "Premium customer pricing",
  isDefault: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**packagePrices**
```javascript
{
  id: "auto-generated",
  packageId: "package-id",
  productId: "product-id",
  productCode: "FF001",
  productName: "Fresh Pomfret",
  priceDiamond: 850,
  pricePlatinum: 800,
  priceGold: 750,
  priceSilver: 700,
  createdAt: timestamp
}
```

**customers** (updated)
```javascript
{
  // ... existing fields ...
  pricingPackageId: "package-id",
  pricingPackageName: "Pack 1"
}
```

## Navigation

- **Main Packages Page:** `/admin/pricing-packages`
- **Edit Package Prices:** `/admin/pricing-packages/[packageId]`
- **Assign to Customer:** `/admin/customers` (Add/Edit Customer form)

## Features

### Pricing Packages Page
- 📦 Card view of all packages
- 🏷️ Default package badge
- ✏️ Edit prices button
- 📋 Duplicate button
- 🗑️ Delete button (except default)

### Edit Prices Page
- 🔍 Search functionality
- 📊 All 4 pricing tiers in one view
- 💛 Yellow highlight for edited rows
- 💾 Save multiple changes at once
- 📈 Real-time statistics
- ⬅️ Back to packages

### Customers Page
- 💰 Pricing package column
- 📝 Package selector in add/edit form
- 🏷️ Package name display

## Security

- ✅ Only admins can create/edit/delete packages
- ✅ Only admins can modify prices
- ✅ Customers can only view assigned prices
- ✅ Firestore security rules enforce permissions

## Best Practices

1. **Create Default First**
   - Always create the default package before others
   - Use current product prices as the baseline

2. **Naming Convention**
   - Use clear, descriptive names
   - Examples: "Pack 1", "Premium", "Wholesale 2024"

3. **Regular Updates**
   - Update all packages when market prices change
   - Keep packages synchronized when adding new products

4. **Customer Assignment**
   - Assign packages when creating customers
   - Review customer pricing periodically
   - Update assignments based on purchase volume

5. **Testing**
   - Create a test package to experiment
   - Assign to a test customer
   - Verify prices appear correctly on order forms

## Troubleshooting

**Issue:** Can't see pricing packages
- **Solution:** Update Firestore security rules (see FIRESTORE_RULES_UPDATE.md)

**Issue:** Changes not saving
- **Solution:** Check admin permissions, refresh the page

**Issue:** Customer not seeing custom prices
- **Solution:** Verify customer has pricingPackageId assigned

**Issue:** Package shows 0 products
- **Solution:** Re-duplicate from a package that has products

## Future Enhancements

Potential features to add:
- 📊 Price comparison view across packages
- 📈 Bulk price adjustment (% increase/decrease)
- 📅 Scheduled price changes
- 🔄 Price history tracking
- 📧 Customer notification on price updates
- 📊 Analytics on package usage

## Support

For questions or issues:
- Check Firestore Console for data verification
- Review browser console for errors
- Verify security rules are published
- Check that default package exists before duplicating
