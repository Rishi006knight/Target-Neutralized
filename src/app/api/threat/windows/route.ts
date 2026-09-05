import { NextResponse } from 'next/server';
import { seedThreatWindows } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(seedThreatWindows, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' },
  });
}
