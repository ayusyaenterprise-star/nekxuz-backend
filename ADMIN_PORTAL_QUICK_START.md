# 📊 Admin Portal Quick Start Guide

## 🚀 Quick Access
**URL:** `https://nekxuz.in/?admin=true`

---

## 📋 Admin Tabs Overview

### 1️⃣ **Orders Tab** (Default)
- ✅ View all customer orders
- ✅ See payment status
- ✅ Track order details
- ✅ Monitor revenue

### 2️⃣ **Products Tab**
- ✅ Add new products
- ✅ Edit existing products
- ✅ Upload product images
- ✅ Set pricing & MOQ
- ✅ Configure tiered pricing

### 3️⃣ **Accounting Tab**
- ✅ Revenue summaries
- ✅ Tax calculations
- ✅ Payment tracking

### 4️⃣ **Stock Management Tab** ✨ NEW!
- ✅ Real-time stock levels
- ✅ Update quantities instantly
- ✅ Stock persists on refresh!
- ✅ Low stock alerts
- ✅ Filter by status

### 5️⃣ **Positioning Tab** ✨ NEW!
- ✅ Control where products appear
- ✅ Choose page & section
- ✅ Set display order
- ✅ Show/hide products

---

## 📦 Stock Management (NEW!)

### Problem Fixed:
**Before:** Stock disappeared on page refresh ❌  
**Now:** Stock saved locally and to database ✅

### How to Update Stock:

1. **Click** "Stock Management" tab
2. **Scroll** to the product
3. **Change** the "Available" number
4. **Saves automatically** - no button needed!
5. **Persists** across page refreshes

### Stock Status Indicators:
- 🟢 **In Stock** (> 10 units)
- 🟡 **Low Stock** (1-10 units)
- 🔴 **Out of Stock** (0 units)

### Quick Filters:
- **All Products** - See everything
- **Low Stock** - Items running out
- **Out of Stock** - Empty items

---

## 📍 Product Positioning (NEW!)

### What It Does:
Control exactly WHERE and HOW your products appear on the website!

### For Each Product, Set:

#### 📄 **Show on Page:**
```
• Home Page ────→ Main website
• Wholesale ────→ Bulk buyers section
• Retail ───────→ Individual buyers
• Direct ───────→ Direct from manufacturer
• Contract ─────→ Contract manufacturing
```

#### 🎯 **Section:**
```
⭐ Featured  ──→ Top priority, appears first
🔥 Trending  ──→ Popular right now
📈 Best Selling ──→ High sales items
✨ New Arrivals ──→ Recently added
⚡ Flash Sale ──→ Limited time offers
👁️ Hidden ──→ Don't show
```

#### 🔢 **Display Order:**
```
0  = First on page (highest priority)
5  = Fifth position
10 = Tenth position
99 = Last (lowest priority)

Rule: Lower number = shows first!
```

#### 👁️ **Visibility:**
```
✅ Checked = Visible on website
❌ Unchecked = Hidden from website
```

### How to Use:

```
1. Click "Positioning" tab
2. Find your product
3. Configure settings:
   • Select page (Home, Wholesale, etc)
   • Select section (Featured, Trending, etc)
   • Enter display order (0-99)
   • Check "Show on Site" to make visible
4. Click "💾 Save Listing"
5. Changes apply instantly!
```

---

## 💾 How Storage Works

### Two-Layer Storage System:

#### 🟦 **Local Storage** (Instant)
- Saved on YOUR device
- Survives page refresh ✅
- Works offline ✅
- Super fast ✅
- Only you see it

#### 🟩 **Database** (Backup)
- Saved on Render server
- Accessible from any device
- Team can see it
- Permanent backup
- Needs internet to sync

### When You Save:
1. **Immediately** saves to local storage
2. **Then** syncs to database
3. Works even if sync fails (uses local copy)

---

## 🎯 Common Tasks

### Task 1: Make Product "Featured" on Home Page

```
1. Go to Admin → Positioning tab
2. Find your product
3. Set:
   • Page: "Home Page"
   • Section: "⭐ Featured"
   • Order: "1" (first position)
   • Visibility: ✅ Checked
4. Click "💾 Save Listing"
✅ Done! Product now featured
```

### Task 2: Update Stock for Multiple Products

```
1. Go to Admin → Stock Management tab
2. For each product, change "Available" field
3. Changes save automatically
4. Check different stock levels update correctly
✅ Done! All stock updated
```

### Task 3: Temporarily Hide a Product

```
1. Go to Admin → Positioning tab
2. Find the product
3. Uncheck "👁️ Show on Site"
4. Click "💾 Save Listing"
✅ Done! Product now hidden
```

### Task 4: Rearrange Product Display Order

```
1. Go to Admin → Positioning tab
2. For each product you want to move:
   • Set different "Order" numbers
   • Lower number = show first
   • Higher number = show last
3. Click "💾 Save Listing" for each
✅ Done! Products rearranged
```

---

## ⚡ Tips & Tricks

### Pro Tips:

1. **Stock Management**
   - Filter by "Low Stock" to see what needs restocking
   - Update in bulk by finding all low items first

2. **Positioning**
   - Use position "0" for your best sellers
   - Use "Flash Sale" section for limited offers
   - Use "New Arrivals" for recently added items

3. **Both Tabs**
   - Changes take effect immediately
   - No app restart needed
   - Customers see updates in real-time

### Troubleshooting:

**Q: Stock disappeared after refresh?**  
A: It's saved locally! Check if localStorage is enabled in browser

**Q: Product still shows after hiding?**  
A: Clear browser cache (Ctrl+Shift+Delete)

**Q: Changes not showing on website?**  
A: Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

---

## 📊 Admin Dashboard Stats

### Summary Cards Show:

```
Stock Management Tab:
├── Total Stock ─── All products combined
├── In Stock ────── Products > 10 units
├── Low Stock ───── Products 1-10 units
└── Out of Stock ─- Products 0 units

Orders Tab:
├── Total Orders ── All-time
├── Today Orders ── Orders placed today
└── Total Revenue - Income from all orders
```

---

## 🔄 Workflow Example

### Morning Routine:

```
1. Check "Orders" tab → See last night's sales
2. Go to "Stock Management" → Update quantities
3. Check "Low Stock" filter → Restock low items
4. Go to "Positioning" → Adjust featured products
5. Set new "Flash Sale" items for the day
6. Done! Your store is updated!
```

---

## 📱 Access on Mobile

The admin portal is fully responsive:
- ✅ Works on phones
- ✅ Works on tablets
- ✅ Works on desktops
- ✅ Touch-friendly interface

Just open `https://nekxuz.in/?admin=true` on any device!

---

## 🎊 Summary

### What You Can Now Do:

✅ **Stock Management**
- Update quantities instantly
- Stock persists on refresh
- See low stock alerts

✅ **Product Positioning**
- Control which page products appear
- Choose featured/trending/bestselling sections
- Set display order (0-99)
- Show/hide products

✅ **Real-Time Updates**
- Changes appear immediately
- No code editing needed
- Works offline (local storage)
- Syncs to database when online

### Result:
**Professional admin portal that works smoothly with your main site!** 🚀

---

For questions, contact support or check the backend logs at Render dashboard.
