// Vercel API route - Wraps Express server for Vercel serverless
import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Razorpay with production keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV"
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nekxuz Backend Running on Vercel',
    platform: 'Vercel Serverless',
    razorpay_mode: 'PRODUCTION',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', invoiceNumber } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: invoiceNumber || `order_${Date.now()}`
    });

    res.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X"
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      error: error.message,
      ok: false
    });
  }
});

// Verify Payment & Create Order
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV");
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed', ok: false });
    }

    // Save order to database
    const order = await prisma.order.create({
      data: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        status: 'paid',
        buyerEmail: orderData.buyerEmail,
        buyerName: orderData.buyerName,
        buyerPhone: orderData.buyerPhone,
        buyerAddress: orderData.buyerAddress,
        buyerCity: orderData.buyerCity,
        buyerState: orderData.buyerState,
        buyerPincode: orderData.buyerPincode,
        items: JSON.stringify(orderData.items || []),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update stock for each item
    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        await prisma.product.update({
          where: { id: item.productId || item.id },
          data: {
            stock: {
              decrement: item.quantity || 1
            }
          }
        }).catch(err => console.log('Stock update skipped:', err.message));
      }
    }

    res.json({
      ok: true,
      orderId: order.id,
      message: 'Payment verified and order created'
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      error: error.message,
      ok: false
    });
  }
});

// Get User Orders
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'email parameter required' });
    }

    const orders = await prisma.order.findMany({
      where: { buyerEmail: email },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      ok: true,
      orders: orders.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]')
      })),
      count: orders.length
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      error: error.message,
      ok: false
    });
  }
});

// Export for Vercel
export default app;
