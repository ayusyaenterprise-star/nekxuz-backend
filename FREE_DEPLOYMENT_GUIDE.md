# 100% Free Deployment Guide (Render + Neon + Vercel)

Since you do not have a VPS, we will use the best free-tier services available.

**Important:** Because free hosting platforms (like Render) are "ephemeral" (they reset often), you **cannot** use SQLite (`dev.db`). We will switch to **PostgreSQL** (free on Neon.tech).

---

## Phase 1: Set up the Free Database (Neon.tech)

1.  Go to [Neon.tech](https://neon.tech) and Sign Up.
2.  Create a **New Project** (e.g., `nekxuz-db`).
3.  Copy the **Connection String** (it looks like `postgres://user:pass@...`).
    *   *Note:* Make sure to select "Prisma" from the dropdown if available, or just copy the standard URL.

## Phase 2: Prepare Your Code for PostgreSQL

You need to update your project to use PostgreSQL instead of SQLite.

### 1. Update `schema.prisma`

Open `prisma/schema.prisma` and change the datasource provider:

```prisma
// OLD
// datasource db {
//   provider = "sqlite"
//   url      = "file:./dev.db"
// }

// NEW
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Update `server.js`

Ensure your `PrismaClient` initialization in `server.js` looks like this (it should already be correct if you followed the previous fix, but double-check):

```javascript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
```

### 3. Generate the Client

Run these commands in your terminal:

```bash
# Install Prisma Client for Postgres
npm install @prisma/client

# Generate the new client
npx prisma generate
```

---

## Phase 3: Deploy Backend to Render.com

1.  Push your code to **GitHub**. (If you haven't, create a repo and push this folder).
2.  Go to [Render.com](https://render.com) and Sign Up.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Configure the Service:**
    *   **Name:** `nekxuz-backend`
    *   **Region:** Singapore (closest to India) or Frankfurt.
    *   **Branch:** `main` (or master)
    *   **Root Directory:** `.` (leave empty)
    *   **Runtime:** Node
    *   **Build Command:** `npm install && npx prisma generate`
    *   **Start Command:** `node server.js`
    *   **Instance Type:** Free

6.  **Environment Variables (Advanced Button):**
    Add the following keys:
    *   `DATABASE_URL`: *(Paste your Neon.tech connection string here)*
    *   `RAZORPAY_KEY_ID`: *(Your Razorpay Key ID)*
    *   `RAZORPAY_KEY_SECRET`: *(Your Razorpay Secret)*
    *   `SHIPROCKET_EMAIL`: *(Your Email)*
    *   `SHIPROCKET_PASSWORD`: *(Your Password)*
    *   `PORT`: `10000` (Render uses port 10000 by default)

7.  Click **Create Web Service**.
    *   Render will deploy your app. It might take a few minutes.
    *   Once done, copy your **Backend URL** (e.g., `https://nekxuz-backend.onrender.com`).

---

## Phase 4: Deploy Frontend to Vercel

1.  Go to [Vercel.com](https://vercel.com) and Sign Up.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project:**
    *   **Framework Preset:** Create React App (it should auto-detect).
    *   **Root Directory:** If your React app is in the root, leave it. If it's in a subfolder, select it.
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `build`

5.  **Environment Variables:**
    *   You likely have an API URL in your frontend code (e.g., `http://localhost:3002`).
    *   You need to update your frontend code to point to your new **Render Backend URL**.
    *   *Example:* In your React code, find where you call the API and change `http://localhost:3002` to `https://nekxuz-backend.onrender.com`.

6.  Click **Deploy**.

---

## Phase 5: Final Database Setup

Once your backend is running on Render, you need to push your database schema to Neon.

Since you can't easily run commands on the Render server console in the free tier, run this **from your local machine**:

1.  Create a `.env` file locally with the *Neon* connection string:
    ```env
    DATABASE_URL="postgres://user:pass@ep-....neon.tech/neondb?sslmode=require"
    ```
2.  Run the migration:
    ```bash
    npx prisma db push
    ```

This will create the tables in your online Neon database.

## Summary

*   **Backend:** Running on Render (Free).
*   **Database:** Hosted on Neon (Free Postgres).
*   **Frontend:** Hosted on Vercel (Free).
*   **Cost:** $0/month.
