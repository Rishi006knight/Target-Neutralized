import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const incidents = await db.incident.findMany({
      orderBy: { occurredAt: 'asc' },
    });
    
    const months: Record<string, number> = {};
    for (const r of incidents) {
      const key = r.occurredAt.toISOString().slice(0, 7);
      months[key] = (months[key] ?? 0) + 1;
    }
    
    // Fill in recent months if no data
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      if (!months[key]) months[key] = 0;
    }
    
    const trend = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
      
    return NextResponse.json(trend);
  } catch (error) {
    console.error('Error fetching incident trend stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}