import { NextResponse } from 'next/server';
import { seedClusters } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(seedClusters, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' },
  });
}
