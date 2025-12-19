# Firestore Security Rules Update

Add these rules to your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in ['ashifamsc@gmail.com', 'ashifamsas@gmail.com'];
    }
    
    // Existing collections...
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Pricing Packages collection
    match /pricingPackages/{packageId} {
      allow read: if true;  // All users can read packages
      allow write: if isAdmin();  // Only admins can create/edit/delete
    }
    
    // Package Prices collection
    match /packagePrices/{priceId} {
      allow read: if true;  // All users can read prices
      allow write: if isAdmin();  // Only admins can create/edit/delete
    }
    
    // Update customers collection to include pricingPackageId
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // ... rest of your existing rules
  }
}
```

## Steps to Update:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project (olx-demo-a7683)
3. Click "Firestore Database" in the left menu
4. Click the "Rules" tab
5. Add the above rules for pricingPackages and packagePrices
6. Click "Publish"
7. Wait 10-20 seconds for changes to propagate

## What This Enables:

- ✅ Pricing packages management
- ✅ Product prices per package
- ✅ Customer-specific pricing
- ✅ Package duplication
- ✅ Secure admin-only writes
