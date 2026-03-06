require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const shiprocket = require('./shiprocket');

const prisma = new PrismaClient();

// --- HSN & GST CONFIGURATION ---
const HSN_RATES = {
  "6109": 18, // Apparel/T-shirts
  "3304": 18, // Beauty/Skin care
  "8517": 12, // Mobile Phones
  "default": 18
};

// --- SHIPPING CHARGE CONFIGURATION ---
// ✅ DYNAMIC SHIPPING CALCULATION
const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 5000, // Free shipping on orders >= ₹5000
  STANDARD_SHIPPING_CHARGE: 99,  // ₹99 for orders < ₹5000
  EXPRESS_SHIPPING_CHARGE: 199,  // ₹199 for fast delivery (optional)
  COD_SURCHARGE: 50,             // Additional charge for COD
  REMOTE_AREA_SURCHARGE: 100     // Additional charge for remote areas
};

/**
 * Calculate shipping charges based on order value
 * ✅ COMPLETE SHIPPING CALCULATION
 */
function calculateShippingCharges(subtotal, isExpress = false, isCOD = false, isRemoteArea = false) {
  let shippingCharge = 0;

  // Base shipping
  if (subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    shippingCharge = 0; // Free shipping
  } else {
    shippingCharge = isExpress 
      ? SHIPPING_CONFIG.EXPRESS_SHIPPING_CHARGE 
      : SHIPPING_CONFIG.STANDARD_SHIPPING_CHARGE;
  }

  // Additional surcharges
  if (isCOD) shippingCharge += SHIPPING_CONFIG.COD_SURCHARGE;
  if (isRemoteArea) shippingCharge += SHIPPING_CONFIG.REMOTE_AREA_SURCHARGE;

  return shippingCharge;
}

// --- HELPER FUNCTIONS ---

function calculateTaxBreakdown(item, sellerState, customerState) {
    const hsnCode = String(item.hsn || "default");
    const rate = HSN_RATES[hsnCode] || HSN_RATES["default"];
    const taxableAmount = Number(item.subtotal || 0);
    
    const sState = String(sellerState || "").toLowerCase().trim();
    const cState = String(customerState || "").toLowerCase().trim();

    // Multivendor Logic: Compare Seller State vs Customer State
    if (sState === cState && sState !== "") {
        const cgst = taxableAmount * (rate / 2 / 100);
        return { cgst: cgst, sgst: cgst, igst: 0, rate: rate, type: 'INTRA' };
    } else {
        const igst = taxableAmount * (rate / 100);
        return { cgst: 0, sgst: 0, igst: igst, rate: rate, type: 'INTER' };
    }
}

function numberToWords(num) {
  if (!num && num !== 0) return '';
  num = Math.round(num);
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function toWords(n) {
    let str = '';
    if (n >= 10000000) { str += toWords(Math.floor(n/10000000)) + ' Crore '; n = n % 10000000; }
    if (n >= 100000) { str += toWords(Math.floor(n/100000)) + ' Lakh '; n = n % 100000; }
    if (n >= 1000) { str += toWords(Math.floor(n/1000)) + ' Thousand '; n = n % 1000; }
    if (n >= 100) { str += toWords(Math.floor(n/100)) + ' Hundred '; n = n % 100; }
    if (n > 0) {
      if (n < 20) str += ones[n] + ' ';
      else str += tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : ' ');
    }
    return str.trim();
  }
  return (toWords(num) || 'Zero') + ' Rupees';
}

async function generateInvoicePdfBuffer(payload) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(16).text(payload.seller || 'Marketplace Seller', { align: 'left' });
      doc.fontSize(10).text(`GSTIN: ${payload.sellerGST || 'URP'}`, { align: 'left' });
      doc.moveDown(0.3);
      doc.fontSize(9).text(`Invoice Date: ${payload.timestamp || new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown(0.5);

      // Buyer
      doc.fontSize(10).text(`Bill To: ${payload.buyer || 'Customer'}`);
      if (payload.buyerAddress) doc.fontSize(9).text(payload.buyerAddress);
      if (payload.buyerPhone) doc.fontSize(9).text(`Phone: ${payload.buyerPhone}`);
      doc.moveDown(0.5);

      // Table
      const tableTop = doc.y;
      doc.fontSize(9);
      doc.text('Description', 40, tableTop);
      doc.text('HSN', 250, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Rate', 350, tableTop);
      doc.text('Tax Type', 410, tableTop);
      doc.text('Amount', 500, tableTop, { align: 'right' });
      doc.moveDown(0.5);

      let y = doc.y;
      (payload.invoice.items || []).forEach((it) => {
        y += 16;
        doc.text(it.title.substring(0, 30), 40, y);
        doc.text(String(it.hsn || '-'), 250, y);
        doc.text(String(it.qty), 300, y);
        doc.text(`₹${it.unit.toFixed(2)}`, 350, y);
        doc.text(it.taxDetails?.type || 'GST', 410, y);
        doc.text(`₹${it.subtotal.toFixed(2)}`, 500, y, { align: 'right' });
      });

      // Totals & GST Breakdown
      y += 30;
      const tax = payload.invoice.taxSummary || { totalCgst: 0, totalSgst: 0, totalIgst: 0 };
      const shipping = Number(payload.invoice.shippingCharges || 0) || 0;
      
      doc.fontSize(10).text(`Subtotal: ₹${(payload.invoice.subtotal || 0).toFixed(2)}`, 400, y);
      y += 14;

      doc.fontSize(10).text(`Shipping: ₹${shipping.toFixed(2)}`, 400, y);
      y += 14;
      
      if (tax.totalIgst > 0) {
        doc.text(`IGST: ₹${tax.totalIgst.toFixed(2)}`, 400, y);
      } else {
        doc.text(`CGST: ₹${tax.totalCgst.toFixed(2)}`, 400, y);
        y += 14;
        doc.text(`SGST: ₹${tax.totalSgst.toFixed(2)}`, 400, y);
      }
      
      y += 14;
      doc.fontSize(12).font('Helvetica-Bold').text(`Grand Total: ₹${(payload.invoice.total || 0).toFixed(2)}`, 400, y);

      const words = numberToWords(Math.round(payload.invoice.total || 0));
      doc.moveDown(2);
      doc.font('Helvetica').fontSize(9).text(`Amount in Words: ${words} Only`, 40);

      doc.end();
    } catch (e) { reject(e); }
  });
}

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3002;

// Initialize Services
let razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        console.log("Razorpay Initialized with Key ID:", process.env.RAZORPAY_KEY_ID.substring(0, 8) + "...");
    } else {
        console.warn("Razorpay keys missing in .env");
    }
} catch (e) {
    console.error("Razorpay Init Error:", e);
}

// --- API ENDPOINTS ---

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Nekxuz Backend Running' });
});

app.post('/api/payment/create-order', async (req, res) => {
  try {
    console.log("Create Order Request Body:", req.body);
    
    if (!razorpay) {
        console.error("Razorpay instance is null");
        return res.status(500).json({ error: "Razorpay not initialized on server." });
    }

    const { amount, currency = "INR", invoiceNumber } = req.body;
    
    if (!amount || isNaN(amount)) {
        console.error("Invalid amount:", amount);
        return res.status(400).json({ error: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency,
      receipt: invoiceNumber || "REC-" + Date.now(),
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created Successfully:", order.id);
    
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
      localOrderId: "LOC-" + Date.now()
    });
  } catch (error) {
    console.error("Create Order Error Stack:", error);
    res.status(500).json({ error: error.message, details: error.error });
  }
});

// --- GET USER ORDERS ---
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "email parameter required" });
    }

    // Query orders by customer email
    const orders = await prisma.order.findMany({
      where: {
        // You may need to add a customer_email or similar field to the Order model
        // For now, we'll return all orders if email matches OR just return all for testing
      },
      include: {
        payments: true,
        shipment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Filter by email from payment info or add to Order model
    res.json({ 
      ok: true,
      orders: orders.map(o => ({
        id: o.id,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt,
        subtotal: o.subtotal,
        tax: o.tax,
        shippingCharges: o.shippingCharges,
        buyerName: o.buyerName,
        buyerEmail: o.buyerEmail,
        buyerPhone: o.buyerPhone,
        buyerAddress: o.buyerAddress,
        buyerCity: o.buyerCity,
        buyerState: o.buyerState,
        buyerPincode: o.buyerPincode,
        shipment: o.shipment ? {
          shipment_id: o.shipment.shiprocketId,
          awb: o.shipment.awb,
          courier: o.shipment.courier,
          status: o.shipment.status
        } : null
      }))
    });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    console.log("Verify Payment Request");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, meta, invoicePayload } = req.body;
    
    // 1. Signature Verification
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    const digest = hmac.update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (digest !== razorpay_signature) return res.status(400).json({ ok: false, message: 'Invalid signature' });

    const invoices = [];
    // Support both 'meta' (from old code) and 'invoicePayload' (from test_checkout.html)
    let payloads = [];
    if (meta && meta.precomputedInvoices) {
        payloads = meta.precomputedInvoices;
  } else if (invoicePayload) {
        // Construct a payload from the test checkout data
    const shippingCharges = Number(invoicePayload.shipping_charges || 0) || 0;
    const baseSubtotal = invoicePayload.order_items.reduce((acc, i) => acc + ((i.selling_price || 100) * i.units), 0);
        payloads = [{
            invoice: {
                items: invoicePayload.order_items.map(i => ({ title: i.name, hsn: "default", qty: i.units, unit: i.selling_price || 100, subtotal: (i.selling_price || 100) * i.units })), 
        subtotal: baseSubtotal,
        shippingCharges: shippingCharges,
        total: baseSubtotal + shippingCharges // Tax added later
            },
            buyer: invoicePayload.billing_customer_name,
            buyerEmail: invoicePayload.billing_email,
            buyerAddress: invoicePayload.billing_address,
            buyerPincode: invoicePayload.billing_pincode,
            buyerCity: invoicePayload.billing_city,
            buyerState: invoicePayload.billing_state,
            buyerPhone: invoicePayload.billing_phone,
            sellerState: "Delhi", // Mock
            buyerState: "Delhi" // Mock
        }];
    } else if (meta && meta.invoice) {
        payloads = [{ invoice: meta.invoice, buyer: meta.buyer }];
    }

    for (let payload of payloads) {
        // 2. GST Calculation Logic
        let totalCgst = 0, totalSgst = 0, totalIgst = 0;
        
        if (payload.invoice && payload.invoice.items) {
            payload.invoice.items = payload.invoice.items.map(item => {
                const tax = calculateTaxBreakdown(item, payload.sellerState, payload.buyerState);
                totalCgst += tax.cgst;
                totalSgst += tax.sgst;
                totalIgst += tax.igst;
                return { ...item, taxDetails: tax };
            });

            payload.invoice.taxSummary = { totalCgst, totalSgst, totalIgst };
            payload.invoice.totalTax = totalCgst + totalSgst + totalIgst;
      // Ensure shipping stays additive and is shown separately on invoice.
      const shipping = Number(payload.invoice.shippingCharges || 0) || 0;
      payload.invoice.total = (payload.invoice.subtotal || 0) + shipping + payload.invoice.totalTax;
        }
        
        // 3. Generate PDF
        const pdfBuffer = await generateInvoicePdfBuffer(payload);
        const fileName = `invoice_${razorpay_payment_id}.pdf`;
        fs.writeFileSync(path.join(__dirname, fileName), pdfBuffer);

        // Don't push yet - we'll push after attaching shipment info
        
        // 4. Save to Database (Prisma)
        let orderId = null;
        try {
          const order = await prisma.order.create({
            data: {
              invoice: fileName,
              amount: payload.invoice ? payload.invoice.total : 0,
              currency: "INR",
              status: "paid",
              subtotal: payload.invoice ? payload.invoice.subtotal : 0,
              tax: payload.invoice ? payload.invoice.totalTax : 0,
              shippingCharges: payload.invoice ? payload.invoice.shippingCharges : 0,
              buyerName: payload.buyer || null,
              buyerEmail: payload.buyerEmail || null,
              buyerPhone: payload.buyerPhone || null,
              buyerAddress: payload.buyerAddress || null,
              buyerCity: payload.buyerCity || null,
              buyerState: payload.buyerState || null,
              buyerPincode: payload.buyerPincode || null,
              payments: {
                create: {
                  razorpayOrderId: razorpay_order_id,
                  razorpayPaymentId: razorpay_payment_id,
                  razorpaySignature: razorpay_signature,
                  amount: payload.invoice ? payload.invoice.total : 0,
                  status: "captured"
                }
              }
            }
          });
          orderId = order.id;
          console.log("Order saved to DB:", order.id);
        } catch (dbError) {
          console.error("Database Error:", dbError);
        }

        // 5. Create Shipment (Shiprocket) - FULLY INTEGRATED
        let shipmentInfo = null;
        if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD && orderId) {
             try {
                 console.log("\n" + "="*60);
                 console.log("🚀 STARTING SHIPROCKET SHIPMENT CREATION");
                 console.log("="*60);

                 // Prepare line items from cart
                 const lineItems = (payload.invoice?.items || []).map((item, idx) => ({
                     "sku": `NEKXUZ-${idx + 1}`,
                     "hsn_code": item.hsn || "3304",
                     "product_name": item.title || "Product",
                     "units": item.qty || 1,
                     "selling_price": (item.unit || 0),
                     "tax": (item.taxDetails?.cgst || item.taxDetails?.sgst || item.taxDetails?.igst || 0),
                     "discount": 0
                 }));

                 // Calculate totals
                 const subTotal = payload.invoice?.subtotal || 0;
                 const totalTax = payload.invoice?.totalTax || 0;
                 const shippingCharges = payload.invoice?.shippingCharges || 0;
                 const grandTotal = payload.invoice?.total || 0;

                 // Build Shiprocket payload - SIMPLIFIED FORMAT
                 const customerName = String(payload.buyer || "Customer");
                 const nameParts = customerName.trim().split(' ');
                 const firstName = nameParts[0] || "Customer";
                 const lastName = nameParts.slice(1).join(' ') || "User";
                 
                 // Prepare items with proper formatting
                 const items = (payload.invoice?.items || []).map((item, idx) => ({
                     "name": String(item.title || "Product"),
                     "sku": String(item.sku || `NEKXUZ-${idx + 1}`),
                     "units": parseInt(item.qty || 1),
                     "selling_price": parseFloat(item.unit || 0),
                     "discount": parseFloat(item.discount || 0),
                     "tax": parseFloat(item.taxDetails?.total || 0),
                     "hsn_code": String(item.hsn || "3304")
                 }));
                 
                 const shipmentPayload = {
                    "order_id": String(orderId),
                    "order_date": new Date().toISOString().split('T')[0],
                    
                    // Customer
                    "customer_name": firstName,
                    "customer_email": String(payload.buyerEmail || "customer@example.com"),
                    "customer_phone": String(payload.buyerPhone || "9999999999"),
                    
                    // Shipping address - flat format
                    "shipping_address": String(payload.buyerAddress || "N/A"),
                    "shipping_city": String(payload.buyerCity || "New Delhi"),
                    "shipping_state": String(payload.buyerState || "Delhi"),
                    "shipping_country": "India",
                    "shipping_zip": String(payload.buyerPincode || "110001"),
                    "shipping_phone": String(payload.buyerPhone || "9999999999"),
                    
                    // Billing address - flat format
                    "billing_customer_name": firstName,
                    "billing_last_name": lastName,
                    "billing_address": String(payload.buyerAddress || "N/A"),
                    "billing_city": String(payload.buyerCity || "New Delhi"),
                    "billing_state": String(payload.buyerState || "Delhi"),
                    "billing_country": "India",
                    "billing_zip": String(payload.buyerPincode || "110001"),
                    "billing_pincode": String(payload.buyerPincode || "110001"),
                    "billing_phone": String(payload.buyerPhone || "9999999999"),
                    "billing_email": String(payload.buyerEmail || "customer@example.com"),
                    "shipping_is_billing": 1,
                    
                    // Items
                    "order_items": items,
                    
                    // Pricing
                    "payment_method": "prepaid",
                    "sub_total": parseFloat(payload.invoice?.subtotal || 0),
                    "tax": parseFloat(payload.invoice?.totalTax || 0),
                    "shipping_charges": parseFloat(payload.invoice?.shippingCharges || 0),
                    "total": parseFloat(payload.invoice?.total || 0),
                    
                    // Package
                    "length": 20,
                    "breadth": 15,
                    "height": 10,
                    "weight": 0.5
                 };

                 console.log("\n📦 SHIPMENT PAYLOAD:");
                 console.log(JSON.stringify(shipmentPayload, null, 2));

                 // Create shipment via Shiprocket
                 const dRes = await shiprocket.createShipment(shipmentPayload);
                 
                 console.log("\n✅ SHIPROCKET RESPONSE:");
                 console.log(JSON.stringify(dRes, null, 2));
                 
                 // Extract shipment details from response
                 let shipmentId = null;
                 let awb = null;
                 let courierName = null;
                 let trackingUrl = null;
                 
                 // Check multiple response formats
                 if (dRes.success === true && dRes.shipment_id) {
                     shipmentId = dRes.shipment_id;
                     awb = dRes.awb || "PENDING";
                     courierName = dRes.courier_name || "Shiprocket";
                 } else if (dRes.status_code === 1 && dRes.shipment_id) {
                     // Shiprocket API v2 format - direct shipment_id
                     shipmentId = dRes.shipment_id;
                     awb = dRes.awb_code || "PENDING";
                     courierName = dRes.courier_name || "Shiprocket";
                 } else if (dRes.status === 1 && dRes.shipment_ids && dRes.shipment_ids.length > 0) {
                     shipmentId = dRes.shipment_ids[0];
                     awb = "PENDING"; // Will be generated after handover
                     courierName = "Shiprocket";
                 } else if (dRes.data && dRes.data.shipment_id) {
                     shipmentId = dRes.data.shipment_id;
                     awb = dRes.data.awb || "PENDING";
                     courierName = dRes.data.courier || "Shiprocket";
                 }
                 
                 // Save shipment to database
                 if (shipmentId) {
                     const shipmentRecord = await prisma.shipment.create({
                         data: {
                             orderId: orderId,
                             shiprocketId: String(shipmentId),
                             awb: String(awb),
                             courier: String(courierName || "Shiprocket"),
                             status: "booked",
                             payload: JSON.stringify({
                                 request: shipmentPayload,
                                 response: dRes,
                                 createdAt: new Date().toISOString()
                             })
                         }
                     });
                     
                     shipmentInfo = {
                         shipment_id: shipmentId,
                         awb: awb,
                         courier: courierName,
                         status: "booked"
                     };
                     
                     console.log("\n📊 SHIPMENT SAVED TO DATABASE:");
                     console.log(`  ID: ${shipmentId}`);
                     console.log(`  AWB: ${awb}`);
                     console.log(`  Courier: ${courierName}`);
                     console.log("="*60 + "\n");
                 } else {
                     console.warn("\n⚠️ Shipment created but no ID returned. Response:", dRes);
                 }

             } catch (dErr) {
                 console.error("\n❌ SHIPROCKET SHIPMENT ERROR:");
                 console.error({
                     message: dErr.message,
                     details: dErr.details,
                     status: dErr.status
                 });
                 console.log("="*60 + "\n");
                 // Continue with order even if shipment fails
             }
        } else {
            console.warn("\n⚠️ SKIPPING SHIPROCKET: Missing credentials or orderID");
            console.warn(`  SHIPROCKET_EMAIL: ${!!process.env.SHIPROCKET_EMAIL}`);
            console.warn(`  SHIPROCKET_PASSWORD: ${!!process.env.SHIPROCKET_PASSWORD}`);
            console.warn(`  orderId: ${orderId}\n`);
        }
        
        // Attach shipment info to response if available
        if (shipmentInfo) {
            payload.shipment = shipmentInfo;
        }
        
        // Now push to invoices array with shipment info attached
        invoices.push(payload);
    }

    // Build response with real shipment data
    let responseShipment = null;
    if (invoices[0]?.shipment) {
        responseShipment = invoices[0].shipment;
    } else {
        // Extract shipment info from first invoice if it exists
        const firstShipment = invoices[0];
        if (firstShipment?.shipment?.shipment_id) {
            responseShipment = firstShipment.shipment;
        }
    }

    return res.json({ 
        ok: true, 
        message: 'Verified and GST Calculated', 
        invoices,
        shipment: responseShipment ? {
            success: true,
            packages: [{ 
                waybill: responseShipment.awb || responseShipment.shipment_id,
                shipment_id: responseShipment.shipment_id,
                courier: responseShipment.courier,
                status: responseShipment.status
            }]
        } : { success: false, packages: [] }
    });
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- SHIPROCKET TRACKING ENDPOINT ---
app.get('/api/shipment/track/:shipmentId', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    
    if (!shipmentId) {
      return res.status(400).json({ error: "shipmentId parameter required" });
    }

    const tracking = await shiprocket.getShipmentTracking(shipmentId);
    res.json({ ok: true, tracking });
  } catch (err) {
    console.error("Shiprocket Tracking Error:", err);
    res.status(500).json({ error: err.message, details: err.details });
  }
});

// --- SHIPROCKET CANCEL ENDPOINT ---
app.post('/api/shipment/cancel/:shipmentId', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    
    if (!shipmentId) {
      return res.status(400).json({ error: "shipmentId parameter required" });
    }

    const result = await shiprocket.cancelShipment(shipmentId);
    res.json({ ok: true, result });
  } catch (err) {
    console.error("Shiprocket Cancel Error:", err);
    res.status(500).json({ error: err.message, details: err.details });
  }
});

// --- CALCULATE SHIPPING CHARGES FROM SHIPROCKET ---
app.post('/api/calculate-shipping', async (req, res) => {
  try {
    const { city, state, weight = 0.5, subtotal = 0, length = 20, breadth = 15, height = 10 } = req.body;

    if (!city || !state) {
      return res.status(400).json({ error: "city and state are required" });
    }

    console.log(`\n📦 Calculating shipping for: ${city}, ${state}`);

    // First try to get accurate shipping from Shiprocket
    if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      try {
        const shipmentData = {
          shipping_address: { city, state, country: 'India' },
          weight: weight || 0.5,
          length: length || 20,
          breadth: breadth || 15,
          height: height || 10,
          pickup_location_id: 1
        };

        console.log(`🚀 Requesting shipping cost from Shiprocket...`);
        const shiprocketResult = await shiprocket.calculateShippingCost(shipmentData);

        if (shiprocketResult && shiprocketResult.status === 1 && shiprocketResult.data) {
          // Shiprocket returned courier options with rates
          const courierOptions = shiprocketResult.data || [];
          
          // Get the cheapest option or default
          let minCost = 99; // Default fallback
          
          if (Array.isArray(courierOptions) && courierOptions.length > 0) {
            const costs = courierOptions
              .map(c => parseFloat(c.rate || c.charge || 99))
              .filter(c => !isNaN(c) && c > 0);
            
            if (costs.length > 0) {
              minCost = Math.min(...costs);
              console.log(`💰 Shiprocket courier options found:`, courierOptions.map(c => ({
                courier: c.courier_name || c.name || 'Unknown',
                rate: c.rate || c.charge
              })));
            }
          }

          // Apply free shipping threshold
          let finalShipping = minCost;
          if (subtotal >= 5000) {
            finalShipping = 0;
            console.log(`✅ Free shipping applied (order >= ₹5000)`);
          } else {
            console.log(`💵 Shipping charge: ₹${finalShipping} (from Shiprocket)`);
          }

          return res.json({ 
            ok: true, 
            shipping_charges: finalShipping,
            shiprocket_charges: minCost,
            message: finalShipping === 0 
              ? "Free shipping on orders above ₹5000" 
              : `Shipping ₹${finalShipping} (via ${courierOptions[0]?.courier_name || 'Shiprocket'})`
          });
        }
      } catch (err) {
        console.warn(`⚠️ Shiprocket calculation failed, using fallback:`, err.message);
        // Fall through to default calculation
      }
    }

    // Fallback to simple calculation based on subtotal
    let shippingCharges = 0;
    
    if (subtotal >= 5000) {
      shippingCharges = 0; // Free shipping for orders >= 5000
    } else {
      shippingCharges = 99; // Standard shipping
    }

    console.log(`📦 Shipping calculated (fallback): ${city}, ${state} - Charges: ₹${shippingCharges}`);
    
    res.json({ 
      ok: true, 
      shipping_charges: shippingCharges,
      message: subtotal >= 5000 ? "Free shipping on orders above ₹5000" : "Standard shipping ₹99"
    });
  } catch (err) {
    console.error("Shipping Calculation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Nekxuz Server running on port ${PORT}`);
  if (process.env.RAZORPAY_KEY_ID) {
     console.log(`Razorpay Key Loaded: ${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...`);
  }
});