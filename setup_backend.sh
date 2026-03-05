#!/bin/bash
cd /Users/ayushgupta/Documents/Nekxuz

echo "Installing backend dependencies..."
npm install dotenv express razorpay body-parser cors axios firebase-admin nodemailer pdfkit jsonwebtoken bcryptjs

echo "Starting Nekxuz Backend Server..."
node server.js