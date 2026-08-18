import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockDetections } from '@/lib/mock-data';

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

    return NextResponse.json(mockDetections);
  } catch (error) {
    console.warn('DB offline, returning fallback detections:', error);
    return NextResponse.json(mockDetections);
  }
}