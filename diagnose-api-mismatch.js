const https = require('https');

// Make a direct database connection to understand where Hostinger data lives
// First, let's check what's in the LOCAL database vs what should be visible from Hostinger

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('🔍 DIAGNOSTIC: Database & API Mismatch\n');
    console.log('='.repeat(50));
    
    // 1. Check local database
    console.log('\n1️⃣  LOCAL DATABASE (what we added orders to):');
    const localOrders = await prisma.order.findMany({
      where: { buyerEmail: 'infodevayushenterprise@gmail.com' },
      select: { id: true, amount: true, createdAt: true }
    });
    console.log(`   Found ${localOrders.length} orders`);
    localOrders.slice(0, 2).forEach(o => {
      console.log(`   - ${o.id} | ₹${o.amount} | ${new Date(o.createdAt).toLocaleDateString()}`);
    });
    
    // 2. Check API response
    console.log('\n2️⃣  HOSTINGER API ENDPOINT:');
    console.log('   Testing: GET /api/orders?email=infodevayushenterprise@gmail.com');
    
    const response = await fetch('https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com');
    const apiData = await response.json();
    console.log(`   Returns: ${apiData.orders.length} orders`);
    if (apiData.orders.length > 0) {
      apiData.orders.slice(0, 2).forEach(o => {
        console.log(`   - ${o.id} | ₹${o.amount}`);
      });
    }
    
    // 3. Analysis
    console.log('\n3️⃣  ANALYSIS:');
    if (localOrders.length > 0 && apiData.orders.length === 0) {
      console.log('   ❌ LOCAL has data, but API returns empty');
      console.log('   📝 This means:');
      console.log('      - Hostinger backend is NOT querying the same database');
      console.log('      - OR Hostinger backend is not running updated code');
      console.log('      - OR email parameter is not being passed correctly');
    }
    
    console.log('\n4️⃣  POSSIBLE SOLUTIONS:');
    console.log('   Option A: Update Hostinger backend code');
    console.log('      1. SSH into Hostinger server');
    console.log('      2. Pull latest backend_hostinger code');
    console.log('      3. Restart the Node.js process');
    console.log('   ');
    console.log('   Option B: Check Hostinger database connection');
    console.log('      1. Verify DATABASE_URL is correct in Hostinger .env');
    console.log('      2. Verify it points to the Neon database');
    console.log('      3. Check if data exists there');
    console.log('   ');
    console.log('   Option C: Add orders directly on Hostinger');
    console.log('      1. Use SSH to run the add-orders script there');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
