const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing query WITHOUT include...');
    const ordersWithout = await prisma.order.findMany({
      where: { buyerEmail: 'infodevayushenterprise@gmail.com' }
    });
    console.log('Orders WITHOUT include:', ordersWithout.length);
    if (ordersWithout.length > 0) {
      console.log('First order:', ordersWithout[0]);
    }

    console.log('\n\nTesting query WITH include...');
    const ordersWith = await prisma.order.findMany({
      where: { buyerEmail: 'infodevayushenterprise@gmail.com' },
      include: {
        payments: true,
        shipment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    console.log('Orders WITH include:', ordersWith.length);
    if (ordersWith.length > 0) {
      console.log('First order:', ordersWith[0]);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
