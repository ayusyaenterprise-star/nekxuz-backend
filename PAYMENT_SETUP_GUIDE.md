# COD & Payment Method Implementation Guide

This implementation adds COD (Cash on Delivery) with 6% surcharge and Prepaid with 5% discount to your Nekxuz platform, with Shiprocket integration for order fulfillment.

## Features

✅ **Prepaid Option** - Save 5% on your order
✅ **Cash on Delivery (COD)** - Pay on delivery with 6% extra charge
✅ **Shiprocket Integration** - Auto-create shipments for COD orders
✅ **Order Tracking** - Track order status via Shiprocket
✅ **Amount Collection** - Clearly shows amount to collect for COD orders

## Files Created

1. **order-service.js** - Core business logic for order processing and Shiprocket integration
2. **api-orders.js** - Express API endpoints for order handling
3. **CheckoutScreen.jsx** - React component for checkout UI

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
npm install axios
```

### Step 2: Update Environment Variables

Create or update `.env` file in your project root:

```env
# Shiprocket Configuration
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_PICKUP_LOCATION=1  # Your warehouse/pickup location ID
SHIPROCKET_CHANNEL_ID=12345   # Your Shiprocket channel ID

# API Configuration
BACKEND_URL=http://localhost:3002
```

### Step 3: Integrate API Routes into server.js

Add this to your `server.js`:

```javascript
const ordersRouter = require('./api-orders.js');

// Add this middleware
app.use('/api/orders', ordersRouter);

// If not already present, add CORS and JSON middleware
app.use(express.json());
app.use(cors());
```

### Step 4: Import CheckoutScreen into App.js

In your `App.js`, add the CheckoutScreen component and integrate it:

```javascript
import CheckoutScreen from './CheckoutScreen.jsx';

// In your App component's render/return, add:
case 'checkout':
  return <CheckoutScreen 
    cartItems={cart} 
    user={user} 
    onOrderComplete={(order) => {
      console.log('Order placed:', order);
      setCart([]);
      setActiveTab('account');
    }}
  />;
```

### Step 5: Update Cart to Checkout Navigation

In your cart modal or checkout button, add:

```javascript
// When user clicks "Checkout" button
navigate('checkout'); // This will show the CheckoutScreen
```

## API Endpoints

### 1. Calculate Order Total
**POST** `/api/orders/calculate`

Request:
```json
{
  "subtotal": 1000,
  "paymentMethod": "prepaid"  // or "cod"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "subtotal": 1000,
    "adjustment": -50,           // -50 for prepaid (5% discount)
    "adjustmentAmount": 50,
    "total": 950,
    "paymentMethod": "prepaid",
    "label": "Save 5%"
  }
}
```

### 2. Create Order
**POST** `/api/orders/create`

Request:
```json
{
  "items": [
    {
      "id": "p1",
      "title": "Product Name",
      "price": "₹100",
      "quantity": 10
    }
  ],
  "subtotal": 1000,
  "paymentMethod": "cod",
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "address": "123 Main St",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India",
  "pincode": "110001"
}
```

Response (COD):
```json
{
  "success": true,
  "order": {
    "id": "ORD-1704112400123",
    "subtotal": 1000,
    "adjustment": 60,
    "adjustmentAmount": 60,
    "total": 1060,
    "paymentMethod": "cod",
    "shiprocketOrderId": "12345",
    "shipmentId": "67890",
    "codAmount": 1060,
    "status": "pending_payment"
  },
  "message": "COD order created. Amount to be collected: ₹1060.00"
}
```

### 3. Get Payment Methods
**GET** `/api/payment-methods`

Response:
```json
{
  "success": true,
  "methods": [
    {
      "key": "prepaid",
      "name": "Prepaid",
      "description": "Pay now and save 5%",
      "discount": 0.05,
      "label": "Save 5%"
    },
    {
      "key": "cod",
      "name": "Cash on Delivery",
      "description": "Pay when you receive your order (6% additional charge)",
      "surcharge": 0.06,
      "label": "6% Extra Charge"
    }
  ]
}
```

### 4. Get Order Status
**GET** `/api/orders/:shiprocketOrderId/status`

Response: Shiprocket order status

## Shiprocket Integration Details

### What Happens on COD Order:

1. ✅ Order is created locally with ID
2. ✅ Amount to collect is calculated (subtotal + 6%)
3. ✅ Shiprocket login token is obtained
4. ✅ Order is sent to Shiprocket with:
   - Customer details
   - Delivery address
   - Order items and pricing
   - **COD Amount** to collect
5. ✅ Shiprocket generates shipping label
6. ✅ Courier can track COD amount via Shiprocket dashboard
7. ✅ Payment collection details are visible to logistics partner

### Shiprocket Pickup Location Setup:

1. Log in to Shiprocket Dashboard
2. Go to Settings → Pickup Locations
3. Note your Pickup Location ID
4. Add to `.env`: `SHIPROCKET_PICKUP_LOCATION=<your_id>`

## Payment Methods Summary

| Method | Calculation | Example |
|--------|-------------|---------|
| **Prepaid** | Subtotal - 5% | ₹1000 → ₹950 |
| **COD** | Subtotal + 6% | ₹1000 → ₹1060 |

## Testing

### Test COD Order:
1. Add items to cart
2. Go to checkout
3. Select "Cash on Delivery"
4. Fill shipping address
5. Click "Place Order"
6. Check Shiprocket dashboard for order

### Test Prepaid Order:
1. Add items to cart
2. Go to checkout
3. Select "Prepaid"
4. See 5% discount applied
5. Fill shipping address
6. Click "Place Order"
7. Integrate payment gateway (Razorpay) for payment processing

## Future Enhancements

- [ ] Razorpay payment gateway integration for prepaid
- [ ] Email notifications for order confirmation
- [ ] SMS notifications for COD collection
- [ ] Admin dashboard for order management
- [ ] Real-time Shiprocket sync
- [ ] Multiple address management for customers
- [ ] Order cancellation and refund handling

## Troubleshooting

**Issue: "Shiprocket Login Failed"**
- Solution: Check email and password in `.env`

**Issue: "Failed to create order in Shiprocket"**
- Solution: Verify channel ID and pickup location are correct
- Check Shiprocket account has active channel

**Issue: COD amount not showing**
- Solution: Ensure payment method is set to "cod" in order

## Support

For Shiprocket API docs: https://apiv2.shiprocket.in/
For more details on COD: Contact Shiprocket support

---

**Note:** Remember to update Shiprocket credentials in `.env` before deploying!
