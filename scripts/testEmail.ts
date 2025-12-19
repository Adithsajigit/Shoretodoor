// Test SMTP Email Configuration
// Run this script to verify your email settings are working

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { testEmailConnection, sendOrderConfirmationEmail } from '../lib/emailService';

async function testEmail() {
  console.log('🔍 Testing SMTP Configuration...\n');
  
  // Display loaded env vars (hide password)
  console.log('📧 SMTP Settings:');
  console.log('   Host:', process.env.SMTP_HOST || 'NOT SET');
  console.log('   Port:', process.env.SMTP_PORT || 'NOT SET');
  console.log('   User:', process.env.SMTP_USER || 'NOT SET');
  console.log('   Pass:', process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
  console.log('');

  // Test 1: Connection
  console.log('1️⃣ Testing SMTP Connection...');
  const connectionTest = await testEmailConnection();
  if (connectionTest) {
    console.log('✅ SMTP connection successful!\n');
  } else {
    console.log('❌ SMTP connection failed. Check your .env.local credentials.\n');
    return;
  }

  // Test 2: Send Test Email
  console.log('2️⃣ Sending Test Order Confirmation Email...');
  try {
    const result = await sendOrderConfirmationEmail({
      customerName: 'Test Customer',
      customerEmail: 'sebinsajiabraham@gmail.com', // Sending to yourself for testing
      orderId: 'TEST123456789',
      orderTotal: 1245.50,
      totalWeight: 125.5,
      tier: 'Gold',
      items: [
        {
          productName: 'King Fish',
          malayalamName: 'നെയ്മീൻ',
          quantity: 50,
          price: 12.50,
          lineTotal: 625.00
        },
        {
          productName: 'Tiger Prawns',
          malayalamName: 'കടുവ ചെമ്മീൻ',
          quantity: 25,
          price: 24.82,
          lineTotal: 620.50
        }
      ]
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('\n✨ Check your inbox at sebinsajiabraham@gmail.com\n');
  } catch (error) {
    console.log('❌ Failed to send test email:', error);
  }
}

// Run the test
testEmail();
