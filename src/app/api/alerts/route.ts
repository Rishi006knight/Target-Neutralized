import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '30');

  try {
    const alerts = await db.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const severityOrder: Record<string, number> = { critical: 0, high: 1, warning: 2, info: 3 };
    const sorted = [...alerts].sort((a, b) => {
      const aOrder = severityOrder[a.severity] ?? 99;
      const bOrder = severityOrder[b.severity] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '0');

  try {
    const alert = await db.alert.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}