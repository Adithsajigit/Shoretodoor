# Create Admin User Guide

## 🔐 Admin Credentials Requested
- **Email**: admin@shoretodoor.uk
- **Password**: admin@shoretodoor.uk

---

## ⚡ Quick Setup (Choose One Method)

### Method 1: Firebase Console (EASIEST - Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select project: `olx-demo-a7683`

2. **Enable Email/Password Authentication**
   - Click on **Authentication** in left sidebar
   - Click on **Sign-in method** tab
   - Click on **Email/Password**
   - Toggle **Enable** ON
   - Click **Save**

3. **Add Admin User**
   - Click on **Users** tab
   - Click **Add User** button
   - Enter:
     - Email: `admin@shoretodoor.uk`
     - Password: `admin@shoretodoor.uk`
   - Click **Add User**

4. **Done!** 
   - Visit: http://localhost:3000/admin/login
   - Login with the credentials above

---

### Method 2: Using Firebase CLI (Advanced)

```bash
# Install Firebase Tools globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# You'll need to manually create the user in the console
# OR use Firebase Admin SDK (requires service account setup)
```

---

### Method 3: Sign Up Page (If you want to create one)

I can create a one-time signup page for you to register the admin user directly from the browser. Would you like me to create this?

---

## 🎯 After Creating the Admin User

1. Visit: **http://localhost:3000/admin/login**
2. Enter:
   - Email: `admin@shoretodoor.uk`
   - Password: `admin@shoretodoor.uk`
3. Click **Sign In to Dashboard**
4. You'll be redirected to the admin dashboard!

---

## ⚠️ Important Security Notes

1. **Change the password after first login** - Using email as password is not secure for production
2. **Enable 2FA** in Firebase Console for additional security
3. **Use environment variables** for sensitive data in production

---

## 🔗 Quick Links

- Firebase Console: https://console.firebase.google.com/project/olx-demo-a7683
- Admin Login: http://localhost:3000/admin/login
- Admin Dashboard: http://localhost:3000/admin/dashboard

---

## 📞 Need Help?

If you're having trouble, let me know and I can:
- Create a temporary signup page
- Help with Firebase Admin SDK setup
- Troubleshoot authentication issues
