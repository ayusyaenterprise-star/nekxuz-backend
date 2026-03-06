// Backend API endpoints for order processing
// Add these endpoints to your Express server (server.js)

const express = require('express');
const orderService = require('./order-service');

const router = express.Router();

/**
 * POST /api/orders/calculate
 * Calculate order total with payment method adjustments
 */
router.post('/calculate', (req, res) => {
  try {
    const { subtotal, paymentMethod } = req.body;

    if (!subtotal || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'subtotal and paymentMethod are required'
      });
    }

    const result = orderService.calculateOrderTotal(subtotal, paymentMethod);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/orders/create
 * Create a new order (COD or Prepaid)
 */
router.post('/create', async (req, res) => {
  try {
    const { 
      items, 
      subtotal, 
      paymentMethod, 
      customerName, 
      email, 
      phone,
      address,
      city,
      state,
      country,
      pincode 
    } = req.body;

    // Validation
    if (!items || !subtotal || !paymentMethod || !customerName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (paymentMethod !== 'prepaid' && paymentMethod !== 'cod') {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method. Use "prepaid" or "cod"'
      });
    }

    const orderData = {
      items,
      subtotal,
      paymentMethod,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      country,
      pincode
    };

    const result = await orderService.processOrder(orderData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/orders/:shiprocketOrderId/status
 * Get status of a Shiprocket order
 */
router.get('/:shiprocketOrderId/status', async (req, res) => {
  try {
    const { shiprocketOrderId } = req.params;
    const status = await orderService.getOrderStatus(shiprocketOrderId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment-methods
 * Get available payment methods with details
 */
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        key: 'prepaid',
        name: 'Prepaid',
        description: 'Pay now and save 5%',
        discount: 0.05,
        label: 'Save 5%'
      },
      {
        key: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order (6% additional charge)',
        surcharge: 0.06,
        label: '6% Extra Charge'
      }
    ]
  });
});

module.exports = router;
