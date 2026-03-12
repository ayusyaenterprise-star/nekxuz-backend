const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n=== TESTING COMPLETE ORDER FLOW ===\n');
    
    // 1. Create an order
    console.log('1️⃣ Creating test order...');
    const order = await prisma.order.create({
      data: {
        invoice: 'TEST-INV-' + Date.now(),
        amount: 999,
        currency: 'INR',
        buyerName: 'Test User',
        buyerEmail: 'test@nekxuz.com',
        buyerPhone: '9876543210',
        buyerAddress: 'Test Address',
        buyerCity: 'TestCity',
        buyerState: 'TestState',
        buyerPincode: '123456'
      }
    });
    console.log('✅ Order created:', order.id);
    
    // 2. Create payment
    console.log('\n2️⃣ Creating payment record...');
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: 'pay_' + Date.now(),
        razorpayPaymentId: 'rpay_' + Date.now(),
        razorpaySignature: 'sig_' + Date.now(),
        status: 'completed',
        amount: 999,
        currency: 'INR'
      }
    });
    console.log('✅ Payment created:', payment.id);
    
    // 3. Create shipment
    console.log('\n3️⃣ Creating shipment record...');
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: 'created',
        idempotencyKey: 'ship_' + Date.now()
      }
    });
    console.log('✅ Shipment created:', shipment.id);
    
    // 4. Query orders by email
    console.log('\n4️⃣ Querying orders by email...');
    const orders = await prisma.order.findMany({
      where: { buyerEmail: 'test@nekxuz.com' },
      include: { payments: true, shipment: true }
    });
    console.log('✅ Found', orders.length, 'orders for test@nekxuz.com');
    console.log('   Order:', orders[0].invoice, 'Status:', orders[0].status);
    if (orders[0].payments.length > 0) {
      console.log('   Payment:', orders[0].payments[0].id, 'Status:', orders[0].payments[0].status);
    }
    if (orders[0].shipment) {
      console.log('   Shipment:', orders[0].shipment.id, 'Status:', orders[0].shipment.status);
    }
    
    // 5. Verify counts
    console.log('\n5️⃣ Database statistics...');
    const orderCount = await prisma.order.count();
    const paymentCount = await prisma.payment.count();
    const shipmentCount = await prisma.shipment.count();
    console.log('✅ Total orders:', orderCount);
    console.log('✅ Total payments:', paymentCount);
    console.log('✅ Total shipments:', shipmentCount);
    
    console.log('\n=== ALL TESTS PASSED ✅ ===\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err);
    process.exit(1);
  }
})();
