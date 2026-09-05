import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HOTSPOTS } from '@/lib/anomaly-detector';

const JAVA_BACKEND = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

const fallbackRiskZones = HOTSPOTS.map((h, i) => ({
  id: i + 1,
  name: h.name,
  centerLat: (h.latMin + h.latMax) / 2,
  centerLng: (h.lngMin + h.lngMax) / 2,
  riskLevel: h.baseRisk,
  incidentCount24h: Math.round(h.baseRisk * 12),
  trend: h.baseRisk > 0.8 ? 'up' : 'stable',
  threatType: h.zoneType,
  bounds: {
    latMin: h.latMin,
    latMax: h.latMax,
    lngMin: h.lngMin,
    lngMax: h.lngMax,
  },
}));

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const javaRes = await fetch(`${JAVA_BACKEND}/api/risk-zones`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (javaRes.ok) {
      const data = await javaRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Java backend offline
  }

  try {
    const riskZones = await db.riskZone.findMany();
    if (riskZones && riskZones.length > 0) {
      return NextResponse.json(riskZones);
    }
    return NextResponse.json(fallbackRiskZones);
  } catch {
    return NextResponse.json(fallbackRiskZones);
  }
}