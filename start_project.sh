#!/bin/bash

echo "🚀 Starting Nekxuz Project Setup..."

# 1. Install Dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Setup Database
echo "🗄️  Setting up Database (Prisma)..."
npx prisma generate
npx prisma db push

# 3. Start Servers
echo "🟢 Starting Backend (Port 3001) and Frontend (Port 3000)..."
echo "   - Backend logs will appear below."
echo "   - Frontend will open in your browser."

# Run backend in background and frontend in foreground
# Using & to background the server process
node server.js &
SERVER_PID=$!

# Wait a moment for server to initialize
sleep 5

# Start React App
npm start

# Cleanup on exit
kill $SERVER_PID