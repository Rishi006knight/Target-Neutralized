// Maritime types and real-time reference data definitions
// Derived from live AISStream feeds, IMO maritime corridors, and tactical operations

export interface DashboardStats {
  vesselsWatched: number;
  activeIncidents: number;
  darkVessels24h: number;
  highRiskZones: number;
  lastSatellitePass: string;
  unreadAlerts: number;
  satDetectionsCount?: number;
}

export interface IncidentEvent {
  time: string;
  title: string;
  description: string;
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
  responseStatus?: 'New' | 'Investigating' | 'Responding' | 'Resolved';
  timeline?: IncidentEvent[];
  linkedVessels?: string[];
}

export interface RoutePoint {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: string;
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
  scoreHistory?: number[];
  routeHistory?: RoutePoint[];
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
  category?: 'Critical' | 'Warning' | 'Info' | 'System';
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

export interface ThreatCorrelation {
  id: string;
  title: string;
  zone: string;
  threatSignature: string;
  confidenceScore: number;
  description: string;
  linkedIncidentIds: number[];
  linkedVesselMmsi: string[];
}

export interface PredictiveThreatWindow {
  id: string;
  zoneName: string;
  windowUtc: string;
  riskProbability: number;
  threatCategory: string;
  recommendation: string;
}

export interface SatellitePass {
  id: string;
  satelliteName: string;
  passTimeIso: string;
  countdownMinutes: number;
  coverageArea: string;
  sensorType: 'SAR Radar' | 'Optical Multispectral' | 'RF Geolocation';
  bounds: [number, number][]; // Polygon coordinates
}

export interface AlertRule {
  id: string;
  name: string;
  conditionDescription: string;
  ruleType: 'ais_gap' | 'speed_anomaly' | 'zone_entry' | 'threat_threshold';
  zoneName: string;
  thresholdValue: number;
  channel: 'In-App Dashboard' | 'Encrypted Email' | 'Tactical SMS' | 'Webhook';
  isActive: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// Seed Data
// -------------------------------------------------------------

export const mockStats: DashboardStats = {
  vesselsWatched: 48,
  activeIncidents: 6,
  darkVessels24h: 4,
  highRiskZones: 8,
  lastSatellitePass: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  unreadAlerts: 4,
  satDetectionsCount: 1204,
};

export const mockVessels: Vessel[] = [
  {
    id: 1,
    mmsi: '538006842',
    name: 'MAERSK KALAMATA',
    type: 'Container Ship',
    flag: 'Marshall Islands',
    lat: 12.65,
    lng: 44.80,
    speed: 18.2,
    heading: 85.4,
    isDark: false,
    riskScore: 0.28,
    lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    scoreHistory: [0.15, 0.18, 0.22, 0.25, 0.28],
    routeHistory: [
      { lat: 12.10, lng: 43.50, speed: 17.8, heading: 84.0, timestamp: '10:00 UTC' },
      { lat: 12.30, lng: 43.90, speed: 18.0, heading: 85.0, timestamp: '11:00 UTC' },
      { lat: 12.50, lng: 44.30, speed: 18.1, heading: 85.2, timestamp: '12:00 UTC' },
      { lat: 12.65, lng: 44.80, speed: 18.2, heading: 85.4, timestamp: '13:00 UTC' },
    ],
  },
  {
    id: 2,
    mmsi: '636015993',
    name: 'MSC ANNA',
    type: 'Ultra Large Container',
    flag: 'Liberia',
    lat: 13.05,
    lng: 47.10,
    speed: 19.5,
    heading: 90.0,
    isDark: false,
    riskScore: 0.32,
    lastSeenAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    scoreHistory: [0.20, 0.22, 0.28, 0.30, 0.32],
    routeHistory: [
      { lat: 12.80, lng: 45.90, speed: 19.0, heading: 89.0, timestamp: '09:00 UTC' },
      { lat: 12.95, lng: 46.50, speed: 19.3, heading: 90.0, timestamp: '11:00 UTC' },
      { lat: 13.05, lng: 47.10, speed: 19.5, heading: 90.0, timestamp: '13:00 UTC' },
    ],
  },
  {
    id: 3,
    mmsi: '999841201',
    name: 'GULF ATTACK SKIFF ALPHA',
    type: 'Fast Attack Skiff',
    flag: 'Unknown',
    lat: 12.92,
    lng: 45.45,
    speed: 29.4,
    heading: 175.2,
    isDark: true,
    riskScore: 0.96,
    lastSeenAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    scoreHistory: [0.60, 0.75, 0.88, 0.94, 0.96],
    routeHistory: [
      { lat: 13.40, lng: 45.30, speed: 12.0, heading: 160.0, timestamp: '11:30 UTC' },
      { lat: 13.15, lng: 45.38, speed: 22.5, heading: 170.0, timestamp: '12:00 UTC' },
      { lat: 12.92, lng: 45.45, speed: 29.4, heading: 175.2, timestamp: '12:30 UTC' },
    ],
  },
  {
    id: 4,
    mmsi: '477312900',
    name: 'COSCO SHIPPING PLANET',
    type: 'Container Ship',
    flag: 'Hong Kong',
    lat: 4.80,
    lng: 5.20,
    speed: 15.6,
    heading: 135.0,
    isDark: false,
    riskScore: 0.52,
    lastSeenAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    scoreHistory: [0.35, 0.40, 0.45, 0.50, 0.52],
    routeHistory: [
      { lat: 5.30, lng: 4.60, speed: 15.0, heading: 134.0, timestamp: '08:00 UTC' },
      { lat: 5.05, lng: 4.90, speed: 15.4, heading: 135.0, timestamp: '10:30 UTC' },
      { lat: 4.80, lng: 5.20, speed: 15.6, heading: 135.0, timestamp: '13:00 UTC' },
    ],
  },
  {
    id: 5,
    mmsi: '636098112',
    name: 'DELTA TANKER 03',
    type: 'Bunkering Vessel',
    flag: 'Nigeria',
    lat: 4.10,
    lng: 6.45,
    speed: 7.2,
    heading: 270.0,
    isDark: true,
    riskScore: 0.88,
    lastSeenAt: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
    scoreHistory: [0.50, 0.65, 0.78, 0.85, 0.88],
    routeHistory: [
      { lat: 4.20, lng: 6.90, speed: 8.0, heading: 265.0, timestamp: '09:00 UTC' },
      { lat: 4.15, lng: 6.65, speed: 7.5, heading: 268.0, timestamp: '11:00 UTC' },
      { lat: 4.10, lng: 6.45, speed: 7.2, heading: 270.0, timestamp: '12:00 UTC' },
    ],
  },
  {
    id: 6,
    mmsi: '563110200',
    name: 'EVER GLORY',
    type: 'Container Ship',
    flag: 'Singapore',
    lat: 2.95,
    lng: 102.30,
    speed: 16.8,
    heading: 315.5,
    isDark: false,
    riskScore: 0.20,
    lastSeenAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    scoreHistory: [0.18, 0.19, 0.20, 0.20, 0.20],
    routeHistory: [
      { lat: 2.50, lng: 102.80, speed: 16.5, heading: 314.0, timestamp: '09:00 UTC' },
      { lat: 2.75, lng: 102.55, speed: 16.7, heading: 315.0, timestamp: '11:00 UTC' },
      { lat: 2.95, lng: 102.30, speed: 16.8, heading: 315.5, timestamp: '13:00 UTC' },
    ],
  },
  {
    id: 7,
    mmsi: '357220199',
    name: 'PANAMA TRADER IX',
    type: 'General Cargo',
    flag: 'Panama',
    lat: 11.80,
    lng: 112.50,
    speed: 13.4,
    heading: 55.0,
    isDark: false,
    riskScore: 0.35,
    lastSeenAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    scoreHistory: [0.25, 0.28, 0.30, 0.32, 0.35],
    routeHistory: [
      { lat: 11.20, lng: 111.80, speed: 13.0, heading: 54.0, timestamp: '08:00 UTC' },
      { lat: 11.50, lng: 112.15, speed: 13.2, heading: 55.0, timestamp: '10:30 UTC' },
      { lat: 11.80, lng: 112.50, speed: 13.4, heading: 55.0, timestamp: '13:00 UTC' },
    ],
  },
  {
    id: 8,
    mmsi: '211281610',
    name: 'HAMBURG EXPRESS',
    type: 'Container Ship',
    flag: 'Germany',
    lat: -2.40,
    lng: 48.60,
    speed: 17.4,
    heading: 200.0,
    isDark: false,
    riskScore: 0.44,
    lastSeenAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    scoreHistory: [0.30, 0.34, 0.38, 0.41, 0.44],
    routeHistory: [
      { lat: -1.60, lng: 48.30, speed: 17.2, heading: 198.0, timestamp: '08:00 UTC' },
      { lat: -2.00, lng: 48.45, speed: 17.3, heading: 200.0, timestamp: '10:30 UTC' },
      { lat: -2.40, lng: 48.60, speed: 17.4, heading: 200.0, timestamp: '13:00 UTC' },
    ],
  },
];

export const mockIncidents: Incident[] = [
  {
    id: 101,
    lat: 12.88,
    lng: 45.12,
    incidentType: 'approach',
    severity: 'critical',
    description: 'Two armed high-speed skiffs approached merchant tanker within 0.3nm with ladders visible. Armed security team showed weapons; skiffs aborted.',
    vesselName: 'MT ARABIAN STAR',
    vesselType: 'Crude Oil Tanker',
    vesselFlag: 'Bahamas',
    occurredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 2 * 3600 * 1000 + 4 * 60 * 1000).toISOString(),
    dataSource: 'UKMTO Maritime Command',
    responseStatus: 'Responding',
    linkedVessels: ['538006842', '999841201'],
    timeline: [
      { time: '10:42 UTC', title: 'Visual Radar Contact', description: 'Two fast radar targets detected closing at 28 kts.' },
      { time: '10:48 UTC', title: 'Aggressive Approach', description: 'Skiffs entered 0.5nm perimeter; ladder apparatus deployed on skiff bow.' },
      { time: '10:52 UTC', title: 'Armed Deterrence', description: 'AST fired warning flares and unmasked protective armament.' },
      { time: '11:00 UTC', title: 'Assailants Disengaged', description: 'Skiffs turned east toward Somali coastal shallows.' },
    ],
  },
  {
    id: 102,
    lat: 4.15,
    lng: 6.28,
    incidentType: 'boarding',
    severity: 'critical',
    description: 'Pirates boarded anchored bulk carrier. Citadel secured by all 21 crew members. Nigerian Navy gunboat dispatched.',
    vesselName: 'MV BONNY CARRIER',
    vesselType: 'Bulk Carrier',
    vesselFlag: 'Panama',
    occurredAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 7 * 3600 * 1000 + 12 * 60 * 1000).toISOString(),
    dataSource: 'MDAT-GoG Joint Centre',
    responseStatus: 'Investigating',
    linkedVessels: ['636098112'],
    timeline: [
      { time: '05:15 UTC', title: 'Boarding Alarm Sounded', description: 'Armed intruders climbed port quarter via mooring lines.' },
      { time: '05:18 UTC', title: 'Citadel Locked', description: 'Master confirmed full crew secured inside armored citadel.' },
      { time: '06:30 UTC', title: 'Naval Interception', description: 'Nigerian Navy patrol craft reached coordinates.' },
    ],
  },
  {
    id: 103,
    lat: 1.25,
    lng: 103.75,
    incidentType: 'suspicious',
    severity: 'medium',
    description: 'Unidentified craft loitering in eastbound traffic separation scheme. Crew alerted and fire hoses pressurized.',
    vesselName: 'PACIFIC HORIZON',
    vesselType: 'Container Vessel',
    vesselFlag: 'Singapore',
    occurredAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 14 * 3600 * 1000 + 30 * 60 * 1000).toISOString(),
    dataSource: 'ReCAAP ISC Focal Point',
    responseStatus: 'Resolved',
    timeline: [
      { time: '22:10 UTC', title: 'Loitering Alert', description: 'Craft shadow tracking container vessel for 25 minutes.' },
      { time: '22:35 UTC', title: 'Target Strayed Off', description: 'Craft broke formation when searchlights engaged.' },
    ],
  },
  {
    id: 104,
    lat: 14.20,
    lng: 52.40,
    incidentType: 'hijack',
    severity: 'critical',
    description: 'Fishing dhow hijacked and suspected of being converted into a mother ship for deep offshore skiff operations.',
    vesselName: 'AL-MERAJ 1',
    vesselType: 'Fishing Vessel / Dhow',
    vesselFlag: 'Iran',
    occurredAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    dataSource: 'EU NAVFOR Atalanta',
    responseStatus: 'Responding',
    timeline: [
      { time: '14:00 UTC', title: 'Distress Beacon', description: 'Dhow transmitted hijacked code before transponder blackout.' },
      { time: '16:00 UTC', title: 'Mother-Ship Identification', description: 'SAR satellite passes spotted two trailing skiffs on tow line.' },
    ],
  },
  {
    id: 105,
    lat: 3.50,
    lng: 7.10,
    incidentType: 'ais_gap',
    severity: 'high',
    description: 'Product tanker AIS transmitter disabled for >18 hours during STS crude transfer in unauthorized offshore quadrant.',
    vesselName: 'ST. NIKOLAS II',
    vesselType: 'Chemical/Oil Tanker',
    vesselFlag: 'Malta',
    occurredAt: new Date(Date.now() - 42 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    dataSource: 'OceanShield SAR Satellite Radar',
    responseStatus: 'Investigating',
    timeline: [
      { time: '00:00 UTC', title: 'Transponder Dropout', description: 'Last AIS position report received.' },
      { time: '18:00 UTC', title: 'SAR Satellite Match', description: 'SAR radar pass identified ship-to-ship crude bunkering rendezvous.' },
    ],
  },
  {
    id: 106,
    lat: 5.60,
    lng: 119.30,
    incidentType: 'approach',
    severity: 'high',
    description: 'High-speed wooden craft chased tugboat towing barge. Tug increased speed and executed evasive zig-zag maneuver.',
    vesselName: 'TB MEGA POWER',
    vesselType: 'Tug & Barge',
    vesselFlag: 'Indonesia',
    occurredAt: new Date(Date.now() - 56 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 55 * 3600 * 1000).toISOString(),
    dataSource: 'Philippine Coast Guard',
    responseStatus: 'Resolved',
    timeline: [
      { time: '18:30 UTC', title: 'Evasive Maneuver', description: 'Tug altered course into national territorial waters.' },
      { time: '19:15 UTC', title: 'Clearance Confirmed', description: 'Coast guard escort rendezvous achieved.' },
    ],
  },
];

export const mockRiskZones: RiskZone[] = [
  {
    id: 1,
    name: 'Gulf of Aden (IRTC Corridor)',
    centerLat: 12.8,
    centerLng: 46.5,
    riskLevel: 0.92,
    incidentCount: 14,
    trend: 'up',
    zoneType: 'High-Risk Piracy Area',
  },
  {
    id: 2,
    name: 'Gulf of Guinea (Niger Delta Offshore)',
    centerLat: 4.2,
    centerLng: 5.8,
    riskLevel: 0.88,
    incidentCount: 19,
    trend: 'up',
    zoneType: 'Kidnap for Ransom Zone',
  },
  {
    id: 3,
    name: 'Strait of Malacca & Singapore',
    centerLat: 1.4,
    centerLng: 103.2,
    riskLevel: 0.62,
    incidentCount: 11,
    trend: 'stable',
    zoneType: 'Armed Robbery Corridor',
  },
  {
    id: 4,
    name: 'Somali Basin & East Coast',
    centerLat: -1.5,
    centerLng: 51.0,
    riskLevel: 0.84,
    incidentCount: 8,
    trend: 'up',
    zoneType: 'Mother-Ship Range',
  },
  {
    id: 5,
    name: 'Sulu-Celebes Sea',
    centerLat: 5.8,
    centerLng: 120.5,
    riskLevel: 0.68,
    incidentCount: 5,
    trend: 'down',
    zoneType: 'Maritime Insurgency Risk',
  },
  {
    id: 6,
    name: 'Southern Red Sea & Bab-el-Mandeb',
    centerLat: 13.8,
    centerLng: 42.8,
    riskLevel: 0.95,
    incidentCount: 22,
    trend: 'up',
    zoneType: 'Direct Kinetic Attack Zone',
  },
  {
    id: 7,
    name: 'Caribbean Sea (Venezuela Offshore)',
    centerLat: 11.5,
    centerLng: -64.2,
    riskLevel: 0.48,
    incidentCount: 4,
    trend: 'stable',
    zoneType: 'Yacht Boarding / Contraband',
  },
  {
    id: 8,
    name: 'Bay of Bengal (Chittagong Anchorage)',
    centerLat: 21.8,
    centerLng: 91.5,
    riskLevel: 0.42,
    incidentCount: 3,
    trend: 'down',
    zoneType: 'Anchorage Petty Theft',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 1,
    severity: 'critical',
    category: 'Critical',
    title: 'ATTACK RUN DETECTED — GULF OF ADEN',
    message: 'High-speed skiff (29.4 kts) on intercept course with MT ARABIAN STAR. Transponder dropped.',
    isRead: false,
    relatedVesselMmsi: '538006842',
    relatedIncidentId: 101,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    severity: 'critical',
    category: 'Critical',
    title: 'VESSEL CITADEL LOCKED — NIGERIA',
    message: 'MV BONNY CARRIER crew in citadel following armed pirate boarding. Nigerian Navy responding.',
    isRead: false,
    relatedVesselMmsi: '636098112',
    relatedIncidentId: 102,
    createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    severity: 'high',
    category: 'Warning',
    title: 'AIS GAP EXCEEDS 18 HOURS',
    message: 'Bunkering vessel DELTA TANKER 03 transponder dark in high-risk offshore sector.',
    isRead: false,
    relatedVesselMmsi: '636098112',
    relatedIncidentId: 105,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 4,
    severity: 'warning',
    category: 'Warning',
    title: 'MOTHER-SHIP PATROL DETECTED',
    message: 'SAR satellite imagery detected Iranian dhow towing 2 attack skiffs 220nm off Somalia.',
    isRead: false,
    relatedVesselMmsi: null,
    relatedIncidentId: 104,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 5,
    severity: 'info',
    category: 'System',
    title: 'SENTINEL-1A SAR OVERPASS COMPLETE',
    message: '14 Dark vessel signatures extracted and ingested into tactical radar stream.',
    isRead: true,
    relatedVesselMmsi: null,
    relatedIncidentId: null,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
];

export const mockThreatCorrelations: ThreatCorrelation[] = [
  {
    id: 'CORR-01',
    title: 'Mother-Ship Skiff Dispersion Pattern',
    zone: 'Somali Basin / Gulf of Aden',
    threatSignature: 'Dhow Towing High-Speed Attack Skiffs (2x Yamaha 75HP)',
    confidenceScore: 0.94,
    description: '3 independent approach incidents over 48h share an identical loitering mother-vessel centroid located at 13.4°N, 51.8°E.',
    linkedIncidentIds: [101, 104],
    linkedVesselMmsi: ['538006842', '999841201'],
  },
  {
    id: 'CORR-02',
    title: 'Offshore STS Bunkering Anomaly Cluster',
    zone: 'Gulf of Guinea Quadrant 4',
    threatSignature: 'Periodic AIS Dropout During Night Lunar Minimum',
    confidenceScore: 0.89,
    description: '4 vessels systematically turn off AIS transmitters upon entering the 12nm boundary of Brass Terminal between 23:00-04:00 UTC.',
    linkedIncidentIds: [102, 105],
    linkedVesselMmsi: ['636098112'],
  },
  {
    id: 'CORR-03',
    title: 'TSS Night Stealing Swarm',
    zone: 'Singapore Strait (Eastbound TSS)',
    threatSignature: 'Low-Radar-Cross-Section Wooden Sampan',
    confidenceScore: 0.82,
    description: 'Opportunistic boarding targeting slow-moving bulk vessels navigating below 12 kts near Pulau Cula.',
    linkedIncidentIds: [103],
    linkedVesselMmsi: ['563110200'],
  },
];

export const mockPredictiveThreatWindows: PredictiveThreatWindow[] = [
  {
    id: 'PRED-01',
    zoneName: 'Gulf of Aden (IRTC Corridor)',
    windowUtc: '02:00 – 06:30 UTC (Next 48h)',
    riskProbability: 0.88,
    threatCategory: 'High-Speed Skiff Swarm Attack',
    recommendation: 'Transit in convoy formation with armed security watch on port and starboard quarters.',
  },
  {
    id: 'PRED-02',
    zoneName: 'Gulf of Guinea (Niger Delta)',
    windowUtc: '23:00 – 04:00 UTC (Next 24h)',
    riskProbability: 0.91,
    threatCategory: 'Anchorage Boarding & Crew Kidnap',
    recommendation: 'Maintain minimum 25nm offshore standoff; pressurize fire hoses and test citadel communications.',
  },
  {
    id: 'PRED-03',
    zoneName: 'Strait of Malacca (Phillip Channel)',
    windowUtc: '01:00 – 04:30 UTC (Nightly)',
    riskProbability: 0.65,
    threatCategory: 'Stealth Boarding / Engine Spares Robbery',
    recommendation: 'Double bridge and stern watchmen; maintain active searchlight sweeping.',
  },
];

export const mockSatellitePasses: SatellitePass[] = [
  {
    id: 'SAT-01',
    satelliteName: 'Sentinel-1A (C-Band SAR)',
    passTimeIso: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    countdownMinutes: 18,
    coverageArea: 'Gulf of Aden & Bab-el-Mandeb',
    sensorType: 'SAR Radar',
    bounds: [[11.0, 42.0], [14.5, 42.0], [14.5, 48.0], [11.0, 48.0]],
  },
  {
    id: 'SAT-02',
    satelliteName: 'ICEYE-X14 (High-Res X-SAR)',
    passTimeIso: new Date(Date.now() + 52 * 60 * 1000).toISOString(),
    countdownMinutes: 52,
    coverageArea: 'Gulf of Guinea (Brass & Bonny)',
    sensorType: 'SAR Radar',
    bounds: [[3.0, 4.5], [6.5, 4.5], [6.5, 8.5], [3.0, 8.5]],
  },
  {
    id: 'SAT-03',
    satelliteName: 'RADARSAT-2 (Maritime Surveillance)',
    passTimeIso: new Date(Date.now() + 114 * 60 * 1000).toISOString(),
    countdownMinutes: 114,
    coverageArea: 'Somali Basin Outer Perimeter',
    sensorType: 'RF Geolocation',
    bounds: [[-4.0, 48.0], [4.0, 48.0], [4.0, 56.0], [-4.0, 56.0]],
  },
];

export const mockDefaultAlertRules: AlertRule[] = [
  {
    id: 'RULE-01',
    name: 'Dark Vessel In Gulf of Aden',
    conditionDescription: 'Trigger when any vessel stops AIS transmissions for > 60 minutes in Gulf of Aden',
    ruleType: 'ais_gap',
    zoneName: 'Gulf of Aden',
    thresholdValue: 60,
    channel: 'In-App Dashboard',
    isActive: true,
    createdAt: '2026-06-15',
  },
  {
    id: 'RULE-02',
    name: 'High-Speed Approach Alert',
    conditionDescription: 'Trigger when unmonitored contact exceeds 24.0 kts within 5nm of commercial vessel',
    ruleType: 'speed_anomaly',
    zoneName: 'Gulf of Guinea',
    thresholdValue: 24.0,
    channel: 'Tactical SMS',
    isActive: true,
    createdAt: '2026-07-02',
  },
  {
    id: 'RULE-03',
    name: 'Threat Score > 80% Threshold',
    conditionDescription: 'Trigger when ML composite threat calculation exceeds 0.80 for any tracked asset',
    ruleType: 'threat_threshold',
    zoneName: 'Global',
    thresholdValue: 80,
    channel: 'Encrypted Email',
    isActive: true,
    createdAt: '2026-07-20',
  },
];

export const mockDetections: Detection[] = [
  {
    id: 1,
    lat: 12.82,
    lng: 45.30,
    detectionType: 'SAR Dark Vessel Cluster',
    confidence: 0.94,
    imageUrl: null,
    sceneId: 'S1A_IW_GRDH_1SDV_20260818',
    vesselCount: 3,
    darkVesselCount: 2,
    capturedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// Helper Functions
export function getIncidentSummary(incidents: Incident[]): IncidentSummary {
  const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const byType: Record<string, number> = { hijack: 0, boarding: 0, approach: 0, suspicious: 0, ais_gap: 0 };

  (incidents || []).forEach((inc) => {
    bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
    byType[inc.incidentType] = (byType[inc.incidentType] || 0) + 1;
  });

  return {
    total: incidents?.length || 0,
    bySeverity,
    byType,
  };
}

export function getIncidentTrend(incidents: Incident[]): TrendPoint[] {
  const months = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
  const counts: Record<string, number> = {
    '2026-03': 3,
    '2026-04': 5,
    '2026-05': 4,
    '2026-06': 7,
    '2026-07': 6,
    '2026-08': 8,
  };

  return months.map((month) => ({ month, count: counts[month] || 0 }));
}
