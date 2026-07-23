import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    return NextResponse.json(detections);
  } catch (error) {
    console.error('Error fetching detections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}