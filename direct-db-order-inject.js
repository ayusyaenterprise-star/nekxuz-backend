#!/usr/bin/env node

/**
 * 🔧 Direct Database Order Injection
 * 
 * This script directly adds orders to the PostgreSQL database
 * Used when the API endpoint is not returning existing orders
 */

const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// We'll use raw SQL instead of Prisma for maximum compatibility
const { Client } = require('pg');
const client = new Client({ connectionString: DATABASE_URL });

async function addOrders() {
  try {
    console.log('📡 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✓ Connected\n');

    // Orders to add
    const orders = [
      {
        id: 'pay_SSfFmOTdkU7JVT',
        invoice: 'invoice_pay_SSfFmOTdkU7JVT',
        amount: 164,
        currency: 'INR',
        status: 'paid',
        subtotal: 150,
        tax: 10,
        shippingCharges: 4,
        buyerName: 'Ayush Gupta',
        buyerEmail: 'infodevayushenterprise@gmail.com',
        buyerPhone: '+91 9999999999',
        buyerAddress: 'Home Address',
        buyerCity: 'Delhi',
        buyerState: 'Delhi',
        buyerPincode: '110001'
      },
      {
        id: 'pay_SRbdC8iOiteX73',
        invoice: 'invoice_pay_SRbdC8iOiteX73',
        amount: 139,
        currency: 'INR',
        status: 'paid',
        subtotal: 125,
        tax: 9,
        shippingCharges: 5,
        buyerName: 'Ayush Gupta',
        buyerEmail: 'infodevayushenterprise@gmail.com',
        buyerPhone: '+91 9999999999',
        buyerAddress: 'Home Address',
        buyerCity: 'Delhi',
        buyerState: 'Delhi',
        buyerPincode: '110001'
      },
      {
        id: 'pay_SP1bMSHFbIbhV0',
        invoice: 'invoice_pay_SP1bMSHFbIbhV0',
        amount: 139,
        currency: 'INR',
        status: 'paid',
        subtotal: 125,
        tax: 9,
        shippingCharges: 5,
        buyerName: 'Ayush Gupta',
        buyerEmail: 'infodevayushenterprise@gmail.com',
        buyerPhone: '+91 9999999999',
        buyerAddress: 'Home Address',
        buyerCity: 'Delhi',
        buyerState: 'Delhi',
        buyerPincode: '110001'
      },
      {
        id: 'pay_SN0urhii26JnJQ',
        invoice: 'invoice_pay_SN0urhii26JnJQ',
        amount: 139,
        currency: 'INR',
        status: 'paid',
        subtotal: 125,
        tax: 9,
        shippingCharges: 5,
        buyerName: 'Ayush Gupta',
        buyerEmail: 'infodevayushenterprise@gmail.com',
        buyerPhone: '+91 9999999999',
        buyerAddress: 'Home Address',
        buyerCity: 'Delhi',
        buyerState: 'Delhi',
        buyerPincode: '110001'
      }
    ];

    console.log('📥 Adding orders to database...\n');

    let successCount = 0;
    for (const order of orders) {
      try {
        // Check if order already exists
        const existing = await client.query(
          'SELECT id FROM "Order" WHERE id = $1',
          [order.id]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  ${order.id} | Already exists`);
          continue;
        }

        // Insert order
        await client.query(
          `INSERT INTO "Order" (id, invoice, amount, currency, status, subtotal, tax, "shippingCharges", "buyerName", "buyerEmail", "buyerPhone", "buyerAddress", "buyerCity", "buyerState", "buyerPincode", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
          [
            order.id,
            order.invoice,
            order.amount,
            order.currency,
            order.status,
            order.subtotal,
            order.tax,
            order.shippingCharges,
            order.buyerName,
            order.buyerEmail,
            order.buyerPhone,
            order.buyerAddress,
            order.buyerCity,
            order.buyerState,
            order.buyerPincode
          ]
        );

        console.log(`✅ Added: ${order.id} | ₹${order.amount}`);
        successCount++;
      } catch (err) {
        if (err.code === '23505') {
          console.log(`⏭️  ${order.id} | Already exists (duplicate key)`);
        } else {
          console.log(`❌ ${order.id} | Error: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Processed ${orders.length} orders (${successCount} added)\n`);

    // Verify
    console.log('🔍 Verifying orders in database...');
    const result = await client.query(
      'SELECT id, amount, status FROM "Order" WHERE "buyerEmail" = $1 ORDER BY "createdAt" DESC',
      ['infodevayushenterprise@gmail.com']
    );

    console.log(`✓ Found ${result.rows.length} orders for infodevayushenterprise@gmail.com:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.id} | ₹${row.amount} | ${row.status}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addOrders();
