import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';

export interface OrderLink {
  id?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  createdBy: string;
  isUsed: boolean;
  usedAt?: Date;
  isActive: boolean;
  bronzeTierEnabled?: boolean; // Allow purchases below 100kg
}

// Generate a random secure token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Create a new order link for a customer
export async function createOrderLink(
  customerId: string,
  customerName: string,
  customerEmail: string,
  durationMinutes: number,
  createdBy: string,
  bronzeTierEnabled: boolean = false
): Promise<{ token: string; expiresAt: Date; linkUrl: string }> {
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const linkData = {
    customerId,
    customerName,
    customerEmail,
    token,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: Timestamp.fromDate(now),
    createdBy,
    isUsed: false,
    isActive: true,
    bronzeTierEnabled
  };

  await addDoc(collection(db, 'orderLinks'), linkData);

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000';
  
  const linkUrl = `${baseUrl}/order/${token}`;

  return { token, expiresAt, linkUrl };
}

// Validate an order link token and get full customer details
export async function validateOrderLink(token: string): Promise<{
  valid: boolean;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  pricingPackageId?: string;
  pricingPackageName?: string;
  bronzeTierEnabled?: boolean;
  error?: string;
}> {
  try {
    console.log('[validateOrderLink] Starting validation for token:', token);
    
    if (!token || token.trim() === '') {
      console.error('[validateOrderLink] Empty token provided');
      return { valid: false, error: 'No token provided' };
    }

    const linksRef = collection(db, 'orderLinks');
    const q = query(linksRef, where('token', '==', token));
    
    console.log('[validateOrderLink] Querying Firestore...');
    const querySnapshot = await getDocs(q);
    console.log('[validateOrderLink] Query result:', querySnapshot.empty ? 'empty' : `${querySnapshot.size} docs`);

    if (querySnapshot.empty) {
      console.error('[validateOrderLink] No matching link found');
      return { valid: false, error: 'Invalid link' };
    }

    const linkDoc = querySnapshot.docs[0];
    const linkData = linkDoc.data();
    console.log('[validateOrderLink] Link data retrieved:', { 
      customerId: linkData.customerId, 
      isActive: linkData.isActive, 
      isUsed: linkData.isUsed 
    });

    // Check if link is active
    if (!linkData.isActive) {
      console.error('[validateOrderLink] Link is not active');
      return { valid: false, error: 'This link has been deactivated' };
    }

    // Check if link has expired
    const now = new Date();
    const expiresAt = linkData.expiresAt.toDate();
    console.log('[validateOrderLink] Expiry check:', { now, expiresAt, expired: now > expiresAt });
    
    if (now > expiresAt) {
      console.error('[validateOrderLink] Link has expired');
      return { valid: false, error: 'This link has expired' };
    }

    // Check if link has been used
    if (linkData.isUsed) {
      console.error('[validateOrderLink] Link has already been used');
      return { valid: false, error: 'This link has already been used' };
    }

    // Get full customer details from customers collection
    console.log('[validateOrderLink] Fetching customer details...');
    const customerDoc = await getDoc(doc(db, 'customers', linkData.customerId));
    
    if (!customerDoc.exists()) {
      console.warn('[validateOrderLink] Customer document not found, using link data');
      return { 
        valid: true,
        customerId: linkData.customerId,
        customerName: linkData.customerName,
        customerEmail: linkData.customerEmail,
        bronzeTierEnabled: linkData.bronzeTierEnabled || false
      };
    }

    const customerData = customerDoc.data();
    console.log('[validateOrderLink] Customer data retrieved successfully');

    return {
      valid: true,
      customerId: linkData.customerId,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      customerCompany: customerData.company,
      customerAddress: customerData.address,
      customerCity: customerData.city,
      customerState: customerData.state,
      customerPincode: customerData.pincode,
      pricingPackageId: customerData.pricingPackageId || '',
      pricingPackageName: customerData.pricingPackageName || 'Default',
      bronzeTierEnabled: linkData.bronzeTierEnabled || false
    };
  } catch (error) {
    console.error('[validateOrderLink] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { valid: false, error: `Failed to validate link: ${errorMessage}` };
  }
}

// Mark a link as used
export async function markLinkAsUsed(token: string): Promise<void> {
  const linksRef = collection(db, 'orderLinks');
  const q = query(linksRef, where('token', '==', token));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const linkDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'orderLinks', linkDoc.id), {
      isUsed: true,
      usedAt: Timestamp.now()
    });
  }
}

// Deactivate a link manually
export async function deactivateOrderLink(token: string): Promise<void> {
  const linksRef = collection(db, 'orderLinks');
  const q = query(linksRef, where('token', '==', token));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const linkDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'orderLinks', linkDoc.id), {
      isActive: false
    });
  }
}

// Get all links for a customer
export async function getCustomerLinks(customerId: string): Promise<OrderLink[]> {
  const linksRef = collection(db, 'orderLinks');
  const q = query(linksRef, where('customerId', '==', customerId));
  const querySnapshot = await getDocs(q);

  const links: OrderLink[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    links.push({
      id: doc.id,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      token: data.token,
      expiresAt: data.expiresAt.toDate(),
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
      isUsed: data.isUsed,
      usedAt: data.usedAt?.toDate(),
      isActive: data.isActive
    });
  });

  return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
