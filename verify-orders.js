/**
 * Verify what's in the database
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 Checking database...\n');
    
    // Get all orders
    const allOrders = await prisma.order.findMany({
      take: 10
    });
    
    console.log(`Total orders in database: ${allOrders.length}`);
    console.log('\nAll orders:');
    allOrders.forEach(o => {
      console.log(`  - ID: ${o.id}`);
      console.log(`    Email: ${o.buyerEmail}`);
      console.log(`    Amount: ₹${o.amount}`);
      console.log(`    Status: ${o.status}\n`);
    });
    
    // Try searching by email
    const email = 'infodevayushenterprise@gmail.com';
    console.log(`\n🔎 Searching for orders with email: ${email}`);
    
    const foundOrders = await prisma.order.findMany({
      where: {
        buyerEmail: email
      }
    });
    
    console.log(`Found ${foundOrders.length} orders\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
