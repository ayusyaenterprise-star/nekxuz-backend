# 🧾 INVOICE PDF DOWNLOAD - TROUBLESHOOTING GUIDE

## Current Status
✅ **Backend Server**: Running on port 3002
✅ **Frontend Server**: Running on port 3004
✅ **Invoice Download Endpoint**: Working (tested with curl)
✅ **Invoice PDFs**: Being generated and saved correctly

## Issue: Invoice Download Button Not Showing

The download button should appear after payment is successfully verified. If it's not showing, here's what to check:

### Step 1: Verify Payment Flow Works
1. Go to `http://localhost:3004`
2. Add items to cart
3. Click "Proceed to Buy"
4. Fill in shipping details
5. Click "Proceed to Payment"
6. Use Razorpay test card: **4111 1111 1111 1111**
7. Expiry: Any future date (e.g., 12/25)
8. CVV: Any 3 digits (e.g., 123)

### Step 2: Check Browser Console
After payment, check your browser's Developer Console (F12):
- Look for log: `"Payment verification response:"` 
- Check if `final.invoice` has a value like `invoice_pay_xxxxx`

### Step 3: What the Response Should Look Like

**Backend (server.js) sends:**
```json
{
  "ok": true,
  "message": "Verified and GST Calculated",
  "invoice": "invoice_pay_xxxxx",
  "orderId": "db_order_id_123",
  "shipment": {
    "success": true,
    "packages": [{
      "waybill": "ABCD123456",
      "shipment_id": "sr_xxxxx",
      "courier": "DHL",
      "status": "Processing"
    }]
  }
}
```

**Frontend (React) receives and sets:**
```javascript
invoiceId: "invoice_pay_xxxxx"
```

### Step 4: Verify Invoice File Exists

Check if invoice PDF file was created:
```bash
ls -la "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"/*.pdf | head -5
```

You should see files like:
```
invoice_pay_SLUbxIlFcNR4xT.pdf
invoice_pay_SLUu2qSxF8dMA8.pdf
```

### Step 5: Test Download Endpoint Directly

Test if endpoint works:
```bash
curl "http://localhost:3002/api/invoice/download/invoice_pay_SLUbxIlFcNR4xT" -o /tmp/test.pdf && ls -lh /tmp/test.pdf
```

Should return: `200 OK` with PDF file

## Backend Logging

New debug logs have been added to track the issue:

1. **When PDF is generated:**
   ```
   ✅ PDF Generated and saved as: invoice_pay_xxxxx.pdf
   ✅ payload.fileName set to: invoice_pay_xxxxx
   ```

2. **Before pushing to invoices array:**
   ```
   ✅ Before push - payload.fileName: invoice_pay_xxxxx
   ```

3. **After pushing to invoices array:**
   ```
   ✅ After push - invoices[0].fileName: invoice_pay_xxxxx
   ```

4. **Final response being sent:**
   ```
   ✅ PAYMENT VERIFICATION COMPLETE:
   Invoice File: invoice_pay_xxxxx
   Order ID: db_order_id_123
   Files in invoices[0]: [...all fields...]
   ```

Watch the backend log file:
```bash
tail -f /tmp/backend.log | grep "✅"
```

## Frontend Console Debugging

Add this to your browser console to test:
```javascript
// Check if orderSuccess is set
console.log(window.orderSuccess);

// Check if invoiceId is in the state
// Look at React DevTools > Components > App > orderSuccess state
```

## Quick Test Checklist

- [ ] Backend running on :3002
- [ ] Frontend running on :3004  
- [ ] Payment completed successfully
- [ ] Order success modal displays
- [ ] Download button visible (orange gradient button with download icon)
- [ ] Clicking download opens/downloads PDF
- [ ] PDF contains correct invoice details

## If Still Not Working

### Option 1: Check Backend Response Format
```bash
# Add temporary endpoint to echo back response
# Then make a test payment and check logs
tail -f /tmp/backend.log
```

### Option 2: Add Frontend Logging
Add this to `src/App.js` after line 2233:
```javascript
console.log("Final payment response:", final);
console.log("Invoice ID from response:", final.invoice);
console.log("Constructed invoiceId:", final.invoice || 'invoice_' + response.razorpay_payment_id);
```

Rebuild: `npm run build` and restart frontend

### Option 3: Manual Test
1. Stop frontend
2. Edit React code to hardcode invoiceId:
```javascript
const successData = {
  invoiceId: 'invoice_pay_SLUbxIlFcNR4xT', // Use existing file
  orderId: 'test-order',
  trackingId: 'test-tracking',
  amount: 100,
  paymentId: 'pay_test'
};
```
3. Rebuild and restart
4. If button shows, issue is in backend response
5. If button doesn't show, issue is in button code

## Files to Review

- **Frontend button code**: `src/App.js` line 2333
- **Frontend invoice state**: `src/App.js` line 2235
- **Backend response**: `server.js` line 703
- **Backend PDF generation**: `server.js` line 454-461
- **Download endpoint**: `server.js` line 1042

## Additional Notes

- Invoice filenames use Razorpay Payment ID: `invoice_pay_xxxxx`
- Each PDF is unique per payment
- PDFs are stored in project root directory
- Download endpoint returns binary PDF with proper headers
- No database is required for downloading (just filesystem)

---

**Last Updated**: 2 March 2026  
**Status**: Ready for testing
