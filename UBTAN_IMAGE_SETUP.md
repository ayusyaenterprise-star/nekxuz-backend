# Blueva Ubtan Face Wash - Image Setup Guide

## Image Sequence & Placement

Your product images should be placed in: 
`src/assets/cataloges/ubtan face wash/`

### Image Files to Add (In Sequence):

1. **1.jpg** - Product Bottle (Main Image)
   - The Blueva Pure Glow Ubtan Face Wash bottle
   - Size: 400x500px (portrait orientation)
   - Used as primary product image and hero image

2. **2.jpg** - Woman with Product (Lifestyle/Usage Image)
   - Woman using or demonstrating the product
   - Size: 400x500px
   - Shows real-world product usage and benefits

3. **3.jpg** - Product Benefits Diagram (Feature Image)
   - Bottle with benefit callouts
   - Highlights: Soft Smooth Skin, Radiant Complexion, Healthy Glow
   - Size: 400x500px
   - Educational/marketing image

## How to Add Images

### Option 1: Manual Copy (Easiest)
```bash
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/src/assets/cataloges/ubtan face wash"

# Copy your images here and rename them as:
# - 1.jpg (product bottle)
# - 2.jpg (woman with product)
# - 3.jpg (benefits diagram)
```

### Option 2: Using Terminal
```bash
# Navigate to the ubtan directory
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/src/assets/cataloges/ubtan face wash"

# Place your three images in this directory
# Ensure they are named: 1.jpg, 2.jpg, 3.jpg
```

## Product Details Updated

✅ **Product ID:** blueva3
✅ **Title:** Blueva Pure Glow Ubtan Face Wash - 75gm
✅ **Price:** ₹59.00
✅ **MRP:** ₹175
✅ **Category:** Face Care
✅ **Manufacturer:** Blueva (Devayush Enterprises)

### Product Features:
- Soft, Smooth Skin
- Radiant Complexion
- Healthy Glow
- Enriched with Saffron & Milk

### Description:
"Blueva Pure Glow Ubtan Face Wash - 75gm. Enriched with Saffron & Milk for radiant complexion. Traditional ubtan ingredients for soft, smooth skin with healthy glow. Paraben-free and dermatologically tested."

## Image Requirements

- **Format:** JPG (recommended) or PNG
- **Dimensions:** 400x500px (or similar portrait ratio)
- **File Size:** Under 500KB each
- **Quality:** High resolution (72-150 DPI minimum)
- **Background:** Clean, professional backgrounds

## Next Steps

1. Copy your three images to the ubtan folder
2. Rename them as 1.jpg, 2.jpg, 3.jpg
3. Rebuild frontend: `npm run build`
4. Restart server: `npm start`
5. Check product display on site

## Troubleshooting

**Images not showing?**
- Check file names exactly match: 1.jpg, 2.jpg, 3.jpg
- Ensure files are in correct directory
- Rebuild with `npm run build`
- Clear browser cache (Ctrl+Shift+Delete)

**Wrong images showing?**
- Verify require() paths in App.js match filenames
- Check that images are in ubtan face wash folder
- Not in charcoal face wash folder

## Image Display Preview

When properly configured, the product will display:
- **Product Card:** Shows 1.jpg with title "Blueva Pure Glow Ubtan Face Wash - 75gm"
- **Product Modal:** Carousel with all 3 images
- **Features:** Displays Soft Smooth Skin, Radiant Complexion, Healthy Glow, Saffron & Milk
- **Price:** ₹59.00 (MRP ₹175)

---

Once you add the images, they will be used across:
- Home page product displays
- Retail from Manufacturers section
- Individual product modals
- Product detail pages
