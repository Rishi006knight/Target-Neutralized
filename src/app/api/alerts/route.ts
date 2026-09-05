import { NextResponse } from 'next/server';
import { seedAlerts, type AbyssalAlert, type Severity } from '@/lib/mock-data';

const JAVA_BACKEND = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

function mapSeverity(s: string): Severity {
  const sev = (s || '').toLowerCase();
  if (sev === 'critical') return 'critical';
  if (sev === 'high') return 'high';
  if (sev === 'elevated' || sev === 'warning') return 'elevated';
  if (sev === 'low' || sev === 'info') return 'low';
  return 'medium';
}

export async function GET() {
  let backendAlerts: AbyssalAlert[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`${JAVA_BACKEND}/api/alerts`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        backendAlerts = data.map((a: any): AbyssalAlert => ({
          id: typeof a.id === 'string' && a.id.startsWith('ALT-') ? a.id : `ALT-J${a.id}`,
          severity: mapSeverity(a.severity),
          title: a.title || 'THREAT ALERT',
          message: a.message || 'Operational alert logged.',
          isRead: Boolean(a.isRead),
          relatedIncidentId: a.incidentId ? `INC-${a.incidentId}` : null,
          relatedVesselMmsi: a.vesselMmsi || null,
          createdAt: a.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch {
    // Backend offline
  }

  const combined = [...backendAlerts];
  const seenIds = new Set(backendAlerts.map(a => a.id));

  for (const seed of seedAlerts) {
    if (!seenIds.has(seed.id)) {
      combined.push(seed);
    }
  }

  return NextResponse.json(combined, {
    headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=30' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      rule: {
        id: `RULE-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}