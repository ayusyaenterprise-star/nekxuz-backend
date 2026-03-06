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

// Initialize Prisma with explicit datasource URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// --- HSN & GST CONFIGURATION ---
const HSN_RATES = {
  "6109": 18, // Apparel/T-shirts
  "3304": 18, // Beauty/Skin care
  "8517": 12, // Mobile Phones
  "3306": 5,  // Toothbrushes (5% GST)
  "toothbrush": 5, // Toothbrush products (5% GST)
  "toothpaste": 5, // Toothpaste (5% GST)
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

      // Company Header
      doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
      doc.fontSize(10).text('', { align: 'center' });
      
      // Seller Info (Manufacturer/Vendor)
      doc.fontSize(11).font('Helvetica-Bold').text(`Sold By: ${payload.seller || 'Marketplace Seller'}`, { align: 'left' });
      doc.fontSize(9).font('Helvetica').text(`GSTIN: ${payload.sellerGST || 'Under Registration Process'}`);
      if (payload.sellerAddress) doc.fontSize(8).text(payload.sellerAddress);
      if (payload.sellerPhone) doc.fontSize(8).text(`Phone: ${payload.sellerPhone}`);
      doc.moveDown(0.3);
      
      // Mediator Info (Ayusya Enterprise)
      doc.fontSize(9).font('Helvetica-Bold').text('Intermediary / Marketplace Operator:');
      doc.fontSize(8).font('Helvetica').text('Ayusya Enterprise (Nekxuz)');
      doc.fontSize(8).text('Email: ayusyaenterprise@gmail.com');
      doc.moveDown(0.5);
      
      // Invoice Details
      const invoiceDate = new Date().toLocaleDateString('en-IN');
      const invoiceNumber = payload.invoiceNumber || `INV-${payload.orderId || Date.now()}`;
      doc.fontSize(9).text(`Invoice No: ${invoiceNumber}`, 400, 130);
      doc.fontSize(9).text(`Date: ${invoiceDate}`, 400, 145);
      doc.moveDown(0.5);

      // Bill To (Customer)
      doc.fontSize(10).font('Helvetica-Bold').text('Bill To:');
      doc.fontSize(9).font('Helvetica').text(payload.buyer || 'Customer');
      if (payload.buyerAddress) doc.fontSize(8).text(payload.buyerAddress);
      if (payload.buyerCity && payload.buyerState && payload.buyerPincode) {
        doc.fontSize(8).text(`${payload.buyerCity}, ${payload.buyerState} ${payload.buyerPincode}`);
      }
      if (payload.buyerPhone) doc.fontSize(8).text(`Phone: ${payload.buyerPhone}`);
      if (payload.buyerEmail) doc.fontSize(8).text(`Email: ${payload.buyerEmail}`);
      doc.moveDown(0.5);

      // Table Header
      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Item Description', 40, tableTop);
      doc.text('HSN', 220, tableTop);
      doc.text('Qty', 260, tableTop);
      doc.text('Rate', 300, tableTop);
      doc.text('GST %', 360, tableTop);
      doc.text('Amount', 480, tableTop, { align: 'right' });
      doc.moveTo(40, tableTop + 12).lineTo(550, tableTop + 12).stroke();
      doc.moveDown(0.5);

      let y = doc.y;
      let itemCount = 0;
      (payload.invoice.items || []).forEach((it) => {
        itemCount++;
        y += 16;
        const gstRate = it.taxDetails?.rate || 18;
        doc.font('Helvetica').fontSize(8);
        doc.text(it.title?.substring(0, 35) || 'Item', 40, y);
        doc.text(String(it.hsn || '-'), 220, y);
        doc.text(String(it.qty), 260, y);
        doc.text(`₹${it.unit?.toFixed(2) || '0.00'}`, 300, y);
        doc.text(`${gstRate}%`, 360, y);
        doc.text(`₹${it.subtotal?.toFixed(2) || '0.00'}`, 480, y, { align: 'right' });
      });

      // Summary Section
      y += 25;
      doc.moveTo(40, y).lineTo(550, y).stroke();
      y += 12;
      
      doc.font('Helvetica').fontSize(9);
      doc.text('Subtotal', 400, y);
      doc.text(`₹${(payload.invoice.subtotal || 0).toFixed(2)}`, 480, y, { align: 'right' });
      
      y += 14;
      const shipping = Number(payload.invoice.shippingCharges || 0) || 0;
      doc.text('Shipping Charges', 400, y);
      doc.text(`₹${shipping.toFixed(2)}`, 480, y, { align: 'right' });
      
      y += 14;
      const tax = payload.invoice.taxSummary || { totalCgst: 0, totalSgst: 0, totalIgst: 0 };
      
      if (tax.totalIgst > 0) {
        doc.text('IGST (18%)', 400, y);
        doc.text(`₹${tax.totalIgst.toFixed(2)}`, 480, y, { align: 'right' });
      } else {
        doc.text('CGST (9%)', 400, y);
        doc.text(`₹${tax.totalCgst.toFixed(2)}`, 480, y, { align: 'right' });
        y += 14;
        doc.text('SGST (9%)', 400, y);
        doc.text(`₹${tax.totalSgst.toFixed(2)}`, 480, y, { align: 'right' });
      }
      
      y += 20;
      doc.moveTo(40, y).lineTo(550, y).stroke();
      y += 12;
      
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('GRAND TOTAL', 400, y);
      doc.text(`₹${(payload.invoice.total || 0).toFixed(2)}`, 480, y, { align: 'right' });

      // Amount in Words
      doc.moveDown(2);
      const words = numberToWords(Math.round(payload.invoice.total || 0));
      doc.font('Helvetica').fontSize(8);
      doc.text(`Amount in Words: ${words}`, 40);

      // Footer with Terms
      doc.moveDown(1);
      doc.fontSize(7).text('Terms & Conditions:', 40);
      doc.fontSize(7).text('• This is a system-generated invoice. No signature is required.');
      doc.fontSize(7).text('• Payment terms: As per agreement. Delivery: Shiprocket/Courier Partner.');
      doc.fontSize(7).text('• Returns/Complaints: Please contact support at ayusyaenterprise@gmail.com within 7 days.');

      doc.end();
    } catch (e) { reject(e); }
  });
}

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());

// Define build path globally
const buildPath = path.join(__dirname, 'build');

// Serve React build (if it exists) - BEFORE public for priority
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

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
    console.log(`[${new Date().toISOString()}] Create Order Request:`, req.body);
    
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
        buyerEmail: email  // Filter by buyer email
      },
      include: {
        payments: true,
        shipment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Return filtered orders
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
    
    // Build items with manufacturer info for proper seller determination
    const itemsWithMfg = invoicePayload.order_items.map(i => {
      // Determine HSN code based on product type
      let hsn = "default";
      if (i.product_id === 'u1' || i.name?.toLowerCase().includes('toothbrush')) {
        hsn = "3306"; // Toothbrushes - 5% GST
      } else if (i.name?.toLowerCase().includes('toothpaste')) {
        hsn = "3306"; // Toothpaste - 5% GST
      } else if (i.name?.toLowerCase().includes('face') || i.name?.toLowerCase().includes('wash')) {
        hsn = "3304"; // Beauty products - 18% GST
      }
      return {
        title: i.name,
        hsn: hsn,
        qty: i.units,
        unit: i.selling_price || 100,
        subtotal: (i.selling_price || 100) * i.units,
        manufacturer: i.manufacturer
      };
    });
    
    const baseSubtotal = itemsWithMfg.reduce((acc, i) => acc + i.subtotal, 0);
    
    // Determine seller based on manufacturers (use first manufacturer's state)
    const firstManufacturer = invoicePayload.order_items[0]?.manufacturer || 'Nekxuz';
    let sellerState = "Delhi"; // Default
    let seller = firstManufacturer;
    
    if (firstManufacturer.includes('Real Herbal')) {
      sellerState = "Delhi";
      seller = "Real Herbal Cosmetics (Sold via Nekxuz)";
    } else if (firstManufacturer.includes('Devayush')) {
      sellerState = "Delhi";
      seller = "Devayush Enterprises (Sold via Nekxuz)";
    }
    
    payloads = [{
            invoice: {
                items: itemsWithMfg,
        subtotal: baseSubtotal,
        shippingCharges: shippingCharges,
        total: baseSubtotal + shippingCharges // Tax added later
            },
            seller: seller,
            sellerAddress: sellerState === "Delhi" ? "H136 Sector 5 Bawana, New Delhi-110039" : "",
            sellerState: sellerState,
            buyer: invoicePayload.billing_customer_name,
            buyerEmail: invoicePayload.billing_email,
            buyerAddress: invoicePayload.billing_address,
            buyerPincode: invoicePayload.billing_pincode,
            buyerCity: invoicePayload.billing_city,
            buyerState: invoicePayload.billing_state || "Delhi",
            buyerPhone: invoicePayload.billing_phone,
            orderId: invoicePayload.order_id || Date.now()
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
        const fileName = `invoice_${razorpay_payment_id}`;
        fs.writeFileSync(path.join(__dirname, `${fileName}.pdf`), pdfBuffer);
        payload.fileName = fileName;
        console.log(`✅ PDF Generated and saved as: ${fileName}.pdf`);
        console.log(`✅ payload.fileName set to: ${payload.fileName}`);

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
          payload.orderId = orderId;
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
        console.log(`✅ Before push - payload.fileName: ${payload.fileName}`);
        invoices.push(payload);
        console.log(`✅ After push - invoices[0].fileName: ${invoices[0]?.fileName}`);
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

    const invoiceFileName = invoices[0]?.fileName || `invoice_${razorpay_payment_id}`;
    console.log("\n✅ PAYMENT VERIFICATION COMPLETE:");
    console.log(`  Invoice File: ${invoiceFileName}`);
    console.log(`  Order ID: ${invoices[0]?.orderId}`);
    console.log(`  Files in invoices[0]:`, Object.keys(invoices[0] || {}));
    console.log("="*60 + "\n");

    // Debug: Check what we're sending back
    const responsePayload = {
        ok: true, 
        message: 'Verified and GST Calculated', 
        invoices,
        invoice: invoiceFileName,
        orderId: invoices[0]?.orderId,
        shipment: responseShipment ? {
            success: true,
            packages: [{ 
                waybill: responseShipment.awb || responseShipment.shipment_id,
                shipment_id: responseShipment.shipment_id,
                courier: responseShipment.courier,
                status: responseShipment.status
            }]
        } : { success: false, packages: [] }
    };
    
    console.log("🔍 FINAL RESPONSE PAYLOAD:");
    console.log(JSON.stringify({
        invoice: responsePayload.invoice,
        orderId: responsePayload.orderId,
        shipment: responsePayload.shipment
    }, null, 2));

    return res.json(responsePayload);
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

// ==================== STOCK MANAGEMENT ENDPOINTS ====================

// Get all stock data
app.get('/api/stock', (req, res) => {
  try {
    const fs = require('fs');
    const stockFile = path.join(__dirname, 'stock.json');
    
    if (fs.existsSync(stockFile)) {
      const stockData = JSON.parse(fs.readFileSync(stockFile, 'utf8'));
      res.json({ ok: true, stock: stockData });
    } else {
      res.json({ ok: true, stock: {} });
    }
  } catch (err) {
    console.error('Stock fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update stock for a product
app.post('/api/stock/update', (req, res) => {
  try {
    const { productId, available, reserved = 0, sold = 0 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const fs = require('fs');
    const stockFile = path.join(__dirname, 'stock.json');
    
    let stockData = {};
    if (fs.existsSync(stockFile)) {
      stockData = JSON.parse(fs.readFileSync(stockFile, 'utf8'));
    }

    stockData[productId] = {
      available: Math.max(0, available || 0),
      reserved: Math.max(0, reserved || 0),
      sold: Math.max(0, sold || 0),
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(stockFile, JSON.stringify(stockData, null, 2));
    
    console.log(`✅ Stock updated for ${productId}: Available=${stockData[productId].available}`);
    
    res.json({ 
      ok: true, 
      message: 'Stock updated successfully',
      stock: stockData[productId]
    });
  } catch (err) {
    console.error('Stock update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get stock for specific product
app.get('/api/stock/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const fs = require('fs');
    const stockFile = path.join(__dirname, 'stock.json');
    
    if (fs.existsSync(stockFile)) {
      const stockData = JSON.parse(fs.readFileSync(stockFile, 'utf8'));
      const stock = stockData[productId] || { available: 0, reserved: 0, sold: 0 };
      res.json({ ok: true, stock });
    } else {
      res.json({ ok: true, stock: { available: 0, reserved: 0, sold: 0 } });
    }
  } catch (err) {
    console.error('Stock fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== PRODUCT MANAGEMENT ENDPOINTS ====================

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const fs = require('fs');
    const productsFile = path.join(__dirname, 'products.json');
    
    if (fs.existsSync(productsFile)) {
      const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      res.json({ ok: true, products });
    } else {
      res.json({ ok: true, products: [] });
    }
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add or update product
app.post('/api/products', (req, res) => {
  try {
    const { id, title, price, manufacturer, gstin, category, moq, sku, img, stock, ...rest } = req.body;
    
    if (!id || !title || !price || !manufacturer || !gstin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fs = require('fs');
    const productsFile = path.join(__dirname, 'products.json');
    const stockFile = path.join(__dirname, 'stock.json');
    
    let products = [];
    if (fs.existsSync(productsFile)) {
      products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    }

    // Remove existing product with same ID if editing
    products = products.filter(p => p.id !== id);

    // Add new product
    const productData = {
      id,
      title,
      price: `₹${parseFloat(price).toFixed(2)}`,
      manufacturer,
      gstin,
      category,
      moq,
      sku,
      img,
      ...rest,
      createdAt: new Date().toISOString()
    };

    products.push(productData);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    // Update stock
    let stockData = {};
    if (fs.existsSync(stockFile)) {
      stockData = JSON.parse(fs.readFileSync(stockFile, 'utf8'));
    }

    if (!stockData[id]) {
      stockData[id] = {
        available: stock || 100,
        reserved: 0,
        sold: 0,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(stockFile, JSON.stringify(stockData, null, 2));
    }

    console.log(`✅ Product ${id} saved: ${title}`);
    
    res.json({ 
      ok: true, 
      message: 'Product saved successfully',
      product: productData
    });
  } catch (err) {
    console.error('Product save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete('/api/products/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const fs = require('fs');
    const productsFile = path.join(__dirname, 'products.json');
    
    let products = [];
    if (fs.existsSync(productsFile)) {
      products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    }

    products = products.filter(p => p.id !== productId);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    console.log(`✅ Product ${productId} deleted`);
    
    res.json({ ok: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- INVOICE DOWNLOAD ENDPOINT ---
app.get('/api/invoice/download/:invoiceId', (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoicePath = path.join(__dirname, `${invoiceId}.pdf`);

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const fileStream = fs.createReadStream(invoicePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceId}.pdf"`);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Invoice download error:', err);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

// --- SHIPROCKET INVOICE DOWNLOAD ENDPOINT ---
app.get('/api/invoice/shiprocket/:shipmentId', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'shipmentId parameter required' });
    }

    console.log(`\n📄 FETCHING SHIPROCKET INVOICE FOR SHIPMENT: ${shipmentId}`);

    // Get invoice PDF from Shiprocket
    const pdfBuffer = await shiprocket.getInvoicePDF(shipmentId);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(404).json({ error: 'Failed to retrieve invoice from Shiprocket' });
    }

    console.log(`✅ Invoice PDF retrieved: ${pdfBuffer.length} bytes`);

    // Send PDF to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shiprocket_invoice_${shipmentId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

    console.log(`✅ Invoice PDF sent to client for shipment ${shipmentId}`);

  } catch (err) {
    console.error('Shiprocket invoice download error:', err);
    res.status(500).json({ error: 'Failed to download invoice from Shiprocket: ' + err.message });
  }
});

// --- HIDDEN WHATSAPP SUPPORT ENDPOINT ---
// Phone number is hidden from users - backend handles the redirect
app.get('/api/support/whatsapp', (req, res) => {
  try {
    const message = req.query.msg || 'Hello Nekxuz, I need support';
    const whatsappNumber = '917291030721'; // Hidden from frontend
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    res.redirect(whatsappUrl);
  } catch (err) {
    console.error('WhatsApp redirect error:', err);
    res.status(500).json({ error: 'Failed to process WhatsApp request' });
  }
});

// Serve React app for all other routes (client-side routing)
const indexPath = path.join(buildPath, 'index.html');
if (fs.existsSync(indexPath)) {
  app.get(/^(?!\/api\/)/, (req, res) => {
    res.sendFile(indexPath);
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Nekxuz Server running on port ${PORT}`);
  if (process.env.RAZORPAY_KEY_ID) {
     console.log(`Razorpay Key Loaded: ${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...`);
  }
});