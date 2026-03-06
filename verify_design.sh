#!/bin/bash

# 🔍 Compare current build with master design
# Use this to verify the design hasn't changed

PROJECT_PATH="/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
MASTER="$PROJECT_PATH/MASTER_PRODUCTION_BUILD"
CURRENT="$PROJECT_PATH/build_hostinger"

echo "🔍 DESIGN VERIFICATION CHECK"
echo "================================"
echo ""

# Check if both folders exist
if [ ! -d "$MASTER" ]; then
    echo "❌ MASTER_PRODUCTION_BUILD not found!"
    exit 1
fi

if [ ! -d "$CURRENT" ]; then
    echo "❌ build_hostinger not found!"
    exit 1
fi

echo "📊 SIZE COMPARISON"
echo "Master:  $(du -sh "$MASTER" | cut -f1)"
echo "Current: $(du -sh "$CURRENT" | cut -f1)"
echo ""

echo "📁 FILE COUNT COMPARISON"
echo "Master:  $(find "$MASTER" -type f | wc -l) files"
echo "Current: $(find "$CURRENT" -type f | wc -l) files"
echo ""

echo "🎨 STATIC CSS FILES"
echo "Master:"
ls -1 "$MASTER/static/css/" 2>/dev/null || echo "  No CSS found"
echo "Current:"
ls -1 "$CURRENT/static/css/" 2>/dev/null || echo "  No CSS found"
echo ""

echo "📦 STATIC JS FILES"
echo "Master:"
ls -1 "$MASTER/static/js/" | head -3
echo "Current:"
ls -1 "$CURRENT/static/js/" | head -3
echo ""

echo "🖼️ STATIC MEDIA (Images)"
echo "Master:  $(ls "$MASTER/static/media/" 2>/dev/null | wc -l) images"
echo "Current: $(ls "$CURRENT/static/media/" 2>/dev/null | wc -l) images"
echo ""

echo "📂 ASSET CATALOGUES"
echo "Master:  $(find "$MASTER/assets" -type f 2>/dev/null | wc -l) product images"
echo "Current: $(find "$CURRENT/assets" -type f 2>/dev/null | wc -l) product images"
echo ""

# Check for differences
echo "🔄 CHECKING FOR DESIGN DIFFERENCES..."
DIFF_COUNT=$(diff -r "$MASTER/static/css/" "$CURRENT/static/css/" 2>/dev/null | wc -l)
if [ "$DIFF_COUNT" -eq 0 ]; then
    echo "✅ CSS files are identical"
else
    echo "⚠️ CSS files differ!"
fi

DIFF_COUNT=$(diff -r "$MASTER/index.html" "$CURRENT/index.html" 2>/dev/null | wc -l)
if [ "$DIFF_COUNT" -eq 0 ]; then
    echo "✅ HTML files are identical"
else
    echo "⚠️ HTML files differ!"
fi

echo ""
echo "================================"
echo "✅ VERIFICATION COMPLETE"
echo ""
echo "If CSS and HTML are identical, design is preserved!"
echo "Safe to deploy: build_hostinger/"
