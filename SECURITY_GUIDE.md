# 🔐 Admin Access Control - Security Guide

## ✅ Security Implementation Complete!

Your admin panel now has **role-based access control** to prevent regular customers from accessing admin features.

---

## 🛡️ How It Works

### 1. **Admin Whitelist**
- Only emails listed in `/lib/adminAuth.ts` can access admin panel
- Currently authorized: `admin@shoretodoor.uk`
- Any other user (customer) will be denied access

### 2. **Three-Layer Protection**

#### Layer 1: Login Page (`/admin/login`)
- Checks if email is in admin whitelist BEFORE login
- Shows "Access Denied" message for non-admin emails
- Prevents unauthorized login attempts

#### Layer 2: Dashboard (`/admin/dashboard`)
- Validates user on every page load
- Automatically logs out and redirects non-admin users
- Shows "Access Denied" screen with 3-second redirect

#### Layer 3: Signup Page (`/admin/signup`)
- Only allows account creation for pre-approved admin emails
- Prevents customers from creating admin accounts
- Shows error for non-authorized emails

---

## 📋 What Happens When Customer Tries to Access Admin?

### Scenario 1: Customer tries `/admin/login`
1. Customer enters their email (e.g., `customer@example.com`)
2. System checks admin whitelist
3. ❌ **Access Denied** message appears
4. Login is blocked

### Scenario 2: Customer somehow reaches `/admin/dashboard`
1. System checks if user email is in admin whitelist
2. ❌ **Access Denied** screen appears
3. User is auto-logged out after 3 seconds
4. Redirected to main store

### Scenario 3: Customer tries `/admin/signup`
1. Customer enters email
2. System checks admin whitelist
3. ❌ **Error message** appears
4. Account creation is blocked

---

## 👥 How to Add More Admins

### Option 1: Add to Whitelist (Recommended)
Edit `/lib/adminAuth.ts`:

```typescript
export const ADMIN_EMAILS = [
  'admin@shoretodoor.uk',
  'manager@shoretodoor.uk',      // ← Add new admin
  'supervisor@shoretodoor.uk',   // ← Add another admin
  // Add more as needed
];
```

### Option 2: After Adding to Whitelist
1. New admin visits: `http://localhost:3000/admin/signup`
2. Creates account with their authorized email
3. Can now access admin dashboard

---

## 🔍 Current Configuration

**Authorized Admins:**
- ✅ admin@shoretodoor.uk

**All Other Users:**
- ❌ Blocked from `/admin/login`
- ❌ Blocked from `/admin/dashboard`
- ❌ Blocked from `/admin/signup`
- ✅ Can still use main store normally

---

## 🎯 Customer Account System

For your customers, you should create a **separate customer portal**:

### Recommended Customer Features:
- `/account/login` - Customer login (different from admin)
- `/account/orders` - View order history
- `/account/profile` - Update profile
- `/account/addresses` - Manage delivery addresses

### Key Differences:
- **Admin Panel**: Only for store management (you & staff)
- **Customer Portal**: For customers to track orders, update info
- **No overlap**: Customers never see admin features

---

## 🚀 Testing the Security

### Test 1: Try logging in as non-admin
1. Go to `/admin/login`
2. Enter: `customer@test.com`
3. ✅ Should see "Access Denied" error

### Test 2: Try signing up as non-admin
1. Go to `/admin/signup`
2. Enter: `random@email.com`
3. ✅ Should see authorization error

### Test 3: Login as admin
1. Go to `/admin/login`
2. Enter: `admin@shoretodoor.uk`
3. ✅ Should access dashboard successfully

---

## 📞 Summary

✅ **Admin panel is now secure**
✅ **Only whitelisted emails can access**
✅ **Customers are automatically blocked**
✅ **Easy to add more admins by editing whitelist**

Your customers can still create Firebase accounts for order tracking, but they'll never be able to access `/admin/*` routes!

---

## 🔗 Files Modified

- ✅ `/lib/adminAuth.ts` - Admin whitelist & validation
- ✅ `/app/admin/login/page.tsx` - Login protection
- ✅ `/app/admin/dashboard/page.tsx` - Dashboard protection
- ✅ `/app/admin/signup/page.tsx` - Signup restriction
