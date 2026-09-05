// ═══════════════════════════════════════════════════
// OCEANSHIELD 2.0 — ABYSSAL DATA MODEL & SEED
// ═══════════════════════════════════════════════════

// ── Source Enums ──
export type IncidentSource = 'UKMTO' | 'ReCAAP' | 'MDAT-GoG' | 'EU NAVFOR';
export type IncidentType = 'APPROACH' | 'BOARDING' | 'HIJACK ATTEMPT' | 'DARK TRANSFER' | 'SOS';
export type Severity = 'critical' | 'high' | 'elevated' | 'medium' | 'low';
export type VesselStatus = 'ACTIVE' | 'DARK' | 'ANCHORED';

// ── Incident ──
export interface TimelineEvent {
  time: string;  // UTC mono display
  label: string; // max 6 words
}

export interface RiskFactor {
  label: string;
  value: number; // 0–100
}

export interface AbyssalIncident {
  id: string;
  lat: number;
  lng: number;
  type: IncidentType;
  severity: Severity;
  source: IncidentSource;
  verdict: string; // ≤20 words, plain language
  confidence: number; // 0–100
  vesselName: string | null;
  occurredAt: string; // ISO
  reportedAt: string; // ISO
  timeline: TimelineEvent[];
  linkedVessels: string[]; // MMSIs
  riskFactors: RiskFactor[];
  clusterId: string | null;
}

// ── Vessel ──
export interface AbyssalVessel {
  id: number;
  mmsi: string;
  name: string;
  type: string;
  flag: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: VesselStatus;
  riskScore: number; // 0–1
  lastPingAge: number; // seconds since last AIS ping
  lastSeenAt: string; // ISO
}

// ── Threat Window ──
export interface ThreatWindow {
  id: string;
  region: string;
  score: number; // 0–100
  peakUtc: string;
  peakIn: string; // countdown display e.g. "4H 22M"
  category: string;
}

// ── Cluster ──
export interface IncidentCluster {
  id: string;
  label: string;
  incidentIds: string[];
  linkScore: number; // 0–1
  centroid: { lat: number; lng: number };
}

// ── Alert ──
export interface AbyssalAlert {
  id: string;
  severity: Severity;
  title: string;
  message: string;
  isRead: boolean;
  relatedIncidentId: string | null;
  relatedVesselMmsi: string | null;
  createdAt: string;
}

// ═══════════════════════════════════════════════════
// SEED DATA — 24 INCIDENTS
// ═══════════════════════════════════════════════════

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600_000).toISOString();
const m = (mins: number) => new Date(now - mins * 60_000).toISOString();
const fwd = (hours: number) => new Date(now + hours * 3600_000).toISOString();

export const seedIncidents: AbyssalIncident[] = [
  // ── Gulf of Aden / IRTC ──
  {
    id: 'INC-001', lat: 12.88, lng: 45.12, type: 'APPROACH', severity: 'critical',
    source: 'UKMTO', confidence: 94,
    verdict: 'Two armed skiffs closed within 0.3nm. Security team deterred attack.',
    vesselName: 'MT ARABIAN STAR', occurredAt: h(2), reportedAt: h(1.9),
    timeline: [
      { time: '10:42 UTC', label: 'Radar contact — 2 fast targets' },
      { time: '10:48 UTC', label: 'Skiffs enter 0.5nm perimeter' },
      { time: '10:52 UTC', label: 'Warning flares fired' },
      { time: '11:00 UTC', label: 'Assailants disengage east' },
    ],
    linkedVessels: ['538006842', '999841201'],
    riskFactors: [
      { label: 'Proximity', value: 96 },
      { label: 'Speed differential', value: 88 },
      { label: 'Weapon indicators', value: 72 },
      { label: 'Pattern match', value: 91 },
    ],
    clusterId: 'CLU-01',
  },
  {
    id: 'INC-002', lat: 13.15, lng: 46.80, type: 'APPROACH', severity: 'high',
    source: 'EU NAVFOR', confidence: 82,
    verdict: 'Single skiff probed container vessel. Aborted on approach of naval patrol.',
    vesselName: 'MSC ANNA', occurredAt: h(6), reportedAt: h(5.5),
    timeline: [
      { time: '07:20 UTC', label: 'Single fast target on AIS' },
      { time: '07:32 UTC', label: 'Skiff altered course to intercept' },
      { time: '07:45 UTC', label: 'EU NAVFOR helo dispatched' },
      { time: '07:52 UTC', label: 'Skiff broke off contact' },
    ],
    linkedVessels: ['636015993'],
    riskFactors: [
      { label: 'Proximity', value: 68 },
      { label: 'Speed differential', value: 74 },
      { label: 'Pattern match', value: 80 },
    ],
    clusterId: 'CLU-01',
  },
  {
    id: 'INC-003', lat: 14.20, lng: 52.40, type: 'HIJACK ATTEMPT', severity: 'critical',
    source: 'EU NAVFOR', confidence: 91,
    verdict: 'Fishing dhow hijacked. Suspected conversion to mother ship.',
    vesselName: 'AL-MERAJ 1', occurredAt: h(28), reportedAt: h(26),
    timeline: [
      { time: '14:00 UTC', label: 'Distress beacon transmitted' },
      { time: '14:02 UTC', label: 'AIS transponder blackout' },
      { time: '16:00 UTC', label: 'SAR satellite confirms tow' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Hijack confidence', value: 91 },
      { label: 'AIS blackout duration', value: 95 },
      { label: 'Mother-ship pattern', value: 87 },
    ],
    clusterId: 'CLU-01',
  },
  {
    id: 'INC-004', lat: 12.42, lng: 44.65, type: 'APPROACH', severity: 'elevated',
    source: 'UKMTO', confidence: 68,
    verdict: 'Whaler-type craft shadowed tanker for 40 minutes before retreating.',
    vesselName: 'STENA SUPREME', occurredAt: h(14), reportedAt: h(13),
    timeline: [
      { time: '23:10 UTC', label: 'Visual contact port quarter' },
      { time: '23:50 UTC', label: 'Craft retreated south' },
    ],
    linkedVessels: ['538009001'],
    riskFactors: [
      { label: 'Proximity', value: 52 },
      { label: 'Loiter duration', value: 65 },
    ],
    clusterId: null,
  },
  {
    id: 'INC-005', lat: 13.60, lng: 48.90, type: 'SOS', severity: 'critical',
    source: 'UKMTO', confidence: 97,
    verdict: 'Bulk carrier under active attack. Armed boarding in progress.',
    vesselName: 'GOLDEN ATLAS', occurredAt: m(35), reportedAt: m(30),
    timeline: [
      { time: '13:47 UTC', label: 'SOS beacon activated' },
      { time: '13:50 UTC', label: 'Master reports armed men onboard' },
      { time: '13:55 UTC', label: 'Crew retreating to citadel' },
    ],
    linkedVessels: ['538009050'],
    riskFactors: [
      { label: 'Weapon confirmed', value: 98 },
      { label: 'Boarding success', value: 90 },
      { label: 'Crew at risk', value: 95 },
    ],
    clusterId: 'CLU-01',
  },

  // ── Gulf of Guinea / Niger Delta ──
  {
    id: 'INC-006', lat: 4.15, lng: 6.28, type: 'BOARDING', severity: 'critical',
    source: 'MDAT-GoG', confidence: 96,
    verdict: 'Pirates boarded anchored carrier. 21 crew sealed in citadel.',
    vesselName: 'MV BONNY CARRIER', occurredAt: h(7), reportedAt: h(6.8),
    timeline: [
      { time: '05:15 UTC', label: 'Boarding alarm sounded' },
      { time: '05:18 UTC', label: 'Citadel locked — crew secure' },
      { time: '06:30 UTC', label: 'Nigerian Navy intercepts' },
    ],
    linkedVessels: ['636098112'],
    riskFactors: [
      { label: 'Boarding success', value: 96 },
      { label: 'Weapon indicators', value: 88 },
      { label: 'Crew exposure', value: 42 },
    ],
    clusterId: 'CLU-02',
  },
  {
    id: 'INC-007', lat: 3.50, lng: 7.10, type: 'DARK TRANSFER', severity: 'high',
    source: 'MDAT-GoG', confidence: 89,
    verdict: 'AIS dark for 18h during unauthorized STS crude transfer.',
    vesselName: 'ST. NIKOLAS II', occurredAt: h(42), reportedAt: h(40),
    timeline: [
      { time: '00:00 UTC', label: 'Last AIS position received' },
      { time: '18:00 UTC', label: 'SAR confirms STS rendezvous' },
    ],
    linkedVessels: ['636098112', '477312900'],
    riskFactors: [
      { label: 'AIS blackout duration', value: 92 },
      { label: 'STS pattern', value: 86 },
      { label: 'Sanctioned zone', value: 78 },
    ],
    clusterId: 'CLU-02',
  },
  {
    id: 'INC-008', lat: 4.82, lng: 5.44, type: 'APPROACH', severity: 'high',
    source: 'MDAT-GoG', confidence: 76,
    verdict: 'Three speedboats circled product tanker at anchorage.',
    vesselName: 'DELTA SPIRIT', occurredAt: h(18), reportedAt: h(17),
    timeline: [
      { time: '18:40 UTC', label: 'Three contacts bearing 220°' },
      { time: '19:05 UTC', label: 'Boats circled at 200m' },
      { time: '19:20 UTC', label: 'Departed after spotlight' },
    ],
    linkedVessels: ['477312900'],
    riskFactors: [
      { label: 'Multiple craft', value: 82 },
      { label: 'Circling pattern', value: 74 },
    ],
    clusterId: 'CLU-02',
  },
  {
    id: 'INC-009', lat: 5.20, lng: 3.88, type: 'BOARDING', severity: 'critical',
    source: 'MDAT-GoG', confidence: 93,
    verdict: 'Armed gang boarded tanker. 4 crew kidnapped for ransom.',
    vesselName: 'MINERVA HELEN', occurredAt: h(52), reportedAt: h(50),
    timeline: [
      { time: '02:15 UTC', label: 'Armed intruders via stern' },
      { time: '02:30 UTC', label: '4 crew seized from bridge' },
      { time: '03:00 UTC', label: 'Attackers departed in speedboat' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Crew kidnapped', value: 98 },
      { label: 'Weapon confirmed', value: 95 },
      { label: 'Ransom pattern', value: 90 },
    ],
    clusterId: 'CLU-02',
  },
  {
    id: 'INC-010', lat: 6.05, lng: 4.22, type: 'APPROACH', severity: 'elevated',
    source: 'MDAT-GoG', confidence: 61,
    verdict: 'Unlit craft approached LNG carrier at dusk. Fire hoses activated.',
    vesselName: 'GAS AGILITY', occurredAt: h(30), reportedAt: h(29),
    timeline: [
      { time: '17:45 UTC', label: 'Unlit craft detected on radar' },
      { time: '18:00 UTC', label: 'Fire hoses deployed' },
      { time: '18:10 UTC', label: 'Craft retreated' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Night approach', value: 72 },
      { label: 'Unlit craft', value: 68 },
    ],
    clusterId: null,
  },

  // ── Singapore/Malacca Strait / Phillip Channel ──
  {
    id: 'INC-011', lat: 1.25, lng: 103.75, type: 'BOARDING', severity: 'medium',
    source: 'ReCAAP', confidence: 78,
    verdict: 'Crew stores robbed from anchored container vessel overnight.',
    vesselName: 'PACIFIC HORIZON', occurredAt: h(14), reportedAt: h(13),
    timeline: [
      { time: '22:10 UTC', label: 'Unauthorized personnel spotted' },
      { time: '22:35 UTC', label: 'Intruders fled when alarm raised' },
    ],
    linkedVessels: ['563110200'],
    riskFactors: [
      { label: 'Anchorage vulnerability', value: 65 },
      { label: 'Night timing', value: 58 },
    ],
    clusterId: 'CLU-03',
  },
  {
    id: 'INC-012', lat: 1.18, lng: 103.52, type: 'BOARDING', severity: 'medium',
    source: 'ReCAAP', confidence: 72,
    verdict: 'Engine spare parts stolen from bulk carrier during transit.',
    vesselName: 'OCEAN PIONEER', occurredAt: h(36), reportedAt: h(34),
    timeline: [
      { time: '01:30 UTC', label: 'Sampan alongside port quarter' },
      { time: '01:55 UTC', label: 'Engine room breach detected' },
      { time: '02:10 UTC', label: 'Perpetrators departed' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Low speed vulnerability', value: 70 },
      { label: 'TSS night pattern', value: 74 },
    ],
    clusterId: 'CLU-03',
  },
  {
    id: 'INC-013', lat: 1.42, lng: 104.10, type: 'APPROACH', severity: 'low',
    source: 'ReCAAP', confidence: 55,
    verdict: 'Fishing craft deviated toward tanker. Likely curiosity, not hostile.',
    vesselName: 'HAFNIA PHOENIX', occurredAt: h(48), reportedAt: h(46),
    timeline: [
      { time: '14:20 UTC', label: 'Fishing craft altered course' },
      { time: '14:35 UTC', label: 'Craft resumed original heading' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Course deviation', value: 40 },
    ],
    clusterId: null,
  },
  {
    id: 'INC-014', lat: 2.85, lng: 101.20, type: 'BOARDING', severity: 'high',
    source: 'ReCAAP', confidence: 84,
    verdict: 'Armed men boarded tug in Malacca Strait. Cash and valuables stolen.',
    vesselName: 'TB MEGA POWER', occurredAt: h(56), reportedAt: h(55),
    timeline: [
      { time: '18:30 UTC', label: 'Armed boarding from wooden craft' },
      { time: '18:45 UTC', label: 'Valuables seized from bridge' },
      { time: '19:15 UTC', label: 'Coast guard escort arrived' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Armed perpetrators', value: 85 },
      { label: 'Slow vessel', value: 72 },
    ],
    clusterId: 'CLU-03',
  },

  // ── Strait of Hormuz ──
  {
    id: 'INC-015', lat: 26.55, lng: 56.20, type: 'APPROACH', severity: 'high',
    source: 'UKMTO', confidence: 79,
    verdict: 'IRGCN fast boats approached tanker convoy in Hormuz TSS.',
    vesselName: 'NORDIC ZENITH', occurredAt: h(10), reportedAt: h(9),
    timeline: [
      { time: '08:15 UTC', label: '4 IRGCN boats detected' },
      { time: '08:22 UTC', label: 'Boats paralleled convoy at 500m' },
      { time: '08:40 UTC', label: 'Boats departed north' },
    ],
    linkedVessels: ['538009020'],
    riskFactors: [
      { label: 'State actor', value: 82 },
      { label: 'Multiple craft', value: 76 },
      { label: 'Convoy proximity', value: 70 },
    ],
    clusterId: null,
  },
  {
    id: 'INC-016', lat: 26.10, lng: 56.65, type: 'DARK TRANSFER', severity: 'high',
    source: 'UKMTO', confidence: 85,
    verdict: 'Tanker went dark for 6 hours inside Hormuz. Suspected sanctions evasion.',
    vesselName: 'SUEZ RAJAN', occurredAt: h(20), reportedAt: h(18),
    timeline: [
      { time: '22:00 UTC', label: 'AIS signal lost' },
      { time: '04:00 UTC', label: 'AIS restored 40nm east' },
    ],
    linkedVessels: ['538009030'],
    riskFactors: [
      { label: 'AIS blackout', value: 88 },
      { label: 'Sanctions zone', value: 82 },
      { label: 'Position jump', value: 75 },
    ],
    clusterId: 'CLU-04',
  },

  // ── Sulu Sea ──
  {
    id: 'INC-017', lat: 5.60, lng: 119.30, type: 'HIJACK ATTEMPT', severity: 'high',
    source: 'ReCAAP', confidence: 80,
    verdict: 'ASG-linked group attempted to board cargo vessel. Repelled by crew.',
    vesselName: 'DONA RAMONA', occurredAt: h(72), reportedAt: h(70),
    timeline: [
      { time: '03:00 UTC', label: 'Speedboat approach from Jolo' },
      { time: '03:15 UTC', label: 'Boarding attempt on stern' },
      { time: '03:25 UTC', label: 'Crew used fire hoses' },
      { time: '03:30 UTC', label: 'Attackers withdrew' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'ASG attribution', value: 78 },
      { label: 'Weapon indicators', value: 70 },
    ],
    clusterId: null,
  },

  // ── Red Sea / Bab-el-Mandeb ──
  {
    id: 'INC-018', lat: 13.42, lng: 42.65, type: 'APPROACH', severity: 'critical',
    source: 'UKMTO', confidence: 92,
    verdict: 'Missile-capable drone boat approached container vessel. USV threat.',
    vesselName: 'MSC PALATIUM', occurredAt: h(4), reportedAt: h(3.5),
    timeline: [
      { time: '09:10 UTC', label: 'USV detected on radar' },
      { time: '09:18 UTC', label: 'Evasive maneuver initiated' },
      { time: '09:25 UTC', label: 'USV lost contact 2nm aft' },
    ],
    linkedVessels: ['636015993'],
    riskFactors: [
      { label: 'USV threat', value: 94 },
      { label: 'Missile capable', value: 88 },
      { label: 'Houthi pattern', value: 92 },
    ],
    clusterId: null,
  },
  {
    id: 'INC-019', lat: 12.90, lng: 43.20, type: 'SOS', severity: 'critical',
    source: 'UKMTO', confidence: 98,
    verdict: 'Bulk carrier struck by drone. Fire in engine room. Crew evacuating.',
    vesselName: 'TRUE CONFIDENCE', occurredAt: h(1), reportedAt: m(50),
    timeline: [
      { time: '12:30 UTC', label: 'Impact reported on port side' },
      { time: '12:33 UTC', label: 'Engine room fire confirmed' },
      { time: '12:40 UTC', label: 'Abandon ship order given' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Strike confirmed', value: 99 },
      { label: 'Fire severity', value: 92 },
      { label: 'Crew at risk', value: 96 },
    ],
    clusterId: null,
  },

  // ── Bay of Bengal ──
  {
    id: 'INC-020', lat: 21.80, lng: 91.50, type: 'BOARDING', severity: 'low',
    source: 'ReCAAP', confidence: 60,
    verdict: 'Petty theft at Chittagong anchorage. Mooring ropes and paint stolen.',
    vesselName: 'BANGLAR SHOURAB', occurredAt: h(96), reportedAt: h(94),
    timeline: [
      { time: '23:45 UTC', label: 'Unauthorized boat alongside' },
      { time: '00:15 UTC', label: 'Items missing from stores' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Anchorage theft', value: 45 },
    ],
    clusterId: null,
  },

  // ── Additional Gulf of Aden ──
  {
    id: 'INC-021', lat: 11.95, lng: 44.10, type: 'APPROACH', severity: 'elevated',
    source: 'EU NAVFOR', confidence: 71,
    verdict: 'Dhow with unusual deck activity observed near IRTC lane.',
    vesselName: null, occurredAt: h(8), reportedAt: h(7),
    timeline: [
      { time: '04:30 UTC', label: 'Maritime patrol aircraft spotted' },
      { time: '05:00 UTC', label: 'Dhow altered course west' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Deck activity', value: 62 },
      { label: 'IRTC proximity', value: 58 },
    ],
    clusterId: 'CLU-01',
  },
  {
    id: 'INC-022', lat: 12.30, lng: 47.55, type: 'BOARDING', severity: 'critical',
    source: 'UKMTO', confidence: 95,
    verdict: 'Armed pirates boarded chemical tanker. Crew in citadel. Navy en route.',
    vesselName: 'MARLIN LUANDA', occurredAt: h(3), reportedAt: h(2.5),
    timeline: [
      { time: '10:15 UTC', label: 'Armed boarding via ladder' },
      { time: '10:20 UTC', label: 'Crew activated citadel' },
      { time: '10:45 UTC', label: 'Naval assets dispatched' },
    ],
    linkedVessels: ['538006842'],
    riskFactors: [
      { label: 'Armed boarding', value: 95 },
      { label: 'Citadel active', value: 80 },
      { label: 'Navy response', value: 60 },
    ],
    clusterId: 'CLU-01',
  },

  // ── Niger Delta additional ──
  {
    id: 'INC-023', lat: 3.90, lng: 6.90, type: 'DARK TRANSFER', severity: 'high',
    source: 'MDAT-GoG', confidence: 87,
    verdict: 'Two tankers conducting STS in restricted waters. Both AIS intermittent.',
    vesselName: 'LADY NOUR', occurredAt: h(16), reportedAt: h(14),
    timeline: [
      { time: '20:00 UTC', label: 'AIS intermittent on both vessels' },
      { time: '22:00 UTC', label: 'Satellite confirms rafted transfer' },
    ],
    linkedVessels: ['636098112'],
    riskFactors: [
      { label: 'STS pattern', value: 88 },
      { label: 'AIS manipulation', value: 84 },
      { label: 'Restricted waters', value: 76 },
    ],
    clusterId: 'CLU-02',
  },
  {
    id: 'INC-024', lat: 4.50, lng: 5.80, type: 'SOS', severity: 'critical',
    source: 'MDAT-GoG', confidence: 94,
    verdict: 'Product tanker adrift after engine sabotage. 6 crew missing.',
    vesselName: 'ANUKET AMBER', occurredAt: h(5), reportedAt: h(4.5),
    timeline: [
      { time: '08:00 UTC', label: 'SOS received from MMSI' },
      { time: '08:15 UTC', label: 'Engine room flooded' },
      { time: '08:45 UTC', label: '6 crew unaccounted for' },
    ],
    linkedVessels: [],
    riskFactors: [
      { label: 'Crew missing', value: 96 },
      { label: 'Engine sabotage', value: 88 },
      { label: 'Adrift in shipping lane', value: 82 },
    ],
    clusterId: 'CLU-02',
  },
];

// ═══════════════════════════════════════════════════
// SEED DATA — 48 VESSELS
// ═══════════════════════════════════════════════════

export const seedVessels: AbyssalVessel[] = [
  // Gulf of Aden region
  { id: 1, mmsi: '538006842', name: 'MAERSK KALAMATA', type: 'Container Ship', flag: 'MHL', lat: 12.65, lng: 44.80, speed: 18.2, heading: 85, status: 'ACTIVE', riskScore: 0.28, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 2, mmsi: '636015993', name: 'MSC ANNA', type: 'Container Ship', flag: 'LBR', lat: 13.05, lng: 47.10, speed: 19.5, heading: 90, status: 'ACTIVE', riskScore: 0.32, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 3, mmsi: '999841201', name: 'SKIFF ALPHA', type: 'Fast Attack Craft', flag: 'UNK', lat: 12.92, lng: 45.45, speed: 29.4, heading: 175, status: 'DARK', riskScore: 0.96, lastPingAge: 2700, lastSeenAt: m(45) },
  { id: 4, mmsi: '538009001', name: 'STENA SUPREME', type: 'Crude Oil Tanker', flag: 'MHL', lat: 12.42, lng: 44.65, speed: 14.8, heading: 78, status: 'ACTIVE', riskScore: 0.38, lastPingAge: 90, lastSeenAt: m(1.5) },
  { id: 5, mmsi: '538009050', name: 'GOLDEN ATLAS', type: 'Bulk Carrier', flag: 'MHL', lat: 13.60, lng: 48.90, speed: 0, heading: 0, status: 'ANCHORED', riskScore: 0.85, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 6, mmsi: '538009060', name: 'MARLIN LUANDA', type: 'Chemical Tanker', flag: 'MHL', lat: 12.30, lng: 47.55, speed: 0.2, heading: 120, status: 'ACTIVE', riskScore: 0.78, lastPingAge: 150, lastSeenAt: m(2.5) },
  { id: 7, mmsi: '211009001', name: 'HAMBURG SUD EXPRESS', type: 'Container Ship', flag: 'DEU', lat: 12.10, lng: 43.50, speed: 17.0, heading: 82, status: 'ACTIVE', riskScore: 0.22, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 8, mmsi: '353009001', name: 'YANGTZE HARMONY', type: 'Bulk Carrier', flag: 'PAN', lat: 13.80, lng: 49.20, speed: 13.5, heading: 95, status: 'ACTIVE', riskScore: 0.30, lastPingAge: 240, lastSeenAt: m(4) },

  // Gulf of Guinea
  { id: 9, mmsi: '477312900', name: 'COSCO SHIPPING PLANET', type: 'Container Ship', flag: 'HKG', lat: 4.80, lng: 5.20, speed: 15.6, heading: 135, status: 'ACTIVE', riskScore: 0.52, lastPingAge: 480, lastSeenAt: m(8) },
  { id: 10, mmsi: '636098112', name: 'DELTA TANKER 03', type: 'Bunkering Vessel', flag: 'NGA', lat: 4.10, lng: 6.45, speed: 0, heading: 270, status: 'DARK', riskScore: 0.88, lastPingAge: 4320, lastSeenAt: h(1.2) },
  { id: 11, mmsi: '636098200', name: 'MV BONNY CARRIER', type: 'Bulk Carrier', flag: 'PAN', lat: 4.15, lng: 6.28, speed: 0, heading: 180, status: 'ANCHORED', riskScore: 0.72, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 12, mmsi: '636098300', name: 'ST. NIKOLAS II', type: 'Chemical Tanker', flag: 'MLT', lat: 3.50, lng: 7.10, speed: 2.1, heading: 220, status: 'ACTIVE', riskScore: 0.68, lastPingAge: 300, lastSeenAt: m(5) },
  { id: 13, mmsi: '636098400', name: 'MINERVA HELEN', type: 'Product Tanker', flag: 'GRC', lat: 5.20, lng: 3.88, speed: 12.0, heading: 180, status: 'ACTIVE', riskScore: 0.55, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 14, mmsi: '636098500', name: 'LADY NOUR', type: 'Oil Tanker', flag: 'CMR', lat: 3.90, lng: 6.90, speed: 0.5, heading: 90, status: 'DARK', riskScore: 0.82, lastPingAge: 1800, lastSeenAt: m(30) },
  { id: 15, mmsi: '636098600', name: 'ANUKET AMBER', type: 'Product Tanker', flag: 'LBR', lat: 4.50, lng: 5.80, speed: 0, heading: 0, status: 'ANCHORED', riskScore: 0.90, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 16, mmsi: '636098700', name: 'GAS AGILITY', type: 'LNG Carrier', flag: 'MHL', lat: 6.05, lng: 4.22, speed: 16.5, heading: 240, status: 'ACTIVE', riskScore: 0.35, lastPingAge: 90, lastSeenAt: m(1.5) },

  // Singapore / Malacca Strait
  { id: 17, mmsi: '563110200', name: 'EVER GLORY', type: 'Container Ship', flag: 'SGP', lat: 2.95, lng: 102.30, speed: 16.8, heading: 315, status: 'ACTIVE', riskScore: 0.20, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 18, mmsi: '563110300', name: 'PACIFIC HORIZON', type: 'Container Ship', flag: 'SGP', lat: 1.25, lng: 103.75, speed: 11.2, heading: 80, status: 'ACTIVE', riskScore: 0.35, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 19, mmsi: '563110400', name: 'OCEAN PIONEER', type: 'Bulk Carrier', flag: 'SGP', lat: 1.18, lng: 103.52, speed: 8.5, heading: 270, status: 'ACTIVE', riskScore: 0.40, lastPingAge: 240, lastSeenAt: m(4) },
  { id: 20, mmsi: '563110500', name: 'HAFNIA PHOENIX', type: 'Product Tanker', flag: 'SGP', lat: 1.42, lng: 104.10, speed: 14.0, heading: 45, status: 'ACTIVE', riskScore: 0.18, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 21, mmsi: '357220199', name: 'PANAMA TRADER IX', type: 'General Cargo', flag: 'PAN', lat: 2.40, lng: 101.80, speed: 13.4, heading: 55, status: 'ACTIVE', riskScore: 0.25, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 22, mmsi: '563110600', name: 'TB MEGA POWER', type: 'Tug', flag: 'IDN', lat: 2.85, lng: 101.20, speed: 6.0, heading: 190, status: 'ACTIVE', riskScore: 0.45, lastPingAge: 300, lastSeenAt: m(5) },

  // Hormuz
  { id: 23, mmsi: '538009020', name: 'NORDIC ZENITH', type: 'VLCC Tanker', flag: 'MHL', lat: 26.55, lng: 56.20, speed: 12.5, heading: 120, status: 'ACTIVE', riskScore: 0.48, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 24, mmsi: '538009030', name: 'SUEZ RAJAN', type: 'Suezmax Tanker', flag: 'MHL', lat: 26.10, lng: 56.65, speed: 0, heading: 0, status: 'DARK', riskScore: 0.80, lastPingAge: 21600, lastSeenAt: h(6) },
  { id: 25, mmsi: '538009040', name: 'FRONT ALTAIR', type: 'Product Tanker', flag: 'MHL', lat: 25.90, lng: 57.10, speed: 14.2, heading: 90, status: 'ACTIVE', riskScore: 0.30, lastPingAge: 60, lastSeenAt: m(1) },

  // Red Sea / Bab-el-Mandeb
  { id: 26, mmsi: '636020001', name: 'MSC PALATIUM', type: 'Container Ship', flag: 'LBR', lat: 13.42, lng: 42.65, speed: 18.0, heading: 160, status: 'ACTIVE', riskScore: 0.62, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 27, mmsi: '636020002', name: 'TRUE CONFIDENCE', type: 'Bulk Carrier', flag: 'LBR', lat: 12.90, lng: 43.20, speed: 0, heading: 0, status: 'ANCHORED', riskScore: 0.95, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 28, mmsi: '636020003', name: 'GALAXY LEADER', type: 'Car Carrier', flag: 'LBR', lat: 14.10, lng: 42.90, speed: 15.5, heading: 145, status: 'ACTIVE', riskScore: 0.55, lastPingAge: 180, lastSeenAt: m(3) },

  // Sulu Sea
  { id: 29, mmsi: '548020001', name: 'DONA RAMONA', type: 'General Cargo', flag: 'PHL', lat: 5.60, lng: 119.30, speed: 10.0, heading: 220, status: 'ACTIVE', riskScore: 0.42, lastPingAge: 240, lastSeenAt: m(4) },
  { id: 30, mmsi: '548020002', name: 'MV KUDOS 1', type: 'General Cargo', flag: 'PHL', lat: 6.20, lng: 118.90, speed: 8.5, heading: 180, status: 'ACTIVE', riskScore: 0.35, lastPingAge: 180, lastSeenAt: m(3) },

  // Bay of Bengal
  { id: 31, mmsi: '405020001', name: 'BANGLAR SHOURAB', type: 'Bulk Carrier', flag: 'BGD', lat: 21.80, lng: 91.50, speed: 0, heading: 0, status: 'ANCHORED', riskScore: 0.15, lastPingAge: 120, lastSeenAt: m(2) },

  // Somali Basin
  { id: 32, mmsi: '211281610', name: 'HAMBURG EXPRESS', type: 'Container Ship', flag: 'DEU', lat: -2.40, lng: 48.60, speed: 17.4, heading: 200, status: 'ACTIVE', riskScore: 0.44, lastPingAge: 600, lastSeenAt: m(10) },
  { id: 33, mmsi: '211281620', name: 'VICTORIA MAERSK', type: 'Container Ship', flag: 'DNK', lat: -1.20, lng: 50.40, speed: 19.0, heading: 210, status: 'ACTIVE', riskScore: 0.30, lastPingAge: 120, lastSeenAt: m(2) },

  // Additional trade route vessels
  { id: 34, mmsi: '538030001', name: 'CAPE MANILA', type: 'Bulk Carrier', flag: 'MHL', lat: 10.20, lng: 45.00, speed: 14.0, heading: 90, status: 'ACTIVE', riskScore: 0.25, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 35, mmsi: '538030002', name: 'NORD SATURN', type: 'Oil Tanker', flag: 'MHL', lat: 11.50, lng: 43.80, speed: 13.0, heading: 75, status: 'ACTIVE', riskScore: 0.32, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 36, mmsi: '538030003', name: 'NISSOS SCHINOUSSA', type: 'Crude Tanker', flag: 'GRC', lat: 13.20, lng: 50.10, speed: 12.5, heading: 100, status: 'ACTIVE', riskScore: 0.28, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 37, mmsi: '538030004', name: 'TORM HELLERUP', type: 'Product Tanker', flag: 'DNK', lat: 4.60, lng: 4.90, speed: 14.5, heading: 160, status: 'ACTIVE', riskScore: 0.38, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 38, mmsi: '538030005', name: 'BW RHINE', type: 'LPG Carrier', flag: 'SGP', lat: 25.40, lng: 55.80, speed: 16.0, heading: 130, status: 'ACTIVE', riskScore: 0.22, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 39, mmsi: '538030006', name: 'PACIFIC ANNA', type: 'Container Ship', flag: 'HKG', lat: 1.80, lng: 103.20, speed: 15.0, heading: 290, status: 'ACTIVE', riskScore: 0.18, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 40, mmsi: '538030007', name: 'OCEAN TRADER', type: 'General Cargo', flag: 'PAN', lat: 5.40, lng: 120.10, speed: 11.0, heading: 200, status: 'ACTIVE', riskScore: 0.20, lastPingAge: 240, lastSeenAt: m(4) },
  { id: 41, mmsi: '538030008', name: 'THORCO CROWN', type: 'Heavy Lift', flag: 'DNK', lat: 14.50, lng: 42.30, speed: 10.5, heading: 155, status: 'ACTIVE', riskScore: 0.48, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 42, mmsi: '538030009', name: 'STAR CENTURION', type: 'Bulk Carrier', flag: 'MHL', lat: 3.20, lng: 5.50, speed: 12.0, heading: 110, status: 'ACTIVE', riskScore: 0.42, lastPingAge: 300, lastSeenAt: m(5) },
  { id: 43, mmsi: '538030010', name: 'MARITIME CHAMPION', type: 'VLCC Tanker', flag: 'LBR', lat: 26.80, lng: 56.50, speed: 11.5, heading: 140, status: 'ACTIVE', riskScore: 0.34, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 44, mmsi: '538030011', name: 'ALPINE PERSEVERANCE', type: 'LNG Carrier', flag: 'MHL', lat: 12.80, lng: 43.10, speed: 17.0, heading: 85, status: 'ACTIVE', riskScore: 0.40, lastPingAge: 180, lastSeenAt: m(3) },
  { id: 45, mmsi: '538030012', name: 'NAVIOS POLLUX', type: 'Container Ship', flag: 'PAN', lat: -3.10, lng: 49.80, speed: 18.5, heading: 190, status: 'ACTIVE', riskScore: 0.26, lastPingAge: 60, lastSeenAt: m(1) },
  { id: 46, mmsi: '538030013', name: 'EAGLE KINABALU', type: 'Chemical Tanker', flag: 'SGP', lat: 2.60, lng: 102.60, speed: 13.0, heading: 310, status: 'ACTIVE', riskScore: 0.22, lastPingAge: 120, lastSeenAt: m(2) },
  { id: 47, mmsi: '538030014', name: 'BERGE KIBO', type: 'Ore Carrier', flag: 'NOR', lat: 4.00, lng: 6.10, speed: 14.0, heading: 160, status: 'ACTIVE', riskScore: 0.36, lastPingAge: 240, lastSeenAt: m(4) },
  { id: 48, mmsi: '538030015', name: 'SILVERSTONE EXPRESS', type: 'Car Carrier', flag: 'JPN', lat: 13.50, lng: 43.60, speed: 16.0, heading: 90, status: 'ACTIVE', riskScore: 0.50, lastPingAge: 180, lastSeenAt: m(3) },
];

// ═══════════════════════════════════════════════════
// SEED DATA — THREAT WINDOWS
// ═══════════════════════════════════════════════════

export const seedThreatWindows: ThreatWindow[] = [
  { id: 'TW-01', region: 'Gulf of Aden IRTC', score: 88, peakUtc: fwd(4), peakIn: '4H 12M', category: 'Skiff Swarm' },
  { id: 'TW-02', region: 'Niger Delta', score: 91, peakUtc: fwd(2), peakIn: '2H 05M', category: 'Anchorage Boarding' },
  { id: 'TW-03', region: 'Phillip Channel', score: 65, peakUtc: fwd(8), peakIn: '8H 30M', category: 'Night Stealing' },
  { id: 'TW-04', region: 'Strait of Hormuz', score: 72, peakUtc: fwd(6), peakIn: '6H 18M', category: 'State Actor' },
  { id: 'TW-05', region: 'Malacca Strait', score: 58, peakUtc: fwd(10), peakIn: '10H 44M', category: 'Armed Robbery' },
];

// ═══════════════════════════════════════════════════
// SEED DATA — CLUSTERS
// ═══════════════════════════════════════════════════

export const seedClusters: IncidentCluster[] = [
  {
    id: 'CLU-01', label: 'Mother-Ship Dispersion',
    incidentIds: ['INC-001', 'INC-002', 'INC-003', 'INC-005', 'INC-021', 'INC-022'],
    linkScore: 0.94, centroid: { lat: 13.10, lng: 46.50 },
  },
  {
    id: 'CLU-02', label: 'Niger Delta STS Ring',
    incidentIds: ['INC-006', 'INC-007', 'INC-008', 'INC-009', 'INC-023', 'INC-024'],
    linkScore: 0.89, centroid: { lat: 4.35, lng: 5.90 },
  },
  {
    id: 'CLU-03', label: 'Strait Night Swarm',
    incidentIds: ['INC-011', 'INC-012', 'INC-014'],
    linkScore: 0.82, centroid: { lat: 1.75, lng: 103.00 },
  },
  {
    id: 'CLU-04', label: 'Hormuz Sanctions Evasion',
    incidentIds: ['INC-016'],
    linkScore: 0.78, centroid: { lat: 26.30, lng: 56.40 },
  },
];

// ═══════════════════════════════════════════════════
// SEED DATA — ALERTS
// ═══════════════════════════════════════════════════

export const seedAlerts: AbyssalAlert[] = [
  { id: 'ALT-01', severity: 'critical', title: 'ACTIVE SOS — TRUE CONFIDENCE', message: 'Drone strike confirmed. Crew evacuating.', isRead: false, relatedIncidentId: 'INC-019', relatedVesselMmsi: '636020002', createdAt: m(50) },
  { id: 'ALT-02', severity: 'critical', title: 'ARMED BOARDING — GOLDEN ATLAS', message: 'Armed men onboard. Crew in citadel.', isRead: false, relatedIncidentId: 'INC-005', relatedVesselMmsi: '538009050', createdAt: m(30) },
  { id: 'ALT-03', severity: 'critical', title: 'CREW KIDNAPPED — ANUKET AMBER', message: '6 crew missing after engine sabotage.', isRead: false, relatedIncidentId: 'INC-024', relatedVesselMmsi: '636098600', createdAt: h(4.5) },
  { id: 'ALT-04', severity: 'high', title: 'AIS DARK — DELTA TANKER 03', message: 'Transponder dark 72 minutes in high-risk zone.', isRead: false, relatedIncidentId: 'INC-007', relatedVesselMmsi: '636098112', createdAt: h(2) },
  { id: 'ALT-05', severity: 'high', title: 'USV THREAT — BAB-EL-MANDEB', message: 'Missile-capable drone boat near MSC PALATIUM.', isRead: false, relatedIncidentId: 'INC-018', relatedVesselMmsi: '636020001', createdAt: h(3.5) },
  { id: 'ALT-06', severity: 'elevated', title: 'SANCTIONS EVASION — SUEZ RAJAN', message: 'Tanker dark 6 hours inside Hormuz.', isRead: true, relatedIncidentId: 'INC-016', relatedVesselMmsi: '538009030', createdAt: h(18) },
];

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return '#F43F5E';
    case 'high': return '#F59E0B';
    case 'elevated': return '#F59E0B';
    case 'medium': return '#8B8000';
    case 'low': return '#2DD4BF';
    default: return '#5E7A8A';
  }
}

export function getSeverityLabel(severity: Severity): string {
  return severity.toUpperCase();
}

export function formatCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

export function formatUtcTime(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(11, 16) + ' UTC';
}

export function getActiveIncidentCount(): number {
  return seedIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
}

export function getDarkVesselCount(): number {
  return seedVessels.filter(v => v.status === 'DARK').length;
}

export function getGlobalThreatScore(): number {
  const criticalWeight = seedIncidents.filter(i => i.severity === 'critical').length * 15;
  const highWeight = seedIncidents.filter(i => i.severity === 'high').length * 8;
  const darkWeight = getDarkVesselCount() * 5;
  return Math.min(99, 30 + criticalWeight + highWeight + darkWeight);
}

// ═══════════════════════════════════════════════════
// BACKWARDS COMPATIBILITY TYPES & EXPORTS
// ═══════════════════════════════════════════════════

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
  isDark?: boolean;
  riskScore: number;
  lastSeenAt: string;
}

export interface Incident {
  id: number | string;
  lat: number;
  lng: number;
  incidentType?: string;
  type?: string;
  severity: string;
  description?: string;
  verdict?: string;
  vesselName?: string | null;
  vesselType?: string;
  vesselFlag?: string;
  occurredAt?: string;
  reportedAt?: string;
  dataSource?: string;
  source?: string;
  confidence?: number;
  timeline?: any[];
  linkedVessels?: string[];
  riskFactors?: any[];
}

export interface Alert {
  id: number | string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  vesselMmsi?: string | null;
  incidentId?: number | string | null;
  createdAt: string;
}

export interface RiskZone {
  id: number;
  name: string;
  lat: number;
  lng: number;
  riskLevel: number;
  incidentCount24h: number;
  trend: string;
  threatType: string;
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
}

export interface SatellitePass {
  id: string;
  name: string;
  sensor: string;
  orbitEta: string;
  footprintLat: number;
  footprintLng: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: string;
  enabled: boolean;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  eventType: string;
}

export interface DashboardStats {
  vesselsWatched: number;
  activeIncidents: number;
  darkVessels24h: number;
  highRiskZones: number;
  lastSatellitePass: string;
  unreadAlerts: number;
}

export interface IncidentSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TrendPoint {
  date: string;
  incidents: number;
}

export const mockVessels: Vessel[] = seedVessels.map(v => ({
  id: v.id,
  mmsi: v.mmsi,
  name: v.name,
  type: v.type,
  flag: v.flag,
  lat: v.lat,
  lng: v.lng,
  speed: v.speed,
  heading: v.heading,
  isDark: v.status === 'DARK',
  riskScore: v.riskScore,
  lastSeenAt: v.lastSeenAt,
}));

export const mockIncidents: Incident[] = seedIncidents.map((i, idx) => ({
  id: i.id,
  lat: i.lat,
  lng: i.lng,
  incidentType: i.type,
  type: i.type,
  severity: i.severity,
  description: i.verdict,
  verdict: i.verdict,
  vesselName: i.vesselName,
  occurredAt: i.occurredAt,
  reportedAt: i.reportedAt,
  dataSource: i.source,
  source: i.source,
  confidence: i.confidence,
  timeline: i.timeline,
  linkedVessels: i.linkedVessels,
  riskFactors: i.riskFactors,
}));

export const mockAlerts: Alert[] = seedAlerts.map((a, idx) => ({
  id: a.id,
  severity: a.severity,
  title: a.title,
  message: a.message,
  isRead: a.isRead,
  vesselMmsi: a.relatedVesselMmsi,
  incidentId: a.relatedIncidentId,
  createdAt: a.createdAt,
}));

export const mockRiskZones: RiskZone[] = [
  { id: 1, name: 'Gulf of Aden (IRTC)', lat: 12.5, lng: 48.0, riskLevel: 0.92, incidentCount24h: 14, trend: 'stable', threatType: 'Piracy Corridor' },
  { id: 2, name: 'Gulf of Guinea (Niger Delta)', lat: 4.5, lng: 5.0, riskLevel: 0.88, incidentCount24h: 22, trend: 'up', threatType: 'Armed Kidnapping Zone' },
  { id: 3, name: 'Strait of Malacca & Singapore', lat: 3.5, lng: 101.5, riskLevel: 0.62, incidentCount24h: 9, trend: 'down', threatType: 'Armed Robbery Corridor' },
  { id: 4, name: 'Somali Basin & East Coast', lat: 2.5, lng: 50.0, riskLevel: 0.84, incidentCount24h: 6, trend: 'stable', threatType: 'Mother-Ship Range' },
  { id: 5, name: 'Southern Red Sea & Bab-el-Mandeb', lat: 14.0, lng: 42.5, riskLevel: 0.95, incidentCount24h: 18, trend: 'up', threatType: 'Direct Kinetic Attack Zone' },
  { id: 6, name: 'Strait of Hormuz', lat: 26.2, lng: 56.5, riskLevel: 0.72, incidentCount24h: 8, trend: 'stable', threatType: 'State Actor Zone' },
];

export const mockDefaultAlertRules: AlertRule[] = [
  { id: 'R-1', name: 'Dark Transponder in High Risk Zone', description: 'Trigger alert when vessel disables AIS transponder in designated risk corridor.', condition: 'isDark == true && zoneRisk >= 0.7', severity: 'critical', enabled: true },
  { id: 'R-2', name: 'High Speed Intercept Vector', description: 'Alert when craft speed exceeds 24 knots within 5nm of commercial vessels.', condition: 'speed >= 24 && distanceToTarget <= 5', severity: 'critical', enabled: true },
  { id: 'R-3', name: 'Abnormal Loitering at Choke Point', description: 'Alert when non-anchored vessel speed drops below 1 knot inside transit lanes.', condition: 'speed < 1.0 && inTrafficLane == true', severity: 'warning', enabled: true },
];

export const mockSatellitePasses: SatellitePass[] = [
  { id: 'SAT-01', name: 'Sentinel-1A (SAR C-Band)', sensor: 'Synthetic Aperture Radar', orbitEta: '14 MIN', footprintLat: 12.8, footprintLng: 46.2 },
  { id: 'SAT-02', name: 'PlanetScope SkySat-12', sensor: 'High-Res Optical Multi-Spectral', orbitEta: '42 MIN', footprintLat: 4.4, footprintLng: 5.8 },
  { id: 'SAT-03', name: 'TerraSAR-X X-Band', sensor: 'Radar StripMap', orbitEta: '1H 15M', footprintLat: 3.2, footprintLng: 101.8 },
];

export const mockDetections = [
  { id: 1, lat: 12.8, lng: 46.0, detectionType: 'Synthetic Aperture Radar (SAR)', confidence: 0.96, vesselId: null, satelliteSource: 'Sentinel-1 SAR C-Band', passNumber: 14, unidentifiedVesselCount: 3, capturedAt: new Date(Date.now() - 1800 * 1000).toISOString(), processedAt: new Date(Date.now() - 1600 * 1000).toISOString() },
];

export const mockStats: DashboardStats = {
  vesselsWatched: seedVessels.length,
  activeIncidents: getActiveIncidentCount(),
  darkVessels24h: getDarkVesselCount(),
  highRiskZones: 6,
  lastSatellitePass: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  unreadAlerts: seedAlerts.filter(a => !a.isRead).length,
};

export function getIncidentSummary(incidents: Incident[] = mockIncidents): IncidentSummary {
  return {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    high: incidents.filter(i => i.severity === 'high').length,
    medium: incidents.filter(i => i.severity === 'medium' || i.severity === 'elevated').length,
    low: incidents.filter(i => i.severity === 'low').length,
  };
}

export function getIncidentTrend(incidents: Incident[] = mockIncidents): TrendPoint[] {
  const dates = ['08/30', '08/31', '09/01', '09/02', '09/03', '09/04', '09/05'];
  return dates.map((date, idx) => ({
    date,
    incidents: 2 + (idx * 3) % 7,
  }));
}
