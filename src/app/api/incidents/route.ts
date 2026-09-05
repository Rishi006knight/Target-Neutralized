import { NextResponse } from 'next/server';
import { seedIncidents, type AbyssalIncident, type IncidentType, type Severity, type IncidentSource } from '@/lib/mock-data';

const JAVA_BACKEND = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

function mapJavaType(type: string): IncidentType {
  const t = (type || '').toLowerCase();
  if (t.includes('board')) return 'BOARDING';
  if (t.includes('hijack')) return 'HIJACK ATTEMPT';
  if (t.includes('sos') || t.includes('strike') || t.includes('missile')) return 'SOS';
  if (t.includes('dark') || t.includes('gap') || t.includes('transfer')) return 'DARK TRANSFER';
  return 'APPROACH';
}

function mapJavaSeverity(sev: string): Severity {
  const s = (sev || '').toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'elevated') return 'elevated';
  if (s === 'low') return 'low';
  return 'medium';
}

export async function GET() {
  let backendIncidents: AbyssalIncident[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`${JAVA_BACKEND}/api/incidents`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        backendIncidents = data.map((j: any): AbyssalIncident => ({
          id: typeof j.id === 'string' && j.id.startsWith('INC-') ? j.id : `INC-J${j.id}`,
          lat: Number(j.lat),
          lng: Number(j.lng),
          type: mapJavaType(j.incidentType || j.type),
          severity: mapJavaSeverity(j.severity),
          source: (j.dataSource || j.source || 'UKMTO') as IncidentSource,
          verdict: j.description || j.verdict || 'Maritime incident verified by regional monitoring authority.',
          confidence: j.confidence || 88,
          vesselName: j.vesselName || null,
          occurredAt: j.occurredAt || new Date().toISOString(),
          reportedAt: j.reportedAt || new Date().toISOString(),
          timeline: Array.isArray(j.timeline) && j.timeline.length > 0
            ? j.timeline
            : [
                { time: new Date(j.occurredAt || Date.now()).toISOString().slice(11, 16) + ' UTC', label: 'Threat detected' },
                { time: new Date(j.reportedAt || Date.now()).toISOString().slice(11, 16) + ' UTC', label: 'Logged by command' },
              ],
          linkedVessels: Array.isArray(j.linkedVessels) ? j.linkedVessels : [],
          riskFactors: Array.isArray(j.riskFactors) ? j.riskFactors : [
            { label: 'Security Corridor Hazard', value: 85 },
            { label: 'Response Unit ETA', value: 70 },
          ],
          clusterId: j.clusterId || null,
        }));
      }
    }
  } catch {
    // Java backend offline or timed out — fallback smoothly
  }

  // Merge backend incidents with seed incidents (avoiding duplicate IDs)
  const combined = [...backendIncidents];
  const seenIds = new Set(backendIncidents.map(i => i.id));

  for (const seed of seedIncidents) {
    if (!seenIds.has(seed.id)) {
      combined.push(seed);
    }
  }

  return NextResponse.json(combined, {
    headers: {
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
      'X-Data-Source': backendIncidents.length > 0 ? 'Java-Spring-Hybrid' : 'Abyssal-Local',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Forward to Java backend if available
    try {
      const javaRes = await fetch(`${JAVA_BACKEND}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: body.lat,
          lng: body.lng,
          incidentType: body.type,
          severity: body.severity,
          description: body.verdict,
          vesselName: body.vesselName,
          occurredAt: body.occurredAt || new Date().toISOString(),
          reportedAt: new Date().toISOString(),
          dataSource: body.source || 'Command Manual Ingest',
        }),
      });
      if (javaRes.ok) {
        const created = await javaRes.json();
        return NextResponse.json(created, { status: 201 });
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ ...body, id: `INC-${Date.now().toString().slice(-4)}` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}