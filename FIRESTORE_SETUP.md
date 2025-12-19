# Firestore Setup Instructions

## Firebase Console Setup Required

You need to configure Firestore security rules to allow the admin to read/write customer data.

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project: **olx-demo-a7683**
3. Click on "Firestore Database" in the left sidebar
4. If Firestore is not enabled, click "Create Database"
   - Choose "Start in production mode"
   - Select your preferred location (e.g., asia-south1 for India)

### Step 2: Update Security Rules
1. Click on the "Rules" tab in Firestore Database
2. Replace the existing rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'admin@shoretodoor.uk';
    }
    
    // Customers collection - only admin can read/write
    match /customers/{customerId} {
      allow read, write: if isAdmin();
    }
    
    // Order links collection - only admin can read/write
    match /orderLinks/{linkId} {
      allow read, write: if isAdmin();
    }
    
    // Orders collection - admin can read/write, public can create (for order placement)
    match /orders/{orderId} {
      allow read, update, delete: if isAdmin();
      allow create: if true; // Anyone with a valid link can place orders
    }
    
    // Block all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish" to save the rules

### Step 3: Verify Setup
1. Go back to your app at http://localhost:3000/admin/customers
2. Try adding a customer
3. The customer should now save successfully to Firestore

### What These Rules Do:
- ✅ Only allow `admin@shoretodoor.uk` to read/write customer data
- ✅ Only allow `admin@shoretodoor.uk` to read/write order links
- ✅ Prepare for future orders collection
- ✅ Block all unauthorized access
- ✅ Require authentication for all operations

### Troubleshooting:
- If you still get permission errors, make sure you're logged in as `admin@shoretodoor.uk`
- Clear your browser cache and try again
- Check the Firebase Console > Authentication to verify the user exists
