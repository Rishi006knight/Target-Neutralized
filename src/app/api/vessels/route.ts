import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockVessels } from '@/lib/mock-data';

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

    if (vessels && vessels.length > 0) {
      return NextResponse.json(vessels);
    }

    const fallback = isDark === 'true' ? mockVessels.filter((v) => v.isDark) : mockVessels;
    return NextResponse.json(fallback);
  } catch (error) {
    console.warn('DB offline, returning fallback vessels:', error);
    const fallback = isDark === 'true' ? mockVessels.filter((v) => v.isDark) : mockVessels;
    return NextResponse.json(fallback);
  }
}