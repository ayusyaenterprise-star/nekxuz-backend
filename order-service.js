// Order Service - Handle payment methods, pricing, and Shiprocket integration
const axios = require('axios');

// Shiprocket API Configuration
const SHIPROCKET_CONFIG = {
  BASE_URL: 'https://apiv2.shiprocket.in/v1/external',
  EMAIL: process.env.SHIPROCKET_EMAIL || 'your_shiprocket_email@example.com',
  PASSWORD: process.env.SHIPROCKET_PASSWORD || 'your_shiprocket_password',
  TOKEN: null // Will be set after login
};

// Payment Constants
const PAYMENT_METHODS = {
  PREPAID: {
    name: 'Prepaid',
    key: 'prepaid',
    discount: 0.05, // 5% discount
    label: 'Save 5%'
  },
  COD: {
    name: 'Cash on Delivery',
    key: 'cod',
    surcharge: 0.06, // 6% surcharge
    label: '6% Extra Charge'
  }
};

/**
 * Calculate order total with payment method adjustments
 * @param {number} subtotal - Subtotal before adjustments
 * @param {string} paymentMethod - 'prepaid' or 'cod'
 * @returns {object} - { subtotal, adjustment, adjustmentAmount, total, paymentMethod }
 */
function calculateOrderTotal(subtotal, paymentMethod) {
  let adjustment = 0;
  let adjustmentAmount = 0;

  if (paymentMethod === PAYMENT_METHODS.PREPAID.key) {
    adjustmentAmount = subtotal * PAYMENT_METHODS.PREPAID.discount;
    adjustment = -adjustmentAmount; // Negative for discount
  } else if (paymentMethod === PAYMENT_METHODS.COD.key) {
    adjustmentAmount = subtotal * PAYMENT_METHODS.COD.surcharge;
    adjustment = adjustmentAmount; // Positive for surcharge
  }

  return {
    subtotal,
    adjustment,
    adjustmentAmount,
    total: subtotal + adjustment,
    paymentMethod,
    label: paymentMethod === PAYMENT_METHODS.PREPAID.key 
      ? PAYMENT_METHODS.PREPAID.label 
      : PAYMENT_METHODS.COD.label
  };
}

/**
 * Login to Shiprocket and get auth token
 */
async function shiprocketLogin() {
  try {
    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/auth/login`,
      {
        email: SHIPROCKET_CONFIG.EMAIL,
        password: SHIPROCKET_CONFIG.PASSWORD
      }
    );

    if (response.data.token) {
      SHIPROCKET_CONFIG.TOKEN = response.data.token;
      console.log('Shiprocket Login Successful');
      return response.data.token;
    }
  } catch (error) {
    console.error('Shiprocket Login Failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

/**
 * Create order in Shiprocket for COD orders
 * @param {object} orderData - Order details
 */
async function createShiprocketOrder(orderData) {
  try {
    // Ensure we have a valid token
    if (!SHIPROCKET_CONFIG.TOKEN) {
      await shiprocketLogin();
    }

    const shiprocketPayload = {
      order_id: orderData.orderId,
      order_date: new Date().toISOString(),
      pickup_location_id: process.env.SHIPROCKET_PICKUP_LOCATION || 1,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || 12345,
      billing_customer_name: orderData.customerName,
      billing_email: orderData.email,
      billing_phone: orderData.phone,
      billing_address: orderData.address,
      billing_city: orderData.city,
      billing_state: orderData.state,
      billing_country: orderData.country,
      billing_pincode: orderData.pincode,
      shipping_is_billing: true,
      order_items: orderData.items.map(item => ({
        name: item.title,
        sku: item.id,
        units: item.quantity,
        selling_price: parseFloat(item.price.replace(/[^0-9.]/g, ''))
      })),
      payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: orderData.subtotal,
      length: 5,
      breadth: 5,
      height: 5,
      weight: 0.5,
      cod_amount: orderData.paymentMethod === 'cod' ? orderData.total : 0
    };

    const response = await axios.post(
      `${SHIPROCKET_CONFIG.BASE_URL}/orders/create/adhoc`,
      shiprocketPayload,
      {
        headers: {
          'Authorization': `Bearer ${SHIPROCKET_CONFIG.TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('Shiprocket Order Created:', response.data.data.order_id);
      return {
        success: true,
        shiprocketOrderId: response.data.data.order_id,
        shipmentId: response.data.data.shipments?.[0]?.id
      };
    }
  } catch (error) {
    console.error('Shiprocket Order Creation Failed:', error.response?.data || error.message);
    throw new Error('Failed to create order in Shiprocket');
  }
}

/**
 * Process order and send to Shiprocket if COD
 * @param {object} orderData - Complete order data
 */
async function processOrder(orderData) {
  try {
    // Calculate totals
    const pricing = calculateOrderTotal(orderData.subtotal, orderData.paymentMethod);

    // Create order object
    const order = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      ...pricing,
      createdAt: new Date(),
      status: orderData.paymentMethod === 'cod' ? 'pending_payment' : 'pending_fulfillment'
    };

    // If COD, send to Shiprocket
    if (orderData.paymentMethod === 'cod') {
      const shiprocketResult = await createShiprocketOrder(order);
      order.shiprocketOrderId = shiprocketResult.shiprocketOrderId;
      order.shipmentId = shiprocketResult.shipmentId;
      order.shiprocketStatus = 'created';
      order.codAmount = order.total; // Amount to be collected
    }

    return {
      success: true,
      order,
      message: orderData.paymentMethod === 'cod' 
        ? 'COD order created. Amount to be collected: ₹' + order.total.toFixed(2)
        : 'Prepaid order created. Proceed with payment.'
    };
  } catch (error) {
    console.error('Order Processing Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Shiprocket order status
 */
async function getOrderStatus(shiprocketOrderId) {
  try {
    if (!SHIPROCKET_CONFIG.TOKEN) {
      await shiprocketLogin();
    }

    const response = await axios.get(
      `${SHIPROCKET_CONFIG.BASE_URL}/orders/${shiprocketOrderId}`,
      {
        headers: {
          'Authorization': `Bearer ${SHIPROCKET_CONFIG.TOKEN}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to get order status:', error.message);
    throw error;
  }
}

module.exports = {
  PAYMENT_METHODS,
  calculateOrderTotal,
  processOrder,
  createShiprocketOrder,
  shiprocketLogin,
  getOrderStatus
};
