const axios = require('axios');

// Shiprocket API configuration
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const EMAIL = process.env.SHIPROCKET_EMAIL;
const PASSWORD = process.env.SHIPROCKET_PASSWORD;
const DEBUG = process.env.SHIPROCKET_DEBUG === 'true';

let cachedToken = null;
let tokenObtainedAt = 0;
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours (Shiprocket tokens last 24 hours)

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Login to Shiprocket and get auth token
 */
async function login() {
  if (!EMAIL || !PASSWORD) {
    console.error('[shiprocket] ERROR: SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are required in .env');
    throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are required');
  }

  try {
    console.log('[shiprocket] Attempting login with email:', EMAIL);
    
    const resp = await axios.post(`${BASE_URL}/auth/login`, 
      { email: EMAIL, password: PASSWORD },
      { timeout: 10000 }
    );

    const token = resp.data?.token;
    if (!token) {
      console.warn('[shiprocket] Login response (no token):', JSON.stringify(resp.data, null, 2));
      throw new Error('Shiprocket login succeeded but no token in response');
    }

    cachedToken = token;
    tokenObtainedAt = Date.now();
    console.log('[shiprocket] ✅ Login successful, token cached for 23 hours');
    return token;
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data || err.message || String(err);
    console.error('[shiprocket] ❌ Login failed:', {
      status: status,
      message: err.message,
      details: details
    });
    const e = new Error('Shiprocket login failed: ' + (details?.message || err.message));
    e.details = details;
    e.status = status;
    throw e;
  }
}

/**
 * Get valid token (use cached if not expired)
 */
async function getToken() {
  if (cachedToken && (Date.now() - tokenObtainedAt) < TOKEN_TTL_MS) {
    if (DEBUG) console.log('[shiprocket] Using cached token');
    return cachedToken;
  }
  console.log('[shiprocket] Token expired or not cached, requesting new token...');
  return await login();
}

/**
 * Create a shipment on Shiprocket
 * ✅ FULLY COMPATIBLE WITH SHIPROCKET API V2
 */
async function createShipment(shipmentData) {
  try {
    console.log('[shiprocket] ⏳ Starting shipment creation...');
    const token = await getToken();
    
    console.log('[shiprocket] 📦 SENDING PAYLOAD to /orders/create/adhoc:');
    console.log(JSON.stringify(shipmentData, null, 2));

    // Make the API call
    console.log('[shiprocket] 📤 Sending request to POST /orders/create/adhoc');
    let resp;
    try {
      resp = await client.post('/orders/create/adhoc', shipmentData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (apiErr) {
      // If it's a 400, try to get more details from the error
      if (apiErr.response?.status === 400) {
        console.error('[shiprocket] ⚠️ HTTP 400 response body:', JSON.stringify(apiErr.response.data, null, 2));
        console.error('[shiprocket] ⚠️ Request headers:', JSON.stringify(apiErr.config?.headers, null, 2));
        console.error('[shiprocket] ⚠️ Request data:', JSON.stringify(apiErr.config?.data, null, 2));
      }
      throw apiErr;
    }

    const data = resp.data;
    
    // Log successful response
    if (data.success === true || data.status === 1) {
      console.log('[shiprocket] ✅ Shipment created successfully!');
      console.log('[shiprocket] 📊 Response:', {
        success: data.success,
        status: data.status,
        shipment_id: data.shipment_id,
        shipment_ids: data.shipment_ids,
        packages: data.packages,
        message: data.message
      });
    } else {
      console.warn('[shiprocket] ⚠️ Response received but may indicate issue:', data);
    }
    
    return data;
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data || {};
    const errorMsg = details.message || details.error || err.message || 'Unknown error';
    
    console.error('[shiprocket] ❌ Shipment creation failed with HTTP', status);
    console.error('[shiprocket] Error message:', errorMsg);
    
    // Print detailed validation errors
    if (details.errors) {
      console.error('[shiprocket] ❌ API Validation Errors:');
      for (const field in details.errors) {
        const fieldErrors = details.errors[field];
        if (Array.isArray(fieldErrors)) {
          console.error(`  ❌ ${field}:`, fieldErrors.join('; '));
        } else {
          console.error(`  ❌ ${field}:`, fieldErrors);
        }
      }
    }
    
    console.error('[shiprocket] Full error response:', JSON.stringify(details, null, 2));
    
    const e = new Error('Shiprocket shipment creation failed: ' + errorMsg);
    e.details = details;
    e.status = status;
    throw e;
  }
}

/**
 * Calculate shipping cost based on Shiprocket warehouse and zones
 * Returns estimated shipping cost
 */
async function calculateShippingCost(shipmentData) {
  try {
    const token = await getToken();
    
    const payload = {
      pickup_location_id: shipmentData.pickup_location_id || 1,
      delivery_address_city: shipmentData.shipping_address?.city || '',
      delivery_address_state: shipmentData.shipping_address?.state || '',
      delivery_address_country: shipmentData.shipping_address?.country || 'India',
      weight: shipmentData.weight || 0.5,
      length: shipmentData.length || 20,
      breadth: shipmentData.breadth || 15,
      height: shipmentData.height || 10
    };

    if (DEBUG) console.log('[shiprocket] 📤 Calculating shipping cost with payload:', JSON.stringify(payload, null, 2));

    // Try multiple endpoints for shipping cost calculation
    let resp = null;
    
    try {
      // Try the predict endpoint first
      resp = await client.post('/courier/assign/predict', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err1) {
      if (err1.response?.status === 404) {
        console.log('[shiprocket] Predict endpoint not available, trying alternative...');
        
        // Try zone-based calculation endpoint
        try {
          resp = await client.post('/settings/warehouse/zones', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (err2) {
          console.log('[shiprocket] Zone endpoint not available, using fallback...');
          // If both fail, throw the original error
          throw err1;
        }
      } else {
        throw err1;
      }
    }

    console.log('[shiprocket] 💰 Shipping cost calculated:', JSON.stringify(resp.data, null, 2));
    return resp.data;
  } catch (err) {
    const details = err.response?.data || err.message || {};
    console.warn('[shiprocket] ⚠️ Could not calculate shipping cost:', details);
    // Return error status so frontend can use fallback
    return { status: 0, code: 'error', message: 'Could not calculate cost', error: details };
  }
}

/**
 * Get shipment tracking details
 */
async function getShipmentTracking(shipmentId) {
  try {
    const token = await getToken();
    console.log('[shiprocket] 🔍 Fetching tracking for shipment:', shipmentId);

    const resp = await client.get(`/shipments/${shipmentId}/track`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('[shiprocket] ✅ Tracking data:', resp.data);
    return resp.data;
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data || {};
    console.error('[shiprocket] ❌ Get tracking failed:', {
      status: status,
      message: err.message,
      details: details
    });
    const e = new Error('Shiprocket get tracking failed: ' + (details.message || err.message));
    e.details = details;
    throw e;
  }
}

/**
 * Cancel a shipment
 */
async function cancelShipment(shipmentId) {
  try {
    const token = await getToken();
    console.log('[shiprocket] ❌ Cancelling shipment:', shipmentId);

    const resp = await client.post(`/shipments/${shipmentId}/cancel`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('[shiprocket] ✅ Shipment cancelled:', resp.data);
    return resp.data;
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data || {};
    console.error('[shiprocket] ❌ Cancel shipment failed:', {
      status: status,
      message: err.message,
      details: details
    });
    const e = new Error('Shiprocket cancel shipment failed: ' + (details.message || err.message));
    e.details = details;
    throw e;
  }
}

/**
 * Get available couriers for a shipment
 */
async function getAvailableCouriers(shipmentData) {
  try {
    const token = await getToken();
    
    console.log('[shiprocket] 🚚 Fetching available couriers...');

    const resp = await client.post('/courier/assign/predict', shipmentData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('[shiprocket] ✅ Available couriers:', resp.data);
    return resp.data;
  } catch (err) {
    const details = err.response?.data || {};
    console.warn('[shiprocket] ⚠️ Could not fetch couriers:', details);
    return null;
  }
}

/**
 * Get available pickup locations
 */
async function getPickupLocations() {
  try {
    const token = await getToken();
    
    if (DEBUG) console.log('[shiprocket] 📍 Fetching pickup locations...');

    // Try multiple endpoints
    let resp;
    try {
      resp = await client.get('/settings/pickup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e1) {
      console.log('[shiprocket] Trying alternate endpoint /warehouse...');
      try {
        resp = await client.get('/warehouse', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e2) {
        console.log('[shiprocket] Trying alternate endpoint /settings/warehouses...');
        resp = await client.get('/settings/warehouses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    }

    console.log('[shiprocket] ✅ Pickup locations:', JSON.stringify(resp.data, null, 2));
    return resp.data;
  } catch (err) {
    const details = err.response?.data || {};
    console.error('[shiprocket] ❌ Could not fetch pickup locations:', details);
    console.error('[shiprocket] Error:', err.message);
    return null;
  }
}

/**
 * Generate and download invoice PDF from Shiprocket
 * @param {number} shipmentId - Shiprocket shipment ID
 * @returns {Buffer} PDF buffer
 */
async function getInvoicePDF(shipmentId) {
  if (!shipmentId) {
    throw new Error('shipmentId is required');
  }

  try {
    const token = await getToken();
    
    console.log(`[shiprocket] 🔍 Fetching invoice PDF for shipment: ${shipmentId}`);
    
    const resp = await axios.get(
      `${BASE_URL}/orders/print/shipment/${shipmentId}/?html=False`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    if (!resp.data) {
      console.warn('[shiprocket] ⚠️ Invoice PDF response is empty');
      throw new Error('No PDF data received from Shiprocket');
    }

    console.log(`[shiprocket] ✅ Invoice PDF retrieved successfully for shipment ${shipmentId}`);
    return resp.data; // This is the PDF buffer
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data || err.message;
    
    console.error('[shiprocket] ❌ Failed to get invoice PDF:', {
      status,
      shipmentId,
      error: details
    });
    
    throw new Error(`Failed to retrieve invoice from Shiprocket: ${err.message}`);
  }
}

/**
 * Get shipment details including invoice URL
 * @param {number} shipmentId - Shiprocket shipment ID
 * @returns {Object} Shipment details with invoice URL
 */
async function getShipmentDetails(shipmentId) {
  if (!shipmentId) {
    throw new Error('shipmentId is required');
  }

  try {
    const token = await getToken();
    
    console.log(`[shiprocket] 🔍 Fetching shipment details for: ${shipmentId}`);
    
    const resp = await axios.get(
      `${BASE_URL}/orders/shipments/${shipmentId}/`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      }
    );

    if (!resp.data) {
      throw new Error('No shipment details received');
    }

    console.log(`[shiprocket] ✅ Shipment details retrieved:`, JSON.stringify(resp.data, null, 2));
    return resp.data;
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data || err.message;
    
    console.error('[shiprocket] ❌ Failed to get shipment details:', {
      status,
      shipmentId,
      error: details
    });
    
    throw new Error(`Failed to retrieve shipment details: ${err.message}`);
  }
}

module.exports = {
  createShipment,
  getShipmentTracking,
  cancelShipment,
  getAvailableCouriers,
  calculateShippingCost,
  getToken,
  login,
  getPickupLocations,
  getInvoicePDF,
  getShipmentDetails
};
