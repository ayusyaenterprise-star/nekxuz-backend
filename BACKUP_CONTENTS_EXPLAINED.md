# 📦 Backup Contents Explanation

## What's Included in Your Backup

### 🎨 Frontend Files (`build/` folder)
- **index.html** - Main entry point
- **static/js/main.*.js** - React application (bundled)
- **static/css/main.*.css** - Styling (Tailwind CSS)
- **test_checkout.html** - Payment testing page
- **assets/** - Product images and logos

**Purpose**: These are the files your customers see in their browser

### 🔧 Backend Files

#### **server.js** (Main Application)
What it does:
- Runs Express.js web server on port 3002
- Serves the React frontend from `build/` folder
- Handles all API requests
- Manages database connections
- Processes payments via Razorpay
- Creates invoices (PDF)
- Tracks shipments via Shiprocket

Key APIs it provides:
```
GET    /api/stock                      - Get all products
POST   /api/payment/create-order       - Create payment
POST   /api/payment/verify             - Verify payment & create order
GET    /api/invoice/download/:id       - Download invoice PDF
GET    /api/shipment/track/:id         - Get tracking info
GET    /api/admin/login                - Admin login
```

#### **shiprocket.js** (Shipping Integration)
What it does:
- Connects to Shiprocket shipping API
- Creates shipments when orders are placed
- Fetches tracking information
- Manages waybills

Functions exported:
- `createShipment()` - Send order to Shiprocket
- `trackShipment()` - Get tracking updates
- `getInvoicePDF()` - Get invoice from Shiprocket
- `getShipmentDetails()` - Get order details

#### **package.json** (Dependencies)
Lists all required Node.js packages:
- `express` - Web framework
- `razorpay` - Payment gateway SDK
- `pdfkit` - PDF generation
- `prisma` - Database ORM
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- And others...

When you run `npm install`, it downloads all these packages.

### 💾 Data Files

#### **stock.json**
Current inventory data:
```json
{
  "products": [
    {
      "id": "p1",
      "title": "Product Name",
      "price": "₹100",
      "stock": 50,
      "moq": 5,
      "pricing": {
        "tiers": [
          { "qty": 10, "price": "₹90" },
          { "qty": 50, "price": "₹80" }
        ]
      }
    }
  ]
}
```

Used by: Frontend to display products and pricing

#### **.env** (Environment Variables)
**YOU MUST CREATE THIS FILE** with your credentials:

```env
# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rpk_live_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key

# Shipping API (Shiprocket)
SHIPROCKET_API_KEY=your_api_key
SHIPROCKET_CHANNEL_ID=your_channel_id

# Database
DATABASE_URL=your_database_connection_string

# Server
NODE_ENV=production
PORT=3002
```

**Where to get these:**
- Razorpay: Dashboard → Settings → API Keys
- Shiprocket: Account → API Settings
- Database: Your database provider

### 📄 Configuration Files

#### **package.json**
- Lists all dependencies
- Defines npm scripts (start, build)
- Version info

#### **schema.prisma**
- Database schema definition
- Table structures
- Relationships

## 🔄 How Everything Works Together

```
Customer → Browser
    ↓
Frontend (React in build/ folder)
    ↓
server.js (backend listening)
    ↓
API Routes:
    ├→ Fetch products from stock.json
    ├→ Create payment order (Razorpay)
    ├→ Verify payment
    ├→ Generate invoice (PDF)
    ├→ Create shipment (Shiprocket)
    ├→ Track order
    └→ Manage admin portal
```

## 📋 File Purposes Summary

| File | Purpose | Type |
|------|---------|------|
| build/ | React frontend | Frontend |
| server.js | Main backend | Backend |
| shiprocket.js | Shipping API | Backend |
| package.json | Dependencies | Config |
| .env | Credentials | Config |
| stock.json | Inventory | Data |

## 🚀 Deployment Flow

1. **Upload backup to Hostinger**
2. **Create .env** with your API keys
3. **Run npm install** to get dependencies
4. **server.js starts** automatically
5. **Listens on port 3002**
6. **Serves React frontend**
7. **Routes requests to APIs**
8. **Connects to Razorpay, Shiprocket, Database**

## ⚙️ What Happens When Someone Uses Your Site

1. User opens your domain
2. Server serves React app from `build/` folder
3. User browses products (from stock.json)
4. User adds to cart
5. User clicks checkout
6. Frontend calls `/api/payment/create-order`
7. Server calls Razorpay API
8. Razorpay modal appears
9. User enters payment info
10. On success:
    - Frontend calls `/api/payment/verify`
    - Server verifies signature
    - Server generates invoice PDF
    - Server calls Shiprocket to create shipment
    - Server stores order
11. Success page shows with download/tracking buttons

## 📊 Key Statistics

- **Frontend Bundle Size**: ~17MB (after optimization)
- **Backend**: Node.js + Express
- **Database**: Prisma ORM compatible
- **Payment**: Razorpay integrated
- **Shipping**: Shiprocket integrated
- **Features**: 50+ endpoints and APIs

## 🔒 Security Features

✅ Razorpay signature verification
✅ API key protection via environment variables
✅ HTTPS support
✅ CORS configuration
✅ Input validation
✅ Admin authentication

---

**Total Backup Size**: ~14MB (compressed)
**Uncompressed**: ~50MB
**Hosting Requirement**: Node.js 18+
**Recommended**: 2GB RAM, SSD storage

You're all set! 🎉
