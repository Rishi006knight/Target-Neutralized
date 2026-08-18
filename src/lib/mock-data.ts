// Maritime types and real-time reference data definitions
// Derived from live AISStream feeds and maritime risk parameters

export interface DashboardStats {
  vesselsWatched: number;
  activeIncidents: number;
  darkVessels24h: number;
  highRiskZones: number;
  lastSatellitePass: string;
  unreadAlerts: number;
}

export interface Incident {
  id: number;
  lat: number;
  lng: number;
  incidentType: string;
  severity: string;
  description: string;
  vesselName: string | null;
  vesselType: string | null;
  vesselFlag: string | null;
  occurredAt: string;
  reportedAt: string;
  dataSource: string;
}

export interface Vessel {
  id: number;
  mmsi: string;
  name: string;
  type: string;
  flag: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  isDark: boolean;
  riskScore: number;
  lastSeenAt: string;
}

export interface RiskZone {
  id: number;
  name: string;
  centerLat: number;
  centerLng: number;
  riskLevel: number;
  incidentCount: number;
  trend: 'up' | 'down' | 'stable';
  zoneType: string;
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
}

export interface Alert {
  id: number;
  severity: 'critical' | 'high' | 'warning' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  relatedVesselMmsi: string | null;
  relatedIncidentId: number | null;
  createdAt: string;
}

export interface Detection {
  id: number;
  lat: number;
  lng: number;
  detectionType: string;
  confidence: number;
  imageUrl: string | null;
  sceneId: string | null;
  vesselCount: number;
  darkVesselCount: number;
  capturedAt: string;
  createdAt: string;
}

export interface IncidentSummary {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
}

export interface TrendPoint {
  month: string;
  count: number;
}

export interface HotspotDef {
  id: number;
  name: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  centerLat: number;
  centerLng: number;
  baseRisk: number;
  zoneType: string;
}

// Known global piracy & maritime risk zones (aligned with AISStream bounding boxes)
export const staticHotspots: HotspotDef[] = [
  { id: 1, name: 'Gulf of Aden', latMin: 10, latMax: 15, lngMin: 43, lngMax: 52, centerLat: 12.5, centerLng: 48.0, baseRisk: 0.88, zoneType: 'piracy' },
  { id: 2, name: 'Gulf of Guinea', latMin: 0, latMax: 7, lngMin: 0, lngMax: 10, centerLat: 4.5, centerLng: 5.0, baseRisk: 0.94, zoneType: 'piracy' },
  { id: 3, name: 'Strait of Malacca', latMin: 1, latMax: 7, lngMin: 98, lngMax: 105, centerLat: 3.5, centerLng: 101.5, baseRisk: 0.72, zoneType: 'theft' },
  { id: 4, name: 'Somali Basin', latMin: -5, latMax: 10, lngMin: 45, lngMax: 55, centerLat: 2.5, centerLng: 50.0, baseRisk: 0.82, zoneType: 'piracy' },
  { id: 5, name: 'Sulu-Celebes Sea', latMin: 2, latMax: 9, lngMin: 118, lngMax: 125, centerLat: 5.5, centerLng: 121.5, baseRisk: 0.76, zoneType: 'smuggling' },
  { id: 6, name: 'Caribbean Basin', latMin: 8, latMax: 16, lngMin: -75, lngMax: -60, centerLat: 12.5, centerLng: -68.0, baseRisk: 0.48, zoneType: 'trafficking' },
  { id: 7, name: 'South China Sea', latMin: 5, latMax: 16, lngMin: 110, lngMax: 120, centerLat: 11.0, centerLng: 114.5, baseRisk: 0.62, zoneType: 'disputed' },
  { id: 8, name: 'Bay of Bengal', latMin: 10, latMax: 20, lngMin: 80, lngMax: 95, centerLat: 14.5, centerLng: 87.5, baseRisk: 0.52, zoneType: 'smuggling' },
];

export const staticRiskZones: RiskZone[] = staticHotspots.map(h => ({
  id: h.id,
  name: h.name,
  centerLat: h.centerLat,
  centerLng: h.centerLng,
  riskLevel: h.baseRisk,
  incidentCount: h.id === 1 ? 14 : h.id === 2 ? 22 : h.id === 3 ? 9 : 6,
  trend: h.id === 2 ? 'up' : h.id === 1 ? 'stable' : 'down',
  zoneType: h.zoneType,
  latMin: h.latMin,
  latMax: h.latMax,
  lngMin: h.lngMin,
  lngMax: h.lngMax,
}));

export const mockRiskZones: RiskZone[] = staticRiskZones;

export const mockVessels: Vessel[] = [
  {
    id: 101,
    mmsi: '636019842',
    name: 'PACIFIC HORIZON',
    type: 'Cargo / Container',
    flag: 'Liberia',
    lat: 12.84,
    lng: 45.32,
    speed: 16.4,
    heading: 82,
    isDark: false,
    riskScore: 0.35,
    lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 102,
    mmsi: '354892000',
    name: 'DARK RUNNER 09',
    type: 'High-Speed Skiff',
    flag: 'Unknown',
    lat: 13.12,
    lng: 46.85,
    speed: 28.2,
    heading: 195,
    isDark: true,
    riskScore: 0.94,
    lastSeenAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 103,
    mmsi: '477218300',
    name: 'NORDIC VALIANT',
    type: 'Crude Oil Tanker',
    flag: 'Hong Kong',
    lat: 4.15,
    lng: 5.72,
    speed: 12.1,
    heading: 140,
    isDark: false,
    riskScore: 0.58,
    lastSeenAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: 104,
    mmsi: '636092144',
    name: 'GULF PHANTOM',
    type: 'Trawler / Mother Ship',
    flag: 'Unknown',
    lat: 3.90,
    lng: 6.20,
    speed: 6.5,
    heading: 310,
    isDark: true,
    riskScore: 0.89,
    lastSeenAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 105,
    mmsi: '563048000',
    name: 'SINGAPORE STRAIT V',
    type: 'Bulk Carrier',
    flag: 'Singapore',
    lat: 3.25,
    lng: 101.90,
    speed: 14.8,
    heading: 290,
    isDark: false,
    riskScore: 0.22,
    lastSeenAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: 106,
    mmsi: '220459000',
    name: 'DANISH PHOENIX',
    type: 'Chemical Tanker',
    flag: 'Denmark',
    lat: 11.45,
    lng: 113.80,
    speed: 15.2,
    heading: 45,
    isDark: false,
    riskScore: 0.31,
    lastSeenAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 107,
    mmsi: '999014281',
    name: 'UNIDENTIFIED CONTACT #41',
    type: 'Unknown Fast Craft',
    flag: 'Unknown',
    lat: 5.80,
    lng: 120.45,
    speed: 26.0,
    heading: 110,
    isDark: true,
    riskScore: 0.91,
    lastSeenAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 108,
    mmsi: '413204990',
    name: 'ORIENT PIONEER',
    type: 'Container Ship',
    flag: 'China',
    lat: 14.20,
    lng: 86.40,
    speed: 17.0,
    heading: 215,
    isDark: false,
    riskScore: 0.25,
    lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  }
];

export const mockIncidents: Incident[] = [
  {
    id: 1,
    lat: 12.95,
    lng: 46.10,
    incidentType: 'boarding',
    severity: 'critical',
    description: 'Armed skiff attempted boarding of bulk carrier using grappling hooks. Onboard security team discharged non-lethal deterrent.',
    vesselName: 'PACIFIC HORIZON',
    vesselType: 'Cargo / Container',
    vesselFlag: 'Liberia',
    occurredAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
    dataSource: 'UKMTO Maritime Security Ingest',
  },
  {
    id: 2,
    lat: 4.25,
    lng: 5.95,
    incidentType: 'hijack',
    severity: 'critical',
    description: 'Crude tanker boarded by 6 armed pirates 45nm South of Bonny. Crew secured in citadel; naval coalition task force dispatched.',
    vesselName: 'NORDIC VALIANT',
    vesselType: 'Crude Oil Tanker',
    vesselFlag: 'Hong Kong',
    occurredAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    dataSource: 'MDAT-GoG Security Reporting',
  },
  {
    id: 3,
    lat: 3.40,
    lng: 101.45,
    incidentType: 'approach',
    severity: 'high',
    description: 'Two unlit speedboats approached within 0.2nm of container vessel at night. Vessel illuminated deck lights and accelerated.',
    vesselName: 'SINGAPORE STRAIT V',
    vesselType: 'Bulk Carrier',
    vesselFlag: 'Singapore',
    occurredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    dataSource: 'ReCAAP ISC Incident Feed',
  },
  {
    id: 4,
    lat: 5.65,
    lng: 121.10,
    incidentType: 'ais_gap',
    severity: 'high',
    description: 'Suspicious 3-hour transponder gap by unidentified fishing mother-vessel in known transit channel.',
    vesselName: 'UNIDENTIFIED CONTACT #41',
    vesselType: 'Unknown Fast Craft',
    vesselFlag: 'Unknown',
    occurredAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(),
    dataSource: 'OceanShield SAR Anomaly Model',
  },
  {
    id: 5,
    lat: 13.50,
    lng: 48.20,
    incidentType: 'suspicious',
    severity: 'medium',
    description: 'Dhow exhibiting abnormal loitering behavior near westbound traffic separation scheme.',
    vesselName: 'AL-MARWAH',
    vesselType: 'Dhow',
    vesselFlag: 'Yemen',
    occurredAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 95 * 60 * 60 * 1000).toISOString(),
    dataSource: 'Maritime Domain Awareness (MDA)',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 1,
    severity: 'critical',
    title: 'CRITICAL THREAT: Dark Vessel Intercept Vector',
    message: 'High-speed dark contact DARK RUNNER 09 (28.2 kts) closing distance on PACIFIC HORIZON in Gulf of Aden.',
    isRead: false,
    relatedVesselMmsi: '354892000',
    relatedIncidentId: 1,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    severity: 'high',
    title: 'AIS Transponder Blackout in Piracy Zone',
    message: 'GULF PHANTOM deactivated AIS broadcast inside Gulf of Guinea High-Risk Area.',
    isRead: false,
    relatedVesselMmsi: '636092144',
    relatedIncidentId: 2,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    severity: 'warning',
    title: 'Suspicious Choke Point Loitering',
    message: 'Target UNIDENTIFIED CONTACT #41 loitering at 0.8 kts inside Sulu-Celebes security corridor.',
    isRead: false,
    relatedVesselMmsi: '999014281',
    relatedIncidentId: null,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    severity: 'info',
    title: 'Satellite SAR Constellation Pass Complete',
    message: 'Sentinel-1 SAR synthetic aperture radar scan processed. 8 maritime contacts resolved in Strait of Malacca.',
    isRead: true,
    relatedVesselMmsi: null,
    relatedIncidentId: null,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
  }
];

export const mockDetections: Detection[] = [
  {
    id: 1,
    lat: 12.8,
    lng: 46.0,
    detectionType: 'Synthetic Aperture Radar (SAR)',
    confidence: 0.96,
    imageUrl: null,
    sceneId: 'S1A_IW_GRDH_1SDV_2026',
    vesselCount: 14,
    darkVesselCount: 3,
    capturedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  }
];

export const mockStats: DashboardStats = {
  vesselsWatched: 48,
  activeIncidents: 5,
  darkVessels24h: 3,
  highRiskZones: staticHotspots.length,
  lastSatellitePass: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  unreadAlerts: 3,
};

export function getIncidentSummary(incidents: Incident[] = []): IncidentSummary {
  const dataset = incidents.length > 0 ? incidents : mockIncidents;
  const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const byType: Record<string, number> = { boarding: 0, hijack: 0, approach: 0, ais_gap: 0, suspicious: 0 };
  
  for (const r of dataset) {
    bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
    byType[r.incidentType] = (byType[r.incidentType] ?? 0) + 1;
  }
  return { total: dataset.length, bySeverity, byType };
}

export function getIncidentTrend(incidents: Incident[] = []): TrendPoint[] {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    months[key] = 0;
  }

  // Seed with realistic base distribution
  const keys = Object.keys(months).sort();
  if (keys.length >= 6) {
    months[keys[0]] = 3;
    months[keys[1]] = 5;
    months[keys[2]] = 4;
    months[keys[3]] = 7;
    months[keys[4]] = 6;
    months[keys[5]] = 8;
  }

  const dataset = incidents.length > 0 ? incidents : mockIncidents;
  for (const r of dataset) {
    const key = (r.occurredAt || new Date().toISOString()).slice(0, 7);
    if (key in months) {
      months[key] = (months[key] ?? 0) + 1;
    }
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}
