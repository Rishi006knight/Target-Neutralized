/**
 * Maritime Threat & Anomaly Detection Engine
 * Evaluates real-time vessel telemetry against known risk parameters,
 * spatial hazard zones, and behavioral patterns.
 */

import { HotspotDef, staticHotspots, Vessel, Alert } from './mock-data';

export interface AnomalyReport {
  vesselMmsi: string;
  vesselName: string;
  anomalyType: 'ais_gap' | 'high_speed_approach' | 'loitering' | 'hotspot_entry' | 'dark_rendezvous' | 'normal';
  severity: 'critical' | 'high' | 'warning' | 'info';
  riskScore: number;
  message: string;
  timestamp: string;
}

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a coordinate falls within a defined hotspot bounding box
 */
export function findMatchingHotspot(lat: number, lng: number): HotspotDef | null {
  for (const hotspot of staticHotspots) {
    if (
      lat >= hotspot.latMin &&
      lat <= hotspot.latMax &&
      lng >= hotspot.lngMin &&
      lng <= hotspot.lngMax
    ) {
      return hotspot;
    }
  }
  return null;
}

/**
 * Evaluates an individual vessel's telemetry to detect anomalies and calculate a dynamic threat score
 */
export function analyzeVesselAnomaly(
  vessel: Vessel,
  previousPosition?: { lat: number; lng: number; timestamp: number }
): AnomalyReport {
  const hotspot = findMatchingHotspot(vessel.lat, vessel.lng);
  let riskScore = 0.05; // Baseline low risk
  let anomalyType: AnomalyReport['anomalyType'] = 'normal';
  let severity: AnomalyReport['severity'] = 'info';
  let message = `Vessel ${vessel.name} [MMSI: ${vessel.mmsi}] operating within normal parameters.`;

  // 1. Dark Vessel Detection (Transponder turned off / flagged dark)
  if (vessel.isDark) {
    riskScore += 0.45;
    anomalyType = 'ais_gap';
    severity = 'high';
    message = `Transponder Blackout: Vessel ${vessel.name} dropped AIS broadcast. Non-emitting contact detected via Radar/SAR.`;
  }

  // 2. High-Risk Piracy Hotspot Entry
  if (hotspot) {
    riskScore += hotspot.baseRisk * 0.4;
    if (anomalyType === 'normal') {
      anomalyType = 'hotspot_entry';
      severity = hotspot.baseRisk > 0.8 ? 'high' : 'warning';
      message = `High-Risk Zone Transit: Vessel ${vessel.name} entered ${hotspot.name} (${hotspot.zoneType.toUpperCase()}).`;
    } else if (vessel.isDark) {
      severity = 'critical';
      message = `CRITICAL THREAT: Dark vessel ${vessel.name} operating without AIS inside ${hotspot.name}. Possible piracy/interception posture.`;
      riskScore = Math.min(0.98, riskScore + 0.35);
    }
  }

  // 3. Speed Anomalies
  // High-speed skiff / interception (> 24 knots in high risk area or unexpected burst)
  if (vessel.speed > 24) {
    if (hotspot || vessel.isDark) {
      riskScore = Math.min(0.95, riskScore + 0.3);
      anomalyType = 'high_speed_approach';
      severity = 'critical';
      message = `High-Speed Intercept Profile: ${vessel.name} moving at ${vessel.speed.toFixed(1)} kts in ${hotspot ? hotspot.name : 'monitored corridor'}.`;
    }
  } else if (vessel.speed < 1.0 && hotspot && !vessel.isDark) {
    // Suspicious drifting / loitering in choke point
    riskScore = Math.min(0.85, riskScore + 0.25);
    anomalyType = 'loitering';
    severity = 'warning';
    message = `Vessel Loitering: ${vessel.name} stationary/drifting (${vessel.speed.toFixed(1)} kts) within ${hotspot.name}.`;
  }

  // Clamp risk score to [0.0, 1.0]
  riskScore = Math.min(1.0, Math.max(0.05, parseFloat(riskScore.toFixed(2))));

  return {
    vesselMmsi: vessel.mmsi,
    vesselName: vessel.name,
    anomalyType,
    severity,
    riskScore,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates an Alert item from an AnomalyReport if threat threshold is met
 */
export function convertAnomalyToAlert(report: AnomalyReport, alertIdSeed: number = Date.now()): Alert | null {
  if (report.anomalyType === 'normal' || report.riskScore < 0.35) {
    return null;
  }

  const title =
    report.anomalyType === 'ais_gap'
      ? 'AIS Transponder Gap Detected'
      : report.anomalyType === 'high_speed_approach'
      ? 'High-Speed Intercept Warning'
      : report.anomalyType === 'loitering'
      ? 'Suspicious Loitering / Rendezvous'
      : 'Hazard Zone Entry Alert';

  return {
    id: alertIdSeed,
    severity: report.severity,
    title,
    message: report.message,
    isRead: false,
    relatedVesselMmsi: report.vesselMmsi,
    relatedIncidentId: null,
    createdAt: report.timestamp,
  };
}
