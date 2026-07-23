import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const incidents = await db.incident.findMany();
    
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    for (const r of incidents) {
      bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
      byType[r.incidentType] = (byType[r.incidentType] ?? 0) + 1;
    }
    
    return NextResponse.json({
      total: incidents.length,
      bySeverity,
      byType,
    });
  } catch (error) {
    console.error('Error fetching incident summary stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}