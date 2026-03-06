// CheckoutScreen Component - Payment selection and order processing
// This is React code to add to App.js

const CheckoutScreen = ({ cartItems = [], user, onOrderComplete }) => {
  const [paymentMethod, setPaymentMethod] = React.useState('prepaid');
  const [loading, setLoading] = React.useState(false);
  const [orderData, setOrderData] = React.useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  });
  const [orderSummary, setOrderSummary] = React.useState(null);
  const [error, setError] = React.useState('');

  // DIRECT BACKEND URL - Bypasses proxy issues
  const API_URL = 'https://nekxuz-backend-oqcn.onrender.com';

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    const qty = parseInt(item.moq) || 1;
    return sum + (price * qty);
  }, 0);

  // Calculate order total based on payment method
  React.useEffect(() => {
    const calculateTotal = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subtotal,
            paymentMethod
          })
        });
        const data = await response.json();
        if (data.success) {
          setOrderSummary(data.data);
        }
      } catch (err) {
        console.error('Failed to calculate order:', err);
      }
    };

    if (subtotal > 0) {
      calculateTotal();
    }
  }, [subtotal, paymentMethod]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!orderData.phone || !orderData.address || !orderData.city || !orderData.state || !orderData.pincode) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare order payload
      const payload = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: parseInt(item.moq) || 1
        })),
        subtotal,
        paymentMethod,
        ...orderData
      };

      // Send to backend
      const response = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        // Store order details
        const order = result.order;
        
        if (paymentMethod === 'cod') {
          alert(`COD Order Created!\nOrder ID: ${order.id}\nAmount to collect: ₹${order.total.toFixed(2)}\nShiprocket Order: ${order.shiprocketOrderId}`);
        } else {
          alert(`Prepaid Order Created!\nOrder ID: ${order.id}\nAmount to pay: ₹${order.total.toFixed(2)}\n\nRedirecting to payment...`);
          // Here you would integrate Razorpay or other payment gateway
        }

        // Notify parent component
        if (onOrderComplete) {
          onOrderComplete(order);
        }
      } else {
        setError(result.error || 'Failed to create order');
      }
    } catch (err) {
      setError(err.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Order Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

            {/* Payment Method Selection */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              
              <div className="space-y-3">
                {/* Prepaid Option */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                  style={{ borderColor: paymentMethod === 'prepaid' ? '#FF0000' : '#e5e7eb', backgroundColor: paymentMethod === 'prepaid' ? 'rgba(255, 0, 0, 0.02)' : 'white' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="prepaid"
                    checked={paymentMethod === 'prepaid'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-gray-900">Prepaid</div>
                    <div className="text-sm text-green-600 font-medium">💰 Save 5% on your order</div>
                  </div>
                </label>

                {/* COD Option */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                  style={{ borderColor: paymentMethod === 'cod' ? '#FF0000' : '#e5e7eb', backgroundColor: paymentMethod === 'cod' ? 'rgba(255, 0, 0, 0.02)' : 'white' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-gray-900">Cash on Delivery (COD)</div>
                    <div className="text-sm text-orange-600 font-medium">📦 Pay when order arrives (6% extra charge)</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={orderData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={orderData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={orderData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="110001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    name="address"
                    value={orderData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Street address, building, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={orderData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Delhi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={orderData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Delhi"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-700">
                  <span>{item.title}</span>
                  <span>₹{(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) * parseInt(item.moq || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            {orderSummary && (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{orderSummary.subtotal.toFixed(2)}</span>
                  </div>

                  {orderSummary.adjustment !== 0 && (
                    <div className="flex justify-between" style={{ color: orderSummary.adjustment < 0 ? '#16a34a' : '#dc2626' }}>
                      <span className="font-medium">{orderSummary.label}</span>
                      <span className="font-medium">{orderSummary.adjustment < 0 ? '-' : '+'}₹{Math.abs(orderSummary.adjustment).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-red-600">₹{orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Note for COD */}
                {paymentMethod === 'cod' && (
                  <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                    <strong>📦 COD Note:</strong> Amount ₹{orderSummary.total.toFixed(2)} will be collected at delivery
                  </div>
                )}

                {/* Discount/Surcharge Explanation */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <strong>💡 Payment Method Details:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Prepaid: Get 5% discount</li>
                    <li>COD: 6% extra charge applies</li>
                  </ul>
                </div>
              </>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !orderSummary}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <p className="text-xs text-gray-600 text-center mt-4">
              By placing an order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
