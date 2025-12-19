// Script to generate invoices for existing orders that don't have them
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { saveInvoicePDF } from '../lib/pdfService';

async function generateMissingInvoices() {
  console.log('🔍 Checking for orders without invoices...\n');

  try {
    // Get all orders
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    let totalOrders = 0;
    let generatedCount = 0;
    let errorCount = 0;

    for (const orderDoc of ordersSnapshot.docs) {
      totalOrders++;
      const order = orderDoc.data();
      
      // Skip if invoice already exists
      if (order.invoiceUrl) {
        console.log(`✓ Order ${orderDoc.id.slice(0, 8)} already has invoice`);
        continue;
      }

      console.log(`📄 Generating invoice for order ${orderDoc.id.slice(0, 8)}...`);

      try {
        // Generate and save invoice
        const invoiceUrl = await saveInvoicePDF({
          orderId: orderDoc.id,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          orderDate: order.createdAt?.toDate() || new Date(),
          items: order.items.map((item: any) => ({
            productName: item.productName,
            malayalamName: item.malayalamName,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.lineTotal
          })),
          totalWeight: order.summary.totalWeight,
          subtotal: order.summary.subtotal,
          tier: order.summary.tier
        });

        // Update Firestore with invoice URL
        const orderRef = doc(db, 'orders', orderDoc.id);
        await updateDoc(orderRef, {
          invoiceUrl: invoiceUrl,
          invoiceGeneratedAt: new Date()
        });

        console.log(`✅ Invoice generated: ${invoiceUrl}\n`);
        generatedCount++;
      } catch (error) {
        console.error(`❌ Failed to generate invoice for order ${orderDoc.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Invoices Generated: ${generatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Already Had Invoices: ${totalOrders - generatedCount - errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
generateMissingInvoices();
