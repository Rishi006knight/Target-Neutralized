import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockRiskZones } from '@/lib/mock-data';

export async function GET() {
  try {
    const riskZones = await db.riskZone.findMany();
    if (riskZones && riskZones.length > 0) {
      return NextResponse.json(riskZones);
    }
    return NextResponse.json(mockRiskZones);
  } catch (error) {
    console.warn('Database offline, returning fallback risk zones:', error);
    return NextResponse.json(mockRiskZones);
  }
}