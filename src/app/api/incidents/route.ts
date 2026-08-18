import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockIncidents } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = {};
    if (severity && severity !== 'all') {
      where.severity = severity;
    }
    if (type && type !== 'all') {
      where.incidentType = type;
    }

    const incidents = await db.incident.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: limit,
      skip: offset,
    });

    if (incidents && incidents.length > 0) {
      return NextResponse.json(incidents);
    }

    const fallback = mockIncidents.filter((inc) => {
      if (severity && severity !== 'all' && inc.severity !== severity) return false;
      if (type && type !== 'all' && inc.incidentType !== type) return false;
      return true;
    });

    return NextResponse.json(fallback);
  } catch (error) {
    console.warn('DB offline, returning fallback incidents:', error);
    const fallback = mockIncidents.filter((inc) => {
      if (severity && severity !== 'all' && inc.severity !== severity) return false;
      if (type && type !== 'all' && inc.incidentType !== type) return false;
      return true;
    });
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    try {
      const newIncident = await db.incident.create({
        data: {
          lat: parseFloat(body.lat ?? '0'),
          lng: parseFloat(body.lng ?? '0'),
          incidentType: body.incidentType ?? 'suspicious',
          severity: body.severity ?? 'medium',
          description: body.description ?? '',
          vesselName: body.vesselName || null,
          vesselType: body.vesselType || null,
          vesselFlag: body.vesselFlag || null,
          occurredAt: new Date(body.occurredAt ?? Date.now()),
          dataSource: body.dataSource ?? 'manual',
        },
      });
      return NextResponse.json(newIncident, { status: 201 });
    } catch {
      // Fallback in-memory response
      const fallbackIncident = {
        id: Date.now(),
        ...body,
        lat: parseFloat(body.lat ?? '0'),
        lng: parseFloat(body.lng ?? '0'),
        occurredAt: new Date(body.occurredAt ?? Date.now()).toISOString(),
        reportedAt: new Date().toISOString(),
      };
      return NextResponse.json(fallbackIncident, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}