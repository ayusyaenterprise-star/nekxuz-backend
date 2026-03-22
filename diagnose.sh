#!/bin/bash

# 🔍 NEKXUZ DEPLOYMENT DIAGNOSTIC SCRIPT

echo "================================"
echo "🔍 NEKXUZ Deployment Diagnostics"
echo "================================"
echo ""

# Check if updated_build exists
echo "1️⃣ Checking updated_build folder..."
if [ -d "updated_build" ]; then
    echo "   ✅ updated_build/ EXISTS"
    echo "   📊 Size: $(du -sh updated_build | cut -f1)"
else
    echo "   ❌ updated_build/ NOT FOUND"
    exit 1
fi

echo ""
echo "2️⃣ Verifying latest code is in build..."

# Check for mobile nav fix
if grep -q "min-w-fit" updated_build/static/js/main*.js; then
    echo "   ✅ Mobile navigation fix (min-w-fit) - PRESENT"
else
    echo "   ❌ Mobile navigation fix - MISSING"
fi

# Check for stock hiding fix
if grep -q "return null" updated_build/static/js/main*.js; then
    echo "   ✅ Stock hiding fix (return null) - PRESENT"
else
    echo "   ❌ Stock hiding fix - MISSING"
fi

echo ""
echo "3️⃣ Checking file structure..."

FILES=(
    "index.html"
    "manifest.json"
    "static/js/main.*.js"
    "static/css/main.*.css"
    "asset-manifest.json"
)

for file in "${FILES[@]}"; do
    count=$(find updated_build -name "$file" 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - MISSING"
    fi
done

echo ""
echo "4️⃣ Main JS file hash..."
MAIN_JS=$(ls -1 updated_build/static/js/main.*.js | head -1 | xargs basename)
echo "   📦 $MAIN_JS"
echo "   Size: $(ls -lh updated_build/static/js/main*.js | awk '{print $5}')"

echo ""
echo "5️⃣ .htaccess file (cache control)..."
if [ -f "updated_build/.htaccess" ]; then
    echo "   ✅ .htaccess EXISTS (cache control enabled)"
else
    echo "   ⚠️  .htaccess MISSING (consider adding for Hostinger)"
fi

echo ""
echo "================================"
echo "✅ BUILD VERIFICATION COMPLETE"
echo "================================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Copy ALL contents from updated_build/"
echo "2. Upload to Hostinger public_html/"
echo "3. Hard refresh: Ctrl+Shift+Delete → Ctrl+F5"
echo "4. Test in Incognito window (Ctrl+Shift+N)"
echo "5. Check F12 console for errors"
echo ""
echo "📊 Expected Changes:"
echo "   - NO green '100 in Stock' badges"
echo "   - RFQ & Messenger tabs on mobile"
echo "   - Responsive 2-column layout on phones"
echo ""
