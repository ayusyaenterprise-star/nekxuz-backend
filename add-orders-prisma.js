/**
 * Script to add orders to Prisma database (PostgreSQL)
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const orders = [
  {
    id: 'pay_SSfFmOTdkU7JVT',
    invoice: 'invoice_pay_SSfFmOTdkU7JVT',
    amount: 164,
    currency: 'INR',
    status: 'paid',
    buyerName: 'Ayush Gupta',
    buyerEmail: 'infodevayushenterprise@gmail.com',
    buyerPhone: '+91 9999999999',
    buyerAddress: 'Home Address',
    buyerCity: 'Delhi',
    buyerState: 'Delhi',
    buyerPincode: '110001',
    subtotal: 150,
    tax: 10,
    shippingCharges: 4
  },
  {
    id: 'pay_SRbdC8iOiteX73',
    invoice: 'invoice_pay_SRbdC8iOiteX73',
    amount: 139,
    currency: 'INR',
    status: 'paid',
    buyerName: 'Ayush Gupta',
    buyerEmail: 'infodevayushenterprise@gmail.com',
    buyerPhone: '+91 9999999999',
    buyerAddress: 'Home Address',
    buyerCity: 'Delhi',
    buyerState: 'Delhi',
    buyerPincode: '110001',
    subtotal: 125,
    tax: 9,
    shippingCharges: 5
  },
  {
    id: 'pay_SP1bMSHFbIbhV0',
    invoice: 'invoice_pay_SP1bMSHFbIbhV0',
    amount: 139,
    currency: 'INR',
    status: 'paid',
    buyerName: 'Ayush Gupta',
    buyerEmail: 'infodevayushenterprise@gmail.com',
    buyerPhone: '+91 9999999999',
    buyerAddress: 'Home Address',
    buyerCity: 'Delhi',
    buyerState: 'Delhi',
    buyerPincode: '110001',
    subtotal: 125,
    tax: 9,
    shippingCharges: 5
  },
  {
    id: 'pay_SN0urhii26JnJQ',
    invoice: 'invoice_pay_SN0urhii26JnJQ',
    amount: 139,
    currency: 'INR',
    status: 'paid',
    buyerName: 'Ayush Gupta',
    buyerEmail: 'infodevayushenterprise@gmail.com',
    buyerPhone: '+91 9999999999',
    buyerAddress: 'Home Address',
    buyerCity: 'Delhi',
    buyerState: 'Delhi',
    buyerPincode: '110001',
    subtotal: 125,
    tax: 9,
    shippingCharges: 5
  }
];

async function addOrders() {
  try {
    console.log('📥 Adding orders to PostgreSQL database...\n');
    
    let addedCount = 0;
    
    for (const order of orders) {
      try {
        const created = await prisma.order.create({
          data: order
        });
        console.log(`✅ Added: ${created.id} | ₹${created.amount / 100} | ${created.buyerEmail}`);
        addedCount++;
      } catch (error) {
        // If order already exists, try to update it
        if (error.code === 'P2002') {
          console.log(`⚠️  Order ${order.id} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding order ${order.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} orders to database!`);
    console.log('📱 Refresh your website to see the orders!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addOrders();
