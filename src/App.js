import React, { useState, useEffect, useMemo, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Configuration ---
const apiKey = ""; // Gemini API Key

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
let app, auth, db, analytics;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  analytics = getAnalytics(app);
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
    // Skin Care Items
    { 
      id: 104, category: 'Skin Care', title: "VelSoft Glow Cocoa Rich Butter Lotion - 100ml", price: "₹45", moq: "12 pcs", img: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=400", 
      pricing: { mrp: 80, sample: 50, tiers: [{qty:12, price:45}, {qty:24, price:35}, {qty:50, price:25}, {qty:100, price:20}] },
      manufacturer: "Real Herbal Cosmetics",
      address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
      description: `Nature’s Sweetest Secret for Soft, Glowing Skin

Wrap your skin in the luxurious embrace of VelSoft Glow Honey Almond. This rich formula combines the golden goodness of pure Honey with the deep-nourishing properties of Almond Oil. Designed for daily hydration, it restores your skin’s natural moisture barrier while leaving behind a subtle, sweet fragrance. The large 600ml bottle ensures you have long-lasting care for the whole family.

Why Your Skin Will Love It:
The Power of Honey: A natural humectant, honey draws moisture into the skin and locks it there, giving you a plump, dewy look and an instant "Glow."

Almond Oil Nourishment: Rich in Vitamin E, almond oil softens rough texture and helps improve skin complexion, making it feel silky smooth.

Deeply Soothing: Perfect for soothing tired or irritated skin, this blend provides comfort and essential hydration without feeling sticky.
Lightweight & Absorbent: Despite its rich ingredients, the lotion absorbs quickly, allowing your skin to breathe while staying moisturized all day.
Family Value Size: The generous 600ml volume offers excellent value, ensuring you never run out of your daily skincare staple.

Key Features:
Volume: 600ml (Mega Value Pack / Family Size)
Skin Type: Suitable for Normal to Dry Skin
Key Ingredients: Honey Extract & Sweet Almond Oil
Scent: Warm, Sweet, and Nutty

How to Use:
Dispense a generous amount from the bottle.
Apply evenly all over the body, paying attention to dry areas like knees and elbows.
Massage gently until fully absorbed to reveal soft, glowing skin.
Get the golden glow of honey and the softness of almonds in one bottle.`
    },
    { 
      id: 106, category: 'Skin Care', title: "Devson Neem & Lime Whitening Cream - 50gm", price: "₹40", moq: "12 pcs", img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=400",
      source: "Direct from Wholeseller",
      manufacturer: "Devayush Enterprise",
      address: "Near Rohini Sector 24, New Delhi-110042",
      pricing: { mrp: 90, sample: 60, tiers: [{qty:12, price:40}, {qty:24, price:35}, {qty:50, price:30}, {qty:100, price:25}] },
      description: `Purify, Brighten, and Restore Your Natural Radiance

Experience the perfect balance of clarity and glow with Devson Neem & Lime Whitening Cream. This expert formula harnesses the ancient purifying power of Neem and the zesty, brightening energy of Lime. Designed to tackle dullness and uneven skin tone, it works actively to clear impurities while revealing a lighter, fresher complexion.

Why Your Skin Will Love It:
Dual-Action Formula:
Neem: Known for its antibacterial properties, it deeply detoxifies the skin, fighting acne-causing bacteria and preventing breakouts.

Lime: Rich in Vitamin C, it acts as a natural bleaching agent to lighten dark spots, remove tan, and control excess oil.

Visible Brightening: Helps fade pigmentation and blemishes, promoting a clearer and more even skin tone.
Oil Control: The citrus extracts regulate sebum production, giving you a matte, shine-free finish perfect for daily wear.
Clear & Healthy Glow: Unlike harsh creams that dry you out, this formula maintains skin health while delivering a radiant "whitening" effect.

Key Features:
Volume: 50gm (Perfect for daily facial care)
Skin Type: Ideal for Oily, Acne-Prone, and Dull Skin
Key Ingredients: Neem Extract & Lime (Citrus) Extract
Benefit: Spot Reduction & Skin Brightening

How to Use:
Cleanse your face thoroughly with a face wash.
Take a small amount of Devson cream on your fingertips.
Dot it over your face and neck.
Massage gently in upward circular motions until fully absorbed. Use twice daily for best results.`
    },
    {
      id: 401, category: 'Skin Care', title: "VelSoft Glow Honey Almond Moisturising Body Lotion - 200ml", price: "₹80", moq: "1 pc", img: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=400",
      discount: "BUY 1 GET 1 FREE", pricing: { mrp: 160, sample: 80, tiers: [{ qty: 1, price: 80, label: "B1G1 Deal" }] },
      manufacturer: "Real Herbal Cosmetics",
      address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
      flashSale: true,
      description: `VelSoft Glow Honey Almond Moisturising Body Lotion (200ml)
Nature’s Sweetest Secret for Soft, Glowing Skin
Wrap your skin in the luxurious embrace of VelSoft Glow Honey Almond. This rich formula combines the golden goodness of pure Honey with the deep-nourishing properties of Almond Oil. Designed for daily hydration, it restores your skin’s natural moisture barrier while leaving behind a subtle, sweet fragrance.

Why Your Skin Will Love It:
The Power of Honey: A natural humectant, honey draws moisture into the skin and locks it there, giving you a plump, dewy look and an instant "Glow."

Almond Oil Nourishment: Rich in Vitamin E, almond oil softens rough texture and helps improve skin complexion, making it feel silky smooth.

Deeply Soothing: Perfect for soothing tired or irritated skin, this blend provides comfort and essential hydration without feeling sticky.
Lightweight & Absorbent: Despite its rich ingredients, the lotion absorbs quickly, allowing your skin to breathe while staying moisturized all day.

Volume: 200ml (Mega Value Pack )
Skin Type: Suitable for Normal to Dry Skin
Key Ingredients: Honey Extract & Sweet Almond Oil
Scent: Warm, Sweet, and Nutty

How to Use:
Dispense a generous amount from the bottle.
Apply evenly all over the body, paying attention to dry areas like knees and elbows.
Massage gently until fully absorbed to reveal soft, glowing skin.
Get the golden glow of honey and the softness of almonds in one bottle.`
    },
    {
      id: 402, category: 'Skin Care', title: "VelSoft Glow Honey Almond with Mix Fruit Moisturising Body Lotion - 200ml", price: "₹80", moq: "1 pc", img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400",
      discount: "BUY 1 GET 1 FREE", pricing: { mrp: 160, sample: 80, tiers: [{ qty: 1, price: 80, label: "B1G1 Deal" }] },
      manufacturer: "Real Herbal Cosmetics",
      address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
      flashSale: true,
      description: `The Ultimate Nutrient Blend for Healthy, Glowing Skin

Why choose one benefit when you can have them all? VelSoft Glow brings you a unique fusion of nature's best skincare secrets in a single bottle. This multitasking formula combines the soothing richness of Honey and Almond with the revitalizing energy of Mixed Fruit extracts. It is designed to nourish, brighten, and hydrate deeply, giving your skin a vibrant and youthful glow.

Why Your Skin Will Love It:
Triple Action Formula:
Honey: Draws moisture in to keep skin hydrated and plump.

Almond Oil: Softens texture and nourishes deeply with Vitamin E.

Mix Fruit Extracts: Packed with vitamins and antioxidants that refresh dull skin and boost radiance.
Fruit-Powered Glow: The natural fruit acids gently exfoliate and brighten, while the honey creates that signature VelSoft luminous finish.
Non-Greasy & Fresh: A perfectly balanced texture that feels rich going on but absorbs instantly, leaving no sticky residue—just soft, fresh-smelling skin.

Vitality Boost: Recharges tired skin with essential vitamins, making it look healthier and more awake instantly.

Key Features:
Volume: 200ml (Perfect for daily personal use or travel)
Skin Type: All Skin Types (especially Dull or Dehydrated skin)
Key Ingredients: Honey, Sweet Almond Oil, Mixed Fruit Complex
Scent: A delightful blend of sweet nutty notes and fresh fruity zest.

How to Use:
Pour a coin-sized amount into your palm.
Massage gently into the skin after a shower, ensuring even coverage.
Enjoy the fresh, fruity scent as your skin drinks up the moisture.
Nourish with Almonds, Refresh with Fruit, Glow with VelSoft.`
    },
    {
      id: 403, category: 'Skin Care', title: "VelSoft Glow Mix Fruit Moisturising Body Lotion - 600ml", price: "₹149", moq: "1 pc", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
      pricing: { mrp: 450, sample: 149, tiers: [{ qty: 1, price: 149 }] },
      manufacturer: "Real Herbal Cosmetics",
      address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
      flashSale: true,
      description: `The Ultimate Nutrient Blend for Healthy, Glowing Skin

Why choose one benefit when you can have them all? VelSoft Glow brings you a unique fusion of nature's best skincare secrets in a single bottle. This multitasking formula combines the soothing richness of Honey and Almond with the revitalizing energy of Mixed Fruit extracts. It is designed to nourish, brighten, and hydrate deeply, giving your skin a vibrant and youthful glow.

Why Your Skin Will Love It:
Triple Action Formula:
Honey: Draws moisture in to keep skin hydrated and plump.

Almond Oil: Softens texture and nourishes deeply with Vitamin E.

Mix Fruit Extracts: Packed with vitamins and antioxidants that refresh dull skin and boost radiance.
Fruit-Powered Glow: The natural fruit acids gently exfoliate and brighten, while the honey creates that signature VelSoft luminous finish.
Non-Greasy & Fresh: A perfectly balanced texture that feels rich going on but absorbs instantly, leaving no sticky residue—just soft, fresh-smelling skin.

Vitality Boost: Recharges tired skin with essential vitamins, making it look healthier and more awake instantly.

Key Features:
Volume: 600ml (Perfect for daily personal use or travel)
Skin Type: All Skin Types (especially Dull or Dehydrated skin)
Key Ingredients: Honey, Sweet Almond Oil, Mixed Fruit Complex
Scent: A delightful blend of sweet nutty notes and fresh fruity zest.

How to Use:
Pour a coin-sized amount into your palm.
Massage gently into the skin after a shower, ensuring even coverage.
Enjoy the fresh, fruity scent as your skin drinks up the moisture.
Nourish with Almonds, Refresh with Fruit, Glow with VelSoft.`
    },
    {
      id: 404, category: 'Skin Care', title: "VelSoft Glow Honey Almond Moisturising Body Lotion - 600ml", price: "₹149", moq: "1 pc", img: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=400",
      pricing: { mrp: 450, sample: 149, tiers: [{ qty: 1, price: 149 }] },
      manufacturer: "Real Herbal Cosmetics",
      address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
      flashSale: true,
      description: `Nature’s Sweetest Secret for Soft, Glowing Skin

Wrap your skin in the luxurious embrace of VelSoft Glow Honey Almond. This rich formula combines the golden goodness of pure Honey with the deep-nourishing properties of Almond Oil. Designed for daily hydration, it restores your skin’s natural moisture barrier while leaving behind a subtle, sweet fragrance. The large 600ml bottle ensures you have long-lasting care for the whole family.

Why Your Skin Will Love It:
The Power of Honey: A natural humectant, honey draws moisture into the skin and locks it there, giving you a plump, dewy look and an instant "Glow."

Almond Oil Nourishment: Rich in Vitamin E, almond oil softens rough texture and helps improve skin complexion, making it feel silky smooth.

Deeply Soothing: Perfect for soothing tired or irritated skin, this blend provides comfort and essential hydration without feeling sticky.
Lightweight & Absorbent: Despite its rich ingredients, the lotion absorbs quickly, allowing your skin to breathe while staying moisturized all day.
Family Value Size: The generous 600ml volume offers excellent value, ensuring you never run out of your daily skincare staple.

Key Features:
Volume: 600ml (Mega Value Pack / Family Size)
Skin Type: Suitable for Normal to Dry Skin
Key Ingredients: Honey Extract & Sweet Almond Oil
Scent: Warm, Sweet, and Nutty

How to Use:
Dispense a generous amount from the bottle.
Apply evenly all over the body, paying attention to dry areas like knees and elbows.
Massage gently until fully absorbed to reveal soft, glowing skin.
Get the golden glow of honey and the softness of almonds in one bottle.`
    },

    // Oral Care Items
    { 
      id: 105, category: 'Oral Care', title: "Devson Clovegel Herbal Toothpaste - 150gm", price: "₹45", moq: "12 pcs", img: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=400",
      source: "Direct from Wholeseller",
      manufacturer: "Devayush Enterprise",
      address: "Near Rohini Sector 24, New Delhi-110042",
      pricing: { mrp: 95, sample: 70, tiers: [{qty:12, price:45}, {qty:24, price:40}, {qty:50, price:35}, {qty:100, price:30}] },
      description: `The Natural Power of Clove for Complete Oral Care

Protect your smile with the trusted strength of nature. Devson Clovegel Herbal Toothpaste is a unique formulation that brings you the legendary benefits of Clove (Laung) in a refreshing gel format. Known for centuries as nature’s dentist, the clove oil in this toothpaste fights bacteria, relieves sensitivity, and ensures your teeth and gums stay strong and healthy.

Why Your Smile Will Love It:
Instant Relief: Rich in Eugenol (the active component of clove), it helps soothe toothaches and reduces gum sensitivity effectively.

Powerful Germ Protection: The antibacterial properties of clove actively fight germs and bacteria in the hard-to-reach areas of your mouth, preventing cavities and plaque buildup.

Healthy Gums: Regular use helps tighten gums and prevents bleeding or inflammation, promoting overall periodontal health.

Herbal Freshness: Unlike synthetic flavors, Clovegel leaves your mouth feeling naturally fresh and clean, combating bad breath at the source.
Gel Formula: A smooth, non-abrasive gel that cleans teeth gently without wearing down the enamel.

Key Features:
Weight: 150gm (Long-lasting Family Pack)
Type: Herbal Gel Toothpaste
Key Ingredient: Natural Clove Oil
Primary Benefit: Cavity Protection & Toothache Relief

How to Use:
Squeeze a pea-sized amount of Clovegel onto your toothbrush.
Brush thoroughly for at least two minutes, covering all surfaces of the teeth and gums.
Rinse with water.
For best results, use twice daily—morning and night.
Stronger teeth, healthier gums, and the confidence of a natural smile with Devson.`
    },
    {
      id: 205, category: 'Oral Care', title: "Devson Care Red Paste - 110g", price: "₹55", moq: "12 pcs", img: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=400",
      source: "Direct from Wholeseller",
      manufacturer: "Devayush Enterprise",
      address: "Near Rohini Sector 24, New Delhi-110042",
      pricing: { mrp: 110, sample: 65, tiers: [{qty:12, price:55}, {qty:24, price:50}, {qty:100, price:40}] },
      description: `Traditional Herbal Strength for Rock-Solid Teeth

Rediscover the power of nature with Devson Care Red Paste. Formulated with a potent blend of time-tested Ayurvedic ingredients, this classic red toothpaste is designed for those who prioritize strong teeth and healthy gums. It combines the efficacy of traditional herbs with modern oral care standards to deliver a deep clean that you can feel.

Why Your Smile Will Love It:
Total Gum Care: Specifically formulated to tighten gums and reduce issues like bleeding and inflammation, ensuring the foundation of your teeth remains healthy.

Fight Germs & Bacteria: Packed with natural antibacterial herbs, it actively fights the germs that cause cavities, plaque, and tooth decay.

Long-Lasting Freshness: The unique spicy-herbal flavor leaves your mouth feeling zingy and fresh for hours, effectively eliminating bad breath.
Stronger Roots: Regular use helps fortify tooth enamel and strengthens the roots, making your teeth resilient against sensitivity and wear.
Natural Cleaning: Gently polishes teeth to remove surface stains and yellowing without damaging the enamel.

Key Features:
Weight: 110g (Convenient Everyday Pack)
Type: Traditional Red Herbal Paste
Key Action: Gum Tightening & Cavity Protection
Flavor Profile: Refreshing Spicy Herbal

How to Use:
Apply a liberal amount of Devson Care Red Paste to your toothbrush.
Brush thoroughly, massaging the gums and cleaning the teeth for 2-3 minutes.
Rinse with water.
Use twice a day for a healthy, problem-free smile.
The strength of tradition for a confident, healthy smile.`
    },
    {
      id: '402b', category: 'Oral Care', title: "Devson Care Smily 24 Toothpaste with Free Brush", price: "₹55", moq: "12 pcs", img: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=400",
      source: "Direct from Wholeseller",
      manufacturer: "Devayush Enterprise",
      address: "Near Rohini Sector 24, New Delhi-110042",
      pricing: { mrp: 95, sample: 65, tiers: [{ qty: 12, price: 55 }, { qty: 24, price: 45 }, { qty: 50, price: 35 }, { qty: 100, price: 30 }] },
      flashSale: true,
      outOfStock: true
    },
    
    // Hair Care (Added from Flash Sale)
    {
      id: '403b', category: 'Hair Care', title: "Luxe Argan Oil Hair Serum (50ml Boxed)", price: "₹4.20", moq: "1 pc", img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400",
      manufacturer: "Real Herbal Cosmetics",
      address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
      pricing: { mrp: 6, sample: 4.2, tiers: [{ qty: 1, price: 4.2 }] },
      flashSale: true
    }
];

// --- Shared Components ---

const Styles = () => (
    <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
    
    :root {
      --primary: #f26c0d;
      --bg-light: #f8f7f5;
      --bg-dark: #221710;
      --surface-dark: #2d211a;
      --surface-light: #ffffff;
    }
    
    .text-primary { color: var(--primary); }
    .bg-primary { background-color: var(--primary); }
    .border-primary { border-color: var(--primary); }
    .ring-primary { --tw-ring-color: var(--primary); }
    .shadow-primary\/20 { --tw-shadow-color: rgba(242, 108, 13, 0.2); }
    .shadow-primary\/30 { --tw-shadow-color: rgba(242, 108, 13, 0.3); }
    .shadow-primary\/40 { --tw-shadow-color: rgba(242, 108, 13, 0.4); }
    .fill-primary { fill: var(--primary); }
    
    .bg-primary\/5 { background-color: rgba(242, 108, 13, 0.05); }
    .bg-primary\/10 { background-color: rgba(242, 108, 13, 0.1); }
    .bg-primary\/20 { background-color: rgba(242, 108, 13, 0.2); }
    .border-primary\/10 { border-color: rgba(242, 108, 13, 0.1); }
    .border-primary\/20 { border-color: rgba(242, 108, 13, 0.2); }
    .border-primary\/30 { border-color: rgba(242, 108, 13, 0.3); }
    .border-primary\/50 { border-color: rgba(242, 108, 13, 0.5); }
    
    .hover\:bg-primary:hover { background-color: var(--primary); }
    .hover\:text-primary:hover { color: var(--primary); }
    .hover\:border-primary:hover { border-color: var(--primary); }
    .group-hover\:text-primary:hover { color: var(--primary); }
    .focus\:ring-primary:focus { --tw-ring-color: var(--primary); }
    .focus\:border-primary:focus { border-color: var(--primary); }

    .bg-background-light { background-color: var(--bg-light); }
    .font-display { font-family: 'Inter', sans-serif; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-in { animation-fill-mode: forwards; }
    .fade-in { animation: fadeIn 0.3s ease-out; }
    
    ::selection { background-color: rgba(242, 108, 13, 0.3); color: var(--primary); }
    `}} />
);

const NexisLogo = () => (
  <div className="flex items-center gap-2 select-none shrink-0 cursor-pointer">
    <div className="flex items-center justify-center size-8 md:size-10 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
      <span className="material-symbols-outlined text-[20px] md:text-[24px] font-bold">spa</span>
    </div>
    <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Nexis</span>
  </div>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 pt-16 pb-24 md:pb-8 mt-auto">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-2 pr-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-[20px] font-bold">spa</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Nexis B2B</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
            The leading global B2B marketplace for personal care manufacturing and wholesale sourcing. Connect, negotiate, and grow your retail business.
          </p>
          <div className="flex gap-4">
            {['facebook', 'twitter', 'linkedin', 'instagram'].map(social => (
              <a key={social} href="#" className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-[18px]">public</span> 
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Sourcing</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary transition-colors">Top Products</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Verified Factories</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Post RFQ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Flash Sales</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">Company</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Press & News</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Return Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400">© 2025 Nexis B2B Inc. All rights reserved.</p>
        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-1 text-gray-300">
              <span className="material-symbols-outlined">lock</span>
              <span className="text-[10px] font-bold">SSL SECURE PAYMENT</span>
           </div>
           <div className="flex gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">VISA</div>
              <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">MC</div>
              <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-gray-500">AMEX</div>
           </div>
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
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white border border-white">
          {cartCount}
        </span>
      )}
    </button>
    {user ? (
        <button onClick={onAccountClick} className="size-9 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white font-bold flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95 text-xs overflow-hidden">
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
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <span className="material-symbols-outlined text-[32px]">spa</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Nexis</h2>
                    <p className="text-sm text-gray-500 mb-8">Sign in to access wholesale pricing, track orders, and chat with manufacturers.</p>
                    
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
    { id: 'wholesale', label: 'Wholesale' },
    { id: 'manufacturing', label: 'Contract Mfg' },
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
          className={`text-sm font-semibold transition-all relative py-2 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'wholesale', icon: 'storefront', label: 'Wholesale' },
    { id: 'manufacturing', icon: 'precision_manufacturing', label: 'Mfg' },
    { id: 'global', icon: 'public', label: 'Global' },
    { id: 'messenger', icon: 'chat_bubble', label: 'Chat' },
    { id: 'rfq', icon: 'request_quote', label: 'RFQ' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 flex justify-between items-end px-1 pb-4 pt-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 p-1 flex-1 min-w-0 transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`}
        >
          {activeTab === tab.id && (
            <div className="absolute top-0 h-0.5 w-6 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(242,108,13,0.3)]"></div>
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
    { role: 'model', text: 'Hello! I am Nexis AI. How can I help you with your B2B sourcing today?' }
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
        systemInstruction: "You are Nexis AI, a helpful assistant for a B2B platform called Nexis. You help users find manufacturers, understand wholesale trends, and optimize their RFQs (Request for Quotes). Be professional, concise, and informative."
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
          <span className="font-bold text-lg text-primary">Nexis AI</span>
          <span className="text-[10px] text-green-500 flex items-center gap-1 font-bold">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE
          </span>
        </div>
        <div className="w-10"></div>
      </header>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <div className="flex gap-1">
                <div className="size-1.5 rounded-full bg-primary animate-bounce"></div>
                <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
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
            placeholder="Ask Nexis AI anything..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-gray-900 focus:outline-none"
          />
          <button onClick={handleSend} className="size-10 bg-primary rounded-lg flex items-center justify-center text-white active:scale-95 transition-transform">
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
          <span className="material-symbols-outlined text-primary text-[28px]">location_on</span>
          Find Local Manufacturers
        </h3>
        <p className="text-sm text-gray-500 mb-6">Discover verified factories in your region using Nexis AI and Google Maps data.</p>
        
        {results.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {results.slice(0, 3).map((r, i) => (
              <a key={i} href={r.uri} target="_blank" rel="noopener noreferrer" className="block bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-primary transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors">{r.name}</span>
                  <span className="material-symbols-outlined text-primary text-sm">open_in_new</span>
                </div>
                {r.snippet && <p className="text-[11px] text-gray-500 italic line-clamp-2">"{r.snippet}"</p>}
              </a>
            ))}
            <button onClick={() => setResults([])} className="text-xs text-primary font-bold hover:underline mt-2">Clear results</button>
          </div>
        ) : (
          <button 
            onClick={findNearby}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-orange-600"
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
                            <span className="material-symbols-outlined text-[48px] fill-current group-hover:text-primary transition-colors">play_arrow</span>
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
                                        <span className="material-symbols-outlined text-primary text-[32px]">spa</span>
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
                                <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
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
                                <span className="material-symbols-outlined text-primary">factory</span> Manufacturing Capabilities
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                {factory.description}
                            </p>

                            <h4 className="font-bold text-gray-900 mb-4">Manufacturing Categories</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {factory.catalog.map((cat, i) => (
                                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
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
                                        <span className="material-symbols-outlined text-primary">inventory_2</span>
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
                                                        <span className="text-[10px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{p.price}</span>
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
        
        <div className="w-full md:w-1/2 bg-gray-50 relative min-h-[300px] md:min-h-full">
          <img src={product.img} className="absolute inset-0 w-full h-full object-contain p-8" />
          <div className="absolute top-6 left-6 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            {product.source || "Direct from Manufacturer"}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
          
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-primary">₹{unitPrice}</span>
            <div className="flex flex-col mb-1">
                <span className="text-sm text-gray-400 font-medium line-through">MRP ₹{mrp}</span>
                <span className="text-xs text-green-600 font-bold">{discount}% OFF</span>
            </div>
            <span className="text-sm text-gray-400 font-medium mb-2 ml-auto">/ piece (for {quantity} pcs)</span>
          </div>

          {samplePrice && (
            <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between group cursor-pointer hover:bg-orange-100 transition-colors"
                 onClick={() => {
                    onAddToCart({ ...product, price: `₹${samplePrice}`, moq: `1 pc`, title: `${product.title} (Sample)` });
                    onClose();
                 }}>
              <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white border border-orange-200 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">science</span>
                  </div>
                  <div>
                      <span className="block text-sm font-bold text-gray-900">Buy Single Sample</span>
                      <span className="text-xs text-gray-500">Test quality before bulk order</span>
                  </div>
              </div>
              <div className="text-right">
                  <span className="block text-sm font-bold text-primary">₹{samplePrice}</span>
                  <button className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-primary">Add to Cart</button>
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
                    <span className={`text-sm font-bold ${quantity === tier.qty ? 'text-primary' : 'text-gray-400'}`}>₹{tier.price}/pc</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-sm font-bold text-gray-700">Quantity:</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(tiers[0].qty, q - 1))} disabled={product.outOfStock} className="size-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary text-gray-600 disabled:opacity-50">-</button>
              <input 
                type="number" 
                value={quantity}
                disabled={product.outOfStock}
                onChange={e => setQuantity(Math.max(tiers[0].qty, parseInt(e.target.value) || tiers[0].qty))}
                className="w-16 text-center bg-transparent border-none font-bold text-lg focus:ring-0 p-0 outline-none disabled:text-gray-400"
              />
              <button onClick={() => setQuantity(q => q + 1)} disabled={product.outOfStock} className="size-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary text-gray-600 disabled:opacity-50">+</button>
            </div>
            <div className="flex-1 text-right">
              <span className="block text-xs text-gray-400">Total Price</span>
              <span className="font-bold text-lg text-gray-900">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button 
            disabled={product.outOfStock}
            onClick={() => {
              if (product.outOfStock) return;
              onAddToCart({ ...product, price: `₹${unitPrice}`, moq: `${quantity} pcs`, title: `${product.title} (${quantity} pcs)` });
              onClose();
            }}
            className={`w-full py-4 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${product.outOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' : 'bg-primary text-white shadow-primary/20 hover:bg-orange-600 active:scale-95'}`}
          >
            {product.outOfStock ? (
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

const HomeScreen = ({ navigate, onAddToCart, cartCount, onOpenAI, onProductClick, user, onLoginClick, onCartClick }) => {
  
  const getDiscount = (priceStr, mrp) => {
     if (!mrp || !priceStr) return null;
     const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
     if (isNaN(price)) return null;
     const percent = Math.round(((mrp - price) / mrp) * 100);
     return percent > 0 ? `${percent}% OFF` : null;
  };

  return (
  <div className="flex-1 w-full animate-in fade-in duration-300">
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <NexisLogo />
          <TopNav activeTab="home" onTabChange={navigate} />
        </div>
        
        <div className="flex items-center gap-4 flex-1 md:max-w-md lg:max-w-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </span>
            <input 
              className="block w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-20 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm focus:outline-none transition-all" 
              placeholder="Search for products, brands, or categories..." 
              type="text" 
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1 gap-1">
              <button className="p-1.5 text-white bg-primary rounded-full hover:bg-orange-600 shadow-sm transition-colors m-1"><span className="material-symbols-outlined text-[18px]">search</span></button>
            </div>
          </div>
          <HeaderActions cartCount={cartCount} onCartClick={onCartClick} onAccountClick={() => navigate('account')} user={user} onLoginClick={onLoginClick} />
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-10">
      {/* AI Pulse Banner */}
      <div onClick={onOpenAI} className="bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-2xl p-6 border border-primary/10 flex items-center gap-6 cursor-pointer hover:shadow-md transition-all">
        <div className="size-14 rounded-full bg-primary flex items-center justify-center text-white shadow-xl animate-pulse shrink-0">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900">Nexis Intelligent Assistant</h4>
          <p className="text-sm text-gray-500 max-w-2xl">Ask about current pricing trends, factory comparisons, or request AI to optimize your RFQ draft for better responses.</p>
        </div>
        <button className="bg-white px-4 py-2 rounded-full border border-primary/20 text-primary text-sm font-bold flex items-center gap-1 group">
          Try Now <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
        </button>
      </div>

      <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-3xl overflow-hidden shadow-xl">
        <img src="https://images.unsplash.com/photo-1556228720-1987594a8a4e?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight mb-4 max-w-xl">Global Sourcing for Premium Skin Care</h2>
          <p className="text-gray-200 text-base md:text-lg mb-8 max-w-md">Connect directly with verified private label manufacturers and secure the best wholesale rates.</p>
          <div className="flex gap-4">
            <button className="bg-primary hover:bg-orange-600 text-white text-sm font-bold px-8 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">Explore Brands</button>
            <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm font-bold px-8 py-3 rounded-full transition-all border border-white/30">View Portfolio</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
        {[{ icon: "face", label: "Skin Care", desc: "Serums & creams" }, { icon: "science", label: "Custom Formula", desc: "Proprietary R&D" }, { icon: "recycling", label: "Eco Package", desc: "Sustainable" }, { icon: "verified", label: "Verified", desc: "Audited partners" }].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center p-6 rounded-3xl bg-white border border-gray-100 cursor-pointer group hover:border-primary transition-all shadow-sm">
            <div className={`size-16 rounded-2xl flex items-center justify-center bg-orange-50 text-primary mb-4 transition-transform group-hover:scale-110`}>
              <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 mb-1">{item.label}</span>
            <span className="hidden md:block text-[11px] text-gray-400 text-center">{item.desc}</span>
          </div>
        ))}
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <span className="material-symbols-outlined text-red-500 fill-current">local_fire_department</span> Top Selling
          </h3>
          <button className="text-sm text-primary font-bold hover:underline" onClick={() => navigate('wholesale')}>View All Collection</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {ALL_PRODUCTS.filter(p => [104, 106, 105].includes(p.id)).map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="bg-white p-3 rounded-2xl border border-gray-100 relative group shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between">
              <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <button onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="absolute bottom-2 right-2 size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90">
                   <span className="material-symbols-outlined text-[24px]">add_shopping_cart</span>
                </button>
                {p.pricing && p.pricing.mrp && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {getDiscount(p.price, p.pricing.mrp)}
                    </div>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">{p.title}</h4>
              <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">{p.price}<span className="text-[10px] text-gray-400 font-normal">/pc</span></span>
                    {p.pricing && p.pricing.mrp && <span className="text-[10px] text-gray-400 line-through">MRP ₹{p.pricing.mrp}</span>}
                </div>
                <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 whitespace-nowrap">Min: {p.moq}</div>
              </div>
              {p.pricing && !p.flashSale && (
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                   <div className="flex flex-col">
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sample</span>
                       <span className="text-xs font-bold text-gray-900">₹{p.pricing.sample}</span>
                   </div>
                   <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onAddToCart({ ...p, price: `₹${p.pricing.sample}`, moq: `1 pc`, title: `${p.title} (Sample)` }); 
                        }}
                        className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg border border-primary/10 transition-all flex items-center gap-1"
                   >
                       <span className="material-symbols-outlined text-[14px]">science</span> Add
                   </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 -mx-4 px-4 py-12 lg:-mx-8 lg:px-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold flex items-center gap-2 mb-8 text-gray-900">
            <span className="material-symbols-outlined text-blue-500 fill-current text-[32px]">trending_up</span> Trending Wholesale Products
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes('devson') && !p.outOfStock).map((p, i) => (
              <div key={i} onClick={() => onProductClick(p)} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group relative shadow-sm hover:shadow-xl transition-all cursor-pointer">
                <div className="relative aspect-square bg-gray-50">
                  <img src={p.img} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                  {p.discount && <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">{p.discount}</div>}
                  {!p.discount && p.pricing && p.pricing.mrp && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                        {getDiscount(p.price, p.pricing.mrp)}
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="absolute bottom-4 right-4 size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-90 z-20">
                     <span className="material-symbols-outlined text-[28px]">add_shopping_cart</span>
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors mb-2">{p.title}</h4>
                    <div className="flex items-end gap-2">
                        <div className="text-xl font-bold text-primary">{p.price} <span className="text-xs font-normal text-gray-400">/ unit</span></div>
                        {p.pricing && p.pricing.mrp && <span className="text-xs text-gray-400 line-through mb-1">₹{p.pricing.mrp}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      Min. Order: {p.moq}
                    </p>
                  </div>
                  
                  {p.pricing && !p.flashSale && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                       <div className="flex flex-col">
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sample</span>
                           <span className="text-xs font-bold text-gray-900">₹{p.pricing.sample}</span>
                       </div>
                       <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onAddToCart({ ...p, price: `₹${p.pricing.sample}`, moq: `1 pc`, title: `${p.title} (Sample)` }); 
                            }}
                            className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg border border-primary/10 transition-all flex items-center gap-1"
                       >
                           <span className="material-symbols-outlined text-[14px]">science</span> Add
                       </button>
                    </div>
                  )}

                  {p.source && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[14px]">store</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 truncate">{p.source}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW FLASH SALE SECTION */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <span className="material-symbols-outlined text-yellow-500 fill-current text-[32px]">bolt</span> 24-Hour Retail Flash Sale
          </h3>
          <div className="text-sm text-gray-500 font-medium">Shelf-ready products at clearance rates</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_PRODUCTS.filter(p => [403, 404, 401, 402].includes(p.id)).map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between">
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                {p.discount || getDiscount(p.price, p.pricing.mrp)}
              </div>
              <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                <img src={p.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1">{p.title}</h4>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-lg font-bold text-gray-900">{p.price}</span>
                  <span className="text-xs text-gray-400 line-through mb-1">₹{p.pricing.mrp}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(p); }} className="w-full mt-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-primary transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined fill-current text-[32px]">percent</span> Exclusive Flash Deals
          </h3>
          <div className="bg-red-50 text-red-500 text-xs font-bold px-4 py-1 rounded-full border border-red-100 flex items-center gap-2">
            <span className="size-2 bg-red-500 rounded-full animate-ping"></span>
            Ends in 12:44:05
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { 
                id: 205, 
                title: "Devson Care Red Paste - 110g", 
                price: "₹55", 
                oldPrice: "₹110", 
                sold: "45%", 
                img: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=400",
                description: `Traditional Herbal Strength for Rock-Solid Teeth...`, // Keeping description
                manufacturer: "Devayush Enterprise",
                address: "Near Rohini Sector 24, New Delhi-110042",
                source: "Direct from Wholeseller",
                pricing: { 
                    mrp: 110, 
                    sample: 65, 
                    tiers: [
                        { qty: 12, price: 55, label: "Flash Deal" },
                        { qty: 24, price: 50, label: "Standard Pack" },
                        { qty: 100, price: 40, label: "Bulk Tier" }
                    ] 
                }
            }
          ].map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className="bg-white rounded-2xl p-4 border border-gray-100 relative group shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between">
              <div className="aspect-square rounded-xl overflow-hidden mb-4 relative bg-gray-50">
                <img src={p.img} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                    {getDiscount(p.price, p.pricing.mrp)}
                </div>
                <button onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="absolute bottom-3 left-3 size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90">
                   <span className="material-symbols-outlined text-[24px]">add_shopping_cart</span>
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-600">{p.price}</span>
                  <span className="text-sm text-gray-400 line-through font-normal">{p.oldPrice}</span>
                </div>

                {p.pricing && p.pricing.sample && (
                    <div className="flex justify-between items-center py-2 border-y border-gray-50 my-1">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sample</span>
                           <span className="text-xs font-bold text-gray-900">₹{p.pricing.sample}</span>
                       </div>
                       <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onAddToCart({ ...p, price: `₹${p.pricing.sample}`, moq: `1 pc`, title: `${p.title} (Sample)` }); 
                            }}
                            className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg border border-primary/10 transition-all flex items-center gap-1"
                       >
                           <span className="material-symbols-outlined text-[14px]">science</span> Add
                       </button>
                    </div>
                )}

                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    <span>Stock Intensity</span>
                    <span>{p.sold} Claimed</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: p.sold }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
  );
};

const WholesaleScreen = ({ navigate, onAddToCart, cartCount, onProductClick, user, onLoginClick, onCartClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  
  const categories = ["All", "Skin Care", "Oral Care", "Hair Care", "Baby Care", "Fragrances"];
  const activeCategories = ["Skin Care", "Oral Care"];
  const sources = ["All", "Manufacturer", "Wholesaler"];

  const matchesFilters = (p) => {
     const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (p.manufacturer && p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
     
     const categoryMatch = selectedCategory === "All" 
        ? activeCategories.includes(p.category) 
        : p.category === selectedCategory;

     let sourceMatch = true;
     if (selectedSource === "Manufacturer") {
         sourceMatch = !p.source || p.source !== "Direct from Wholeseller";
     } else if (selectedSource === "Wholesaler") {
         sourceMatch = p.source === "Direct from Wholeseller";
     }

     return searchMatch && categoryMatch && sourceMatch;
  };

  return (
    <div className="flex-1 w-full animate-in fade-in duration-300 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <NexisLogo />
            <TopNav activeTab="wholesale" onTabChange={navigate} />
          </div>
          <div className="flex items-center gap-4 flex-1 md:max-w-md lg:max-w-2xl">
             <div className="relative flex-1">
               <div className="flex">
                   <div className="hidden md:flex items-center px-3 bg-gray-100 rounded-l-lg border-r border-gray-200 text-xs font-bold text-gray-500 whitespace-nowrap">
                       {selectedCategory}
                   </div>
                   <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full md:rounded-l-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" 
                    placeholder="Search wholesale products, brands..." 
                    type="text" 
                  />
               </div>
               <button className="absolute inset-y-0 right-0 px-3 bg-primary rounded-r-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">search</span>
               </button>
            </div>
            <HeaderActions cartCount={cartCount} onCartClick={onCartClick} onAccountClick={() => navigate('account')} user={user} onLoginClick={onLoginClick} />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6 lg:px-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6 hidden md:block">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Categories</h3>
                <ul className="space-y-1">
                    {categories.map(cat => (
                        <li key={cat}>
                            <button 
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${selectedCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Supplier Type</h3>
                <div className="space-y-2">
                    {sources.map(src => (
                        <label key={src} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`size-4 rounded border flex items-center justify-center transition-colors ${selectedSource === src ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                {selectedSource === src && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                            </div>
                            <input type="radio" name="source" className="hidden" checked={selectedSource === src} onChange={() => setSelectedSource(src)} />
                            <span className={`text-sm ${selectedSource === src ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{src}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
        
        {/* Mobile Filter Horizontal Scroll */}
        <div className="md:hidden w-full overflow-x-auto pb-2 no-scrollbar flex gap-2">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border whitespace-nowrap ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
            <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="font-bold text-gray-800 text-lg">
                    {selectedCategory === "All" ? "Featured Products" : `${selectedCategory}`}
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                    Showing results for <span className="text-gray-900 font-bold">"{selectedSource === "All" ? "All Suppliers" : selectedSource}"</span>
                </span>
            </div>

            {selectedCategory !== "All" && !activeCategories.includes(selectedCategory) ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
                    <div className="size-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-[48px] text-gray-300">hourglass_top</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Coming Soon</h2>
                    <p className="text-gray-500 mb-6">We are onboarding manufacturers for {selectedCategory}.</p>
                    <button onClick={() => setSelectedCategory("All")} className="text-primary font-bold hover:underline">Browse All Products</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {ALL_PRODUCTS.filter(matchesFilters).map(p => {
                        const isRetail = p.flashSale || p.moq === "1 pc";
                        const isWholesaler = p.source === "Direct from Wholeseller";

                        return (
                        <div key={p.id} onClick={() => onProductClick(p)} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col h-full relative">
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 items-start">
                                {p.outOfStock ? (
                                    <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Out of Stock</span>
                                ) : (
                                    <>
                                        {p.discount && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">{p.discount}</span>}
                                        {isRetail && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">shopping_bag</span> Retail Ready</span>}
                                        {isWholesaler ? (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">store</span> Wholesaler</span>
                                        ) : (
                                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">factory</span> Factory Direct</span>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="relative aspect-[1.1] bg-white p-4 border-b border-gray-50">
                                <img src={p.img} className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ${p.outOfStock ? 'grayscale opacity-50' : 'group-hover:scale-105'}`} />
                                <button onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="absolute bottom-2 right-2 size-8 bg-white rounded-full flex items-center justify-center text-primary shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-gray-50">
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                            </div>
                            
                            <div className="p-3 flex-1 flex flex-col">
                                <h3 className={`font-bold text-sm mb-1 leading-snug line-clamp-2 ${p.outOfStock ? 'text-gray-400' : 'text-gray-900'}`}>{p.title}</h3>
                                
                                {p.manufacturer && (
                                    <div className="text-[10px] text-gray-500 mb-2 truncate flex items-center gap-1">
                                        <span className="text-gray-400">Sold by:</span> <span className="font-semibold text-gray-700 hover:text-primary hover:underline">{p.manufacturer}</span>
                                    </div>
                                )}

                                <div className="mt-auto space-y-2">
                                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                        {p.pricing && p.pricing.sample && !p.outOfStock && (
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 border-dashed">
                                                <div>
                                                    <span className="block text-[9px] text-gray-400 font-bold uppercase">Sample Price</span>
                                                    <span className="text-sm font-bold text-gray-900">₹{p.pricing.sample}</span>
                                                </div>
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        onAddToCart({ ...p, price: `₹${p.pricing.sample}`, moq: `1 pc`, title: `${p.title} (Sample)` }); 
                                                    }}
                                                    className="text-[10px] font-bold bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white px-2 py-1 rounded transition-colors"
                                                >
                                                    Buy Sample
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="block text-[9px] text-gray-400 font-bold uppercase">Wholesale Price</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-lg font-bold ${p.outOfStock ? 'text-gray-400' : 'text-primary'}`}>{p.price}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">/pc</span>
                                                </div>
                                                <span className="text-[9px] text-gray-400 block mt-0.5">MOQ: {p.moq}</span>
                                            </div>
                                            <button 
                                                disabled={p.outOfStock}
                                                onClick={(e) => { e.stopPropagation(); if(!p.outOfStock) onAddToCart(p); }}
                                                className={`size-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${p.outOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-primary hover:shadow-md'}`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">{p.outOfStock ? 'block' : 'add'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {ALL_PRODUCTS.filter(matchesFilters).length === 0 && (
                <div className="py-20 text-center bg-white rounded-2xl border border-gray-200">
                    <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">search_off</span>
                    <p className="text-gray-500 font-medium">No products found matching your filters.</p>
                    <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedSource("All"); }} className="mt-4 text-primary font-bold hover:underline">Clear All Filters</button>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ManufacturingScreen = ({ navigate, cartCount, onStartChat, user, onLoginClick, onCartClick }) => {
    const [selectedFactory, setSelectedFactory] = useState(null);

    const realHerbalData = {
        name: "Real Herbal Cosmetics",
        address: "H136 Sector 5, Bawana Industrial Area, New Delhi-110039",
        rating: "4.9",
        verified: true,
        moq: "10,000 pcs",
        description: "Real Herbal Cosmetics is a premier manufacturer specializing in high-quality herbal and cosmetic formulations. We provide comprehensive third-party labeling and private label services, empowering brands to launch customizable products including Toothpaste, Body Lotions, Shampoos, Hair Oils, and Creams with their own unique design and packaging.",
        videoThumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
        catalog: [
            { name: "Customizable Toothpaste", specs: "Gel/White/Red Paste, Clove/Neem/Salt variants", icon: "dentistry" },
            { name: "Premium Body Lotions", specs: "Cocoa, Shea, Honey Almond, Fruit Extracts, Vitamin E", icon: "clean_hands" },
            { name: "Hair Care Solutions", specs: "Herbal Shampoos, Amla/Argan/Coconut Hair Oils, Serums", icon: "spa" },
            { name: "Face & Skin Creams", specs: "Whitening, Anti-aging, Cold Cream, Face Gels, Scrubs", icon: "face_3" }
        ]
    };

    return (
      <div className="flex-1 w-full animate-in fade-in duration-300">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <NexisLogo />
              <TopNav activeTab="manufacturing" onTabChange={navigate} />
            </div>
            <div className="flex items-center gap-4 flex-1 md:max-w-2xl">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <span className="material-symbols-outlined text-[24px]">search</span>
                </span>
                <input className="w-full pl-12 pr-12 py-3 rounded-full bg-gray-100 border-none shadow-sm text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Search manufacturers, factory specialties, or certifications..." />
                <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                </button>
              </div>
              <HeaderActions cartCount={cartCount} onCartClick={onCartClick} onAccountClick={() => navigate('account')} user={user} onLoginClick={onLoginClick} />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-10 lg:px-8 space-y-12">
          <NearbyManufacturers />

          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Manufacturing Categories</h2>
              <button className="text-sm text-primary font-bold hover:underline">View All Capabilities</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[{ icon: "sanitizer", label: "Skin Care" }, { icon: "spa", label: "Hair Care" }, { icon: "face_3", label: "Cosmetics" }, { icon: "eco", label: "Organic" }, { icon: "science", label: "Labs" }, { icon: "package_2", label: "Packaging" }].map((cat, i) => (
                <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-white border border-gray-100 cursor-pointer group hover:border-primary transition-all shadow-sm">
                  <div className="size-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary transition-transform group-hover:scale-110 mb-4">
                    <span className="material-symbols-outlined text-[36px]">{cat.icon}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 leading-tight">{cat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-primary fill-current text-[32px]">verified</span>
              <h2 className="text-2xl font-bold text-gray-900">Featured Manufacturers & Factories</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Real Herbal Cosmetics Card */}
              <div 
                onClick={() => setSelectedFactory(realHerbalData)}
                className="bg-white rounded-3xl p-8 border-2 border-primary/20 shadow-xl shadow-primary/5 hover:shadow-2xl transition-all relative overflow-hidden group cursor-pointer"
              >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-primary/20"></div>
                   <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">star</span> Featured
                   </div>
                   
                   <div className="flex items-start gap-6 mb-6 relative z-10">
                     <div className="size-24 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center text-center shadow-md p-2 group-hover:border-primary transition-colors">
                       <span className="material-symbols-outlined text-primary text-[32px]">spa</span>
                       <span className="text-[9px] font-bold text-gray-900 leading-none mt-1 uppercase">Real Herbal<br/>Cosmetics</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                         <h3 className="font-bold text-xl truncate pr-2 text-gray-900">Real Herbal Cosmetics</h3>
                       </div>
                       <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span> H136 Sector 5, Bawana Industrial Area, Delhi
                       </p>
                       <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                           Specializing in customizable herbal toothpaste, body lotions, and hair care. Full 3rd party labeling services.
                       </p>
                       <div className="flex flex-wrap gap-2 mt-4">
                         {["MOQ: 10,000", "Custom Labels", "Private Label", "GMP"].map(tag => <span key={tag} className="text-[10px] text-gray-700 bg-orange-50 px-3 py-1 rounded-full font-bold border border-orange-100">{tag}</span>)}
                       </div>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                     <button className="py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-colors flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">play_circle</span> Watch Video
                     </button>
                     <button className="py-3 text-sm font-bold text-white bg-primary hover:bg-orange-600 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                       View Full Profile
                     </button>
                   </div>
              </div>

              {/* Other Manufacturers */}
              {[
                { name: "Zenith Packaging Sol.", rating: "4.7", desc: "Sustainable glass and recycled plastic packaging for personal care brands. Specializing in high-end cosmetic containers and eco-friendly dispensers.", tags: ["MOQ: 5000pcs", "Custom Molds", "Recyclable", "FDA Registered"], icon: "water_drop" }
              ].map((m, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group opacity-80 hover:opacity-100">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-gray-100"></div>
                   <div className="flex items-start gap-6 mb-6 relative z-10">
                     <div className="size-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                       <span className="material-symbols-outlined text-[48px]">{m.icon}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                         <h3 className="font-bold text-xl truncate pr-2 text-gray-900">{m.name}</h3>
                         <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-xs text-yellow-700 font-bold border border-yellow-200">
                           <span className="material-symbols-outlined text-[16px] fill-current">star</span> {m.rating}
                         </div>
                       </div>
                       <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">{m.desc}</p>
                       <div className="flex flex-wrap gap-2 mt-5">
                         {m.tags.map(tag => <span key={tag} className="text-[10px] text-gray-600 bg-gray-50 px-3 py-1 rounded-full font-bold border border-gray-100">{tag}</span>)}
                       </div>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                     <button className="py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-colors flex items-center justify-center gap-2">
                       View Full Profile
                     </button>
                     <button onClick={() => navigate('rfq')} className="py-3 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                       Send Custom RFQ
                     </button>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        
        <FactoryModal factory={selectedFactory} onClose={() => setSelectedFactory(null)} onChat={onStartChat} />
        <Footer />
      </div>
    );
};

const GlobalScreen = ({ navigate, cartCount }) => (
  <div className="flex-1 w-full flex flex-col animate-in fade-in duration-500">
    <header className="flex items-center justify-between p-6 lg:px-12 z-10">
      <NexisLogo />
      <TopNav activeTab="global" onTabChange={navigate} />
      <HeaderActions cartCount={cartCount} onCartClick={() => {}} onAccountClick={() => navigate('account')} />
    </header>

    <main className="flex-1 flex flex-col items-center justify-center px-6 relative w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse"></div>
      </div>

      <div className="relative z-10 mb-12 group">
        <div className="relative flex h-64 w-64 md:h-80 md:w-80 items-center justify-center rounded-full bg-white ring-1 ring-gray-100 backdrop-blur-xl transition-transform group-hover:scale-105 duration-700 shadow-2xl">
          <span className="material-symbols-outlined text-[140px] md:text-[180px] text-primary/80 animate-pulse" style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}>public</span>
          <div className="absolute h-full w-full animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-primary/20"></div>
          <div className="absolute -top-4 -right-4 size-16 bg-primary/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 size-24 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tighter text-gray-900">
          Global Market <br/>
          <span className="text-primary italic">Coming Early 2026</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
          We are expanding beyond personal care. Soon you will be able to connect with audited manufacturers and wholesale suppliers across every industry, from every corner of the globe.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-12">
          <button className="w-full md:w-auto flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-primary/40 transition-all active:scale-95 hover:bg-orange-600 group">
            <span className="material-symbols-outlined group-hover:animate-bounce">notifications_active</span>
            Notify Me of Launch
          </button>
          <button className="w-full md:w-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-gray-700 border border-gray-200 transition-all hover:bg-gray-50">
            View Roadmap
          </button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const RFQScreen = ({ navigate }) => {
  const [description, setDescription] = useState('');
  const [optimizing, setOptimizing] = useState(false);

  const optimizeRFQ = async () => {
    if (!description.trim()) return;
    setOptimizing(true);
    try {
      if(!genAI) throw new Error("AI not ready");
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-preview',
        systemInstruction: "You are an expert RFQ optimizer for B2B manufacturing."
      });
      const result = await model.generateContent(`Optimize this RFQ description for a cosmetic manufacturer. Make it professional and include industry-specific details: "${description}"`);
      const text = result.response.text();
      if (text) setDescription(text.trim());
    } catch (err) {
        // Fallback
        setDescription(description + "\n(AI Optimization unavailable, please review manually.)");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="flex-1 w-full pb-32 animate-in slide-in-from-bottom duration-300">
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-6 py-5 border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-4">
            <span className="material-symbols-outlined text-gray-900 text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold flex-1 text-gray-900">New Request for Quote</h1>
          <div className="hidden md:flex items-center gap-3 text-xs font-bold text-gray-400">
              <span className="text-primary border-b-2 border-primary pb-1">1. BASICS</span>
              <span>2. MANUFACTURING</span>
              <span>3. CONTACT</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-12 max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-12">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold leading-tight text-gray-900">Define Your Needs</h2>
            <p className="text-gray-500 text-lg">Detailed RFQs receive higher quality responses and more accurate pricing from verified factories.</p>
          </div>

          <section className="space-y-8">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <span className="material-symbols-outlined text-primary text-[32px]">inventory_2</span>
              <h3 className="text-2xl font-bold text-gray-900">Product Specification</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Product Name</span>
                <input className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900 placeholder-gray-400 transition-all focus:outline-none" placeholder="e.g. Vitamin C Face Serum" />
              </label>
              <label className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Product Category</span>
                <div className="relative">
                  <select className="w-full h-14 px-5 pr-12 rounded-2xl appearance-none bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900 focus:outline-none">
                    <option>Select category</option>
                    <option>Skin Care (Face)</option>
                    <option>Body & Bath</option>
                    <option>Oral Care</option>
                    <option>Packaging & Containers</option>
                  </select>
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-gray-400">expand_more</span>
                </div>
              </label>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <span className="material-symbols-outlined text-primary text-[32px]">factory</span>
              <h3 className="text-2xl font-bold text-gray-900">Manufacturing Requirements</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Min Required Qty</span>
                <input className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="1000" type="number" />
              </label>
              <label className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Max Potential Qty</span>
                <input className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="5000" type="number" />
              </label>
            </div>
            <label className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ingredients & Detailed Formulation</span>
                <button 
                  onClick={optimizeRFQ}
                  disabled={optimizing || !description}
                  className="text-xs font-bold text-primary flex items-center gap-1.5 hover:bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 transition-all disabled:opacity-50 shadow-sm"
                >
                  {optimizing ? 'AI Working...' : <><span className="material-symbols-outlined text-sm">auto_awesome</span> Improve with AI</>}
                </button>
              </div>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary h-64 text-base text-gray-900 leading-relaxed shadow-inner focus:outline-none" 
                placeholder="Describe key ingredients, specific formulation needs, scent profiles, or packaging constraints..." 
              />
            </label>
          </section>

          <div className="bg-primary/5 rounded-3xl p-10 border-2 border-dashed border-primary/20 flex flex-col items-center text-center gap-4 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="size-16 rounded-full bg-white flex items-center justify-center text-primary border border-primary/10 shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">cloud_upload</span>
            </div>
            <div>
              <p className="font-bold text-xl text-gray-900">Upload Product Design Files</p>
              <p className="text-sm text-gray-500 mt-2">Drag and drop your PDF, CAD, or high-res imagery here.</p>
            </div>
          </div>
        </div>

        <aside className="w-full md:w-80 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl sticky top-28">
            <h4 className="text-lg font-bold text-gray-900 mb-6">Quote Summary</h4>
            <div className="space-y-4 mb-8">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Service Type</span>
                 <span className="font-bold text-gray-900">Custom Mfg</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Category</span>
                 <span className="font-bold text-gray-900">Skin Care</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Timeline</span>
                 <span className="font-bold text-gray-900">Standard (30d)</span>
               </div>
            </div>
            <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-orange-600 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              <span>Submit RFQ</span>
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-4">By submitting, you agree to Nexis B2B Supplier Terms and global trade compliance standards.</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

const MessengerScreen = ({ navigate, initialChatId }) => {
  const [activeChatId, setActiveChatId] = useState(initialChatId || 1);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  
  const [chats, setChats] = useState([
    { id: 1, name: "Nexis Support", avatar: "support_agent", status: "online", lastMsg: "How can we assist you with your sourcing?", time: "Now", unread: 1, type: "support" },
    { id: 2, name: "Real Herbal Cosmetics", avatar: "spa", status: "online", lastMsg: "We received your RFQ #4521.", time: "10:30 AM", unread: 2, type: "manufacturer" },
    { id: 3, name: "Zenith Packaging", avatar: "inventory_2", status: "offline", lastMsg: "Could you confirm the glass finish?", time: "Wed", unread: 0, type: "manufacturer" }
  ]);

  const [messages, setMessages] = useState({
    1: [
        { id: 1, sender: 'them', text: "Welcome to Nexis B2B Support. How can we help you today?", time: "10:00 AM" }
    ],
    2: [
        { id: 1, sender: 'them', text: "Hello from Real Herbal Cosmetics. We specialize in custom formulations for toothpaste and lotions.", time: "Yesterday" },
        { id: 2, sender: 'me', text: "I'm interested in your 10,000pc MOQ tier for toothpaste.", time: "Yesterday" },
        { id: 3, sender: 'them', text: "We received your RFQ #4521. Our team is currently reviewing your formulation and we will have a prototype quote for you by tomorrow EOD.", time: "10:30 AM" }
    ],
    3: [
        { id: 1, sender: 'them', text: "Could you confirm the preferred glass finish? We currently offer frosted and high-gloss options.", time: "Wed" }
    ]
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now(), sender: 'me', text: input, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    
    setMessages(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), newMsg]
    }));
    
    // Update last message in chat list
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMsg: input, time: "Just now" } : c));
    setInput("");

    // Simulate Reply
    setTimeout(() => {
        let replyText = "Thank you for your message. We will get back to you shortly.";
        if (activeChatId === 1) replyText = "A support agent is reviewing your request. Please allow 5-10 minutes.";
        if (activeChatId === 2) replyText = "Thanks for your inquiry. Our production manager at Real Herbal will review your requirements and update the quote.";

        const replyMsg = { id: Date.now() + 1, sender: 'them', text: replyText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        
        setMessages(prev => ({
            ...prev,
            [activeChatId]: [...prev[activeChatId], replyMsg]
        }));
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMsg: replyText, time: "Just now" } : c));
    }, 1500);
  };

  const activeChatInfo = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 animate-in fade-in duration-300">
        {/* Sidebar List */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <button onClick={() => navigate('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="font-bold text-lg text-gray-900 flex-1">Messages</h2>
                <button className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit_square</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {chats.map(chat => (
                    <div 
                        key={chat.id} 
                        onClick={() => setActiveChatId(chat.id)}
                        className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${activeChatId === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                    >
                        <div className="relative">
                            <div className={`size-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${chat.type === 'support' ? 'bg-blue-500' : 'bg-gray-900'}`}>
                                {chat.avatar.length > 2 ? <span className="material-symbols-outlined">{chat.avatar}</span> : chat.name[0]}
                            </div>
                            {chat.status === 'online' && <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-sm text-gray-900 truncate">{chat.name}</h4>
                                <span className="text-[10px] text-gray-400">{chat.time}</span>
                            </div>
                            <p className={`text-xs truncate ${chat.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{chat.lastMsg}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col h-full bg-white ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
            {activeChatId ? (
                <>
                    {/* Header */}
                    <header className="p-4 border-b border-gray-200 flex items-center gap-3 shadow-sm bg-white z-10">
                        <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 -ml-2 text-gray-500">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className={`size-10 rounded-full flex items-center justify-center text-white shadow-sm ${activeChatInfo.type === 'support' ? 'bg-blue-500' : 'bg-gray-900'}`}>
                                {activeChatInfo.avatar.length > 2 ? <span className="material-symbols-outlined text-[20px]">{activeChatInfo.avatar}</span> : activeChatInfo.name[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                                {activeChatInfo.name} 
                                {activeChatInfo.id === 2 && <span className="material-symbols-outlined text-[14px] text-blue-500 fill-current">verified</span>}
                            </h3>
                            <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-green-500"></span> Online
                            </p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">call</span></button>
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">videocam</span></button>
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">info</span></button>
                        </div>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages[activeChatId]?.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative group ${msg.sender === 'me' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <span className={`text-[9px] block mt-1 text-right opacity-70 ${msg.sender === 'me' ? 'text-white' : 'text-gray-400'}`}>{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-2 pr-2 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
                            <button className="p-2 text-gray-400 hover:text-primary"><span className="material-symbols-outlined">add_circle</span></button>
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..." 
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500"
                            />
                            <button onClick={handleSendMessage} disabled={!input.trim()} className="p-2 bg-primary text-white rounded-xl shadow-md hover:bg-orange-600 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <div className="size-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[48px]">chat</span>
                    </div>
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    </div>
  );
};

const CartOverlay = ({ cart, onClose, onRemove, isOpen }) => {
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const p = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return acc + (isNaN(p) ? 0 : p);
    }, 0);
  }, [cart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-stretch md:justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full md:w-96 bg-white rounded-t-3xl md:rounded-none p-8 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-500 border-l border-gray-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Cart ({cart.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>
        <div className="flex-1 space-y-4 mb-8 overflow-y-auto no-scrollbar pr-2">
          {cart.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center gap-4">
               <span className="material-symbols-outlined text-[64px] text-gray-200">shopping_basket</span>
               <p className="text-gray-500 font-medium">Your shopping cart is currently empty</p>
               <button onClick={onClose} className="text-primary font-bold text-sm hover:underline">Start Sourcing Products</button>
            </div>
          ) : (
            cart.map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                <div className="size-20 rounded-xl bg-white border border-gray-200 shrink-0 overflow-hidden">
                  <img src={item.img} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">Min. Order: {item.moq}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-primary text-base">{item.price}</p>
                    <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><span className="material-symbols-outlined text-[22px]">delete</span></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-gray-100 pt-8 space-y-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-gray-900">Estimated Total</span>
            <span className="text-primary">₹{subtotal.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center italic">Final logistics and duties calculated at checkout.</p>
          <button className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:bg-gray-200 flex items-center justify-center gap-2 text-lg active:scale-95" disabled={cart.length === 0}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountScreen = ({ navigate }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if(!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if(u) {
                // Determine if this is an anonymous user to show fallback data
                const isAnonymous = u.isAnonymous;
                setUser({
                    name: u.displayName || (isAnonymous ? "Demo User" : "User"),
                    email: u.email || (isAnonymous ? "demo@nexis-b2b.com" : ""),
                    avatar: u.photoURL || (u.displayName?.[0] || "D")
                });
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        if(auth) await signOut(auth);
        navigate('home');
    }

    if (!user) {
        return (
            <div className="flex-1 w-full animate-in fade-in duration-300 flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm w-full">
                    <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Not Signed In</h2>
                    <p className="text-gray-500 text-sm mb-6">Please sign in to access your account dashboard.</p>
                    <button onClick={() => navigate('home')} className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors">
                        Go to Home
                    </button>
                </div>
            </div>
        )
    }

  return (
  <div className="flex-1 w-full animate-in fade-in duration-300">
    <header className="p-8 pb-4 max-w-7xl mx-auto">
      <button onClick={() => navigate('home')} className="mb-8 p-3 bg-gray-50 rounded-full text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200">
        <span className="material-symbols-outlined text-[28px]">arrow_back</span>
      </button>
      <div className="flex items-center gap-8 mb-10">
        <div className="size-28 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-white ring-4 ring-primary/5 shadow-xl overflow-hidden">
            {typeof user.avatar === 'string' && user.avatar.length > 2 ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar"/>
            ) : (
                user.name?.[0]
            )}
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider border border-green-200">
              <span className="material-symbols-outlined text-[14px] fill-current">verified</span> Verified Buyer
            </span>
            <p className="text-gray-400 text-sm font-medium">Member since Oct 2023</p>
          </div>
        </div>
      </div>
    </header>
    <main className="px-8 max-w-7xl mx-auto space-y-10 pb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Active RFQs', val: '12', color: 'text-primary' },
          { label: 'Pending Orders', val: '45', color: 'text-blue-600' },
          { label: 'Logistics', val: '08', color: 'text-orange-500' },
          { label: 'Drafts', val: '03', color: 'text-gray-400' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className={`${s.color} text-4xl font-bold tabular-nums`}>{s.val}</p>
            <p className="text-[11px] text-gray-500 font-bold uppercase mt-2 tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {['Purchase Orders & History', 'Factory Inspection Reports', 'Product Compliance & Lab Results', 'Global Shipping & Custom Logistics', 'Billing, Wallet & Trade Credits', 'Organization Settings'].map((item, i) => (
          <button key={i} className="w-full flex justify-between items-center p-6 bg-white rounded-3xl hover:bg-gray-50 transition-all border border-gray-100 shadow-sm group">
            <span className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">{item}</span>
            <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100">
        <button onClick={handleSignOut} className="flex-1 py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors">Sign Out of All Sessions</button>
        <button className="flex-1 py-4 text-gray-500 font-bold text-sm bg-gray-50 rounded-2xl border border-gray-200">Switch Workspace</button>
      </div>
    </main>
    <Footer />
  </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [chatTarget, setChatTarget] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Auth State Listener
  useEffect(() => {
    if(!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // Determine if this is an anonymous user to show fallback data
            const isAnonymous = currentUser.isAnonymous;
            setUser({ 
                name: currentUser.displayName || (isAnonymous ? "Demo User" : "User"), 
                email: currentUser.email || (isAnonymous ? "demo@nexis-b2b.com" : ""), 
                avatar: currentUser.photoURL || (currentUser.displayName?.[0] || "D")
            });
        } else {
            setUser(null);
        }
    });
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product) => {
    setCartItems(prev => [...prev, product]);
    if (window.innerWidth >= 768) setShowCart(true);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index > -1) {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      }
      return prev;
    });
  };

  const handleStartChat = (manufacturerName) => {
      let chatId = 1;
      if (manufacturerName.includes("Real Herbal")) chatId = 2;
      setChatTarget(chatId);
      setActiveTab('messenger');
  };

  const handleGoogleLogin = async () => {
      if (!auth) {
          alert("Firebase Auth not initialized. Please check configuration.");
          return;
      }
      try {
          // Fallback to anonymous auth for preview environments where domain is dynamic
          // In a real app, you would use GoogleAuthProvider and signInWithPopup
          await signInAnonymously(auth);
          setShowLogin(false);
      } catch (error) {
          console.error("Login failed", error);
          alert("Login failed: " + error.message);
      }
  };

  const renderScreen = () => {
    switch(activeTab) {
      case 'home': return <HomeScreen navigate={setActiveTab} onAddToCart={handleAddToCart} cartCount={cartItems.length} onOpenAI={() => setShowAI(true)} onProductClick={setSelectedProduct} user={user} onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />;
      case 'wholesale': return <WholesaleScreen navigate={setActiveTab} onAddToCart={handleAddToCart} cartCount={cartItems.length} onProductClick={setSelectedProduct} user={user} onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />;
      case 'manufacturing': return <ManufacturingScreen navigate={setActiveTab} cartCount={cartItems.length} onStartChat={handleStartChat} user={user} onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />;
      case 'global': return <GlobalScreen navigate={setActiveTab} cartCount={cartItems.length} user={user} onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />;
      case 'messenger': return <MessengerScreen navigate={setActiveTab} initialChatId={chatTarget} />;
      case 'rfq': return <RFQScreen navigate={setActiveTab} />;
      case 'account': return <AccountScreen navigate={setActiveTab} />;
      default: return <HomeScreen navigate={setActiveTab} onAddToCart={handleAddToCart} cartCount={cartItems.length} onOpenAI={() => setShowAI(true)} onProductClick={setSelectedProduct} user={user} onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light font-display">
      <Styles />
      <main className="flex-1 w-full min-h-screen relative overflow-x-hidden">
        {renderScreen()}
        
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={handleAddToCart}
          />
        )}

        <CartOverlay 
          isOpen={showCart} 
          cart={cartItems} 
          onClose={() => setShowCart(false)} 
          onRemove={handleRemoveFromCart} 
        />
        
        <AIChatBot 
          isOpen={showAI} 
          onClose={() => setShowAI(false)} 
        />

        <LoginModal 
            isOpen={showLogin} 
            onClose={() => setShowLogin(false)} 
            onGoogleLogin={handleGoogleLogin} 
        />
        
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="md:hidden">
          {cartItems.length > 0 && activeTab !== 'rfq' && (
            <button 
              onClick={() => setShowCart(true)}
              className="fixed bottom-40 right-4 size-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white z-50 animate-bounce active:scale-90"
            >
              <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
              <span className="absolute top-0 right-0 size-6 bg-white text-primary text-[11px] font-black rounded-full border-2 border-primary flex items-center justify-center shadow-md">
                {cartItems.length}
              </span>
            </button>
          )}
        </div>

        {!showAI && activeTab !== 'rfq' && (
          <button 
            onClick={() => setShowAI(true)}
            className="fixed bottom-24 right-4 md:bottom-12 md:right-12 size-14 md:size-16 bg-white border border-primary/20 rounded-full shadow-2xl flex items-center justify-center text-primary z-50 hover:bg-gray-50 transition-all group scale-100 hover:scale-110 active:scale-90"
          >
            <span className="material-symbols-outlined text-[28px] md:text-[32px] group-hover:rotate-12 transition-transform">auto_awesome</span>
            <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full animate-ping opacity-75"></div>
            <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full border border-white"></div>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;