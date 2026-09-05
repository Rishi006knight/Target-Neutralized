import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  seedIncidents,
  seedVessels,
  seedAlerts,
  getActiveIncidentCount,
  getDarkVesselCount,
  getGlobalThreatScore,
} from '@/lib/mock-data';

export async function GET() {
  const fallbackStats = {
    vesselsWatched: seedVessels.length,
    activeIncidents: getActiveIncidentCount(),
    darkVessels24h: getDarkVesselCount(),
    highRiskZones: 6,
    lastSatellitePass: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    unreadAlerts: seedAlerts.filter(a => !a.isRead).length,
    globalThreatScore: getGlobalThreatScore(),
  };

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
      : fallbackStats.lastSatellitePass;

    const unreadAlerts = await db.alert.count({
      where: {
        isRead: false,
      },
    });

    if (vesselsWatched === 0 && activeIncidents === 0) {
      return NextResponse.json(fallbackStats);
    }

    return NextResponse.json({
      vesselsWatched,
      activeIncidents,
      darkVessels24h,
      highRiskZones,
      lastSatellitePass,
      unreadAlerts,
      globalThreatScore: getGlobalThreatScore(),
    });
  } catch {
    return NextResponse.json(fallbackStats);
  }
}