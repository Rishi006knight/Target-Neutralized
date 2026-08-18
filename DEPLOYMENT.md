# OceanShield OPS — Deployment & Architecture Guide

This guide walks you through running and deploying the **OceanShield OPS Maritime Anomaly Detector** platform (Java Spring Boot 3 Backend + Next.js Frontend).

---

## 🏛️ Architecture Overview

- **Backend**: Java 17 + Spring Boot 3 (`backend-java/`) running on port `8080` with REST APIs, real-time threat evaluation, and anomaly scoring.
- **Frontend**: Next.js 16 + React 19 + TypeScript + Leaflet + Tailwind CSS running on port `3000`.
- **Database (Optional)**: Supabase PostgreSQL (via transaction pooler) or zero-config in-memory persistence.

---

## 🚀 Running the Java Spring Boot Backend

### Prerequisites:
- Java JDK 17+ installed
- Maven (`mvn`)

### Start Java Backend:
```bash
cd backend-java
mvn spring-boot:run
```
The Java backend will start on **`http://localhost:8080`**.

### Verified Endpoints:
- `GET /api/stats` — High-level situation report and active incident metrics
- `GET /api/vessels` — Monitored fleet telemetry (with `?isDark=true` support)
- `POST /api/vessels/telemetry` — Real-time telemetry ingest with automated anomaly evaluation
- `GET /api/incidents` — Global incident reports
- `POST /api/incidents` — Report new incident
- `GET /api/incidents/summary` — Incident breakdown by severity & type
- `GET /api/incidents/trend` — 6-month incident trend timeline
- `GET /api/alerts` — System threat notifications
- `PATCH /api/alerts/{id}/read` — Acknowledge alert
- `GET /api/risk-zones` — Global piracy & security corridors
- `GET /api/detections` — Satellite SAR/optical passes

---

## 🖥️ Running the Next.js Frontend

```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## ☁️ Deployment Guide (Render / Railway / Cloud)

### Option A: Java Spring Boot Backend on Render / Railway
1. **Root Directory**: `backend-java`
2. **Build Command**: `mvn clean package -DskipTests`
3. **Start Command**: `java -jar target/ocean-shield-ops-1.0.0.jar`
4. **Port**: `8080`

### Option B: Next.js Frontend on Netlify / Vercel
1. Connect repository `Target-Neutralized`
2. Set Build Command: `npm run build`
3. Set Publish Directory: `.next`
4. Configure `NEXT_PUBLIC_AISSTREAM_API_KEY` (optional for live AISStream WebSocket feed).
