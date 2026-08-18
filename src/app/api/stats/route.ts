import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockStats } from '@/lib/mock-data';

export async function GET() {
  try {
    const vesselsWatched = await db.vessel.count();

    const activeIncidents = await db.incident.count({
      where: {
        severity: { in: ['critical', 'high'] },
      },
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const darkVessels24h = await db.vessel.count({
      where: {
        isDark: true,
        lastSeenAt: { gte: oneDayAgo },
      },
    });

    const highRiskZones = await db.riskZone.count({
      where: {
        riskLevel: { gte: 0.7 },
      },
    });

    const latestDetection = await db.detection.findFirst({
      orderBy: { capturedAt: 'desc' },
    });
    const lastSatellitePass = latestDetection
      ? latestDetection.capturedAt.toISOString()
      : new Date(Date.now() - 4 * 60 * 1000).toISOString();

    const unreadAlerts = await db.alert.count({
      where: {
        isRead: false,
      },
    });

    if (vesselsWatched === 0 && activeIncidents === 0) {
      return NextResponse.json(mockStats);
    }

    return NextResponse.json({
      vesselsWatched,
      activeIncidents,
      darkVessels24h,
      highRiskZones,
      lastSatellitePass,
      unreadAlerts,
    });
  } catch (error) {
    console.warn('DB offline, returning fallback mock stats:', error);
    return NextResponse.json(mockStats);
  }
}