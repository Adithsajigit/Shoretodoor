import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from '../data';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: 'olx-demo-a7683',
      // You'll need to add your service account key here or use environment variables
    })
  });
}

const db = getFirestore();

async function migrateProducts() {
  console.log(`Starting migration of ${products.length} products...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      // Add product to Firestore
      await db.collection('products').add({
        code: product.code,
        englishName: product.englishName,
        malayalamName: product.malayalamName,
        preparation: product.preparation,
        packaging: product.packaging,
        sizeSpec: product.sizeSpec,
        priceDiamond: product.priceDiamond,
        pricePlatinum: product.pricePlatinum,
        priceGold: product.priceGold,
        priceSilver: product.priceSilver,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      successCount++;
      console.log(`✓ Migrated: ${product.englishName} (${product.code})`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to migrate ${product.englishName}:`, error);
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

migrateProducts();
