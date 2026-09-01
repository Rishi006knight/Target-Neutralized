# OceanShield OPS — Deployment & Architecture Guide

This guide walks you through deploying the **OceanShield OPS Maritime Anomaly Detector** platform on **Vercel** (Frontend / Fullstack) and Cloud backends (Render / Railway / Java Spring Boot).

---

## 🏛️ Architecture Overview

- **Frontend (Vercel)**: Next.js 16 + React 19 + TypeScript + Leaflet + Tailwind CSS + App Router with resilient API fallbacks.
- **Backend (Optional / Standalone)**: Java 17 + Spring Boot 3 (`backend-java/`) running on port `8080`.
- **Database (Optional)**: Supabase PostgreSQL (via transaction pooler) or zero-config resilient in-memory mode.

---

## 🚀 Deploying to Vercel (Step-by-Step)

### Option 1: Via Vercel Web Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com/) and log in with your GitHub account.
2. Click **Add New...** > **Project**.
3. Import your repository: `Rishi006knight/Target-Neutralized`.
4. Configure Project Settings:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (or `prisma generate && next build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`
5. *(Optional)* Under **Environment Variables**, add:
   - `NEXT_PUBLIC_AISSTREAM_API_KEY`: *(Your AISStream.io API key for live global satellite telemetry, or leave empty for auto-simulation mode)*
   - `DATABASE_URL`: *(Your Supabase connection string, if connecting PostgreSQL)*
6. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://target-neutralized.vercel.app`).

---

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy directly from the project directory
cd d:\projects\neutralise
vercel --prod
```

---

## 🖥️ Running Locally

### 1. Next.js Frontend:
```bash
cd d:\projects\neutralise
npm install
npm run dev
```
Open **`http://localhost:3000`**.

### 2. Java Spring Boot Backend (Optional):
```bash
cd d:\projects\neutralise\backend-java
mvn spring-boot:run
```
Backend runs on **`http://localhost:8080`**.

---

## ☁️ Java Spring Boot Backend Deployment (Render / Railway)

1. **Root Directory**: `backend-java`
2. **Build Command**: `mvn clean package -DskipTests`
3. **Start Command**: `java -jar target/ocean-shield-ops-1.0.0.jar`
4. **Port**: `8080`
