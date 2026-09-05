import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const fallbackDetections = [
  {
    id: 1,
    lat: 12.8,
    lng: 46.0,
    detectionType: 'Synthetic Aperture Radar (SAR)',
    confidence: 0.96,
    vesselId: null,
    satelliteSource: 'Sentinel-1 SAR C-Band',
    passNumber: 14,
    unidentifiedVesselCount: 3,
    capturedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 1600 * 1000).toISOString(),
  },
  {
    id: 2,
    lat: 4.5,
    lng: 5.6,
    detectionType: 'Optical Satellite Pass',
    confidence: 0.89,
    vesselId: null,
    satelliteSource: 'PlanetScope SkySat',
    passNumber: 8,
    unidentifiedVesselCount: 2,
    capturedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 3400 * 1000).toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const where: any = {};
    if (type && type !== 'all') {
      where.detectionType = type;
    }

    const detections = await db.detection.findMany({
      where,
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });

    if (detections && detections.length > 0) {
      return NextResponse.json(detections);
    }

    return NextResponse.json(fallbackDetections);
  } catch {
    return NextResponse.json(fallbackDetections);
  }
}