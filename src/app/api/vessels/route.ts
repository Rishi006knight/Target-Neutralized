import { NextResponse } from 'next/server';
import { seedVessels, type AbyssalVessel, type VesselStatus } from '@/lib/mock-data';

const JAVA_BACKEND = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isDark = searchParams.get('isDark');

  let backendVessels: AbyssalVessel[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const query = isDark ? '?isDark=true' : '';
    const res = await fetch(`${JAVA_BACKEND}/api/vessels${query}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        backendVessels = data.map((v: any): AbyssalVessel => {
          let status: VesselStatus = 'ACTIVE';
          if (v.isDark) status = 'DARK';
          else if ((v.speed || 0) < 0.8) status = 'ANCHORED';

          return {
            id: v.id || Math.abs(String(v.mmsi).hashCode?.() || 1000),
            mmsi: String(v.mmsi),
            name: v.name || `VESSEL_${v.mmsi}`,
            type: v.type || 'Commercial Cargo',
            flag: v.flag || 'International',
            lat: Number(v.lat),
            lng: Number(v.lng),
            speed: Number(v.speed || 0),
            heading: Number(v.heading || 0),
            status,
            riskScore: Number(v.riskScore || 0.1),
            lastPingAge: 0,
            lastSeenAt: v.lastSeenAt || new Date().toISOString(),
          };
        });
      }
    }
  } catch {
    // Java backend offline or timed out
  }

  // Combine backend vessels with seed vessels
  const combined = [...backendVessels];
  const seenMmsi = new Set(backendVessels.map(v => v.mmsi));

  for (const seed of seedVessels) {
    if (!seenMmsi.has(seed.mmsi)) {
      if (isDark === 'true' && seed.status !== 'DARK') continue;
      combined.push(seed);
    }
  }

  return NextResponse.json(combined, {
    headers: {
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
      'X-Data-Source': backendVessels.length > 0 ? 'Java-Spring-Hybrid' : 'Abyssal-Local',
    },
  });
}