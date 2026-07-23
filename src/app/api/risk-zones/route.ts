import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const riskZones = await db.riskZone.findMany();
    return NextResponse.json(riskZones);
  } catch (error) {
    console.error('Error fetching risk zones:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}