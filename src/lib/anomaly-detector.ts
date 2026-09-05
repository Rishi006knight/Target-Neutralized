/**
 * Maritime Threat & Anomaly Detection Engine
 * Evaluates real-time vessel telemetry against known risk parameters,
 * spatial hazard zones, and behavioral patterns.
 * 
 * Adapted for OCEANSHIELD 2.0 Abyssal types.
 */

import { type AbyssalVessel } from './mock-data';

// Known piracy hotspot bounding boxes
interface HotspotDef {
  name: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  baseRisk: number;
  zoneType: string;
}

export const HOTSPOTS: HotspotDef[] = [
  { name: 'Gulf of Aden (IRTC Corridor)', latMin: 11.0, latMax: 15.0, lngMin: 43.0, lngMax: 52.0, baseRisk: 0.92, zoneType: 'Piracy Corridor' },
  { name: 'Gulf of Guinea (Niger Delta)', latMin: 0.0, latMax: 7.0, lngMin: 0.0, lngMax: 10.0, baseRisk: 0.88, zoneType: 'Armed Kidnapping Zone' },
  { name: 'Strait of Malacca & Singapore', latMin: 1.0, latMax: 7.0, lngMin: 98.0, lngMax: 105.0, baseRisk: 0.62, zoneType: 'Armed Robbery Corridor' },
  { name: 'Somali Basin & East Coast', latMin: -5.0, latMax: 10.0, lngMin: 45.0, lngMax: 56.0, baseRisk: 0.84, zoneType: 'Mother-Ship Range' },
  { name: 'Southern Red Sea & Bab-el-Mandeb', latMin: 12.0, latMax: 16.0, lngMin: 41.0, lngMax: 44.5, baseRisk: 0.95, zoneType: 'Direct Kinetic Attack Zone' },
  { name: 'Strait of Hormuz', latMin: 25.0, latMax: 27.5, lngMin: 55.0, lngMax: 58.0, baseRisk: 0.72, zoneType: 'State Actor Zone' },
  { name: 'Sulu-Celebes Sea', latMin: 2.0, latMax: 9.0, lngMin: 118.0, lngMax: 125.0, baseRisk: 0.68, zoneType: 'Maritime Insurgency Risk' },
];

export interface AnomalyReport {
  vesselMmsi: string;
  vesselName: string;
  anomalyType: 'ais_gap' | 'high_speed_approach' | 'loitering' | 'hotspot_entry' | 'dark_rendezvous' | 'normal';
  severity: 'critical' | 'high' | 'warning' | 'info';
  riskScore: number;
  message: string;
  isDark: boolean;
  timestamp: string;
}

function findMatchingHotspot(lat: number, lng: number): HotspotDef | null {
  for (const hotspot of HOTSPOTS) {
    if (lat >= hotspot.latMin && lat <= hotspot.latMax && lng >= hotspot.lngMin && lng <= hotspot.lngMax) {
      return hotspot;
    }
  }
  return null;
}

/**
 * Evaluates a vessel's telemetry to detect anomalies and calculate a dynamic threat score.
 * Works with both AbyssalVessel and legacy AIS-stream ingested vessels.
 */
export function analyzeVesselAnomaly(
  vessel: { mmsi: string; name: string; lat: number; lng: number; speed: number; heading: number; status?: string; isDark?: boolean }
): AnomalyReport {
  const hotspot = findMatchingHotspot(vessel.lat, vessel.lng);
  const isDark = vessel.status === 'DARK' || vessel.isDark === true;
  let riskScore = 0.05;
  let anomalyType: AnomalyReport['anomalyType'] = 'normal';
  let severity: AnomalyReport['severity'] = 'info';
  let message = `Vessel ${vessel.name} [${vessel.mmsi}] operating within normal parameters.`;

  // 1. Dark Vessel Detection
  if (isDark) {
    riskScore += 0.45;
    anomalyType = 'ais_gap';
    severity = 'high';
    message = `Transponder Blackout: ${vessel.name} dropped AIS broadcast.`;
  }

  // 2. Hotspot Entry
  if (hotspot) {
    riskScore += hotspot.baseRisk * 0.4;
    if (anomalyType === 'normal') {
      anomalyType = 'hotspot_entry';
      severity = hotspot.baseRisk > 0.8 ? 'high' : 'warning';
      message = `High-Risk Zone: ${vessel.name} entered ${hotspot.name}.`;
    } else if (isDark) {
      severity = 'critical';
      message = `CRITICAL: Dark vessel ${vessel.name} inside ${hotspot.name}.`;
      riskScore = Math.min(0.98, riskScore + 0.35);
    }
  }

  // 3. Speed Anomalies
  if (vessel.speed > 24) {
    if (hotspot || isDark) {
      riskScore = Math.min(0.95, riskScore + 0.3);
      anomalyType = 'high_speed_approach';
      severity = 'critical';
      message = `High-Speed Intercept: ${vessel.name} at ${vessel.speed.toFixed(1)} kts in ${hotspot ? hotspot.name : 'monitored corridor'}.`;
    }
  } else if (vessel.speed < 1.0 && hotspot && !isDark) {
    riskScore = Math.min(0.85, riskScore + 0.25);
    anomalyType = 'loitering';
    severity = 'warning';
    message = `Loitering: ${vessel.name} at ${vessel.speed.toFixed(1)} kts in ${hotspot.name}.`;
  }

  riskScore = Math.min(1.0, Math.max(0.05, parseFloat(riskScore.toFixed(2))));

  return {
    vesselMmsi: vessel.mmsi,
    vesselName: vessel.name,
    anomalyType,
    severity,
    riskScore,
    message,
    isDark,
    timestamp: new Date().toISOString(),
  };
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
