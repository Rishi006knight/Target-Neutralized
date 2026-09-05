import { PrismaClient } from '@prisma/client';
import { seedIncidents, seedVessels, seedAlerts } from '../src/lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean database
  console.log('Cleaning existing database records...');
  await prisma.incident.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.riskZone.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.detection.deleteMany();

  // Seed vessels
  console.log(`Seeding ${seedVessels.length} vessels...`);
  for (const v of seedVessels) {
    await prisma.vessel.create({
      data: {
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
        lastSeenAt: new Date(v.lastSeenAt),
      },
    });
  }

  // Seed incidents
  console.log(`Seeding ${seedIncidents.length} incidents...`);
  for (const i of seedIncidents) {
    await prisma.incident.create({
      data: {
        lat: i.lat,
        lng: i.lng,
        incidentType: i.type,
        severity: i.severity,
        description: i.verdict,
        vesselName: i.vesselName,
        vesselType: 'Commercial Transit',
        vesselFlag: 'International',
        occurredAt: new Date(i.occurredAt),
        reportedAt: new Date(i.reportedAt),
        dataSource: i.source,
      },
    });
  }

  // Seed risk zones
  const sampleZones = [
    { name: 'Gulf of Aden (IRTC)', centerLat: 12.5, centerLng: 48.0, riskLevel: 0.92, incidentCount: 14, trend: 'stable', zoneType: 'Piracy Corridor' },
    { name: 'Gulf of Guinea (Niger Delta)', centerLat: 4.5, centerLng: 5.0, riskLevel: 0.88, incidentCount: 22, trend: 'up', zoneType: 'Armed Kidnapping Zone' },
    { name: 'Strait of Malacca & Singapore', centerLat: 3.5, centerLng: 101.5, riskLevel: 0.62, incidentCount: 9, trend: 'down', zoneType: 'Armed Robbery Corridor' },
  ];
  for (const z of sampleZones) {
    await prisma.riskZone.create({ data: z });
  }

  // Seed alerts
  for (const a of seedAlerts) {
    await prisma.alert.create({
      data: {
        severity: a.severity,
        title: a.title,
        message: a.message,
        isRead: a.isRead,
        relatedVesselMmsi: a.relatedVesselMmsi,
        relatedIncidentId: a.relatedIncidentId ? parseInt(a.relatedIncidentId.replace(/\D/g, '')) || 1 : null,
        createdAt: new Date(a.createdAt),
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
