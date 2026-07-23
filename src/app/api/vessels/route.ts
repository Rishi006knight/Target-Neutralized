import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isDark = searchParams.get('isDark');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const where: any = {};
    if (isDark === 'true') {
      where.isDark = true;
    }

    const vessels = await db.vessel.findMany({
      where,
      take: limit,
    });
    return NextResponse.json(vessels);
  } catch (error) {
    console.error('Error fetching vessels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}