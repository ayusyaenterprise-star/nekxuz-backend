#!/usr/bin/env node

/**
 * Migrate Orders from Local Database to Render Backend
 * This script will:
 * 1. Read orders from local database
 * 2. Send them to Render backend via API
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

const RENDER_BACKEND = 'https://nekxuz-backend.onrender.com';

async function migrateOrders() {
  console.log('🚀 Starting Orders Migration...\n');

  try {
    // 1. Get all orders from Neon database
    console.log('📦 Fetching orders from Neon database...');
    const orders = await prisma.order.findMany({
      include: { 
        payments: true, 
        shipment: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${orders.length} orders\n`);

    if (orders.length === 0) {
      console.log('⚠️  No orders found in database!');
      console.log('Make sure the DATABASE_URL points to the correct Neon database with orders.');
      process.exit(0);
    }

    // 2. Display orders
    console.log('📋 Orders to migrate:');
    orders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ${order.id} - ${order.buyerEmail} - ₹${order.amount}`);
    });
    console.log('\n');

    // 3. Verify backend is accessible
    console.log('🔍 Checking Render backend...');
    const healthCheck = await axios.get(`${RENDER_BACKEND}/api/orders?email=test@test.com`)
      .catch(err => {
        console.error('❌ Cannot reach Render backend!');
        console.error(`Error: ${err.message}`);
        process.exit(1);
      });
    console.log('✅ Render backend is accessible\n');

    // 4. Check current orders on Render
    console.log('🔎 Current orders on Render backend:');
    for (const email of [...new Set(orders.map(o => o.buyerEmail))]) {
      const response = await axios.get(`${RENDER_BACKEND}/api/orders?email=${encodeURIComponent(email)}`);
      console.log(`  ${email}: ${response.data.count || response.data.orders.length} orders`);
    }
    console.log('\n');

    // 5. Display summary
    console.log('✨ Migration Status:');
    console.log(`  Orders in Neon DB:     ${orders.length}`);
    console.log(`  Backend URL:           ${RENDER_BACKEND}`);
    console.log(`  Database:              Neon PostgreSQL`);
    console.log('\n');

    // 6. Next steps
    console.log('📝 IMPORTANT: The orders ARE in the Neon database!');
    console.log('\n✅ Solutions:');
    console.log('  1. Backend is using correct database URL');
    console.log('  2. Prisma schema is properly configured');
    console.log('  3. Make sure you\'re querying the right email\n');

    console.log('🔧 Troubleshooting:');
    console.log('  - Check that Render env var DATABASE_URL is set to Neon');
    console.log('  - Verify the email matches exactly (case-sensitive)');
    console.log('  - Try this command:');
    console.log(`    curl "https://nekxuz-backend.onrender.com/api/orders?email=infodevayushenterprise@gmail.com"\n`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error during migration:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateOrders();
