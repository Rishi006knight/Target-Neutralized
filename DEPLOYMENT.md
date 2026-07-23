# OceanShield OPS — Deployment Guide (Supabase + Railway + Netlify)

This guide walks you through deploying the **OceanShield OPS Maritime Anomaly Detector** app.

---

## Step 1: Set up the Database (Supabase)

1. Sign up/log in to [Supabase](https://supabase.com/).
2. Create a new project.
3. Once the database is ready, navigate to **Project Settings** > **Database** > **Connection string**.
4. Copy the **Transaction** or **Session** pooler URI. It looks like:
   ```text
   postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Replace `[YOUR_PASSWORD]` with your actual database password.

---

## Step 2: Push Database Schema & Seed Data

1. In your local project directory, open your `.env` file and update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
2. Run the following command in your terminal to deploy all database tables to Supabase:
   ```bash
   bun run db:push
   ```
3. Seed the database with live mock vessel positions, alerts, and incidents:
   ```bash
   bun prisma db seed
   ```
4. Verify by checking your Supabase project dashboard under **Table Editor** to see populated tables: `Vessel`, `Incident`, `Alert`, `Detection`, and `RiskZone`.

---

## Step 3: Deploy to Railway (Backend App Host)

[Railway](https://railway.app/) will host the Next.js server/API routes and handle backend execution.

1. Create a new project on Railway.
2. Select **Deploy from GitHub repo** and select your repository.
3. Go to the project **Variables** tab and add the environment variable:
   * **Key**: `DATABASE_URL`
   * **Value**: *Your Supabase Connection String*
4. Railway will automatically build and run the app using the Nixpacks builder specified in `railway.json`.
5. Once deployed, Railway will generate a public domain (e.g., `https://neutralise-production.up.railway.app`).

---

## Step 4: Deploy to Netlify (Frontend App Host)

[Netlify](https://www.netlify.com/) provides high-speed global CDN hosting for the frontend.

1. Log in to Netlify and click **Add new site** > **Import from an existing project**.
2. Connect your GitHub account and select your project repository.
3. In **Build Settings**:
   * **Build command**: `bun run build` or `npm run build`
   * **Publish directory**: `.next`
4. Under **Environment variables**, click **Add variable** and set:
   * **Key**: `DATABASE_URL`
   * **Value**: *Your Supabase Connection String*
5. Netlify will deploy the site and provide a custom subdomain (e.g., `https://oceanshield-ops.netlify.app`).

---

## Step 5: (Optional) Running WebSocket & Background Workers

If you write a background AIS scraper or consumer inside `mini-services/`:
1. Ensure your background service runs on Railway as a secondary service (or worker).
2. Configure it to connect to the Supabase PostgreSQL database using the same `DATABASE_URL` to update coordinates in real-time.
