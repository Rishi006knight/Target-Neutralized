import { PrismaClient } from '@prisma/client';
import { mockIncidents, mockVessels, mockRiskZones, mockAlerts, mockDetections } from '../src/lib/mock-data';

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
  console.log(`Seeding ${mockVessels.length} vessels...`);
  for (const v of mockVessels) {
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
        isDark: v.isDark,
        riskScore: v.riskScore,
        lastSeenAt: new Date(v.lastSeenAt),
      },
    });
  }

  // Seed incidents
  console.log(`Seeding ${mockIncidents.length} incidents...`);
  for (const i of mockIncidents) {
    await prisma.incident.create({
      data: {
        lat: i.lat,
        lng: i.lng,
        incidentType: i.incidentType,
        severity: i.severity,
        description: i.description,
        vesselName: i.vesselName,
        vesselType: i.vesselType,
        vesselFlag: i.vesselFlag,
        occurredAt: new Date(i.occurredAt),
        reportedAt: new Date(i.reportedAt),
        dataSource: i.dataSource,
      },
    });
  }

  // Seed risk zones
  console.log(`Seeding ${mockRiskZones.length} risk zones...`);
  for (const z of mockRiskZones) {
    await prisma.riskZone.create({
      data: {
        name: z.name,
        centerLat: z.centerLat,
        centerLng: z.centerLng,
        riskLevel: z.riskLevel,
        incidentCount: z.incidentCount,
        trend: z.trend,
        zoneType: z.zoneType,
      },
    });
  }

  // Seed alerts
  console.log(`Seeding ${mockAlerts.length} alerts...`);
  for (const a of mockAlerts) {
    await prisma.alert.create({
      data: {
        severity: a.severity,
        title: a.title,
        message: a.message,
        isRead: a.isRead,
        relatedVesselMmsi: a.relatedVesselMmsi,
        relatedIncidentId: a.relatedIncidentId,
        createdAt: new Date(a.createdAt),
      },
    });
  }

  // Seed detections
  console.log(`Seeding ${mockDetections.length} detections...`);
  for (const d of mockDetections) {
    await prisma.detection.create({
      data: {
        lat: d.lat,
        lng: d.lng,
        detectionType: d.detectionType,
        confidence: d.confidence,
        imageUrl: d.imageUrl,
        sceneId: d.sceneId,
        vesselCount: d.vesselCount,
        darkVesselCount: d.darkVesselCount,
        capturedAt: new Date(d.capturedAt),
        createdAt: new Date(d.createdAt),
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
