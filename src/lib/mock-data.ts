// Mock data layer mirroring the Supabase schema from the zip project
// Types match the OpenAPI spec in lib/api-spec/openapi.yaml

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
  trend: string;
  zoneType: string;
}

export interface Alert {
  id: number;
  severity: string;
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

// ---- MOCK DATA ----

export const mockStats: DashboardStats = {
  vesselsWatched: 12847,
  activeIncidents: 23,
  darkVessels24h: 147,
  highRiskZones: 6,
  lastSatellitePass: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  unreadAlerts: 8,
};

const vesselNames = [
  'MV Pacific Star', 'MT Ocean Titan', 'FV Horizon', 'MV Ever Fortune',
  'MT Global Courage', 'MV Cape Victory', 'FV Sea Hawk', 'MV Neptune Grace',
  'MT Blue Horizon', 'MV Eastern Promise', 'FV Golden Catch', 'MV Storm Breaker',
  'MT Southern Cross', 'MV Arctic Fox', 'FV Deep Current', 'MV Iron Duke',
  'MT Red Sparrow', 'MV Jade Emperor', 'FV Silver Fin', 'MV Dark Voyager',
];

const vesselTypes = ['cargo', 'tanker', 'fishing', 'bulk_carrier', 'passenger', 'container'];
const flags = ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Hong Kong', 'Malta', 'Greece', 'Bahamas', 'Nigeria', 'Togo'];
const incidentTypes = ['hijack', 'boarding', 'approach', 'suspicious', 'ais_gap', 'ship_to_ship', 'spoofed_ais'];
const severities = ['critical', 'high', 'medium', 'low'];
const dataSources = ['IMO', 'IMB', 'ML_detected', 'satellite', 'manual'];

// Piracy hotspot coordinates
const hotspots = [
  { name: 'Gulf of Aden', lat: 12.5, lng: 48.0, risk: 0.85 },
  { name: 'Gulf of Guinea', lat: 4.5, lng: 5.0, risk: 0.92 },
  { name: 'Strait of Malacca', lat: 3.5, lng: 103.5, risk: 0.68 },
  { name: 'Somali Basin', lat: 1.5, lng: 50.0, risk: 0.78 },
  { name: 'Sulu-Celebes Sea', lat: 5.5, lng: 122.0, risk: 0.72 },
  { name: 'Caribbean', lat: 12.0, lng: -72.0, risk: 0.45 },
  { name: 'South China Sea', lat: 10.0, lng: 115.0, risk: 0.55 },
  { name: 'Bay of Bengal', lat: 14.0, lng: 88.0, risk: 0.48 },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIncidents(count: number): Incident[] {
  const incidents: Incident[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const hotspot = pick(hotspots);
    const timeOffset = randInt(0, 90) * 24 * 60 * 60 * 1000;
    const occurredAt = new Date(now - timeOffset);
    incidents.push({
      id: i + 1,
      lat: hotspot.lat + rand(-3, 3),
      lng: hotspot.lng + rand(-3, 3),
      incidentType: pick(incidentTypes),
      severity: pick(severities),
      description: `Suspicious vessel activity detected near ${hotspot.name}. Vessel exhibited abnormal behavior pattern consistent with piracy reconnaissance operations in the region.`,
      vesselName: pick(vesselNames),
      vesselType: pick(vesselTypes),
      vesselFlag: pick(flags),
      occurredAt: occurredAt.toISOString(),
      reportedAt: new Date(occurredAt.getTime() + randInt(5, 120) * 60 * 1000).toISOString(),
      dataSource: pick(dataSources),
    });
  }
  return incidents.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function generateVessels(count: number): Vessel[] {
  const vessels: Vessel[] = [];
  for (let i = 0; i < count; i++) {
    const isDark = Math.random() < 0.12;
    const hotspot = pick(hotspots);
    const lastSeenOffset = isDark ? randInt(4, 72) * 60 * 60 * 1000 : randInt(0, 30) * 60 * 1000;
    vessels.push({
      id: i + 1,
      mmsi: String(randInt(200000000, 677000000)),
      name: vesselNames[i % vesselNames.length],
      type: pick(vesselTypes),
      flag: pick(flags),
      lat: hotspot.lat + rand(-5, 5),
      lng: hotspot.lng + rand(-5, 5),
      speed: isDark ? 0 : rand(0.5, 18),
      heading: randInt(0, 359),
      isDark,
      riskScore: isDark ? rand(0.5, 0.98) : rand(0.02, 0.35),
      lastSeenAt: new Date(Date.now() - lastSeenOffset).toISOString(),
    });
  }
  return vessels.sort((a, b) => b.riskScore - a.riskScore);
}

export const mockIncidents = generateIncidents(47);

export const mockVessels = generateVessels(85);

export const mockRiskZones: RiskZone[] = hotspots.map((h, i) => ({
  id: i + 1,
  name: h.name,
  centerLat: h.lat,
  centerLng: h.lng,
  riskLevel: h.risk,
  incidentCount: randInt(3, 28),
  trend: pick(['up', 'down', 'stable']),
  zoneType: pick(['piracy', 'theft', 'smuggling', 'trafficking']),
}));

const alertMessages = [
  { title: 'Dark Vessel Detected', message: 'Vessel MMSI 311405000 has gone dark for 6.2 hours near Gulf of Aden. Last known position: 12.34N, 48.12E. SAR imagery analysis in progress.' },
  { title: 'AIS Spoofing Alert', message: 'MMSI clone detected: vessel claiming MMSI 538006238 appeared simultaneously at 4.5N, 8.2W and 12.1N, 44.8E. Reported speed exceeds physical limits.' },
  { title: 'STS Transfer Suspicion', message: 'Two vessels engaged in ship-to-ship transfer 340nm from nearest port at 02:30 UTC. Both vessels below 1 knot for 3+ hours in open ocean.' },
  { title: 'High Risk Zone Breach', message: 'MV Pacific Star entered Gulf of Guinea high-risk zone. Risk score elevated to 0.82 based on vessel profile, cargo type, and historical incident data.' },
  { title: 'SAR Dark Vessel Match', message: 'Sentinel-1C detected vessel at 1.23N, 49.87E with no corresponding AIS signal within 30-minute window. Classification: probable dark vessel.' },
  { title: 'Route Deviation Warning', message: 'MT Ocean Titan deviated 87nm from declared route near Strait of Malacca. Mahalanobis distance exceeds 3.2 standard deviations from historical route envelope.' },
  { title: 'Sanctions Vessel Match', message: 'Vessel matching OFAC SDN list identified: MV Dark Voyager (MMSI 351234000) detected in Caribbean waters. Flag: Togo.' },
  { title: 'Loitering Detection', message: 'DBSCAN cluster identified: 4 vessels loitering within 500m radius at 5.12N, 103.45E for 2.5+ hours. Pattern consistent with waiting for transfer.' },
  { title: 'Teleportation Spoof', message: 'Vessel MMSI 477123400 reported position jump of 1,200nm in 45 minutes (implied speed: 1,600 knots). Location: South China Sea to Bay of Bengal.' },
  { title: 'Satellite Pass Complete', message: 'Sentinel-1C pass over Gulf of Aden complete. 3 SAR scenes processed. 2 dark vessel candidates detected. Models: YOLO11s v3.2.' },
  { title: 'Periodic Risk Recalculation', message: 'All risk zone scores updated. Gulf of Guinea: 0.92 (up from 0.88). New incident data from IMB incorporated. Next scheduled: 6 hours.' },
  { title: 'Trajectory Anomaly', message: 'MAE Transformer flagged trajectory for MMSI 636091234: cosine similarity 0.12 vs known anomaly patterns. Embedding stored in pgvector for review.' },
];

export const mockAlerts: Alert[] = alertMessages.map((a, i) => ({
  id: i + 1,
  severity: i < 2 ? 'critical' : i < 5 ? 'high' : i < 8 ? 'warning' : 'info',
  title: a.title,
  message: a.message,
  isRead: i >= 5,
  relatedVesselMmsi: i < 8 ? String(randInt(200000000, 677000000)) : null,
  relatedIncidentId: i < 6 ? randInt(1, 10) : null,
  createdAt: new Date(Date.now() - i * randInt(15, 90) * 60 * 1000).toISOString(),
}));

export const mockDetections: Detection[] = Array.from({ length: 12 }, (_, i) => {
  const hotspot = pick(hotspots);
  return {
    id: i + 1,
    lat: hotspot.lat + rand(-2, 2),
    lng: hotspot.lng + rand(-2, 2),
    detectionType: pick(['vessel', 'dark_vessel', 'anomaly']),
    confidence: rand(0.65, 0.99),
    imageUrl: null,
    sceneId: `S1C_IW_GRDH_${randInt(1, 999)}_202607${randInt(10, 21)}`,
    vesselCount: randInt(1, 8),
    darkVesselCount: Math.random() < 0.4 ? randInt(1, 3) : 0,
    capturedAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000 + randInt(5, 30) * 60 * 1000).toISOString(),
  };
});

export function getIncidentSummary(): IncidentSummary {
  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const r of mockIncidents) {
    bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
    byType[r.incidentType] = (byType[r.incidentType] ?? 0) + 1;
  }
  return { total: mockIncidents.length, bySeverity, byType };
}

export function getIncidentTrend(): TrendPoint[] {
  const months: Record<string, number> = {};
  for (const r of mockIncidents) {
    const key = r.occurredAt.slice(0, 7);
    months[key] = (months[key] ?? 0) + 1;
  }
  // Fill in recent months even if no data
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    if (!months[key]) months[key] = randInt(1, 8);
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, count }));
}
