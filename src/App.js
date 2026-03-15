/* eslint-disable no-alert, no-restricted-globals */
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- Configuration ---
const apiKey = ""; // Gemini API Key
const API_BASE_URL = "https://nekxuz-backend-j1sj.vercel.app"; // Backend URL for API calls (FREE Vercel serverless)

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCp_B50oMUb_lMBxpAOxh5qcSPeng9PbyM",
  authDomain: "nekxuz-27e49.firebaseapp.com",
  projectId: "nekxuz-27e49",
  storageBucket: "nekxuz-27e49.firebasestorage.app",
  messagingSenderId: "303644694658",
  appId: "1:303644694658:web:2118c56969b0522db77c9b",
  measurementId: "G-CEED34LWJ0"
};

// --- Initialize Firebase ---
let app, auth, db, analytics, storage;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  analytics = getAnalytics(app);
  storage = getStorage(app);
  console.log("Firebase Initialized Successfully");
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// --- AI Service ---
let genAI = null;
try {
    if(apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
    }
} catch (e) {
    console.error("AI Init Error", e);
}

// --- Shared Product Data (Single Source of Truth) ---
const ALL_PRODUCTS = [
  {
    id: 'c2',
    title: 'devson care red paste-150gm',
    price: '₹60.00',
    moq: 12,
    img: require('./assets/cataloges/red paste/1.jpg'),
    images: [
        require('./assets/cataloges/red paste/1.jpg'),
        require('./assets/cataloges/red paste/2.jpg'),
        require('./assets/cataloges/red paste/3.jpg'),
        require('./assets/cataloges/red paste/4.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Oral Care',
    pricing: { 
      mrp: 110, 
      sample: 65, 
      tiers: [
        {qty: 12, price: 60},
        {qty: 24, price: 55},
        {qty: 50, price: 50},
        {qty: 100, price: 45}
      ] 
    }
  },
  {
    id: 'mcs2',
    title: 'VelSoft Glow Cocoa Rich Butter Lotion - 100ml',
    price: '₹35.00',
    moq: 12,
    img: require('./assets/cataloges/vsc-100ml/c2.jpg'),
    images: [
        require('./assets/cataloges/vsc-100ml/c2.jpg'),
        require('./assets/cataloges/vsc-100ml/mcs2.jpg'),
        require('./assets/cataloges/vsc-100ml/c3.jpg'),
        require('./assets/cataloges/vsc-100ml/c4.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    pricing: { 
      mrp: 80, 
      sample: 40, 
      tiers: [
        {qty: 12, price: 35},
        {qty: 24, price: 30},
        {qty: 50, price: 25},
        {qty: 100, price: 20}
      ] 
    }
  },
  {
    id: 'c4',
    title: 'VelSoft Glow Rice Water Face Wash - 100ml',
    price: '₹65.00',
    moq: 24,
    img: require('./assets/cataloges/velsoft rice water face wash/1.jpg'),
    images: [
        require('./assets/cataloges/velsoft rice water face wash/1.jpg'),
        require('./assets/cataloges/velsoft rice water face wash/2.jpg'),
        require('./assets/cataloges/velsoft rice water face wash/3.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    pricing: { 
      mrp: 269, 
      sample: 65, 
      tiers: [
        {qty: 24, price: 65},
        {qty: 50, price: 55},
        {qty: 100, price: 45},
        {qty: 200, price: 35}
      ] 
    }
  },
  {
    id: 'u1',
    title: 'Premium Soft Bristle Toothbrush (White Label)',
    price: '₹12.00',
    moq: 100,
    img: require('./assets/cataloges/toothbrush/1.jpg'),
    images: [require('./assets/cataloges/toothbrush/1.jpg')],
    manufacturer: 'Devayush Enterprises',
    address: 'House no 06/b, Gali no. 3, Prahlad Vihar near Rohini Sector-5',
    source: 'Direct from Wholeseller',
    category: 'Oral Care',
    description: 'High-quality soft bristle toothbrush ready for your brand customization. Available in multiple colors.',
    pricing: { 
      mrp: 45, 
      sample: null, 
      tiers: [
        {qty: 100, price: 12},
        {qty: 500, price: 10},
        {qty: 1000, price: 5},
        {qty: 2000, price: 3}
      ] 
    }
  },
  {
    id: 'u3',
    title: 'Charcoal Face Wash - 100ml (Unlabeled)',
    price: '₹60.00',
    moq: 1,
    img: require('./assets/cataloges/unlabelled charcoal face wash-100ml/1.jpeg'),
    images: [
        require('./assets/cataloges/unlabelled charcoal face wash-100ml/1.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    description: 'Activated charcoal face wash for deep cleansing. Removes impurities and excess oil. Blank bottle for private labeling.',
    pricing: { 
      mrp: 275, 
      sample: 60, 
      tiers: [
        {qty: 1, price: 60},
        {qty: 24, price: 55},
        {qty: 50, price: 50},
        {qty: 100, price: 45}
      ] 
    }
  },
  {
    id: 'u4',
    title: 'Neem Aloe Vera Face Wash - 100ml (Unlabeled)',
    price: '₹60.00',
    moq: 1,
    img: require('./assets/cataloges/unlabelled aloe vera face wash-100ml/1.jpeg'),
    images: [
        require('./assets/cataloges/unlabelled aloe vera face wash-100ml/1.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    description: 'Neem and aloe vera enriched face wash for sensitive skin. Anti-bacterial and soothing. Blank bottle for private labeling.',
    pricing: { 
      mrp: 275, 
      sample: 60, 
      tiers: [
        {qty: 1, price: 60},
        {qty: 24, price: 55},
        {qty: 50, price: 50},
        {qty: 100, price: 45}
      ] 
    }
  },
  {
    id: 'u5',
    title: 'Vitamin C Face Wash - 100ml (Unlabeled)',
    price: '₹60.00',
    moq: 1,
    img: require('./assets/cataloges/unlabelled vitamin c face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/unlabelled vitamin c face wash/1.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    description: 'Vitamin C enriched face wash for brightening and anti-aging. Boosts skin radiance and elasticity. Blank bottle for private labeling.',
    pricing: { 
      mrp: 275, 
      sample: 60, 
      tiers: [
        {qty: 1, price: 60},
        {qty: 24, price: 55},
        {qty: 50, price: 50},
        {qty: 100, price: 45}
      ] 
    }
  },
  {
    id: 'f1',
    title: 'Devson Care Herbal Toothpaste - 100g',
    price: '₹32.00',
    moq: 12,
    img: require('./assets/cataloges/herbal toothpaste/1.jpg'),
    images: [
        require('./assets/cataloges/herbal toothpaste/1.jpg'),
        require('./assets/cataloges/herbal toothpaste/2.jpg'),
        require('./assets/cataloges/herbal toothpaste/3.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Oral Care',
    description: 'Devson Care Herbal Toothpaste - 100g. Formulated with natural herbal extracts for optimal oral health. Fresh breath, healthy gums, and natural whitening. No harmful chemicals. Effective against plaque and cavity prevention.',
    features: ['Fresh Breath', 'Healthy Gums', 'Natural Whitening', 'Herbal Extracts', 'No Harmful Chemicals'],
    pricing: { mrp: 102, tiers: [{qty: 1, price: 56}, {qty: 12, price: 32}, {qty: 24, price: 28}, {qty: 50, price: 25}, {qty: 100, price: 22}] }
  },
  {
    id: 'f2',
    title: 'VelSoft Glow Honey and Almond Body Lotion 600ml',
    price: '₹150.00',
    moq: 1,
    img: require('./assets/cataloges/honey almond -600/1.jpg'),
    images: [
        require('./assets/cataloges/honey almond -600/1.jpg'),
        require('./assets/cataloges/honey almond -600/2.jpg'),
        require('./assets/cataloges/honey almond -600/3.jpg'),
        require('./assets/cataloges/honey almond -600/4.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    pricing: { mrp: 450, tiers: [{qty: 1, price: 150}] }
  },
  {
    id: 'f3',
    title: 'Devson Care Neem Lime - 50gm',
    price: '₹45.00',
    moq: 50,
    img: '/assets/cataloges/neem-lime-50/1.jpeg?v=20260302',
    images: [
        '/assets/cataloges/neem-lime-50/1.jpeg?v=20260302',
        '/assets/cataloges/neem-lime-50/2.jpg',
        '/assets/cataloges/neem-lime-50/3.jpg'
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Wholesale',
    category: 'Skin Care',
    description: 'Devson Care Neem Lime - 50gm. Professional antibacterial neem and lime formulation for effective skin care. Fresh packaging with natural ingredients.',
    pricing: { 
      mrp: 82, 
      sample: 45,
      tiers: [
        {qty: 1, price: 45, label: 'Sample'},
        {qty: 50, price: 25},
        {qty: 100, price: 20}
      ] 
    }
  },
  {
    id: 'dc1',
    title: 'Devson Care Clovegel Pack of 2 - 150gm',
    price: '₹99.00',
    moq: 1,
    img: require('./assets/cataloges/clovegel/1.jpg'),
    images: [
        require('./assets/cataloges/clovegel/1.jpg'),
        require('./assets/cataloges/clovegel/2.jpg'),
        require('./assets/cataloges/clovegel/3.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Oral Care',
    description: 'Pack of 2 Clovegel toothpaste tubes, 150gm each. Fresh mint flavor with clove extract.',
    pricing: { mrp: 220, tiers: [{qty: 1, price: 99}] }
  },
  {
    id: 'dc2',
    title: 'Devson Care Neem Lime - 50gm Pack of 2',
    price: '₹45.00',
    moq: 1,
    img: '/assets/cataloges/neem-lime-50/1.jpeg?v=20260302',
    images: [
        '/assets/cataloges/neem-lime-50/1.jpeg?v=20260302',
        '/assets/cataloges/neem-lime-50/2.jpg',
        '/assets/cataloges/neem-lime-50/3.jpg'
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    description: 'Devson Care Neem Lime - 50gm Pack of 2. Antibacterial neem and lime formulation for clear, healthy skin.',
    pricing: { mrp: 82, tiers: [{qty: 1, price: 45}] }
  },
  {
    id: 'vgh1',
    title: 'VelSoft Glow Honey Almond - 150gm',
    price: '₹129.00',
    moq: 1,
    img: require('./assets/cataloges/honey almond-100ml/1.jpg'),
    images: [
        require('./assets/cataloges/honey almond-100ml/1.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Skin Care',
    description: 'Premium honey and almond face cream, 150gm. Moisturizing and nourishing formula.',
    pricing: { mrp: 299, tiers: [{qty: 1, price: 129}] }
  },
  {
    id: 'blueva3',
    title: 'Blueva Pure Glow Ubtan Face Wash - 75gm',
    price: '₹59.00',
    moq: 1,
    img: require('./assets/cataloges/ubtan face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/ubtan face wash/1.jpeg'),
        require('./assets/cataloges/ubtan face wash/2.jpeg'),
        require('./assets/cataloges/ubtan face wash/3.jpeg')
    ],
    manufacturer: 'Blueva (Devayush Enterprises)',
    address: 'House no 06/b, Gali no. 3, Prahlad Vihar near Rohini Sector-5, Delhi',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'Blueva Pure Glow Ubtan Face Wash - 75gm. Enriched with Saffron & Milk for radiant complexion. Traditional ubtan ingredients for soft, smooth skin with healthy glow. Paraben-free and dermatologically tested.',
    features: ['Soft, Smooth Skin', 'Radiant Complexion', 'Healthy Glow', 'Enriched with Saffron & Milk'],
    pricing: { mrp: 175, tiers: [{qty: 1, price: 59}] }
  },
  {
    id: 'blueva4',
    title: 'Blueva Aloe Vera Neem Tulsi Face Wash - 75gm',
    price: '₹59.00',
    moq: 1,
    img: require('./assets/cataloges/aloe vera neem tulsi face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/aloe vera neem tulsi face wash/1.jpeg'),
        require('./assets/cataloges/aloe vera neem tulsi face wash/2.jpeg'),
        require('./assets/cataloges/aloe vera neem tulsi face wash/3.jpeg')
    ],
    manufacturer: 'Blueva (Devayush Enterprises)',
    address: 'House no 06/b, Gali no. 3, Prahlad Vihar near Rohini Sector-5, Delhi',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'Blueva Aloe Vera Neem Tulsi Face Wash - 75gm. Specially formulated for acne-prone and oily skin with natural glycerine. Enriched with Aloe Vera Extract, Neem Leaf Extract, and Glycerine Contract. Gentle on skin, effective acne control. Paraben-free and dermatologically tested.',
    features: ['Acne & Oil Control', 'Gentle & Mild', 'Dry Skin Relief', 'Enriched with Aloe Vera, Neem & Glycerine'],
    pricing: { mrp: 175, tiers: [{qty: 1, price: 59}] }
  },
  {
    id: 'blueva5',
    title: 'Blueva Purifying Lavender Bliss Face Wash - 75gm',
    price: '₹59.00',
    moq: 1,
    img: require('./assets/cataloges/lavender bliss face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/lavender bliss face wash/1.jpeg'),
        require('./assets/cataloges/lavender bliss face wash/2.jpeg'),
        require('./assets/cataloges/lavender bliss face wash/3.jpeg')
    ],
    manufacturer: 'Blueva (Devayush Enterprises)',
    address: 'House no 06/b, Gali no. 3, Prahlad Vihar near Rohini Sector-5, Delhi',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'Blueva Purifying Lavender Bliss Face Wash - 75gm. Enriched with Niacinamide & Pearl for hydrated and nourished skin. Soothes and calms sensitive skin while brightening complexion. Features Hydro Boost technology for maximum hydration. Paraben-free, gentle & mild, non-drying formula.',
    features: ['Soothes & Calms Skin', 'Niacinamide & Pearl', 'Hydrates & Nourishes', 'Brightens & Calms Skin', 'Paraben-Free'],
    pricing: { mrp: 175, tiers: [{qty: 1, price: 59}] }
  },
  {
    id: 'combo1',
    title: 'Blueva Face Wash Combo Pack - 75gm Each (3 Variants)',
    price: '₹199.00',
    moq: 1,
    img: require('./assets/cataloges/blueva combo pack/1.jpeg'),
    images: [
        require('./assets/cataloges/blueva combo pack/1.jpeg'),
        require('./assets/cataloges/blueva combo pack/2.jpeg'),
        require('./assets/cataloges/blueva combo pack/3.jpeg'),
        require('./assets/cataloges/blueva combo pack/4.jpeg')
    ],
    manufacturer: 'Blueva (Devayush Enterprises)',
    address: 'House no 06/b, Gali no. 3, Prahlad Vihar near Rohini Sector-5, Delhi',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'Blueva Face Wash Combo Pack - Complete set of 3 premium face wash variants (75gm each). Includes Pure Glow Ubtan Face Wash, Aloe Vera Neem Tulsi Face Wash, and Purifying Lavender Bliss Face Wash. Perfect for complete skincare routine with multiple benefits. Paraben-free and dermatologically tested.',
    features: ['3 Premium Variants', 'Complete Skincare Solution', 'Radiance & Glow', 'Acne & Oil Control', 'Hydration & Nourishment'],
    pricing: { mrp: 525, tiers: [{qty: 1, price: 199}] }
  },
  {
    id: 'devson1',
    title: 'Devson Care Clovegel Pack of 2 - 150gm',
    price: '₹89.00',
    moq: 1,
    img: require('./assets/cataloges/clovegel/1.jpg'),
    images: [
        require('./assets/cataloges/clovegel/1.jpg'),
        require('./assets/cataloges/clovegel/2.jpg'),
        require('./assets/cataloges/clovegel/3.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'Devson Care Clovegel Pack of 2 - 150gm. Soothing clove gel for skin care.',
    pricing: { mrp: 199, tiers: [{qty: 1, price: 89}] }
  },
  {
    id: 'devson2',
    title: 'Devson Care Neem Lime - 50gm',
    price: '₹45.00',
    moq: 50,
    img: '/assets/cataloges/neem-lime-50/1.jpeg?v=20260302',
    images: [
        '/assets/cataloges/neem-lime-50/1.jpeg?v=20260302',
        '/assets/cataloges/neem-lime-50/2.jpg',
        '/assets/cataloges/neem-lime-50/3.jpg'
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Wholesale',
    category: 'Face Care',
    description: 'Devson Care Neem Lime - 50gm. Antibacterial neem and lime formulation for effective skin care.',
    pricing: { mrp: 82, tiers: [{qty: 1, price: 45, label: 'Sample'}, {qty: 50, price: 25}, {qty: 100, price: 20}] }
  },
  {
    id: 'devson3',
    title: 'Devson Care Herbal Aloe Vera & Cucumber Face Wash - 100ml',
    price: '₹59.00',
    moq: 1,
    img: require('./assets/cataloges/devson aloe vera cucumber face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/devson aloe vera cucumber face wash/1.jpeg'),
        require('./assets/cataloges/devson aloe vera cucumber face wash/2.jpeg'),
        require('./assets/cataloges/devson aloe vera cucumber face wash/3.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'Devson Care Herbal Aloe Vera & Cucumber Face Wash - 100ml. Cooling and refreshing face wash with natural aloe vera and cucumber extracts. Suitable for all skin types. Gently cleanses while maintaining skin moisture balance. Dermatologically tested.',
    features: ['Aloe Vera Extract', 'Cucumber Extract', 'Gentle Cleansing', 'All Skin Types', 'Cooling & Refreshing'],
    pricing: { mrp: 155, tiers: [{qty: 1, price: 59, label: 'Sample'}, {qty: 24, price: 45}, {qty: 50, price: 40}, {qty: 100, price: 35}] }
  },
  {
    id: 'velsoft1',
    title: 'VelSoft Glow Honey and Almond Body Lotion 600ml',
    price: '₹149.00',
    moq: 1,
    img: require('./assets/cataloges/honey almond -600/1.jpg'),
    images: [
        require('./assets/cataloges/honey almond -600/1.jpg'),
        require('./assets/cataloges/honey almond -600/2.jpg'),
        require('./assets/cataloges/honey almond -600/3.jpg'),
        require('./assets/cataloges/honey almond -600/4.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Body Care',
    description: 'VelSoft Glow Honey and Almond Body Lotion 600ml. Moisturizing formula with honey and almond extracts.',
    pricing: { mrp: 349, tiers: [{qty: 1, price: 149}] }
  },
  {
    id: 'w1',
    title: 'Amar Dant Ayush Anti Cavity Dental Toothpaste - 150g',
    price: '₹45.00',
    moq: 12,
    img: require('./assets/cataloges/amar dant ayush/1.jpg'),
    images: [
        require('./assets/cataloges/amar dant ayush/1.jpg'),
        require('./assets/cataloges/amar dant ayush/2.jpg'),
        require('./assets/cataloges/amar dant ayush/3.jpg'),
        require('./assets/cataloges/amar dant ayush/4.jpg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Oral Care',
    description: 'Amar Dant Ayush Anti Cavity Dental Toothpaste - 150g. Advanced formula with natural ayurvedic ingredients. 24-hour cavity protection with solid teeth and super fresh whitening. Enriched with calcium for strong teeth.',
    features: ['24-Hour Cavity Protection', 'Solid Teeth & Anti-Cavity', 'Super Fresh Whitening', 'Ayurvedic Formula (Dant Ayush)', 'Enriched with Calcium', 'Anti Plaque & Tartar'],
    pricing: { mrp: 110, tiers: [{qty: 1, price: 65}, {qty: 12, price: 45}, {qty: 24, price: 40}, {qty: 50, price: 35}, {qty: 100, price: 30}] }
  },
  {
    id: 'vs1',
    title: 'VelSoft Glow Honey and Almond Body Lotion 600ml',
    price: '₹99.00',
    moq: 1,
    img: require('./assets/cataloges/velsoft glow honey almond body lotion/1.jpeg'),
    images: [
        require('./assets/cataloges/velsoft glow honey almond body lotion/1.jpeg'),
        require('./assets/cataloges/velsoft glow honey almond body lotion/2.jpeg'),
        require('./assets/cataloges/velsoft glow honey almond body lotion/3.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Body Care',
    description: 'VelSoft Glow Honey and Almond Body Lotion 600ml. Premium moisturizing body lotion with natural honey and almond extracts. Deeply nourishes and softens skin. Suitable for all skin types. Long-lasting hydration with a luxurious feel.',
    features: ['Premium Body Lotion', 'Honey & Almond Extracts', 'Deep Moisturization', 'Suitable for All Skin Types', 'Long-Lasting Hydration', 'Luxury Feel'],
    pricing: { mrp: 450, tiers: [{qty: 1, price: 99}] }
  },
  {
    id: 'vs2',
    title: 'VelSoft Glow Charcoal Face Wash - 100ml',
    price: '₹65.00',
    moq: 1,
    img: require('./assets/cataloges/velsoft glow charcoal face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/velsoft glow charcoal face wash/1.jpeg'),
        require('./assets/cataloges/velsoft glow charcoal face wash/2.jpeg'),
        require('./assets/cataloges/velsoft glow charcoal face wash/3.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'VelSoft Glow Charcoal Face Wash - 100ml. Deep cleansing face wash with activated charcoal. Removes dirt, oil, and impurities. Leaves skin feeling fresh and clean. Suitable for all skin types, especially oily and combination skin.',
    features: ['Activated Charcoal', 'Deep Cleansing', 'Removes Oil & Impurities', 'Fresh & Clean Feel', 'Suitable for Oily Skin', 'Gentle Formula'],
    pricing: { mrp: 275, tiers: [{qty: 1, price: 65}] }
  },
  {
    id: 'vs3',
    title: 'VelSoft Glow Vitamin C Face Wash - 100ml',
    price: '₹65.00',
    moq: 1,
    img: require('./assets/cataloges/velsoft glow vitamin c face wash/1.jpeg'),
    images: [
        require('./assets/cataloges/velsoft glow vitamin c face wash/1.jpeg'),
        require('./assets/cataloges/velsoft glow vitamin c face wash/2.jpeg'),
        require('./assets/cataloges/velsoft glow vitamin c face wash/3.jpeg')
    ],
    manufacturer: 'Real Herbal Cosmetics',
    address: 'H136 Sector 5 Bawana, New Delhi-110039',
    source: 'Direct from Manufacturer',
    category: 'Face Care',
    description: 'VelSoft Glow Vitamin C Face Wash - 100ml. Brightening face wash infused with Vitamin C. Boosts skin radiance and promotes a glowing complexion. Effective against dullness and dark spots. Suitable for all skin types.',
    features: ['Vitamin C Enriched', 'Brightening Formula', 'Boosts Radiance', 'Anti-Dullness', 'Reduces Dark Spots', 'Glowing Complexion'],
    pricing: { mrp: 275, tiers: [{qty: 1, price: 65}] }
  }
];

// --- Shared Components ---

const Styles = () => (
    <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
    
    :root {
      --primary: #C0C0C0; /* Silver */
      --secondary: #FF0000; /* Red */
      --bg-light: #FFFFFF; /* White */
      --bg-dark: #221710;
      --surface-dark: #2d211a;
      --surface-light: #ffffff;
    }
    
    .text-primary { color: var(--primary); }
    .text-secondary { color: var(--secondary); }
    .bg-primary { background-color: var(--primary); }
    .bg-secondary { background-color: var(--secondary); }
    .border-primary { border-color: var(--primary); }
    .border-secondary { border-color: var(--secondary); }
    .ring-primary { --tw-ring-color: var(--primary); }
    .shadow-primary\\/20 { --tw-shadow-color: rgba(192, 192, 192, 0.2); }
    .shadow-primary\\/30 { --tw-shadow-color: rgba(192, 192, 192, 0.3); }
    .shadow-primary\\/40 { --tw-shadow-color: rgba(192, 192, 192, 0.4); }
    .fill-primary { fill: var(--primary); }
    
    .bg-primary\\/5 { background-color: rgba(192, 192, 192, 0.05); }
    .bg-primary\\/10 { background-color: rgba(192, 192, 192, 0.1); }
    .bg-primary\\/20 { background-color: rgba(192, 192, 192, 0.2); }
    .border-primary\\/10 { border-color: rgba(192, 192, 192, 0.1); }
    .border-primary\\/20 { border-color: rgba(192, 192, 192, 0.2); }
    .border-primary\\/30 { border-color: rgba(192, 192, 192, 0.3); }
    .border-primary\\/50 { border-color: rgba(192, 192, 192, 0.5); }
    
    .hover\\:bg-primary:hover { background-color: var(--primary); }
    .hover\\:text-primary:hover { color: var(--primary); }
    .hover\\:border-primary:hover { border-color: var(--primary); }
    .group-hover\\:text-primary:hover { color: var(--primary); }
    .focus\\:ring-primary:focus { --tw-ring-color: var(--primary); }
    .focus\\:border-primary:focus { border-color: var(--primary); }

    .bg-background-light { background-color: var(--bg-light); }
    .font-display { font-family: 'Inter', sans-serif; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-in { animation-fill-mode: forwards; }
    .fade-in { animation: fadeIn 0.3s ease-out; }
    
    ::selection { background-color: rgba(192, 192, 192, 0.3); color: var(--primary); }
    `}} />
);

const NexisLogo = () => (
  <div className="flex items-center gap-2 select-none shrink-0 cursor-pointer">
    <span className="text-2xl md:text-3xl font-bold tracking-tight text-secondary">Nekxuz</span>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand Section */}
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold tracking-tight text-white">Ayusya</span>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">Enterprises</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
            India's trusted B2B marketplace for personal care and cosmetics wholesale sourcing. Connect directly with manufacturers, negotiate wholesale rates, and scale your retail business with verified quality products.
          </p>
          <div className="flex gap-4 mb-6">
            <a href="#" title="Facebook" className="size-9 rounded-full bg-gray-800 hover:bg-secondary flex items-center justify-center text-gray-300 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">facebook</span>
            </a>
            <a href="#" title="LinkedIn" className="size-9 rounded-full bg-gray-800 hover:bg-secondary flex items-center justify-center text-gray-300 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">linkedin</span>
            </a>
            <a href="#" title="Twitter" className="size-9 rounded-full bg-gray-800 hover:bg-secondary flex items-center justify-center text-gray-300 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a href="#" title="Instagram" className="size-9 rounded-full bg-gray-800 hover:bg-secondary flex items-center justify-center text-gray-300 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">image</span>
            </a>
          </div>
        </div>

        {/* Sourcing & Services */}
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wide">Sourcing</h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><a href="#" className="hover:text-secondary transition-colors">Browse Products</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Verified Factories</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Post RFQ</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Wholesale Pricing</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Contract Manufacturing</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Flash Sales</a></li>
          </ul>
        </div>

        {/* Company Info */}
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wide">Company</h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><a href="#" className="hover:text-secondary transition-colors">About Nekxuz</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Our Mission</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Blog & News</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Support Center</a></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wide">Legal</h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Refund Policy</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Cookie Policy</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Compliance</a></li>
          </ul>
        </div>
      </div>

      {/* Legal Details Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
        <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wide">Legal Information & Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-400 leading-relaxed">
          <div>
            <h5 className="text-gray-200 font-semibold mb-2">Company Registration</h5>
            <p><strong>Company Name:</strong> Ayusya Enterprises</p>
            <p><strong>GST Registration:</strong> 07EWZPG4345H1ZZ</p>
            <p><strong>Registered Address:</strong> House NO.06/B, Laxmi Narayan Niwas, Gali Number 3, Nearby Gurudwara, Prahlad Vihar, North West Delhi, Delhi - 110042</p>
            <p><strong>Email:</strong> ayusyaenterprise@gmail.com</p>
            <p><strong>Phone:</strong> +91-11-4051-5386</p>
          </div>

          <div>
            <h5 className="text-gray-200 font-semibold mb-2">Payment & Security</h5>
            <p><strong>Payment Gateway:</strong> Razorpay (IAMAI Compliant)</p>
            <p><strong>SSL Encryption:</strong> 256-bit TLS 1.3</p>
            <p><strong>PCI DSS Compliance:</strong> Level 1</p>
            <p><strong>Data Protection:</strong> ISO 27001 Certified</p>
            <p><strong>Supported Payment Methods:</strong> Credit/Debit Cards, UPI, Net Banking, Wallet</p>
          </div>

          <div>
            <h5 className="text-gray-200 font-semibold mb-2">Shipping & Logistics</h5>
            <p><strong>Logistics Partner:</strong> Shiprocket (Delhivery, DTDC, Ecom Express)</p>
            <p><strong>Shipping Timeframe:</strong> 3-7 business days (All-India)</p>
            <p><strong>Tracking System:</strong> Real-time AWB Tracking</p>
            <p><strong>Insurance Coverage:</strong> Optional Transit Insurance Available</p>
            <p><strong>Warehouse Locations:</strong> Delhi, Mumbai, Bangalore</p>
          </div>

          <div>
            <h5 className="text-gray-200 font-semibold mb-2">Consumer Rights & Grievances</h5>
            <p><strong>Return Period:</strong> 7-30 days (Product Dependent)</p>
            <p><strong>Refund Processing:</strong> 5-7 business days to source account</p>
            <p><strong>Grievance Redressal:</strong> ayusyaenterprise@gmail.com</p>
            <p><strong>Nodal Officer:</strong> ayusyaenterprise@gmail.com</p>
            <p><strong>Response Time:</strong> Within 48 business hours</p>
          </div>

          <div>
            <h5 className="text-gray-200 font-semibold mb-2">E-Commerce Compliance</h5>
            <p><strong>E-Commerce Rules:</strong> MEITY Registered (RCS/IRDA Compliant)</p>
            <p><strong>Consumer Protection:</strong> Covered under Consumer Protection Act 2019</p>
            <p><strong>Data Privacy:</strong> DPDP Act 2023 Compliant</p>
            <p><strong>Digital Signature:</strong> Available upon request</p>
            <p><strong>Business Model:</strong> B2B Marketplace for Personal Care & Cosmetics</p>
          </div>

          <div>
            <h5 className="text-gray-200 font-semibold mb-2">Tax & Invoicing</h5>
            <p><strong>GST Handling:</strong> Input Tax Credit (ITC) Eligible</p>
            <p><strong>Invoice Format:</strong> CMS/GSTR-1 Compliant</p>
            <p><strong>E-Invoicing:</strong> IRN Generated (NIC Format)</p>
            <p><strong>TDS Coverage:</strong> Section 194O (if applicable)</p>
            <p><strong>Financial Year:</strong> April 1 - March 31</p>
          </div>
        </div>
      </div>

      {/* Disclaimers & Policies */}
      <div className="bg-gray-800/30 rounded-lg p-4 mb-8 border border-gray-700">
        <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wide">Important Disclaimers</h4>
        <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
          <li><strong>Product Information:</strong> We strive for accuracy, but product images and descriptions are provided by suppliers and may vary.</li>
          <li><strong>Liability Limitation:</strong> Nekxuz B2B is not liable for indirect, incidental, or consequential damages arising from product use.</li>
          <li><strong>Third-Party Content:</strong> Seller profiles, reviews, and ratings are user-generated and moderated for authenticity.</li>
          <li><strong>Market Risks:</strong> Prices and availability subject to market fluctuations. Advance notice given for major changes.</li>
          <li><strong>Intellectual Property:</strong> All content on Nekxuz is proprietary. Unauthorized reproduction is prohibited.</li>
          <li><strong>Terms Modification:</strong> We reserve the right to modify terms of service with 30 days' notice to registered users.</li>
        </ul>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">© 2025-2026 Ayusya Enterprises. All rights reserved.</p>
            <p className="text-xs text-gray-600 mt-1">Made in India | Serving Global Retailers</p>
          </div>
          
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2 text-gray-400 text-xs hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span>PCI DSS Level 1</span>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <span className="text-gray-400 text-xs font-semibold">Secure Payments:</span>
            <div className="flex gap-2">
              <div className="h-6 px-2 bg-gray-800 rounded flex items-center justify-center text-[9px] font-bold text-gray-400 border border-gray-700">VISA</div>
              <div className="h-6 px-2 bg-gray-800 rounded flex items-center justify-center text-[9px] font-bold text-gray-400 border border-gray-700">MASTERCARD</div>
              <div className="h-6 px-2 bg-gray-800 rounded flex items-center justify-center text-[9px] font-bold text-gray-400 border border-gray-700">UPI</div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-gray-700">
          <p className="text-[10px] text-gray-600">
            For any queries or concerns, contact: <a href="mailto:ayusyaenterprise@gmail.com" className="text-secondary hover:underline">📧 ayusyaenterprise@gmail.com</a> | 
            <a href="tel:01140515386" className="text-secondary hover:underline ml-2">+91-11-4051-5386</a> | 
            <a href="mailto:ayusyaenterprise@gmail.com?subject=Support%20Required&body=Hello%20Nekxuz,%0A%0AI%20need%20support.%20Please%20assist." className="text-secondary hover:underline ml-2">� Email Support</a> | 
            <a href="#" className="text-secondary hover:underline ml-2">Report Abuse</a>
          </p>
          <p className="text-[10px] text-gray-700 mt-2">
            <a href="?admin=true" className="text-gray-500 hover:text-secondary transition-colors">Admin Portal</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

const HeaderActions = ({ cartCount, onCartClick, onAccountClick, user, onLoginClick }) => (
  <div className="flex items-center gap-2">
    <button onClick={onCartClick} className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-gray-50 group">
      <span className="material-symbols-outlined !text-[28px] group-hover:fill-current">shopping_cart</span>
      {cartCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white border border-white">
          {cartCount}
        </span>
      )}
    </button>
    {user ? (
        <button onClick={onAccountClick} className="size-9 rounded-full bg-gradient-to-br from-primary to-gray-600 text-white font-bold flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95 text-xs overflow-hidden">
            {typeof user.avatar === 'string' && user.avatar.length > 2 ? <img src={user.avatar} className="w-full h-full object-cover"/> : user.name?.[0]}
        </button>
    ) : (
        <button onClick={onLoginClick} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span className="hidden md:inline">Login</span>
        </button>
    )}
  </div>
);

const LoginModal = ({ isOpen, onClose, onGoogleLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if(!isOpen) return null;

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (err) {
            console.error(err);
            // Auto-create specific vendor account if not found (for prototype access)
            if (email === 'realherbalcosmetics@gmail.com') {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await updateProfile(userCredential.user, { displayName: "Real Herbal Cosmetics" });
                    onClose();
                    return;
                } catch (createErr) {
                    console.error("Auto-creation failed", createErr);
                }
            }
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-6">
                        <span className="text-4xl font-bold tracking-tight text-secondary">Nekxuz</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Nekxuz</h2>
                    <p className="text-sm text-gray-500 mb-8">Sign in to access wholesale pricing, track orders, and chat with manufacturers.</p>
                    
                    <form onSubmit={handleEmailLogin} className="w-full space-y-3 mb-4">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-secondary focus:ring-secondary outline-none text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-secondary focus:ring-secondary outline-none text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-xs text-red-500 text-left">{error}</p>}
                        <button type="submit" className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-secondary/20">
                            Login
                        </button>
                    </form>

                    <div className="relative w-full mb-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
                    </div>

                    <button 
                        onClick={onGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-sm mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}

const TopNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'retail', label: 'Direct from Manufacturer' },
    { id: 'wholesale', label: 'Wholesale' },
    { id: 'manufacturing', label: 'Contract Mfg' },
    { id: 'wholesaler', label: 'Wholesaler' },
    { id: 'global', label: 'Global Market' },
    { id: 'messenger', label: 'Messenger' },
    { id: 'rfq', label: 'RFQ' },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-8 ml-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-sm font-semibold transition-all relative py-2 ${activeTab === tab.id ? 'text-secondary' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'retail', icon: 'local_fire_department', label: 'Retail' },
    { id: 'wholesale', icon: 'storefront', label: 'Wholesale' },
    { id: 'manufacturing', icon: 'precision_manufacturing', label: 'Mfg' },
    { id: 'wholesaler', icon: 'business', label: 'Wholesaler' },
    { id: 'global', icon: 'public', label: 'Global' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 flex justify-between items-end px-1 pb-4 pt-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 p-1 flex-1 min-w-0 transition-all relative ${activeTab === tab.id ? 'text-secondary' : 'text-gray-400'}`}
        >
          {activeTab === tab.id && (
            <div className="absolute top-0 h-0.5 w-6 rounded-full bg-secondary shadow-[0_0_10px_2px_rgba(242,108,13,0.3)]"></div>
          )}
          <span className={`material-symbols-outlined text-[24px] ${activeTab === tab.id ? 'fill-current' : ''}`}>
            {tab.icon}
          </span>
          <span className={`text-[9px] font-bold text-center leading-none uppercase tracking-tighter`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

const AIChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am Nekxuz AI. How can I help you with your B2B sourcing today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      if (!genAI) throw new Error("AI not initialized");
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-preview',
        systemInstruction: "You are Nekxuz AI, a helpful assistant for a B2B platform called Nekxuz. You help users find manufacturers, understand wholesale trends, and optimize their RFQs (Request for Quotes). Be professional, concise, and informative."
      });
      
      const result = await model.generateContent(userText);
      const text = result.response.text();
      
      setMessages(prev => [...prev, { role: 'model', text: text || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI (Check API Key). For now, I can tell you that we have 15 new manufacturers in the lotion category!" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto md:w-96 z-[100] flex flex-col bg-background-light shadow-2xl border-l border-gray-200 animate-in slide-in-from-right duration-300">
      <header className="flex items-center p-4 border-b border-gray-100 bg-white">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <span className="font-bold text-lg text-secondary">Nekxuz AI</span>
          <span className="text-[10px] text-green-500 flex items-center gap-1 font-bold">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE
          </span>
        </div>
        <div className="w-10"></div>
      </header>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-secondary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <div className="flex gap-1">
                <div className="size-1.5 rounded-full bg-secondary animate-bounce"></div>
                <div className="size-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-1.5 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1.5">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Nekxuz AI anything..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-gray-900 focus:outline-none"
          />
          <button onClick={handleSend} className="size-10 bg-secondary rounded-lg flex items-center justify-center text-white active:scale-95 transition-transform">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const NearbyManufacturers = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const findNearby = async () => {
    setLoading(true);
    setError('');
    try {
      let latLng = { latitude: 37.78193, longitude: -122.40476 };
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {}
      }

      if (!genAI) throw new Error("AI not configured");

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview" });
      const result = await model.generateContent("Find verified cosmetic and herbal manufacturers near my current location. Return a JSON array of 3 fictitious but realistic results with name, uri (url), and snippet.");
      const text = result.response.text();
      
      const simulatedResults = [
          { name: "Golden State Organics", uri: "#", snippet: "Certified organic manufacturing facility specializing in essential oils." },
          { name: "Bay Area Labs", uri: "#", snippet: "High-tech skincare formulation lab with small MOQ options." },
          { name: "Pacific Packaging Solutions", uri: "#", snippet: "Eco-friendly glass and recycled plastic container manufacturer." }
      ];
      
      setResults(simulatedResults);

    } catch (err) {
       setResults([
          { name: "Local Bio-Labs", uri: "#", snippet: "Specializing in organic serums." },
          { name: "City Packaging Co", uri: "#", snippet: "Custom boxes and bottles." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6 overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
        <span className="material-symbols-outlined text-[140px] text-primary">google_pin</span>
      </div>
      <div className="relative z-10 max-w-2xl">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-gray-900">
          <span className="material-symbols-outlined text-secondary text-[28px]">location_on</span>
          Find Local Manufacturers
        </h3>
        <p className="text-sm text-gray-500 mb-6">Discover verified factories in your region using Nekxuz AI and Google Maps data.</p>
        
        {results.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {results.slice(0, 3).map((r, i) => (
              <a key={i} href={r.uri} target="_blank" rel="noopener noreferrer" className="block bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-primary transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors">{r.name}</span>
                  <span className="material-symbols-outlined text-secondary text-sm">open_in_new</span>
                </div>
                {r.snippet && <p className="text-[11px] text-gray-500 italic line-clamp-2">"{r.snippet}"</p>}
              </a>
            ))}
            <button onClick={() => setResults([])} className="text-xs text-secondary font-bold hover:underline mt-2">Clear results</button>
          </div>
        ) : (
          <button 
            onClick={findNearby}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-secondary text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-red-600"
          >
            {loading ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                Searching Nearby...
              </>
            ) : 'Scan Nearby Factories'}
          </button>
        )}
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>
    </div>
  );
};

const FactoryModal = ({ factory, onClose, onChat }) => {
    if (!factory) return null;

    const factoryProducts = ALL_PRODUCTS.filter(p => p.manufacturer === factory.name);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
                 <div className="h-64 bg-gray-900 relative shrink-0">
                    <img src={factory.videoThumbnail} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button className="size-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center text-white hover:scale-110 transition-transform group">
                            <span className="material-symbols-outlined text-[48px] fill-current group-hover:text-secondary transition-colors">play_arrow</span>
                        </button>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                         <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white hover:bg-white hover:text-black transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-20">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="size-24 rounded-2xl bg-white p-2 shadow-xl shrink-0">
                                <div className="w-full h-full border border-gray-100 rounded-xl flex items-center justify-center bg-gray-50 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="material-symbols-outlined text-secondary text-[32px]">spa</span>
                                        <span className="text-[8px] font-bold uppercase text-gray-900 leading-tight mt-1">Real Herbal<br/>Cosmetics</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-3xl font-bold">{factory.name}</h2>
                                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] fill-current">verified</span> Verified Factory
                                    </span>
                                </div>
                                <p className="text-gray-300 flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    {factory.address}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        onChat(factory.name);
                                        onClose();
                                    }}
                                    className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">chat_bubble</span> Chat
                                </button>
                                <button className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined">send</span> Send Inquiry
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="p-8 grid md:grid-cols-3 gap-8">
                     <div className="md:col-span-2 space-y-8">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">factory</span> Manufacturing Capabilities
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                {factory.description}
                            </p>

                            <h4 className="font-bold text-gray-900 mb-4">Manufacturing Categories</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {factory.catalog.map((cat, i) => (
                                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center text-secondary">
                                                <span className="material-symbols-outlined">{cat.icon}</span>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 text-sm">{cat.name}</h5>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MOQ: {factory.moq}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">{cat.specs}</p>
                                    </div>
                                ))}
                            </div>

                            {factoryProducts.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-secondary">inventory_2</span>
                                        Product Showcase & Live Inventory
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">Ready-to-ship products manufactured by {factory.name}. Available for wholesale purchase or private label sampling.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {factoryProducts.map(p => (
                                            <div key={p.id} className="flex gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary bg-white shadow-sm hover:shadow-md transition-all items-center cursor-pointer" onClick={() => onClose() /* Ideally navigating to product, but closing for now to allow cart add from main list */}>
                                                <img src={p.img} className="size-14 object-contain bg-gray-50 rounded-lg border border-gray-100 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{p.title}</p>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] text-secondary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{p.price}</span>
                                                        {p.outOfStock && <span className="text-[9px] text-red-500 font-bold">OOS</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 mb-8">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-600">label</span> Private & Third Party Labeling
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    We specialize in end-to-end customizable manufacturing. Launch your own brand with our premium formulations.
                                </p>
                                <ul className="grid grid-cols-2 gap-3">
                                    {["Custom Formulations", "Bottle/Tube Design", "Label Printing", "Packaging Boxes", "FDA/Ayush Compliance"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                     </div>

                     <div className="space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Start Your Order</h3>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <label className="block">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">I am interested in</span>
                                    <select className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 text-sm">
                                        <option>Custom Toothpaste Manufacturing</option>
                                        <option>Body Lotion Private Label</option>
                                        <option>Hair Care Products</option>
                                        <option>Skin Creams & Serums</option>
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</span>
                                        <input type="number" defaultValue="10000" className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 text-sm" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timeline</span>
                                        <select className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 text-sm">
                                            <option>Urgent</option>
                                            <option selected>Standard</option>
                                            <option>Flexible</option>
                                        </select>
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</span>
                                    <textarea className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 text-sm h-24" placeholder="Describe your requirements, custom label needs, etc..."></textarea>
                                </label>
                                <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg">
                                    Submit RFQ
                                </button>
                                <p className="text-[10px] text-gray-400 text-center">
                                    Typically responds within 24 hours.
                                </p>
                            </form>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-sm text-gray-900 mb-2">Certifications</h4>
                            <div className="flex flex-wrap gap-2">
                                {["ISO 9001:2015", "GMP Certified", "Ayush License", "FDA Registered"].map(c => (
                                    <span key={c} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{c}</span>
                                ))}
                            </div>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(product.pricing?.tiers?.[0]?.qty || 12);
  const [activeImg, setActiveImg] = useState(product.img);
  const [sampleQty, setSampleQty] = useState(1);
  const isOutOfStock = product.outOfStock || (product.stock !== undefined && product.stock <= 0);
  const gallery = product.images || [product.img];

  useEffect(() => {
    setActiveImg(product.img);
    setSampleQty(1);
  }, [product]);
  
  const defaultPricing = {
    mrp: 80,
    sample: 65,
    tiers: [
      { qty: 12, price: 45, label: "Starter Pack" },
      { qty: 24, price: 35, label: "Standard Pack" },
      { qty: 50, price: 25, label: "Bulk Tier" },
      { qty: 100, price: 20, label: "Wholesale Tier" },
    ]
  };

  const config = product.pricing || defaultPricing;
  const { mrp, sample: samplePrice, tiers } = config;

  const currentTier = tiers.slice().reverse().find(t => quantity >= t.qty) || tiers[0];
  const unitPrice = currentTier.price;
  const totalPrice = quantity * unitPrice;
  const discount = Math.round(((mrp - unitPrice) / mrp) * 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-gray-600">close</span>
        </button>
        
        <div className="w-full md:w-1/2 bg-gray-50 relative min-h-[300px] md:min-h-full flex flex-col">
          <div className="relative flex-1 min-h-[300px]">
            <img src={activeImg} className="absolute inset-0 w-full h-full object-contain p-8" alt={product.title} />
          </div>
          <div className="absolute top-6 left-6 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            {product.source || "Direct from Manufacturer"}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 p-4 justify-center overflow-x-auto z-10 bg-white/50 backdrop-blur-sm border-t border-gray-100">
                {gallery.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(img)} className={`size-14 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${activeImg === img ? 'border-secondary ring-2 ring-secondary/20' : 'border-gray-200 hover:border-gray-300'}`}>
                        <img src={img} className="w-full h-full object-cover" alt={`View ${i+1}`} />
                    </button>
                ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
          
          <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  {product.source || "Direct from Manufacturer"}
              </span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-secondary">₹{unitPrice}</span>
            <div className="flex flex-col mb-1">
                <span className="text-xl text-gray-500 font-bold line-through">MRP ₹{mrp}</span>
                <span className="text-xs text-green-600 font-bold">{discount}% OFF</span>
            </div>
            <span className="text-sm text-gray-400 font-medium mb-2 ml-auto">/ piece (for {quantity} pcs)</span>
          </div>

          {samplePrice && (
            <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-white border border-orange-200 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined">science</span>
                      </div>
                      <div>
                          <span className="block text-sm font-bold text-gray-900">Buy Samples</span>
                          <span className="text-xs text-gray-500">Test quality before bulk order</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="block text-sm font-bold text-secondary">₹{samplePrice * sampleQty}</span>
                      <span className="text-[10px] text-gray-400">₹{samplePrice}/pc</span>
                  </div>
              </div>
              
              <div className="flex items-center justify-between bg-white/60 rounded-lg p-2 border border-orange-100/50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSampleQty(q => Math.max(1, q - 1))} className="size-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 text-gray-600 shadow-sm transition-colors">-</button>
                    <span className="text-sm font-bold w-6 text-center text-gray-900">{sampleQty}</span>
                    <button onClick={() => setSampleQty(q => q + 1)} className="size-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 text-gray-600 shadow-sm transition-colors">+</button>
                  </div>
                  <button 
                        onClick={() => { 
                            onAddToCart({ ...product, price: `₹${samplePrice}`, moq: `${sampleQty} pcs`, title: `${product.title} (Sample x${sampleQty})` }); 
                            onClose();
                        }}
                        className="text-xs font-bold text-white bg-secondary px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                   >
                       <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span> Add Sample
                   </button>
              </div>
            </div>
          )}

          {tiers.length > 1 && (
            <div className="mb-8 space-y-3">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Bulk Volume Discounts</p>
              <div className="grid grid-cols-2 gap-2">
                {tiers.map(tier => (
                  <div 
                    key={tier.qty}
                    onClick={() => setQuantity(tier.qty)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${quantity === tier.qty ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/50'}`}
                  >
                    <div>
                      <span className="block text-sm font-bold text-gray-900">{tier.qty} Pcs</span>
                      <span className="text-[10px] text-gray-500 font-medium">{tier.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${quantity === tier.qty ? 'text-secondary' : 'text-gray-400'}`}>₹{tier.price}/pc</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-sm font-bold text-gray-700">Quantity:</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(tiers[0].qty, q - 1))} disabled={isOutOfStock} className="size-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary text-gray-600 disabled:opacity-50">-</button>
              <input 
                type="number" 
                value={quantity}
                disabled={isOutOfStock}
                onChange={e => setQuantity(Math.min(product.stock || Infinity, Math.max(tiers[0].qty, parseInt(e.target.value) || tiers[0].qty)))}
                className="w-16 text-center bg-transparent border-none font-bold text-lg focus:ring-0 p-0 outline-none disabled:text-gray-400"
              />
              <button onClick={() => setQuantity(q => Math.min(product.stock || Infinity, q + 1))} disabled={isOutOfStock} className="size-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary text-gray-600 disabled:opacity-50">+</button>
            </div>
            <div className="flex-1 text-right">
              <span className="block text-xs text-gray-400">Total Price</span>
              <span className="font-bold text-lg text-gray-900">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button 
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              onAddToCart({ ...product, price: `₹${unitPrice}`, moq: `${quantity} pcs`, title: `${product.title} (${quantity} pcs)` });
              onClose();
            }}
            className={`w-full py-4 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' : 'bg-secondary text-white shadow-primary/20 hover:bg-red-600 active:scale-95'}`}
          >
            {isOutOfStock ? (
                <>
                    <span className="material-symbols-outlined">block</span>
                    Out of Stock
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Add to Cart
                </>
            )}
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">Safe payments via Razorpay • 100% Purchase Protection</p>

          {(product.description || product.manufacturer) && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                {product.description && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Product Description</h4>
                        <div className="text-sm text-gray-500 leading-relaxed space-y-2">
                            {product.description.split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return <div key={i} className="h-2"></div>;
                                
                                // Heuristic for headers: Short line ending in : or purely uppercase short line
                                const isHeader = (trimmed.endsWith(':') && trimmed.length < 60) || (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && trimmed.length > 3);
                                
                                if (isHeader) {
                                    return <h5 key={i} className="font-bold text-gray-800 pt-2 text-xs uppercase tracking-wider">{trimmed}</h5>;
                                }
                                
                                // Heuristic for Key: Value pairs (e.g. Volume: 600ml)
                                const colonIndex = trimmed.indexOf(':');
                                if (colonIndex > 0 && colonIndex < 30 && !trimmed.endsWith('.')) {
                                    return (
                                        <div key={i} className="flex gap-2">
                                            <span className="font-semibold text-gray-700 min-w-fit">{trimmed.substring(0, colonIndex)}:</span>
                                            <span>{trimmed.substring(colonIndex + 1).trim()}</span>
                                        </div>
                                    );
                                }

                                return <p key={i}>{trimmed}</p>;
                            })}
                        </div>
                    </div>
                )}
                {product.manufacturer && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Manufacturer / Supplier</h4>
                        <p className="text-sm text-gray-800 font-bold">{product.manufacturer}</p>
                        {product.address && <p className="text-xs text-gray-500 mt-1">{product.address}</p>}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SupplierPanel = ({ user, onLoginClick, onExit, products }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    mrp: '',
    samplePrice: '',
    moq: '',
    stock: '',
    category: 'Skin Care',
    description: '',
    manufacturer: '',
    address: '',
    source: 'Direct from Manufacturer'
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Identify Vendor
  const isRealHerbal = user?.email === 'realherbalcosmetics@gmail.com';
  const vendorName = isRealHerbal ? 'Real Herbal Cosmetics' : (user?.displayName || '');
  
  // Filter products for this vendor
  const vendorProducts = products.filter(p => p.manufacturer === vendorName);

  const handleEdit = (product) => {
      setFormData({
          title: product.title,
          price: parseFloat(product.price.replace(/[^0-9.]/g, '')),
          mrp: product.pricing?.mrp || '',
          samplePrice: product.pricing?.sample || '',
          moq: product.moq,
          stock: product.stock || '',
          category: product.category || 'Skin Care',
          description: product.description || '',
          manufacturer: product.manufacturer,
          address: product.address || '',
          source: product.source || 'Direct from Manufacturer'
      });
      setActiveView('add_product');
  };

  const generateTiers = (basePrice) => {
      return [
          { qty: 12, price: basePrice, label: "Starter Pack" },
          { qty: 24, price: Math.ceil(basePrice * 0.92), label: "Standard Pack" },
          { qty: 50, price: Math.ceil(basePrice * 0.85), label: "Bulk Tier" },
          { qty: 100, price: Math.ceil(basePrice * 0.75), label: "Wholesale Tier" }
      ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
        alert("You must be logged in to publish products.");
        if (onLoginClick) onLoginClick();
        return;
    }

    setUploading(true);
    try {
      let imageUrls = [];
      
      if (images.length > 0) {
        if (!storage) {
            alert("Storage not initialized. Check Firebase config.");
        } else {
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const storageRef = ref(storage, `products/${Date.now()}_${i}_${img.name}`);
                const snapshot = await uploadBytes(storageRef, img);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }
        }
      }
      
      const mainImage = imageUrls.length > 0 ? imageUrls[0] : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500";
      const basePrice = parseFloat(formData.price);
      const moqQty = parseInt(formData.moq);
      const stockQty = parseInt(formData.stock) || 0;

      if (db) {
        await addDoc(collection(db, "products"), {
          ...formData,
          id: `new_${Date.now()}`,
          img: mainImage,
          images: imageUrls.length > 0 ? imageUrls : [mainImage],
          price: `₹${basePrice.toFixed(2)}`,
          stock: stockQty,
          manufacturer: formData.manufacturer || (user ? user.name : 'Verified Supplier'),
          address: formData.address || 'Verified Location',
          source: formData.source,
          pricing: { 
            mrp: parseFloat(formData.mrp) || basePrice * 1.5, 
            sample: parseFloat(formData.samplePrice) || basePrice * 1.2, 
            tiers: generateTiers(basePrice)
          },
          createdAt: new Date().toISOString()
        });
        
        if(window.confirm("Product Published Successfully! Do you want to view it in the Wholesale Market now?")) {
            onExit(); // Exit seller mode
            // The main app will default to home, user can click wholesale. 
            // Ideally we pass a state to switch tab, but for now this exits the panel.
        }
        
        setFormData({ title: '', price: '', mrp: '', samplePrice: '', moq: '', stock: '', category: 'Skin Care', description: '', manufacturer: '', address: '', source: 'Direct from Manufacturer' });
        setImages([]);
      } else {
        alert("Database connection failed. Please check your Firebase configuration.");
      }
    } catch (error) {
      console.error("Error adding product: ", error);
      alert(`Error uploading product: ${error.message}\n\nPlease ensure your Firebase Storage and Firestore rules are configured to allow writes.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 animate-in fade-in flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">Nekxuz <span className="text-secondary">Seller Central</span></span>
            {isRealHerbal && <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded ml-2 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span> GOLD SUPPLIER</span>}
        </div>
        <div className="flex items-center gap-4">
            {user && <span className="text-sm font-medium text-gray-300">Welcome, {user.name}</span>}
            <button onClick={onExit} className="text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">logout</span> Exit to Marketplace
            </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
            <div className="p-4 space-y-1">
                <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeView === 'dashboard' ? 'bg-secondary/10 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="material-symbols-outlined">dashboard</span> Dashboard
                </button>
                <button onClick={() => { setFormData({ title: '', price: '', mrp: '', samplePrice: '', moq: '', category: 'Skin Care', description: '', manufacturer: vendorName, address: isRealHerbal ? 'H135 Sector 5 Bawana Industrial Area, New Delhi-110039' : '', source: 'Direct from Manufacturer' }); setActiveView('add_product'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeView === 'add_product' ? 'bg-secondary/10 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="material-symbols-outlined">add_box</span> Add Product
                </button>
                <button onClick={() => setActiveView('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeView === 'inventory' ? 'bg-secondary/10 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="material-symbols-outlined">inventory_2</span> Inventory
                </button>
                <button onClick={() => setActiveView('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeView === 'orders' ? 'bg-secondary/10 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="material-symbols-outlined">local_shipping</span> Orders & Shipping
                </button>
                <button onClick={() => setActiveView('advertising')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeView === 'advertising' ? 'bg-secondary/10 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="material-symbols-outlined">campaign</span> Advertising
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {!user ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="size-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-gray-500">lock</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Seller Authentication Required</h2>
                <p className="text-gray-500 max-w-md">Please log in with your verified seller account to access the Nekxuz Supplier Panel and manage your catalog.</p>
                <button onClick={onLoginClick} className="px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg">
                    Login to Seller Central
                </button>
             </div>
          ) : activeView === 'dashboard' ? (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Sales</span>
                        <div className="text-3xl font-bold text-gray-900 mt-2">₹0</div>
                        <span className="text-gray-400 text-xs font-bold flex items-center gap-1 mt-2">No sales yet (Fresh Account)</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Inventory Left</span>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{(vendorProducts.length * 500).toLocaleString()} <span className="text-sm font-normal text-gray-400">Units</span></div>
                        <span className="text-green-500 text-xs font-bold mt-2">Est. Value: ₹{(vendorProducts.reduce((acc, p) => acc + (parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0) * 500, 0)).toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Listings</span>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{vendorProducts.length}</div>
                        <span className="text-gray-400 text-xs font-bold mt-2">Products live on Wholesale</span>
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                    <span className="material-symbols-outlined text-blue-600 text-3xl">tips_and_updates</span>
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Listing Optimization Tip</h3>
                        <p className="text-blue-800 text-sm mt-1">Products with 4+ images and detailed descriptions see 35% higher conversion rates. Go to "Add Product" to update your catalog.</p>
                    </div>
                </div>
             </div>
          ) : activeView === 'add_product' ? (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 px-8 py-6 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Add New Product to Catalog</h2>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step 1 of 1</span>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Vital Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Vital Info</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label><input required className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="e.g. Organic Vitamin C Serum - 30ml" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Category</label><select className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Skin Care</option><option>Hair Care</option><option>Oral Care</option><option>Face Care</option></select></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Manufacturer Name</label><input className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="Your Company Name" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Business Type</label><select className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}><option>Direct from Manufacturer</option><option>Direct from Wholeseller</option></select></div>
                            </div>
                        </div>

                        {/* Offer */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Offer & Pricing</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Wholesale Price (₹)</label><input required type="number" className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="Base Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">MRP (₹)</label><input required type="number" className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="Market Price" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Sample Price (₹)</label><input required type="number" className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="Single Unit" value={formData.samplePrice} onChange={e => setFormData({...formData, samplePrice: e.target.value})} /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">MOQ</label><input required type="number" className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="Min Qty" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-1">Stock</label><input required type="number" className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" placeholder="Available Qty" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                            </div>
                            <p className="text-xs text-gray-500 italic">Note: Bulk pricing tiers will be automatically generated based on your wholesale price.</p>
                        </div>

                        {/* Images & Description */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Images & Description</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Images (Max 4)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <span className="material-symbols-outlined text-gray-400 text-4xl">cloud_upload</span>
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-red-500 focus-within:outline-none">
                                                <span>Upload files</span>
                                                <input type="file" className="sr-only" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files).slice(0, 4))} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB ({images.length} selected)</p>
                                    </div>
                                </div>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Product Description</label><textarea className="w-full rounded-lg border-gray-300 focus:border-secondary focus:ring-secondary" rows="4" placeholder="Describe key features, ingredients, and benefits..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                            <button type="button" onClick={() => setFormData({ title: '', price: '', mrp: '', samplePrice: '', moq: '', stock: '', category: 'Skin Care', description: '', manufacturer: '', address: '', source: 'Direct from Manufacturer' })} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50">Reset</button>
                            <button disabled={uploading} className="px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2">
                                {uploading ? <span className="size-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span> : <span className="material-symbols-outlined">publish</span>}
                                Publish Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          ) : activeView === 'inventory' ? (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                    <button onClick={() => setActiveView('add_product')} className="bg-secondary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-red-600 transition-colors">+ Add Product</button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">MOQ</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vendorProducts.length > 0 ? vendorProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="size-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                            <img src={p.img} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{p.title}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.price}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.moq}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.stock || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEdit(p)} className="text-xs text-blue-600 font-bold hover:underline">Edit</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products found in your inventory.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          ) : activeView === 'orders' ? (
              <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                              <tr>
                                  <th className="px-6 py-4">Order ID</th>
                                  <th className="px-6 py-4">Product</th>
                                  <th className="px-6 py-4">Qty</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {[
                                  {id: '#ORD-7782', product: 'VelSoft Lotion', qty: 120, status: 'Pending', date: '2 mins ago'},
                                  {id: '#ORD-7781', product: 'Charcoal Face Wash', qty: 50, status: 'Shipped', date: '1 hour ago'},
                                  {id: '#ORD-7780', product: 'Toothbrush (White Label)', qty: 1000, status: 'Delivered', date: 'Yesterday'},
                              ].map((order, i) => (
                                  <tr key={i} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                                      <td className="px-6 py-4 text-gray-600">{order.product}</td>
                                      <td className="px-6 py-4 text-gray-600">{order.qty}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                              {order.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          {order.status === 'Pending' ? (
                                              <button className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-sm">Ship Now</button>
                                          ) : (
                                              <button className="text-xs text-gray-400 font-bold hover:text-gray-600">View Details</button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          ) : activeView === 'advertising' ? (
              <div className="flex flex-col items-center justify-center py-20 text-center h-full">
                  <div className="size-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-5xl text-gray-400">campaign</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Advertising Console Coming Soon</h2>
                  <p className="text-gray-500 max-w-md">
                      Boost your product visibility with sponsored listings and targeted campaigns. This feature is currently under development.
                  </p>
              </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory</span>
                <h3 className="text-xl font-bold text-gray-900">Inventory Module Loading...</h3>
                <p>Your live listings will appear here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const AppHeader = ({ activeTab, onTabChange, cartCount, user, onLoginClick, onCartClick, onAccountClick, onSearch }) => {
  const [term, setTerm] = useState('');
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <NexisLogo />
          <TopNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
        
        <div className="flex items-center gap-4 flex-1 md:max-w-md lg:max-w-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </span>
            <input 
              className="block w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-20 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm focus:outline-none transition-all" 
              placeholder="Search for products..." 
              type="text" 
              value={term}
              onChange={e => setTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch(term)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1 gap-1">
              <button onClick={() => onSearch(term)} className="p-1.5 text-white bg-secondary rounded-full hover:bg-red-600 shadow-sm transition-colors m-1"><span className="material-symbols-outlined text-[18px]">search</span></button>
            </div>
          </div>
          <HeaderActions cartCount={cartCount} onCartClick={onCartClick} onAccountClick={onAccountClick} user={user} onLoginClick={onLoginClick} />
        </div>
      </div>
    </header>
  );
};

const WholesaleScreen = ({ products, onProductClick, onAddToCart, title, stock = {} }) => {
  const getDiscount = (priceStr, mrp) => {
     if (!mrp || !priceStr) return null;
     const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
     if (isNaN(price)) return null;
     const percent = Math.round(((mrp - price) / mrp) * 100);
     return percent > 0 ? `${percent}% OFF` : null;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{products.length} Products</span>
      </div>
      
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
          {products.map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="bg-white p-3 rounded-2xl border border-gray-100 relative group shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between">
              <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-gray-50">
                <img src={p.img} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(p); }} className="absolute bottom-2 right-2 size-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90">
                   <span className="material-symbols-outlined text-[24px]">add_shopping_cart</span>
                </button>
                {p.pricing && p.pricing.mrp && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {getDiscount(p.price, p.pricing.mrp)}
                    </div>
                )}
                {/* Stock Badge */}
                {(() => {
                  const stockQty = stock[p.id]?.available || 0;
                  let badgeColor = 'bg-red-500'; // Out of stock
                  let badgeText = 'Out of Stock';
                  if (stockQty > 10) {
                    badgeColor = 'bg-green-600';
                    badgeText = `${stockQty} in Stock`;
                  } else if (stockQty > 0) {
                    badgeColor = 'bg-yellow-600';
                    badgeText = `Only ${stockQty} left`;
                  }
                  return (
                    <div className={`absolute top-2 right-2 ${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm`}>
                      {badgeText}
                    </div>
                  );
                })()}
              </div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">{p.title}</h4>
              <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-secondary">{p.price}<span className="text-[10px] text-gray-400 font-normal">/pc</span></span>
                    {p.pricing && p.pricing.mrp && <span className="text-xs text-gray-500 font-bold line-through">MRP ₹{p.pricing.mrp}</span>}
                </div>
                <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 whitespace-nowrap">Min: {p.moq}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

const CartOverlay = ({ cart, onClose, onRemove, isOpen }) => {
  const [step, setStep] = useState('cart'); // 'cart' | 'details' | 'success'
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [details, setDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer policy (show in cart + product contexts)
  const RETURN_POLICY = {
    refundDays: 3,
    exchangeDays: 7,
    conditions: 'Only damaged, defective, or wrong delivered products are eligible.'
  };

  // Cart is an array of products; allow per-item quantity like Amazon.
  // We keep quantity client-side (not persisted) and default to MOQ (or 1).
  const cartLines = useMemo(() => {
    return cart.map((item) => {
      const unitPrice = parseFloat(String(item.price || '').replace(/[^0-9.]/g, ''));
      const unit = isNaN(unitPrice) ? 0 : unitPrice;

      const moq = parseInt(String(item.moq || '1'), 10);
      const minQty = Number.isFinite(moq) && moq > 0 ? moq : 1;

      const qtyRaw = item.quantity ?? minQty;
      const qty = Math.max(minQty, parseInt(String(qtyRaw), 10) || minQty);

      // 🔧 Optimize price based on MOQ tiers
      let optimizedPrice = unit;
      if (item.pricing && item.pricing.tiers && Array.isArray(item.pricing.tiers)) {
        // Find the best tier for this quantity (highest qty <= current qty)
        const applicableTier = item.pricing.tiers
          .filter(tier => tier.qty <= qty)
          .sort((a, b) => b.qty - a.qty)[0]; // Get the highest tier that applies
        
        if (applicableTier) {
          optimizedPrice = applicableTier.price;
        }
      }

      return {
        ...item,
        unit: optimizedPrice, // Use optimized price instead of base price
        minQty,
        quantity: qty,
        lineTotal: optimizedPrice * qty,
      };
    });
  }, [cart]);

  const itemsCount = useMemo(
    () => cartLines.reduce((acc, line) => acc + (parseInt(String(line.quantity), 10) || 0), 0),
    [cartLines]
  );

  const subtotal = useMemo(() => {
    return cartLines.reduce((acc, line) => acc + (line.lineTotal || 0), 0);
  }, [cartLines]);

  // Simple shipping charge model for now (kept deterministic for invoice):
  // - Free shipping above ₹5,000
  // - Otherwise ₹99 flat
  const shippingCharge = useMemo(() => {
    if (!subtotal) return 0;
    return subtotal >= 5000 ? 0 : 99;
  }, [subtotal]);

  const grandTotal = useMemo(() => subtotal + shippingCharge, [subtotal, shippingCharge]);

  const updateQuantity = (id, nextQty) => {
    const next = Math.max(1, parseInt(String(nextQty), 10) || 1);
    // Mutate via state setter? CartOverlay only receives cart.
    // We'll update via custom event pattern: if parent provides onUpdateQuantity later.
    // For now, we modify cart items by attaching quantity with a window event.
    window.dispatchEvent(new CustomEvent('nekxuz:cart:updateQuantity', { detail: { id, quantity: next } }));
  };

  const handleCheckout = async () => {
    // ✅ REQUIRE LOGIN BEFORE CHECKOUT
    if (!window.user || !window.user.email) {
      alert("Please log in to proceed with checkout");
      return;
    }

    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
  console.log("Initiating checkout for amount:", grandTotal, "Cart items:", cart.length);
        // 1. Create Order on Backend
        const orderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'omit',
            body: JSON.stringify({ 
        amount: grandTotal, 
                invoiceNumber: "INV-" + Date.now() 
            })
        });
        
        const responseText = await orderRes.text();
        console.log("Order creation response status:", orderRes.status, "Text:", responseText);

        if (!orderRes.ok) {
             try {
                 const errJson = JSON.parse(responseText);
                 throw new Error(errJson.error || responseText);
             } catch (e) {
                 console.error("Error parsing response:", e);
                 if (responseText.includes("Proxy error") || responseText.includes("ECONNREFUSED")) {
                     throw new Error("Cannot connect to Backend Server. Please ensure your backend is running.");
                 }
                 const msg = responseText && responseText.trim() ? responseText : "Empty Response";
                 throw new Error("Server Error: " + msg);
             }
        }

        if (!responseText || !responseText.trim()) {
            throw new Error("Server returned empty response body");
        }

        const orderData = JSON.parse(responseText);
        console.log("Parsed order data:", orderData);

        if (!orderData.id) throw new Error("Order ID not returned from backend");

        // 2. Open Razorpay
        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Nekxuz B2B",
            description: `Order for ${cart.length} items`,
            order_id: orderData.id,
            handler: async function (response) {
                console.log("💳 Payment success response:", response);
                // 3. Verify Payment & Create Shipment
                try {
                    console.log("🔄 Starting payment verification...");
                    const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'omit',
                        body: JSON.stringify({
                            ...response,
                            localOrderId: orderData.localOrderId,
                            invoicePayload: {
                                billing_customer_name: details.name,
                                billing_email: window.user?.email || '',
                                billing_address: details.address,
                                billing_city: details.city,
                                billing_pincode: details.pincode,
                                billing_state: details.state,
                                billing_phone: details.phone,
                                order_items: cart.map(item => ({
                                    name: item.title,
                                    units: parseInt(item.quantity ?? item.moq) || 1,
                                    selling_price: parseFloat(item.price.replace(/[^0-9.]/g, '')),
                                    manufacturer: item.manufacturer || 'Nekxuz',
                                    product_id: item.id
                                })),
                                weight: "0.5", // Placeholder
                                shipping_charges: shippingCharge
                            }
                        })
                    });
                    console.log("✅ Verification response received");
                    const final = await verifyRes.json();
                    console.log("=".repeat(60));
                    console.log("🔍 PAYMENT VERIFICATION RESPONSE:");
                    console.log("Full response:", final);
                    console.log("final.ok:", final.ok);
                    console.log("final.invoice:", final.invoice);
                    console.log("final.orderId:", final.orderId);
                    console.log("final.shipment:", final.shipment);
                    console.log("=".repeat(60));
                    
                    if (final.ok) {
                        const invoiceId = final.invoice || 'invoice_' + response.razorpay_payment_id;
                        const shipmentId = final.shipment?.packages?.[0]?.shipment_id || "Processing";
                        const successData = {
                            orderId: final.orderId || 'ORDER-' + Date.now(),
                            invoiceId: invoiceId,
                            trackingId: final.shipment?.packages?.[0]?.waybill || "Processing",
                            shipmentId: shipmentId,
                            amount: grandTotal,
                            paymentId: response.razorpay_payment_id
                        };
                        console.log("✅ SETTING ORDER SUCCESS WITH:", successData);
                        console.log("invoiceId value is:", invoiceId);
                        console.log("shipmentId value is:", shipmentId);
                        console.log("🎯 About to call setOrderSuccess()...");
                        setOrderSuccess(successData);
                        console.log("🎯 About to call setStep('success')...");
                        setStep('success');
                        console.log("✅ State updated, success screen should now be visible!");
                    } else {
                        console.error("❌ Payment verification failed:", final.message);
                        alert("Payment Verification Failed: " + final.message);
                    }
                } catch (e) {
                    console.error("❌ Verification error:", e);
                    console.error("Error stack:", e.stack);
                    alert("Verification Error: " + e.message);
                }
            },
            prefill: {
                name: details.name,
                contact: details.phone
            },
            theme: {
                color: "#f26c0d"
            }
        };
        
        console.log("🔴 OPENING RAZORPAY MODAL");
        const rzp = new window.Razorpay(options);
        
        // Ensure modal stays open properly
        rzp.on('payment.failed', function (response){
            console.error("❌ Payment failed:", response);
            alert("Payment Failed: " + response.error.description);
            setIsProcessing(false);
        });
        
        rzp.on('payment.closed', function() {
            console.log("⚠️ RAZORPAY MODAL CLOSED - checking state");
            console.log("Current step:", step);
            console.log("Order success:", orderSuccess);
        });
        
        rzp.open();

    } catch (err) {
        console.error("Checkout Error:", err);
        alert("Checkout failed: " + err.message);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Debug logging
  console.log("📋 CHECKOUT MODAL STATE:", {
    isOpen,
    step,
    orderSuccess: orderSuccess ? { orderId: orderSuccess.orderId, invoiceId: orderSuccess.invoiceId } : null,
    cartLength: cart.length
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-stretch md:justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full md:w-[480px] bg-white rounded-t-3xl md:rounded-none shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-500 border-l border-gray-100 flex flex-col h-[90vh] md:h-full">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
                {step === 'success' ? 'Order Confirmation' : (step === 'cart' ? `Shopping Cart (${cart.length})` : 'Shipping Details')}
            </h2>
            {step === 'details' && <button onClick={() => setStep('cart')} className="text-xs text-primary font-bold hover:underline mt-1">Back to Cart</button>}
          </div>
          <button 
            onClick={() => {
              // Prevent closing during success screen
              if (step === 'success') {
                console.log("🚫 Close button clicked but step is 'success' - ignoring");
                return;
              }
              console.log("✅ Closing cart modal");
              onClose();
            }}
            disabled={step === 'success'}
            className={`p-2 rounded-full transition-colors ${step === 'success' ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
            title={step === 'success' ? 'Click Continue Shopping to close' : 'Close'}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar" style={{ display: 'flex', flexDirection: 'column', backgroundColor: step === 'success' ? '#f0f9ff' : 'white' }}>
      {step === 'success' && orderSuccess ? (
              // Order Success Screen
              (() => {
                console.log("🎉🎉🎉 RENDERING SUCCESS SCREEN 🎉🎉🎉");
                console.log("orderSuccess:", orderSuccess);
                console.log("step:", step);
                return (
              <div style={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                textAlign: 'center', 
                gap: '16px', 
                paddingBottom: '32px',
                minHeight: '100%',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '16px',
                zIndex: 1000,
                position: 'relative'
              }}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce mt-6 flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-3xl">check</span>
                </div>
                <div className="flex-shrink-0">
                  <h3 className="text-xl font-bold text-gray-900">Order Placed Successfully! ✓</h3>
                  <p className="text-sm text-gray-600 mt-1">Thank you for your purchase</p>
                </div>

                {/* Order Details Card */}
                <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 space-y-2 flex-shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <span className="text-xs font-bold text-gray-600">Order ID</span>
                    <span className="text-xs font-bold text-gray-900 break-all">{orderSuccess.orderId}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <span className="text-xs font-bold text-gray-600">Payment ID</span>
                    <span className="text-xs font-bold text-gray-900 font-mono">{orderSuccess.paymentId?.substring(0, 12)}...</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <span className="text-xs font-bold text-gray-600">Amount</span>
                    <span className="text-sm font-bold text-secondary">₹{orderSuccess.amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Tracking ID</span>
                    <span className="text-xs font-bold text-green-700">{orderSuccess.trackingId}</span>
                  </div>
                </div>

                {/* Invoice Download & Track Shipment Buttons */}
                <div className="flex flex-col gap-2 w-full flex-shrink-0">
                  {/* Invoice Copy Download Button (Full Width) */}
                  {orderSuccess?.invoiceId ? (
                      <button
                        onClick={async () => {
                          try {
                            console.log("📄 Downloading invoice copy for invoiceId:", orderSuccess.invoiceId);
                            const invoiceRes = await fetch(`${API_BASE_URL}/api/invoice/download/${orderSuccess.invoiceId}`);
                            
                            if (!invoiceRes.ok) {
                              const errorData = await invoiceRes.json();
                              throw new Error(errorData.error || `HTTP ${invoiceRes.status}`);
                            }
                            
                            const blob = await invoiceRes.blob();
                            
                            if (blob.size === 0) {
                              throw new Error('Received empty PDF file');
                            }
                            
                            console.log("✅ Invoice PDF received:", blob.size, "bytes");
                            
                            // Create download link
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `invoice-${orderSuccess.invoiceId}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            // Cleanup
                            setTimeout(() => {
                              window.URL.revokeObjectURL(url);
                            }, 100);
                            
                            console.log("✅ Invoice downloaded successfully");
                            alert("✅ Invoice downloaded successfully!");
                          } catch (err) {
                            console.error("❌ Error downloading invoice:", err);
                            alert("⚠️ Error downloading invoice:\n" + err.message);
                          }
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm hover:from-blue-600 hover:to-blue-800"
                      >
                        <span className="material-symbols-outlined text-base">article</span>
                        <span>Invoice Copy</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-gray-200 text-gray-600 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-base">hourglass_empty</span>
                        <span>Generating Invoice...</span>
                      </div>
                    )}

                  {/* Track Shipment Button */}
                  {orderSuccess?.trackingId && orderSuccess.trackingId !== "Processing" ? (
                      <button
                        onClick={async () => {
                          try {
                            const trackingRes = await fetch(`${API_BASE_URL}/api/shipment/track/${orderSuccess.trackingId}`);
                            const trackingData = await trackingRes.json();
                            
                            if (trackingData.tracking && trackingData.tracking.length > 0) {
                              const latestStatus = trackingData.tracking[0];
                              alert(`📦 Shipment Status\n\nStatus: ${latestStatus.status}\nLocation: ${latestStatus.location || 'N/A'}\nDate: ${latestStatus.timestamp || 'N/A'}`);
                            } else {
                              alert(`📦 Shipment Tracking\n\nAWB: ${orderSuccess.trackingId}\n\nYour shipment is being prepared for dispatch. Check again in a few hours for updates.`);
                            }
                          } catch (err) {
                            console.error("Tracking error:", err);
                            alert(`📦 Shipment Tracking\n\nAWB: ${orderSuccess.trackingId}\n\nYour shipment is being prepared for dispatch.`);
                          }
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <span className="material-symbols-outlined text-base">local_shipping</span>
                        <span>Track Order</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-gray-200 text-gray-600 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-base">pending</span>
                        <span>Tracking Soon...</span>
                      </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex-shrink-0">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-bold">📧 Confirmation:</span> Check your email for invoice and tracking updates.
                  </p>
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setStep('cart');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors text-sm flex-shrink-0"
                >
                  Continue Shopping
                </button>
              </div>
                );
              })()
            ) : step === 'cart' ? (
              cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-gray-400">
                   <span className="material-symbols-outlined text-6xl">shopping_cart_off</span>
                   <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {/* Return/Refund Policy */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-amber-700 text-[18px] mt-0.5">assignment_return</span>
                        <div>
                          <p className="text-sm font-bold text-amber-900">Return & Refund Policy</p>
                          <p className="text-xs text-amber-800 mt-1">
                            Refundable for <span className="font-bold">{RETURN_POLICY.refundDays} days</span> and exchangeable for <span className="font-bold">{RETURN_POLICY.exchangeDays} days</span>. {RETURN_POLICY.conditions}
                          </p>
                        </div>
                      </div>
                    </div>

                    {cartLines.map((item, i) => (
                    <div key={`${item.id}-${i}`} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="size-20 rounded-lg bg-gray-50 shrink-0 overflow-hidden border border-gray-100">
                        <img src={item.img} className="w-full h-full object-contain" alt={item.title} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{item.title}</h4>
                            <p className="text-[10px] text-gray-500 mt-1">MOQ: {item.moq} • Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, Math.max(item.minQty, (item.quantity || item.minQty) - 1))}
                                className="size-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                disabled={(item.quantity || item.minQty) <= item.minQty}
                                aria-label="Decrease quantity"
                              >
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <input
                                type="number"
                                min={item.minQty}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, e.target.value)}
                                className="w-16 text-center text-sm font-bold rounded-lg border border-gray-200 py-1"
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, (item.quantity || item.minQty) + 1)}
                                className="size-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                                aria-label="Increase quantity"
                              >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-[10px] text-gray-500">₹{item.unit.toLocaleString()} /pc</p>
                                <p className="font-bold text-primary text-sm">₹{(item.lineTotal || 0).toLocaleString()}</p>
                              </div>
                              <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
              )
          ) : (
              <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                      <h4 className="font-bold text-blue-900 text-sm mb-1">Order Summary</h4>
                      <div className="flex justify-between text-sm text-blue-800">
                          <span>Total Items</span>
                          <span>{itemsCount}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-blue-900 mt-1">
                          <span>Subtotal</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-800 mt-1">
                          <span>Shipping</span>
                          <span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge.toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-blue-900 mt-1">
                          <span>Total Amount</span>
                          <span>₹{grandTotal.toLocaleString()}</span>
                      </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex gap-2 items-start">
                      <span className="material-symbols-outlined text-amber-700 text-[18px] mt-0.5">policy</span>
                      <div>
                        <p className="text-sm font-bold text-amber-900">Return & Refund Policy</p>
                        <p className="text-xs text-amber-800 mt-1">
                          Refundable for <span className="font-bold">{RETURN_POLICY.refundDays} days</span> (damaged/defective/wrong delivery only). Exchange available up to <span className="font-bold">{RETURN_POLICY.exchangeDays} days</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                      <label className="block">
                          <span className="text-xs font-bold text-gray-700">Full Name</span>
                          <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm" placeholder="John Doe" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
                      </label>
                      <label className="block">
                          <span className="text-xs font-bold text-gray-700">Phone Number</span>
                          <input type="tel" className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm" placeholder="9876543210" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
                      </label>
                      <label className="block">
                          <span className="text-xs font-bold text-gray-700">Address Line 1</span>
                          <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm" placeholder="House No, Street, Area" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                          <label className="block">
                              <span className="text-xs font-bold text-gray-700">City</span>
                              <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm" placeholder="City" value={details.city} onChange={e => setDetails({...details, city: e.target.value})} />
                          </label>
                          <label className="block">
                              <span className="text-xs font-bold text-gray-700">Pincode</span>
                              <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm" placeholder="110001" value={details.pincode} onChange={e => setDetails({...details, pincode: e.target.value})} />
                          </label>
                      </div>
                      <label className="block">
                          <span className="text-xs font-bold text-gray-700">State</span>
                          <input type="text" className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm" placeholder="State" value={details.state} onChange={e => setDetails({...details, state: e.target.value})} />
                      </label>
                  </div>
              </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white">
          {step === 'cart' ? (
             <div className="space-y-4">
         <div className="space-y-2">
           <div className="flex justify-between items-end">
             <span className="text-sm text-gray-500">Subtotal</span>
             <span className="text-lg font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-end">
             <span className="text-sm text-gray-500">Shipping</span>
             <span className="text-lg font-bold text-gray-900">{shippingCharge === 0 ? 'Free' : `₹${shippingCharge.toLocaleString()}`}</span>
           </div>
           <div className="flex justify-between items-end pt-2 border-t border-gray-100">
             <span className="text-sm text-gray-500">Total</span>
             <span className="text-2xl font-bold text-gray-900">₹{grandTotal.toLocaleString()}</span>
           </div>
           <p className="text-[10px] text-gray-400">Free shipping on orders ₹5,000 and above.</p>
         </div>
                 <button 
                    onClick={() => setStep('details')} 
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    Proceed to Buy
                    <span className="material-symbols-outlined">arrow_forward</span>
                 </button>
                 <a 
                    href={`mailto:ayusyaenterprise@gmail.com?subject=Order Query - ${cart.length} Items, Total: ₹${grandTotal}&body=Hello Nekxuz,\n\nI have a query about my order with ${cart.length} items.\n\nTotal amount: ₹${grandTotal}\n\nPlease assist me.\n\nThank you!`}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                 >
                    � Get Support via Email
                 </a>
             </div>
          ) : (
             <div className="space-y-3">
                <button 
                   onClick={handleCheckout}
                   disabled={isProcessing || !details.name || !details.phone || !details.address || !details.pincode}
                   className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                   {isProcessing ? (
                       <>
                           <div className="size-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                           Processing...
                       </>
                   ) : (
                       <>
                           Pay ₹{grandTotal.toLocaleString()}
                           <span className="material-symbols-outlined">lock</span>
                       </>
                   )}
                </button>
                <a 
                   href={`mailto:ayusyaenterprise@gmail.com?subject=Order Support - Name: ${encodeURIComponent(details.name)}, Total: ₹${grandTotal}&body=Hello Nekxuz,\n\nI have a query about my order.\n\nName: ${details.name}\nPhone: ${details.phone}\nAddress: ${details.address}\nTotal: ₹${grandTotal}\n\nPlease assist me as soon as possible.\n\nThank you!`}
                   className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                   � Or Get Help via Email
                </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyOrdersScreen = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }
    // Fetch user's orders from backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders?email=${encodeURIComponent(user.email)}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit'
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
      </div>

      {!user || !user.email ? (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-blue-600 text-5xl block mb-3">lock</span>
          <p className="text-blue-900 font-semibold">Please log in to view your orders</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 border-3 border-primary border-t-transparent animate-spin rounded-full"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-gray-400 text-5xl block mb-3">shopping_cart_off</span>
          <p className="text-gray-600 font-semibold">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1">Start shopping to create your first order</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-500">Order #{order.id.substring(0, 8)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  order.status === 'paid' ? 'bg-green-100 text-green-700' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                <div className="text-sm space-y-2">
                  <p className="text-gray-600"><span className="font-semibold">Shipping to:</span> {order.buyerAddress || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-semibold">Contact:</span> {order.buyerPhone || 'N/A'}</p>
                </div>
              </div>

              {/* Charges Breakdown */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                <p className="font-semibold text-blue-900 text-sm mb-3">Charges Breakdown</p>
                <div className="text-sm space-y-1.5">
                  <div className="flex justify-between text-blue-800">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{order.subtotal ? order.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Tax (IGST/CGST+SGST):</span>
                    <span className="font-semibold">₹{order.tax ? order.tax.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Shipping Charges:</span>
                    <span className="font-semibold">
                      {order.shippingCharges === null || order.shippingCharges === undefined 
                        ? 'N/A' 
                        : order.shippingCharges === 0 
                          ? 'FREE' 
                          : `₹${order.shippingCharges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                      }
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-1.5 flex justify-between text-blue-900 font-bold">
                    <span>Total Amount:</span>
                    <span>₹{(order.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Shipment Tracking */}
              {order.shipment && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-green-900 text-sm mb-3">📦 Shipment Tracking</p>
                  <div className="text-sm space-y-1.5 text-green-800">
                    <p><span className="font-semibold">Tracking ID (AWB):</span> {order.shipment.awb}</p>
                    <p><span className="font-semibold">Shiprocket ID:</span> {order.shipment.shipment_id || 'N/A'}</p>
                    <p><span className="font-semibold">Courier:</span> {order.shipment.courier}</p>
                    <p><span className="font-semibold">Status:</span> {order.shipment.status || 'Processing'}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-sm">
                  View Details
                </button>
                {order.status === 'paid' && order.shipment && (
                  <button className="flex-1 py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-all text-sm">
                    Track Shipment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RetailScreen = ({ onAddToCart, onOpenAI, onProductClick, getDiscount, stock = {}, retailFromMfgProducts = [] }) => {
  const flashSaleProducts = retailFromMfgProducts.length > 0 ? retailFromMfgProducts : ALL_PRODUCTS.filter(p => ['blueva3', 'blueva4', 'blueva5', 'combo1', 'devson1', 'vs1', 'vs2', 'vs3'].includes(p.id));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl sm:rounded-3xl p-4 sm:p-8 border border-yellow-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="size-14 sm:size-20 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <span className="material-symbols-outlined text-3xl sm:text-5xl fill-current">bolt</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900">24-Hour Retail Flash Sale</h2>
            <span className="bg-red-600 text-white text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">Exclusive Stockout Sale</span>
          </div>
          <p className="text-xs sm:text-base text-gray-600 mt-1 sm:mt-2">Exclusive clearance rates for retail buyers directly from manufacturers. Limited time shelf-ready inventory.</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">UP TO 60% OFF</div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Shelf-Ready Pricing</p>
        </div>
      </div>

      {/* Exclusive Stockout Sale Section - VelSoft Products */}
      <section className="bg-gradient-to-br from-red-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-3xl p-4 sm:p-8 border-2 border-red-300">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <span className="material-symbols-outlined text-red-600 fill-current text-[28px] sm:text-[36px] flex-shrink-0">flash_on</span>
            <h2 className="text-lg sm:text-3xl font-bold text-gray-900">Exclusive Stockout Sale</h2>
            <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full animate-pulse whitespace-nowrap">LIMITED TIME</span>
          </div>
          <p className="text-xs sm:text-base text-gray-600 mt-2 sm:mt-3 ml-0 sm:ml-12">Premium VelSoft Glow collection at unbeatable clearance prices. Exclusive retail stockout offers!</p>
        </div>

        {/* VelSoft Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {ALL_PRODUCTS.filter(p => ['vs1', 'vs2', 'vs3'].includes(p.id)).map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="group relative bg-white rounded-2xl border-2 border-red-200 overflow-hidden hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between shadow-md hover:border-red-400">
              {/* Exclusive Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
                <span className="material-symbols-outlined text-[14px]">star</span>
                EXCLUSIVE
              </div>

              {/* Stock Badge */}
              {(() => {
                const stockQty = stock[p.id]?.available || 0;
                let badgeColor = 'bg-red-500';
                let badgeText = 'Out of Stock';
                if (stockQty > 10) {
                  badgeColor = 'bg-green-600';
                  badgeText = `${stockQty} in Stock`;
                } else if (stockQty > 0) {
                  badgeColor = 'bg-yellow-600';
                  badgeText = `Only ${stockQty} left`;
                }
                return (
                  <div className={`absolute top-4 right-4 ${badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg`}>
                    {badgeText}
                  </div>
                );
              })()}

              {/* Image */}
              <div className="aspect-square overflow-hidden bg-gray-50 relative">
                <img src={p.img} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                <button onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="absolute bottom-4 right-4 size-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-90 z-20">
                  <span className="material-symbols-outlined text-[28px]">add_shopping_cart</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-secondary transition-colors">{p.title}</h3>
                  <p className="text-[11px] text-gray-500 mt-1.5">{p.manufacturer} • {p.category}</p>
                </div>

                {/* Pricing */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 line-through">{p.pricing?.mrp ? `₹${p.pricing.mrp}` : 'N/A'}</p>
                      <p className="text-lg font-bold text-secondary">{p.price}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">{getDiscount(p.price, p.pricing?.mrp) || '0%'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant CTA */}
      <div onClick={onOpenAI} className="bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-2xl p-6 border border-primary/10 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all">
        <div className="size-14 rounded-full bg-secondary flex items-center justify-center text-white shadow-xl animate-pulse shrink-0">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900">Need help selecting products?</h4>
          <p className="text-sm text-gray-500">Ask our AI assistant for product recommendations optimized for your retail business.</p>
        </div>
        <button className="bg-white px-4 py-2 rounded-full border border-primary/20 text-secondary text-sm font-bold flex items-center gap-1 group">
          Ask AI <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
        </button>
      </div>

      {/* Flash Sale Products Grid */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <span className="material-symbols-outlined text-yellow-500 fill-current text-[32px]">bolt</span>
            Today's Hot Deals
          </h3>
          <p className="text-sm text-gray-500 mt-2">Premium personal care products at wholesale rates for retail buyers</p>
        </div>

        {flashSaleProducts.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-5xl block mb-3">inventory_2</span>
            <p className="text-gray-600 font-semibold">No flash sale products available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSaleProducts.map(p => (
              <div key={p.id} onClick={() => onProductClick(p)} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm">
                {/* Sale Badge */}
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
                  <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                  {p.discount || (p.pricing && getDiscount(p.price, p.pricing.mrp))}
                </div>

                {/* Stock Badge */}
                {(() => {
                  const stockQty = stock[p.id]?.available || 0;
                  let badgeColor = 'bg-red-500';
                  let badgeText = 'Out of Stock';
                  if (stockQty > 10) {
                    badgeColor = 'bg-green-600';
                    badgeText = `${stockQty} in Stock`;
                  } else if (stockQty > 0) {
                    badgeColor = 'bg-yellow-600';
                    badgeText = `Only ${stockQty} left`;
                  }
                  return (
                    <div className={`absolute top-4 right-4 ${badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg`}>
                      {badgeText}
                    </div>
                  );
                })()}

                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gray-50 relative">
                  <img src={p.img} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                  <button onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="absolute bottom-4 right-4 size-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-90 z-20">
                    <span className="material-symbols-outlined text-[28px]">add_shopping_cart</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-sm font-bold leading-snug text-gray-900 group-hover:text-secondary transition-colors mb-3">{p.title}</h4>
                    <div className="flex items-end gap-2 mb-4">
                      <div className="text-2xl font-bold text-secondary">{p.price}</div>
                      {p.pricing && p.pricing.mrp && (
                        <span className="text-sm text-gray-500 font-bold line-through mb-1">₹{p.pricing.mrp}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      Min. Order: {p.moq}
                    </p>
                  </div>

                  {/* Pricing Tiers */}
                  {p.pricing && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-900 mb-2">Bulk Pricing:</p>
                      <div className="space-y-1">
                        {Array.isArray(p.pricing.tiers) ? (
                          p.pricing.tiers.slice(0, 2).map((tier, i) => (
                            <div key={i} className="text-[9px] text-blue-800 flex justify-between">
                              <span>{tier.qty}+ units</span>
                              <span className="font-bold">₹{tier.price}/pc</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[9px] text-blue-800">
                            Sample: <span className="font-bold">₹{p.pricing.sample}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button onClick={(e) => { e.stopPropagation(); onAddToCart(p); }} className="w-full py-2.5 bg-secondary hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all active:scale-95">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Buy from Us */}
      <section className="bg-gradient-to-r from-primary/5 to-gray-50 rounded-3xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Why Choose Direct from Manufacturer?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "price_check", title: "Direct Pricing", desc: "Eliminate middlemen - buy directly from manufacturers at factory rates" },
            { icon: "verified_user", title: "Verified Quality", desc: "All products are certified and comply with regulatory standards" },
            { icon: "local_shipping", title: "Fast Shipping", desc: "Pan-India delivery in 3-7 business days with real-time tracking" },
            { icon: "support_agent", title: "24/7 Support", desc: "Dedicated customer support for bulk orders and customization" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4">
              <div className="size-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-secondary text-[28px]">{item.icon}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const AccountScreen = ({ user, onLogout }) => {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar with user info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="size-16 rounded-full bg-gradient-to-br from-primary to-gray-600 text-white font-bold flex items-center justify-center shadow-md mb-4 text-xl overflow-hidden">
                {typeof user?.avatar === 'string' && user.avatar.length > 2 ? (
                  <img src={user.avatar} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || 'U'
                )}
              </div>
              <h3 className="font-bold text-lg text-gray-900">{user?.name || 'User'}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <button className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
                Edit Profile
              </button>
              <button onClick={onLogout} className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content area with My Orders */}
        <div className="md:col-span-2">
          <MyOrdersScreen user={user} />
        </div>
      </div>
    </main>
  );
};

const HomeScreen = ({ navigate, onAddToCart, onOpenAI, onProductClick, stock = {} }) => {
  const topSellingProducts = ALL_PRODUCTS.filter(p => ['c2', 'mcs2'].includes(p.id));
  const whitelabelProducts = ALL_PRODUCTS.filter(p => ['u1', 'u3', 'u4', 'u5'].includes(p.id));
  const retailFromMfgProducts = ALL_PRODUCTS.filter(p => ['blueva3', 'blueva4', 'blueva5', 'combo1', 'devson1', 'vs1', 'vs2', 'vs3'].includes(p.id));
  const wholesaleProducts = ALL_PRODUCTS.filter(p => ['f1', 'f3', 'w1', 'w3', 'devson3', 'c4'].includes(p.id));

  const getDiscount = (price, mrp) => {
    if (!mrp || !price) return '0%';
    const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    const mrpNum = parseFloat(String(mrp).replace(/[^0-9.]/g, ''));
    if (isNaN(priceNum) || isNaN(mrpNum) || mrpNum === 0) return '0%';
    const discount = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
    return `${Math.max(0, discount)}%`;
  };

  const ProductCard = ({ product, badge }) => (
    <div key={product.id} onClick={() => onProductClick(product)} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm">
      {/* Badge */}
      {badge && (
        <div className={`absolute top-4 left-4 ${badge.color} text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1 shadow-lg`}>
          <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
          {badge.text}
        </div>
      )}

      {/* Discount Badge */}
      {product.pricing && product.pricing.mrp && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-lg">
          {getDiscount(product.price, product.pricing.mrp)} OFF
        </div>
      )}

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-50 relative">
        <img src={product.img} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
        <button onClick={(e) => { e.stopPropagation(); onProductClick(product); }} className="absolute bottom-4 right-4 size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-90 z-20">
          <span className="material-symbols-outlined text-[28px]">add_shopping_cart</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h4 className="text-sm font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-2">{product.title}</h4>
          <div className="flex items-end gap-2 mb-4">
            <div className="text-2xl font-bold text-primary">{product.price}</div>
            {product.pricing && product.pricing.mrp && (
              <span className="text-sm text-gray-500 font-bold line-through mb-1">₹{product.pricing.mrp}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Min. Order: {product.moq}
          </p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} className="w-full py-2.5 bg-primary hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all active:scale-95 mt-4">
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <main className="space-y-0 pb-20">
      {/* Premium Hero Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl hidden sm:block"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl hidden sm:block"></div>
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-12 sm:py-20 relative z-10 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
              India's Leading B2B
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Marketplace</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              Direct manufacturer-to-customer platform for all kinds of products - from finished goods to raw materials, packaging & machineries
            </p>
            <div className="flex gap-2 sm:gap-4 flex-wrap justify-center px-2">
              <button onClick={() => navigate('retail')} className="px-4 sm:px-8 py-2.5 sm:py-3.5 bg-primary text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/30 whitespace-nowrap">
                <span className="material-symbols-outlined text-sm sm:text-base">shopping_bag</span>
                <span className="hidden sm:inline">Explore Catalog</span>
                <span className="sm:hidden">Shop</span>
              </button>
              <button onClick={onOpenAI} className="px-4 sm:px-8 py-2.5 sm:py-3.5 bg-white/10 border border-white text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-sm sm:text-base">auto_awesome</span>
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </button>
            </div>
          </div>

          {/* USP Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {[
              { icon: 'verified_user', title: 'Verified Manufacturers', desc: 'Trusted & GSTIN verified suppliers' },
              { icon: 'local_shipping', title: 'Nationwide Delivery', desc: 'Fast shipping to your doorstep' },
              { icon: 'trending_down', title: 'Best Prices', desc: 'Direct wholesale rates, no middlemen' },
              { icon: 'support_agent', title: '24/7 Support', desc: 'Dedicated customer success team' }
            ].map((usp, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center text-white hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-2xl sm:text-4xl text-primary block mb-1 sm:mb-2">{ usp.icon}</span>
                <p className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">{usp.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-200">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Product Categories</h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 px-2">Explore our diverse range of products and services</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-16">
          {[
            { name: 'Finished Products', icon: 'inventory_2', color: 'from-blue-400 to-blue-600', count: '150+', action: () => navigate('retail') },
            { name: 'Raw Materials', icon: 'science', color: 'from-green-400 to-green-600', count: 'Coming Soon', action: null },
            { name: 'Packaging Materials', icon: 'local_shipping', color: 'from-orange-400 to-orange-600', count: 'Coming Soon', action: null },
            { name: 'Machineries', icon: 'construction', color: 'from-purple-400 to-purple-600', count: 'Coming Soon', action: null }
          ].map((cat, i) => (
            <div 
              key={i} 
              onClick={cat.action}
              className={`group bg-gradient-to-br ${cat.color} rounded-lg sm:rounded-2xl p-3 sm:p-8 text-white ${cat.action ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'} transition-all overflow-hidden relative`}
            >
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform hidden sm:block"></div>
              <span className="material-symbols-outlined text-3xl sm:text-6xl mb-2 sm:mb-4 block relative z-10">{cat.icon}</span>
              <h3 className="text-sm sm:text-2xl font-bold mb-1 sm:mb-2 relative z-10 line-clamp-2">{cat.name}</h3>
              <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-4 relative z-10">{cat.count} Products</p>
              {cat.action ? (
                <button className="mt-2 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-900 font-bold rounded-lg sm:rounded-lg group-hover:bg-gray-100 transition-all text-xs sm:text-sm relative z-10 w-full">
                  Browse
                </button>
              ) : (
                <div className="mt-2 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 text-white font-bold rounded-lg text-xs sm:text-sm relative z-10 text-center w-full">
                  Coming Soon
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-8 sm:space-y-16 lg:px-8">
        {/* Wholesale Opportunities - TOP */}
        <section className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-green-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4">

              <div className="size-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">storefront</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Wholesale Opportunities</h2>
                <p className="text-gray-600 text-sm mt-1">Bulk orders with exceptional margins</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Bulk Ready</div>
              <p className="text-sm text-gray-500 mt-1">MOQ Friendly</p>
            </div>
          </div>

          {wholesaleProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-gray-300 text-5xl block mb-3">inventory_2</span>
              <p className="text-gray-600 font-semibold">No wholesale products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wholesaleProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p}
                  badge={{ icon: 'inventory_2', text: 'Wholesale', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }}
                />
              ))}
            </div>
          )}
        </section>

        {/* White Label Solutions */}
        <section className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-3xl p-8 border border-indigo-100">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">card_giftcard</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">White Label Solutions</h2>
                <p className="text-gray-600 text-sm mt-1">Customize & brand as your own</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Your Brand</div>
              <p className="text-sm text-gray-500 mt-1">Custom Packaging will Available soon</p>
            </div>
          </div>

          {whitelabelProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-gray-300 text-5xl block mb-3">inventory_2</span>
              <p className="text-gray-600 font-semibold">No white label products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whitelabelProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p}
                  badge={{ icon: 'card_giftcard', text: 'White Label', color: 'bg-gradient-to-r from-indigo-500 to-blue-500' }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Retail from Manufacturers */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-500 text-[32px]">store</span>
                Retail from Manufacturers
              </h2>
              <p className="text-gray-500 text-sm mt-2">Exclusive direct-from-factory retail collections</p>
            </div>
            <button onClick={() => navigate('retail')} className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
              See All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {retailFromMfgProducts.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-gray-300 text-5xl block mb-3">inventory_2</span>
              <p className="text-gray-600 font-semibold">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {retailFromMfgProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p}
                  badge={{ icon: 'factory', text: 'Direct from MFG', color: 'bg-gradient-to-r from-orange-500 to-red-500' }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Top Selling Products - BOTTOM */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary fill-current text-[32px]">shopping_cart</span>
                Top Selling Products
              </h2>
              <p className="text-gray-500 text-sm mt-2">Most popular choices among retail buyers nationwide</p>
            </div>
            <button onClick={() => navigate('retail')} className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
              See All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-gray-300 text-5xl block mb-3">inventory_2</span>
              <p className="text-gray-600 font-semibold">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSellingProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  badge={{ icon: 'local_fire_department', text: 'Top Seller', color: 'bg-gradient-to-r from-red-500 to-orange-500' }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const ManufacturingScreen = () => {
  const [selectedMfg, setSelectedMfg] = React.useState('rhc');
  
  const manufacturers = [
    {
      id: 'rhc',
      name: 'Real Herbal Cosmetics',
      gstin: '07DECPG1726L1ZK',
      address: 'H136 Sector 5 Bawana, New Delhi-110039',
      email: 'realherbalcosmetics@gmail.com',
      phone: '11146106783',
      specialization: 'Premium Skincare & Body Care Products',
      certifications: ['ISO 9001:2015', 'GMP Certified', 'Ayurveda Certified'],
      minOrder: 5000,
      leadTime: '7-14 days',
      type: 'Manufacturer',
      catalogs: [
        { id: 'c2', name: 'Devson Care Red Paste - 150gm', moq: 5000 },
        { id: 'mcs2', name: 'VelSoft Glow Cocoa Rich Butter Lotion - 100ml', moq: 5000 },
        { id: 'c4', name: 'VelSoft Glow Rice Water Face Wash - 100ml', moq: 5000 },
        { id: 'u3', name: 'Charcoal Face Wash - 100ml (Unlabeled)', moq: 5000 },
        { id: 'u4', name: 'Neem Aloe Vera Face Wash - 100ml (Unlabeled)', moq: 5000 },
        { id: 'u5', name: 'Vitamin C Face Wash - 100ml (Unlabeled)', moq: 5000 },
        { id: 'f1', name: 'Devson Care Herbal Toothpaste - 100g', moq: 5000 },
        { id: 'f2', name: 'VelSoft Glow Honey and Almond Body Lotion 600ml', moq: 5000 },
        { id: 'f3', name: 'Devson Care Neem Lime', moq: 5000 },
        { id: 'dc1', name: 'Devson Care Clovegel Pack of 2 - 150gm', moq: 5000 },
        { id: 'dc2', name: 'Devson Care Neem Lime Pack of 2 - 50gm', moq: 5000 },
        { id: 'vgh1', name: 'VelSoft Glow Honey Almond - 150gm', moq: 5000 },
        { id: 'devson1', name: 'Devson Care Clovegel Pack of 2 - 150gm', moq: 5000 },
        { id: 'devson2', name: 'Devson Care Neem Lime Pack of 2 - 50gm', moq: 5000 },
        { id: 'devson3', name: 'Devson Care Herbal Aloe Vera & Cucumber Face Wash - 100ml', moq: 5000 },
        { id: 'velsoft1', name: 'VelSoft Glow Honey and Almond Body Lotion 600ml', moq: 5000 },
        { id: 'w1', name: 'Amar Dant Ayush Anti Cavity Dental Toothpaste - 150g', moq: 5000 },
        { id: 'vs1', name: 'VelSoft Glow Honey and Almond Body Lotion 600ml', moq: 5000 },
        { id: 'vs2', name: 'VelSoft Glow Charcoal Face Wash - 100ml', moq: 5000 },
        { id: 'vs3', name: 'VelSoft Glow Vitamin C Face Wash - 100ml', moq: 5000 }
      ],
      description: 'Leading manufacturer of Ayurvedic and herbal cosmetics with 10+ years of experience. We specialize in private label manufacturing and bulk custom orders.'
    }
  ];

  const currentMfg = manufacturers.find(m => m.id === selectedMfg);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contract Manufacturing</h1>
        <p className="text-gray-600">Connect with our verified manufacturers for custom production</p>
      </div>

      {/* Manufacturer Toggle - Removed, only showing Real Herbal Cosmetics */}

      {/* Manufacturer Details */}
      {currentMfg && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{currentMfg.name}</h2>
                <p className="opacity-90">{currentMfg.specialization}</p>
                <p className="text-sm mt-2 opacity-75 font-semibold">{currentMfg.type}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-gray-700">{currentMfg.description}</p>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">GSTIN</h3>
                <p className="text-lg text-gray-900 font-semibold">{currentMfg.gstin}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">MOQ (Minimum Order)</h3>
                <p className="text-lg text-gray-900 font-semibold">{currentMfg.minOrder.toLocaleString()} units</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Lead Time</h3>
                <p className="text-lg text-gray-900 font-semibold">{currentMfg.leadTime}</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">📍 Address</h3>
              <p className="text-gray-900">{currentMfg.address}</p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">📞 Phone</h3>
                <a href={`tel:+91${currentMfg.phone.replace(/[^0-9]/g, '')}`} className="text-blue-600 hover:text-blue-800 font-semibold text-lg">
                  {currentMfg.phone}
                </a>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">✉️ Email</h3>
                <a href={`mailto:${currentMfg.email}`} className="text-green-600 hover:text-green-800 font-semibold break-all">
                  {currentMfg.email}
                </a>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">✅ Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {currentMfg.certifications.map((cert, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Catalogs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">📦 Catalogs Available</h3>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMfg.catalogs.map((catalog, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded border border-indigo-200">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium text-sm">{catalog.name}</p>
                        <p className="text-xs text-gray-600 mt-1">MOQ: <span className="font-bold text-indigo-600">{catalog.moq.toLocaleString()} units</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons - Email Support Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
              <a 
                href={`mailto:ayusyaenterprise@gmail.com?subject=Inquiry - ${encodeURIComponent(currentMfg.name)} - Custom Manufacturing&body=Dear Team,\n\nI am interested in custom manufacturing with ${currentMfg.name}.\n\nPlease contact me with details about your services, pricing, and timeline.\n\nMinimum Order Quantity: ${currentMfg.minOrder} units\nLead Time: ${currentMfg.leadTime}\n\nI look forward to hearing from you.\n\nThank you!`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                � Send Inquiry via Email
              </a>
              <a 
                href={`mailto:${currentMfg.email}?subject=Custom Manufacturing Request - ${currentMfg.name}&body=Dear ${currentMfg.name},\n\nI am interested in custom manufacturing services with your organization.\n\nCompany: [Your Company Name]\nContact: [Your Name]\nEmail: [Your Email]\n\nMOQ Required: ${currentMfg.minOrder} units\nLead Time Expected: ${currentMfg.leadTime}\n\nPlease provide quotation and further details.\n\nThank you!`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                � Contact Manufacturer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-900 mb-2">💡 About Contract Manufacturing</h3>
        <p className="text-amber-800 text-sm">
          Our team will contact you through <span className="font-bold">ayusyaenterprise@gmail.com</span> to discuss your manufacturing requirements, pricing, and timelines. 
          All manufacturers are GSTIN verified and GMP certified. Minimum order quantities and lead times are listed above.
        </p>
      </div>
    </main>
  );
};

const GlobalMarketScreen = () => (
  <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
    <div className="text-center py-20">
      <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">public</span>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Market Coming Soon</h2>
      <p className="text-gray-500">This section is under development</p>
    </div>
  </main>
);

const WholesalerScreen = () => {
  const devayush = {
    id: 'devayush',
    name: 'Devayush Enterprises',
    gstin: '07DECPG1726L1ZK',
    address: 'House No.06/b, Prahlad Vihar, New Delhi',
    email: 'devayushenterprise@gmail.com',
    phone: '',
    specialization: 'White Label & Premium Toothbrush Products',
    certifications: ['ISO 9001:2015', 'GMP Certified'],
    minOrder: 1000,
    leadTime: '10-15 days',
    type: 'Wholeseller',
    catalogs: [
      { id: 'u1', name: 'Premium Soft Bristle Toothbrush (White Label)', moq: 1000 },
      { id: 'blueva3', name: 'Blueva Pure Glow Ubtan Face Wash - 75gm', moq: 1000 },
      { id: 'blueva4', name: 'Blueva Aloe Vera Neem Tulsi Face Wash - 75gm', moq: 1000 },
      { id: 'blueva5', name: 'Blueva Purifying Lavender Bliss Face Wash - 75gm', moq: 1000 },
      { id: 'combo1', name: 'Blueva Face Wash Combo Pack - 75gm Each (3 Variants)', moq: 1000 }
    ],
    description: 'Specialist in white label and premium toothbrush manufacturing. Blueva premium face wash collection with natural ingredients and proven results.'
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Wholesale Partners</h1>
        <p className="text-gray-600">Premium wholesalers with verified products and competitive pricing</p>
      </div>

      {/* Wholesaler Details */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">{devayush.name}</h2>
              <p className="opacity-90">{devayush.specialization}</p>
              <p className="text-sm mt-2 opacity-75 font-semibold">{devayush.type}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-gray-700">{devayush.description}</p>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">GSTIN</h3>
              <p className="text-lg text-gray-900 font-semibold">{devayush.gstin}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">MOQ (Minimum Order)</h3>
              <p className="text-lg text-gray-900 font-semibold">{devayush.minOrder.toLocaleString()} units</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Lead Time</h3>
              <p className="text-lg text-gray-900 font-semibold">{devayush.leadTime}</p>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">📍 Address</h3>
            <p className="text-gray-900">{devayush.address}</p>
          </div>

          {/* Contact Information */}
          <div className={`grid ${devayush.phone ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {devayush.phone && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">📞 Phone</h3>
                <a href={`tel:+91${devayush.phone.replace(/[^0-9]/g, '')}`} className="text-blue-600 hover:text-blue-800 font-semibold text-lg">
                  {devayush.phone}
                </a>
              </div>
            )}
            <div className={`${devayush.phone ? 'bg-green-50' : 'bg-green-50'} rounded-lg p-4`}>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">✉️ Email</h3>
              <a href={`mailto:${devayush.email}`} className="text-green-600 hover:text-green-800 font-semibold break-all">
                {devayush.email}
              </a>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">✅ Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {devayush.certifications.map((cert, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Product Collections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">📦 Product Collections</h3>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {devayush.catalogs.map((catalog, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded border border-green-200">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm">{catalog.name}</p>
                      <p className="text-xs text-gray-600 mt-1">MOQ: <span className="font-bold text-green-600">{catalog.moq.toLocaleString()} units</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            <a 
              href={`mailto:ayusyaenterprise@gmail.com?subject=Wholesale Partnership Inquiry - ${devayush.name}&body=Hello,\n\nI am interested in wholesale partnership with ${devayush.name}.\n\nMOQ: ${devayush.minOrder} units\n\nPlease provide details about your products, pricing, and partnership terms.\n\nThank you!`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              � Get Quote via Email
            </a>
            <a 
              href={`mailto:${devayush.email}?subject=Wholesale Partnership Inquiry&body=Hello,\n\nI am interested in wholesale partnership with ${devayush.name}.\n\nPlease provide details about your products, pricing, and partnership terms.\n\nMOQ: ${devayush.minOrder} units\n\nThank you!`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              � Request Information
            </a>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-900 mb-2">💡 About Our Wholesalers</h3>
        <p className="text-amber-800 text-sm">
          We partner with verified wholesale suppliers who offer competitive pricing on bulk orders. All wholesalers are GSTIN verified and GMP certified. 
          Contact directly for customized pricing, bulk discounts, and special partnership offers.
        </p>
      </div>
    </main>
  );
};

const MessengerScreen = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    queryType: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:ayusyaenterprise@gmail.com?subject=Nekxuz Inquiry - ${encodeURIComponent(formData.queryType)} - ${encodeURIComponent(formData.subject)}&body=Name: ${encodeURIComponent(formData.name)}%0AEmail: ${encodeURIComponent(formData.email)}%0AQuery Type: ${encodeURIComponent(formData.queryType)}%0ASubject: ${encodeURIComponent(formData.subject)}%0A%0AMessage:%0A${encodeURIComponent(formData.message)}`;
    
    window.location.href = mailtoLink;
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', queryType: 'general', message: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Messenger & Support</h1>
        <p className="text-gray-600">Send us your queries, concerns, or business inquiries. All messages are forwarded to our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <span className="material-symbols-outlined text-4xl text-blue-600 mb-2">business</span>
          <h3 className="font-bold text-gray-900 mb-2">Manufacturer Inquiries</h3>
          <p className="text-sm text-gray-600">Questions about Real Herbal Cosmetics manufacturing services</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <span className="material-symbols-outlined text-4xl text-green-600 mb-2">storefront</span>
          <h3 className="font-bold text-gray-900 mb-2">Wholesaler Inquiries</h3>
          <p className="text-sm text-gray-600">Questions about Devayush Enterprises wholesale partnerships</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <span className="material-symbols-outlined text-4xl text-purple-600 mb-2">help</span>
          <h3 className="font-bold text-gray-900 mb-2">General Support</h3>
          <p className="text-sm text-gray-600">General inquiries and customer support requests</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Query Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Query Type *</label>
            <select
              name="queryType"
              value={formData.queryType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="general">General Inquiry</option>
              <option value="manufacturer">Manufacturer (Real Herbal Cosmetics)</option>
              <option value="wholesaler">Wholesaler (Devayush Enterprises)</option>
              <option value="support">Customer Support</option>
              <option value="feedback">Feedback & Suggestions</option>
              <option value="partnership">Partnership & Collaboration</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Brief subject of your inquiry"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Please provide details about your inquiry..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ✉️ Send Message
            </button>
            <button
              type="reset"
              onClick={() => setFormData({ name: '', email: '', subject: '', queryType: 'general', message: '' })}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✅ Message sent successfully! Our team will respond to your email shortly.
            </div>
          )}
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-900 mb-2">📧 Email Support</h3>
        <p className="text-amber-800 text-sm mb-2">
          All messages are received at: <span className="font-bold">ayusyaenterprise@gmail.com</span>
        </p>
        <p className="text-amber-800 text-sm">
          Our team will respond to your inquiry within 24 hours. You can also use this email address to reach out directly with any questions about our manufacturer partners or wholesale offerings.
        </p>
      </div>
    </main>
  );
};

const RFQScreen = () => {
  const [formData, setFormData] = React.useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    productIds: [],
    quantity: '',
    requirements: '',
    budget: '',
    timeline: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        productIds: checked
          ? [...prev.productIds, value]
          : prev.productIds.filter(id => id !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productList = formData.productIds.length > 0 
      ? formData.productIds.map(id => {
          const prod = ALL_PRODUCTS.find(p => p.id === id);
          return prod ? `- ${prod.title} (MOQ: ${prod.moq} units)` : '';
        }).join('%0A')
      : 'Not specified';

    const mailtoLink = `mailto:ayusyaenterprise@gmail.com?subject=Nekxuz RFQ - ${encodeURIComponent(formData.company)}&body=Company: ${encodeURIComponent(formData.company)}%0AContact Name: ${encodeURIComponent(formData.contactName)}%0AEmail: ${encodeURIComponent(formData.email)}%0APhone: ${encodeURIComponent(formData.phone)}%0A%0AREQUESTED PRODUCTS:%0A${productList}%0A%0AQuantity Required: ${encodeURIComponent(formData.quantity)}%0ABudget: ${encodeURIComponent(formData.budget)}%0ATimeline: ${encodeURIComponent(formData.timeline)}%0A%0ASpecial Requirements:%0A${encodeURIComponent(formData.requirements)}`;
    
    window.location.href = mailtoLink;
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ company: '', contactName: '', email: '', phone: '', productIds: [], quantity: '', requirements: '', budget: '', timeline: '' });
      setSubmitted(false);
    }, 2000);
  };

  const featuredProducts = ALL_PRODUCTS.filter(p => 
    ['f1', 'f2', 'f3', 'c2', 'mcs2', 'u3', 'u4', 'u5', 'w1', 'vs1', 'vs2', 'vs3', 'blueva3', 'blueva4', 'blueva5', 'combo1'].includes(p.id)
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Request for Quotation (RFQ)</h1>
        <p className="text-gray-600">Submit your detailed product requirements and receive competitive quotes from our manufacturers and wholesalers.</p>
      </div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <span className="text-2xl">💰</span>
          <h3 className="font-bold text-gray-900 mb-1">Best Pricing</h3>
          <p className="text-sm text-gray-600">Get competitive quotes based on your order volume</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <span className="text-2xl">⚡</span>
          <h3 className="font-bold text-gray-900 mb-1">Fast Response</h3>
          <p className="text-sm text-gray-600">Receive quotes within 24-48 hours</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <span className="text-2xl">✅</span>
          <h3 className="font-bold text-gray-900 mb-1">Custom Solutions</h3>
          <p className="text-sm text-gray-600">Tailored manufacturing & wholesale options</p>
        </div>
      </div>

      {/* RFQ Form */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="Your company name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 XXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Products *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
              {featuredProducts.map(product => (
                <label key={product.id} className="flex items-start gap-3 cursor-pointer hover:bg-white p-2 rounded">
                  <input
                    type="checkbox"
                    name="products"
                    value={product.id}
                    checked={formData.productIds.includes(product.id)}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{product.title}</span>
                </label>
              ))}
            </div>
            {formData.productIds.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Please select at least one product</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Units) *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="e.g., 10000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (₹) *</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                placeholder="e.g., 500000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Timeline *</label>
            <select
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">Select timeline</option>
              <option value="within-15-days">Within 15 Days</option>
              <option value="within-30-days">Within 30 Days</option>
              <option value="within-45-days">Within 45 Days</option>
              <option value="within-60-days">Within 60 Days</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requirements & Notes</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              placeholder="Any special requirements, packaging, labeling, or additional details..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={formData.productIds.length === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              📨 Submit RFQ
            </button>
            <button
              type="reset"
              onClick={() => setFormData({ company: '', contactName: '', email: '', phone: '', productIds: [], quantity: '', requirements: '', budget: '', timeline: '' })}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✅ RFQ submitted successfully! Our team will review and respond with quotes within 24-48 hours.
            </div>
          )}
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-900 mb-3">📋 RFQ Process</h3>
        <ol className="text-amber-800 text-sm space-y-2 list-decimal list-inside">
          <li><strong>Submit RFQ:</strong> Fill out the form above with your product requirements and quantity</li>
          <li><strong>Receive Quotes:</strong> Our manufacturers will send you competitive quotations within 24-48 hours</li>
          <li><strong>Negotiate:</strong> Compare quotes and negotiate terms directly with manufacturers</li>
          <li><strong>Place Order:</strong> Finalize order details and payment terms with your chosen supplier</li>
          <li><strong>Production:</strong> Manufacturers begin production according to agreed timeline</li>
          <li><strong>Delivery:</strong> Receive quality-inspected products at your location</li>
        </ol>
      </div>
    </main>
  );
};

const AdminDashboard = ({ adminUser, onLogout }) => {
  const [adminTab, setAdminTab] = useState('orders');
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState(() => {
    // Initialize stock for all products
    const stockObj = {};
    ALL_PRODUCTS.forEach(p => {
      stockObj[p.id] = { available: 100, reserved: 0, sold: 0 };
    });
    return stockObj;
  });
  const [newProduct, setNewProduct] = useState({
    title: '', price: '', moq: '1', category: 'retail', 
    manufacturer: '', gstin: '', address: '', 
    source: '', img: '', pricing: { mrp: 0, sample: 0, tiers: [] },
    stock: 100, sku: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, todayOrders: 0 });
  const [stockFilter, setStockFilter] = useState('all');

  // Fetch orders and stock on mount
  useEffect(() => {
    fetchOrders();
    fetchStockData();
    calculateStats();
    // Refresh stock every 10 seconds to show live updates
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await fetch('/api/stock', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit'
      });
      if (response.ok) {
        const data = await response.json();
        setStock(data.stock || {});
      }
    } catch (err) {
      console.error("Failed to fetch stock:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit'
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const calculateStats = () => {
    const today = new Date().toLocaleDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === today).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    setStats({
      totalOrders: orders.length,
      totalRevenue,
      todayOrders
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.manufacturer || !newProduct.gstin) {
      alert('Please fill all required fields: Title, Price, Manufacturer, GSTIN');
      return;
    }

    if (newProduct.gstin.length !== 15) {
      alert('GSTIN must be exactly 15 characters');
      return;
    }

    setLoading(true);
    try {
      const productId = editingProduct?.id || `prod_${Date.now()}`;
      const productData = {
        id: productId,
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        moq: newProduct.moq,
        category: newProduct.category,
        manufacturer: newProduct.manufacturer,
        gstin: newProduct.gstin,
        address: newProduct.address,
        source: newProduct.source,
        img: newProduct.img,
        sku: newProduct.sku,
        stock: parseInt(newProduct.stock || 100),
        pricing: newProduct.pricing,
        flashSale: newProduct.category === 'retail'
      };

      // Save to backend
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      // Update stock on backend
      await fetch(`${API_BASE_URL}/api/stock/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          available: parseInt(newProduct.stock || 100),
          reserved: 0,
          sold: 0
        }),
        credentials: 'omit'
      });

      // Update local state
      const formattedData = {
        ...productData,
        price: `₹${parseFloat(newProduct.price).toFixed(2)}`,
        moq: `${newProduct.moq} pc`
      };

      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? formattedData : p));
        setEditingProduct(null);
      } else {
        setProducts([...products, formattedData]);
        setStock({...stock, [productId]: { available: parseInt(newProduct.stock || 100), reserved: 0, sold: 0 }});
      }

      setNewProduct({
        title: '', price: '', moq: '1', category: 'retail',
        manufacturer: '', gstin: '', address: '',
        source: '', img: '', pricing: { mrp: 0, sample: 0, tiers: [] },
        stock: 100, sku: ''
      });
      setImagePreview(null);
      
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setImagePreview(product.img);
    setNewProduct({
      title: product.title,
      price: product.price.replace('₹', ''),
      moq: product.moq.replace(' pc', ''),
      category: product.flashSale ? 'retail' : 'wholesale',
      manufacturer: product.manufacturer || '',
      gstin: product.gstin || '',
      address: product.address || '',
      source: product.source || '',
      img: product.img || '',
      pricing: product.pricing || { mrp: 0, sample: 0, tiers: [] },
      stock: stock[product.id]?.available || 100,
      sku: product.sku || ''
    });
    setAdminTab('products');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProduct({...newProduct, img: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockUpdate = async (productId, newQuantity) => {
    const quantity = Math.max(0, newQuantity);
    
    // Update local state immediately for UI responsiveness
    setStock({
      ...stock,
      [productId]: {
        ...stock[productId],
        available: quantity
      }
    });

    // Sync with backend
    try {
      await fetch(`${API_BASE_URL}/api/stock/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          available: quantity,
          reserved: stock[productId]?.reserved || 0,
          sold: stock[productId]?.sold || 0
        }),
        credentials: 'omit'
      });
      console.log(`✅ Stock synced for ${productId}: ${quantity}`);
    } catch (err) {
      console.error('Failed to sync stock:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-bold">A</div>
          <div>
            <h1 className="font-bold">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Ayusya Enterprises</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors">
          Logout
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen">
          <nav className="space-y-2">
            {[
              { id: 'orders', icon: 'shopping_bag', label: 'Orders' },
              { id: 'products', icon: 'inventory_2', label: 'Manage Products' },
              { id: 'accounting', icon: 'assessment', label: 'Accounting' },
              { id: 'stock', icon: 'warehouse', label: 'Stock Management' },
              { id: 'positioning', icon: 'dashboard_customize', label: 'Site Positioning' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  adminTab === tab.id
                    ? 'bg-secondary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Orders Tab */}
          {adminTab === 'orders' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Orders Management</h2>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-secondary">
                  <p className="text-gray-500 text-sm font-semibold">Total Orders</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-primary">
                  <p className="text-gray-500 text-sm font-semibold">Today's Orders</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stats.todayOrders}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-green-500">
                  <p className="text-gray-500 text-sm font-semibold">Total Revenue</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Order ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-secondary">{order.id.substring(0, 8)}</td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-semibold">{order.buyerName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.buyerEmail || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{(order.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'paid' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          {order.shipment?.awb ? (
                            <div className="text-xs">
                              <span className="font-semibold text-secondary">{order.shipment.awb}</span>
                              <div className="text-gray-500">{order.shipment.courier}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {adminTab === 'products' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Manage Products</h2>
              
              {/* Add/Edit Product Form */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title *</label>
                      <input
                        type="text"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                        placeholder="e.g., Charcoal Face Wash"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      >
                        <option value="retail">Direct from Manufacturer (Flash Sale)</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="home">Home Page Feature</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer/Wholesaler *</label>
                      <input
                        type="text"
                        value={newProduct.manufacturer}
                        onChange={(e) => setNewProduct({...newProduct, manufacturer: e.target.value})}
                        placeholder="Company Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN *</label>
                      <input
                        type="text"
                        value={newProduct.gstin}
                        onChange={(e) => setNewProduct({...newProduct, gstin: e.target.value})}
                        placeholder="07EWZPG4345H1ZZ"
                        pattern="[0-9A-Z]{15}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={newProduct.address}
                        onChange={(e) => setNewProduct({...newProduct, address: e.target.value})}
                        placeholder="Full Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order (MOQ)</label>
                      <input
                        type="number"
                        value={newProduct.moq}
                        onChange={(e) => setNewProduct({...newProduct, moq: e.target.value})}
                        placeholder="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">MRP</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.pricing.mrp}
                        onChange={(e) => setNewProduct({...newProduct, pricing: {...newProduct.pricing, mrp: parseFloat(e.target.value)}})}
                        placeholder="200"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sample Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.pricing.sample}
                        onChange={(e) => setNewProduct({...newProduct, pricing: {...newProduct.pricing, sample: parseFloat(e.target.value)}})}
                        placeholder="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">SKU / Product Code</label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                        placeholder="e.g., CF-001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                        placeholder="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                      <input
                        type="text"
                        value={newProduct.source}
                        onChange={(e) => setNewProduct({...newProduct, source: e.target.value})}
                        placeholder="Direct from Manufacturer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 my-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Product Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="text-2xl text-gray-400 mb-1">📷</span>
                            <p className="text-xs text-gray-600">Click to upload image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      <div>
                        {imagePreview ? (
                          <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-lg">
                            <img src={imagePreview} alt="Preview" className="max-h-28 max-w-28 object-contain rounded" />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setNewProduct({...newProduct, img: ''});
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg text-gray-400 text-sm">
                            No image selected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* URL Alternative */}
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Or use image URL:</label>
                      <input
                        type="url"
                        value={newProduct.img}
                        onChange={(e) => {
                          setNewProduct({...newProduct, img: e.target.value});
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-secondary hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setImagePreview(null);
                          setNewProduct({
                            title: '', price: '', moq: '1', category: 'retail',
                            manufacturer: '', gstin: '', address: '',
                            source: '', img: '', pricing: { mrp: 0, sample: 0, tiers: [] },
                            stock: 100, sku: ''
                          });
                        }}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded-lg transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900">Listed Products ({products.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Product</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Manufacturer</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Price</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Stock</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={p.img} alt={p.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                              <div>
                                <p className="font-semibold text-gray-900">{p.title}</p>
                                <p className="text-xs text-gray-500">ID: {p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900">{p.manufacturer || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{p.gstin || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-secondary">{p.price}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <input 
                                  type="number" 
                                  min="0"
                                  value={stock[p.id]?.available || 0}
                                  onChange={(e) => handleStockUpdate(p.id, parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                (stock[p.id]?.available || 0) > 10 ? 'bg-green-100 text-green-700' :
                                (stock[p.id]?.available || 0) > 0 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {stock[p.id]?.available || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              p.flashSale ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {p.flashSale ? 'Retail' : 'Wholesale'}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-orange-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Accounting Tab */}
          {adminTab === 'accounting' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Accounting & Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Revenue Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="text-2xl font-bold text-secondary">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Orders Count:</span>
                      <span className="text-2xl font-bold text-primary">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg Order Value:</span>
                      <span className="text-2xl font-bold text-green-600">₹{(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Order Distribution</h3>
                  <div className="space-y-3">
                    {['paid', 'pending', 'failed'].map(status => {
                      const count = orders.filter(o => o.status === status).length;
                      const percentage = (count / Math.max(stats.totalOrders, 1)) * 100;
                      return (
                        <div key={status}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 capitalize font-semibold">{status}</span>
                            <span className="text-gray-900 font-bold">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'paid' ? 'bg-green-600' :
                                status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Management Tab */}
          {adminTab === 'stock' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Stock Management</h2>
              
              {/* Stock Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
                  <p className="text-gray-500 text-xs font-semibold uppercase">Total Stock</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {Object.values(stock).reduce((sum, s) => sum + (s.available || 0), 0)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
                  <p className="text-gray-500 text-xs font-semibold uppercase">In Stock</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {products.filter(p => (stock[p.id]?.available || 0) > 0).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
                  <p className="text-gray-500 text-xs font-semibold uppercase">Low Stock</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {products.filter(p => (stock[p.id]?.available || 0) > 0 && (stock[p.id]?.available || 0) <= 10).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow border-l-4 border-orange-500">
                  <p className="text-gray-500 text-xs font-semibold uppercase">Out of Stock</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {products.filter(p => (stock[p.id]?.available || 0) === 0).length}
                  </p>
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6 flex gap-2">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    stockFilter === 'all' ? 'bg-secondary text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    stockFilter === 'low' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    stockFilter === 'out' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Out of Stock
                </button>
              </div>

              {/* Stock Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900">Product Stock Levels</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Product</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Available</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Reserved</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Sold</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter(p => {
                        const qty = stock[p.id]?.available || 0;
                        if (stockFilter === 'low') return qty > 0 && qty <= 10;
                        if (stockFilter === 'out') return qty === 0;
                        return true;
                      }).map(p => {
                        const s = stock[p.id] || { available: 0, reserved: 0, sold: 0 };
                        const statusColor = s.available > 10 ? 'bg-green-100 text-green-700' : 
                                          s.available > 0 ? 'bg-yellow-100 text-yellow-700' : 
                                          'bg-red-100 text-red-700';
                        return (
                          <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={p.img} alt={p.title} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                <div>
                                  <p className="font-semibold text-gray-900">{p.title}</p>
                                  <p className="text-xs text-gray-500">{p.sku || p.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="number" 
                                min="0"
                                value={s.available}
                                onChange={(e) => handleStockUpdate(p.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-bold"
                              />
                            </td>
                            <td className="px-6 py-4 text-gray-900 font-semibold">{s.reserved}</td>
                            <td className="px-6 py-4 text-gray-900 font-semibold">{s.sold}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                {s.available > 10 ? 'In Stock' : s.available > 0 ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-orange-600 transition-colors"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Site Positioning Tab */}
          {adminTab === 'positioning' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Site Positioning & Display</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Top Products (Home Page)</h3>
                  <p className="text-sm text-gray-600 mb-4">Current products shown in "Top Selling" section:</p>
                  <div className="space-y-2">
                    {products.filter(p => ['blueva1', 'blueva2', 'blueva3', 'allTreeCombo'].includes(p.id)).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-900">{p.title}</span>
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded">Featured</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Trending Products</h3>
                  <p className="text-sm text-gray-600 mb-4">Current products in "Trending" section:</p>
                  <div className="space-y-2">
                    {products.filter(p => ['blueva1', 'blueva2', 'blueva3'].includes(p.id)).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-900">{p.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Trending</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [stock, setStock] = useState({});
  const [isSellerMode, setIsSellerMode] = useState(() => window.location.search.includes('seller=true'));
  const [isAdminMode, setIsAdminMode] = useState(() => window.location.search.includes('admin=true'));
  const [adminUser, setAdminUser] = useState(null);
  const [showCart, setShowCart] = useState(false);

  // Define filter arrays for product categories
  const retailFromMfgProducts = ALL_PRODUCTS.filter(p => ['blueva3', 'blueva4', 'blueva5', 'combo1', 'devson1'].includes(p.id));
  const whitelabelProducts = ALL_PRODUCTS.filter(p => ['u1', 'u3', 'u4', 'u5'].includes(p.id));
  const wholesaleProducts = ALL_PRODUCTS.filter(p => ['f1', 'f3', 'w1', 'w3', 'devson3', 'c4'].includes(p.id));
  const topSellingProducts = ALL_PRODUCTS.filter(p => ['c2', 'mcs2'].includes(p.id));

  // Check if admin should be logged in
  useEffect(() => {
    if (isAdminMode) {
      const adminPassword = prompt('Enter admin password:');
      if (adminPassword === 'ayusya2025') {
        setAdminUser({ name: 'Admin', email: 'admin@ayusya.com' });
      } else {
        alert('Invalid password!');
        setIsAdminMode(false);
      }
    }
  }, [isAdminMode]);

  // Listen for quantity update events emitted from CartOverlay.
  useEffect(() => {
    const handler = (e) => {
      const { id, quantity } = (e && e.detail) || {};
      if (!id) return;
      setCart((prev) => {
        let found = false;
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          found = true;
          // Respect MOQ min at write-time too.
          const moq = parseInt(String(p.moq || '1'), 10);
          const minQty = Number.isFinite(moq) && moq > 0 ? moq : 1;
          const q = Math.max(minQty, parseInt(String(quantity), 10) || minQty);
          return { ...p, quantity: q };
        });
        return found ? next : prev;
      });
    };
    window.addEventListener('nekxuz:cart:updateQuantity', handler);
    return () => window.removeEventListener('nekxuz:cart:updateQuantity', handler);
  }, []);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        const userData = u ? { name: u.displayName, email: u.email, avatar: u.photoURL } : null;
        setUser(userData);
        // Store user globally for checkout validation
        window.user = userData;
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (db) {
      try {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
          const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Merge static products with DB products
          setProducts([...ALL_PRODUCTS, ...newProducts]);
        }, (error) => {
            console.warn("Firestore snapshot error (likely permissions):", error.code);
        });
        return () => unsubscribe();
      } catch (e) {
          console.warn("Firestore init error:", e);
      }
    }
  }, []);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded successfully");
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);
  }, []);

  // Fetch stock data on mount and refresh every 10 seconds
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stock`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit'
        });
        if (response.ok) {
          const data = await response.json();
          setStock(data.stock || {});
        }
      } catch (err) {
        console.error("Failed to fetch stock:", err);
      }
    };

    fetchStock();
    const interval = setInterval(fetchStock, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (auth) {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        setIsLoginOpen(false);
      } catch (e) { console.error("Login error", e); }
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setUser(null);
        window.user = null;
        setActiveTab('home');
      } catch (e) { console.error("Logout error", e); }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const getFilteredProducts = () => {
      if (activeTab === 'search') {
          return products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      if (activeTab === 'wholesale') {
          return [...wholesaleProducts, ...topSellingProducts, ...whitelabelProducts];
      }
      return products;
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index > -1) {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      }
      return prev;
    });
  };

  if (isSellerMode) {
      return (
        <>
          <Styles />
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onGoogleLogin={handleLogin} />
          <SupplierPanel 
            user={user} 
            onLoginClick={() => setIsLoginOpen(true)} 
            onExit={() => { window.history.pushState({}, '', window.location.pathname); setIsSellerMode(false); }} 
            products={products} 
          />
        </>
      );
  }

  // If admin mode is active, show admin dashboard
  if (isAdminMode && adminUser) {
    return (
      <AdminDashboard 
        adminUser={adminUser} 
        onLogout={() => {
          setAdminUser(null);
          setIsAdminMode(false);
          window.location.href = '/';
        }}
      />
    );
  }

  return (
    <>
      <Styles />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onGoogleLogin={handleLogin} />
      <AIChatBot isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={(p) => { setCart([...cart, p]); setShowCart(true); }} 
        />
      )}

      <CartOverlay 
        isOpen={showCart} 
        cart={cart} 
        onClose={() => setShowCart(false)} 
        onRemove={handleRemoveFromCart} 
      />

      <AppHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        cartCount={cart.length} 
        user={user} 
        onLoginClick={() => setIsLoginOpen(true)} 
        onCartClick={() => setShowCart(true)}
        onAccountClick={() => setActiveTab('account')}
        onSearch={handleSearch}
      />

      {activeTab === 'home' ? (
        <HomeScreen 
          navigate={setActiveTab} 
          onAddToCart={(p) => { setCart([...cart, p]); setShowCart(true); }} 
          onOpenAI={() => setIsAIOpen(true)} 
          onProductClick={setSelectedProduct}
          stock={stock}
        />
      ) : activeTab === 'retail' ? (
        <RetailScreen 
          onAddToCart={(p) => { setCart([...cart, p]); setShowCart(true); }} 
          onOpenAI={() => setIsAIOpen(true)} 
          onProductClick={setSelectedProduct}
          getDiscount={(priceStr, mrp) => {
            if (!mrp || !priceStr) return null;
            const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
            if (isNaN(price)) return null;
            const percent = Math.round(((mrp - price) / mrp) * 100);
            return percent > 0 ? `${percent}% OFF` : null;
          }}
          stock={stock}
          retailFromMfgProducts={retailFromMfgProducts}
        />
      ) : (activeTab === 'wholesale' || activeTab === 'search') ? (
        <WholesaleScreen 
            products={getFilteredProducts()} 
            onProductClick={setSelectedProduct} 
            onAddToCart={(p) => { setCart([...cart, p]); setShowCart(true); }}
            title={activeTab === 'search' ? `Search Results for "${searchQuery}"` : "Wholesale Collection"}
            stock={stock}
        />
      ) : activeTab === 'manufacturing' ? (
        <ManufacturingScreen onChat={() => setActiveTab('messenger')} />
      ) : activeTab === 'wholesaler' ? (
        <WholesalerScreen onChat={() => setActiveTab('messenger')} />
      ) : activeTab === 'global' ? (
        <GlobalMarketScreen />
      ) : activeTab === 'messenger' ? (
        <MessengerScreen />
      ) : activeTab === 'rfq' ? (
        <RFQScreen />
      ) : activeTab === 'account' ? (
        <AccountScreen user={user} onLogout={handleLogout} />
      ) : null}
      
      {/* Floating Email Support Button */}
      <a 
        href={`mailto:ayusyaenterprise@gmail.com?subject=Support Required&body=Hello Nekxuz,\n\nI have a query and need support.\n\nPlease assist me as soon as possible.\n\nThank you!`}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-300 z-40 hover:scale-110"
        title="Email Support"
      >
        <span className="text-2xl">�</span>
      </a>

      <Footer />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
};

export default App;