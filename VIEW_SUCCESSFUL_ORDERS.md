# 📊 How to View Your Successful Razorpay Orders

## 🎯 View Orders in 2 Places

### PLACE 1: Your Website "My Orders" Tab
1. Go to: https://nekxuz.in
2. Login with: `infodevayushenterprise@gmail.com`
3. Click: "My Orders" tab
4. You should see all successful orders with:
   - Order date
   - Order amount
   - Order status
   - Items ordered

---

### PLACE 2: Razorpay Dashboard (Official Records)
1. Go to: https://dashboard.razorpay.com
2. Login with your Razorpay account
3. Click: "Payments" section
4. View all successful payments with:
   - Payment ID
   - Amount
   - Status (Successful/Failed)
   - Timestamp
   - Customer email
   - Payment method (card/net banking)
   - Receipt number

---

## 📲 Check Your Specific Orders

### Method 1: Check via API
Test if orders are in your database:

```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=infodevayushenterprise@gmail.com"
```

Should return:
```json
{
  "orders": [
    {
      "id": "pay_2xxxxxxxxxxx",
      "invoice": "invoice_pay_2xxxxxxxxxxx",
      "amount": 13900,
      "currency": "INR",
      "status": "paid",
      "buyerName": "Your Name",
      "buyerEmail": "infodevayushenterprise@gmail.com",
      "subtotal": 12800,
      "tax": 1152,
      "shippingCharges": 100,
      "createdAt": "2024-12-15T10:30:00Z",
      ...
    }
  ]
}
```

### Method 2: Check Razorpay Account
1. Open: https://dashboard.razorpay.com/app/payments
2. Filter by date or customer email
3. Look for status: "Successful" (green badge)
4. Click on payment to see full details:
   - Payment method
   - Card last 4 digits
   - Amount charged
   - Receipt number
   - Refund status

---

## ✅ Order Details You Should See

For each successful order, you'll see:

| Field | Example | Meaning |
|---|---|---|
| Payment ID | `pay_2xxxxxxxxxxx` | Unique Razorpay payment ID |
| Invoice | `invoice_pay_2xxxxxxxxxxx` | Your business invoice number |
| Amount | 13900 | Total paid (in paise, so 13900 = ₹139) |
| Status | Successful/Paid | Payment went through ✅ |
| Customer Name | Your Name | From checkout form |
| Customer Email | infodevayushenterprise@gmail.com | From checkout |
| Subtotal | 12800 | Before tax/shipping |
| Tax | 1152 | 9% GST |
| Shipping | 100 | Shipping charges |
| Date | 2024-12-15 10:30 | When payment was processed |
| Card | 4111 ****** 1111 | Last 4 digits of card used |

---

## 🔍 Troubleshooting: Order Not Showing?

### Issue 1: Order in Razorpay but NOT on Website
**Reason:** Order not saved to database
**Solution:**
- Make sure Render has environment variables set ✅
- Make sure `/api/payment/verify` endpoint saves orders ✅
- Check Render logs for database errors

**Test:**
```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=infodevayushenterprise@gmail.com"
```
If empty, order didn't save to database.

### Issue 2: Payment Failed in Razorpay
**Reason:** Card declined, insufficient funds, or payment gateway error
**Solution:**
- Check Razorpay dashboard for failure reason
- Use test card: `4111 1111 1111 1111` to test
- Try different card if test card fails

### Issue 3: Order Shows Wrong Amount
**Reason:** Tax calculation or shipping issue
**Solution:**
- Verify cart subtotal: ₹ × 1.09 = final amount
- Check shipping charges in checkout form
- Clear browser cache (Cmd+Shift+R)

---

## 📋 Finding Your Orders

### In Razorpay Dashboard:

**Path:** Payments → All Payments

**Filters you can use:**
- Date range: "Last 30 days"
- Status: "Successful"
- Amount: Filter by amount range
- Customer email: Search by email

**Click on any payment to see:**
- Full payment details
- Customer information
- Card details (masked)
- Refund option
- Receipt download

---

### In Your Website:

**Path:** Login → My Orders tab

**Shows:**
- All your orders
- Order ID
- Order date
- Order amount
- Order items
- Payment status

---

## 💰 Order Amount Breakdown

When you see an order of ₹139:

```
Subtotal: ₹128.00 (product prices)
GST (9%): ₹11.52 (tax)
Shipping: ₹1.00 (delivery)
---
Total:    ₹140.52 ❌ (shows as 14052 paise in API)

Note: Razorpay shows in paise (1 rupee = 100 paise)
So ₹139 = 13900 paise in API response
```

---

## 🔐 Privacy & Security

Your order information is:
- ✅ Only visible to you (logged in with your email)
- ✅ Stored securely in PostgreSQL
- ✅ Protected by email authentication
- ✅ Not shared publicly

Card details are:
- ✅ Handled by Razorpay (PCI-DSS compliant)
- ✅ Only last 4 digits stored
- ✅ Never stored on your website
- ✅ Not stored in your database

---

## 📞 Need Help Finding Orders?

### Check These Things in Order:

1. **✅ Payment went through on Razorpay?**
   - Check: https://dashboard.razorpay.com/app/payments
   - Status should be "Successful" (green)

2. **✅ Website sees the order in database?**
   - Test: `https://nekxuz-backend.onrender.com/api/orders?email=infodevayushenterprise@gmail.com`
   - Should return order data

3. **✅ "My Orders" tab shows it?**
   - Login to website
   - Go to "My Orders"
   - Should see the order

4. **✅ If stuck at any step:**
   - Screenshot the issue
   - Share the email address used
   - Share the order amount
   - Let me know which step failed

---

## 🎯 Quick Links

| What | Link |
|---|---|
| View Orders on Website | https://nekxuz.in → Login → My Orders |
| View Orders on Razorpay | https://dashboard.razorpay.com/app/payments |
| Check Orders via API | `https://nekxuz-backend.onrender.com/api/orders?email=YOUR_EMAIL` |
| Test Backend Health | https://nekxuz-backend.onrender.com/api/health |

