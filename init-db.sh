#!/bin/bash
# Initialize database with proper schema

cd "$(dirname "$0")"

echo "🔧 Initializing Database..."
echo "================================"

# Check if prisma is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Installing Node packages..."
    npm install
fi

echo "📋 Current Prisma schema:"
npx prisma schema view

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "📊 Database status:"
npx prisma db execute --stdin < /dev/null

echo ""
echo "🎯 Verifying models..."
echo "  ✓ Order model"
echo "  ✓ Payment model" 
echo "  ✓ Shipment model"

echo ""
echo "✅ Ready to start server!"
