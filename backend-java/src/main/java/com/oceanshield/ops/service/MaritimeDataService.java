package com.oceanshield.ops.service;

import com.oceanshield.ops.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class MaritimeDataService {

    private final AnomalyDetectionService anomalyDetectionService;

    private final Map<String, Vessel> vesselsMap = new ConcurrentHashMap<>();
    private final Map<Integer, Incident> incidentsMap = new ConcurrentHashMap<>();
    private final Map<Integer, Alert> alertsMap = new ConcurrentHashMap<>();
    private final List<RiskZone> riskZonesList = new ArrayList<>();
    private final List<Detection> detectionsList = new ArrayList<>();

    private final AtomicInteger incidentIdSeq = new AtomicInteger(100);
    private final AtomicInteger alertIdSeq = new AtomicInteger(100);

    public MaritimeDataService(AnomalyDetectionService anomalyDetectionService) {
        this.anomalyDetectionService = anomalyDetectionService;
    }

    @PostConstruct
    public void initSeedData() {
        // 1. Seed Global Piracy & Risk Zones (Matching AISStream corridors)
        riskZonesList.add(new RiskZone(1, "Gulf of Aden", 12.5, 48.0, 0.88, 14, "stable", "piracy", 10.0, 15.0, 43.0, 52.0));
        riskZonesList.add(new RiskZone(2, "Gulf of Guinea", 4.5, 5.0, 0.94, 22, "up", "piracy", 0.0, 7.0, 0.0, 10.0));
        riskZonesList.add(new RiskZone(3, "Strait of Malacca", 3.5, 101.5, 0.72, 9, "down", "theft", 1.0, 7.0, 98.0, 105.0));
        riskZonesList.add(new RiskZone(4, "Somali Basin", 2.5, 50.0, 0.82, 6, "stable", "piracy", -5.0, 10.0, 45.0, 55.0));
        riskZonesList.add(new RiskZone(5, "Sulu-Celebes Sea", 5.5, 121.5, 0.76, 5, "stable", "smuggling", 2.0, 9.0, 118.0, 125.0));
        riskZonesList.add(new RiskZone(6, "Caribbean Basin", 12.5, -68.0, 0.48, 3, "down", "trafficking", 8.0, 16.0, -75.0, -60.0));
        riskZonesList.add(new RiskZone(7, "South China Sea", 11.0, 114.5, 0.62, 7, "up", "disputed", 5.0, 16.0, 110.0, 120.0));
        riskZonesList.add(new RiskZone(8, "Bay of Bengal", 14.5, 87.5, 0.52, 4, "stable", "smuggling", 10.0, 20.0, 80.0, 95.0));

        // 2. Seed Monitored Vessels
        addOrUpdateVessel(new Vessel(101, "636019842", "PACIFIC HORIZON", "Cargo / Container", "Liberia", 12.84, 45.32, 16.4, 82.0, false, 0.35, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(102, "354892000", "DARK RUNNER 09", "High-Speed Skiff", "Unknown", 13.12, 46.85, 28.2, 195.0, true, 0.94, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(103, "477218300", "NORDIC VALIANT", "Crude Oil Tanker", "Hong Kong", 4.15, 5.72, 12.1, 140.0, false, 0.58, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(104, "636092144", "GULF PHANTOM", "Trawler / Mother Ship", "Unknown", 3.90, 6.20, 6.5, 310.0, true, 0.89, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(105, "563048000", "SINGAPORE STRAIT V", "Bulk Carrier", "Singapore", 3.25, 101.90, 14.8, 290.0, false, 0.22, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(106, "220459000", "DANISH PHOENIX", "Chemical Tanker", "Denmark", 11.45, 113.80, 15.2, 45.0, false, 0.31, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(107, "999014281", "UNIDENTIFIED CONTACT #41", "Unknown Fast Craft", "Unknown", 5.80, 120.45, 26.0, 110.0, true, 0.91, Instant.now().toString()));
        addOrUpdateVessel(new Vessel(108, "413204990", "ORIENT PIONEER", "Container Ship", "China", 14.20, 86.40, 17.0, 215.0, false, 0.25, Instant.now().toString()));

        // 3. Seed Maritime Incidents
        incidentsMap.put(1, new Incident(1, 12.95, 46.10, "boarding", "critical", "Armed skiff attempted boarding of bulk carrier using grappling hooks. Onboard security deterrent deployed.", "PACIFIC HORIZON", "Cargo / Container", "Liberia", Instant.now().minusSeconds(14 * 3600).toString(), Instant.now().minusSeconds(13 * 3600).toString(), "UKMTO Maritime Ingest"));
        incidentsMap.put(2, new Incident(2, 4.25, 5.95, "hijack", "critical", "Crude tanker boarded by 6 armed pirates 45nm South of Bonny. Crew secured in citadel; naval task force dispatched.", "NORDIC VALIANT", "Crude Oil Tanker", "Hong Kong", Instant.now().minusSeconds(28 * 3600).toString(), Instant.now().minusSeconds(27 * 3600).toString(), "MDAT-GoG Reporting"));
        incidentsMap.put(3, new Incident(3, 3.40, 101.45, "approach", "high", "Two unlit speedboats approached within 0.2nm of container vessel at night. Vessel accelerated to evasive speed.", "SINGAPORE STRAIT V", "Bulk Carrier", "Singapore", Instant.now().minusSeconds(48 * 3600).toString(), Instant.now().minusSeconds(47 * 3600).toString(), "ReCAAP ISC Incident Feed"));
        incidentsMap.put(4, new Incident(4, 5.65, 121.10, "ais_gap", "high", "Suspicious 3-hour transponder gap by unidentified fishing mother-vessel in known transit channel.", "UNIDENTIFIED CONTACT #41", "Unknown Fast Craft", "Unknown", Instant.now().minusSeconds(72 * 3600).toString(), Instant.now().minusSeconds(71 * 3600).toString(), "OceanShield SAR Anomaly Model"));
        incidentsMap.put(5, new Incident(5, 13.50, 48.20, "suspicious", "medium", "Dhow exhibiting abnormal loitering behavior near westbound traffic separation scheme.", "AL-MARWAH", "Dhow", "Yemen", Instant.now().minusSeconds(96 * 3600).toString(), Instant.now().minusSeconds(95 * 3600).toString(), "Maritime Domain Awareness"));

        // 4. Seed Alerts
        alertsMap.put(1, new Alert(1, "critical", "CRITICAL THREAT: Dark Vessel Intercept Vector", "High-speed dark contact DARK RUNNER 09 (28.2 kts) closing distance on PACIFIC HORIZON in Gulf of Aden.", false, "354892000", 1, Instant.now().minusSeconds(900).toString()));
        alertsMap.put(2, new Alert(2, "high", "AIS Transponder Blackout in Piracy Zone", "GULF PHANTOM deactivated AIS broadcast inside Gulf of Guinea High-Risk Area.", false, "636092144", 2, Instant.now().minusSeconds(2700).toString()));
        alertsMap.put(3, new Alert(3, "warning", "Suspicious Choke Point Loitering", "Target UNIDENTIFIED CONTACT #41 loitering at 0.8 kts inside Sulu-Celebes security corridor.", false, "999014281", null, Instant.now().minusSeconds(7200).toString()));
        alertsMap.put(4, new Alert(4, "info", "Satellite SAR Constellation Pass Complete", "Sentinel-1 SAR synthetic aperture radar scan processed. 8 maritime contacts resolved in Strait of Malacca.", true, null, null, Instant.now().minusSeconds(14400).toString()));

        // 5. Seed Detections
        detectionsList.add(new Detection(1, 12.8, 46.0, "Synthetic Aperture Radar (SAR)", 0.96, null, "S1A_IW_GRDH_1SDV_2026", 14, 3, Instant.now().minusSeconds(1800).toString(), Instant.now().minusSeconds(1600).toString()));
    }

    // --- Vessels Operations ---
    public List<Vessel> getAllVessels(Boolean isDarkOnly, String search) {
        return vesselsMap.values().stream()
            .filter(v -> isDarkOnly == null || !isDarkOnly || Boolean.TRUE.equals(v.getIsDark()))
            .filter(v -> {
                if (search == null || search.trim().isEmpty()) return true;
                String q = search.toLowerCase();
                return (v.getName() != null && v.getName().toLowerCase().contains(q)) ||
                       (v.getMmsi() != null && v.getMmsi().contains(q));
            })
            .sorted(Comparator.comparing(Vessel::getRiskScore, Comparator.nullsLast(Comparator.reverseOrder())))
            .collect(Collectors.toList());
    }

    public Vessel getVesselByMmsi(String mmsi) {
        return vesselsMap.get(mmsi);
    }

    public Vessel addOrUpdateVessel(Vessel vessel) {
        if (vessel.getMmsi() == null || vessel.getMmsi().trim().isEmpty()) {
            vessel.setMmsi("MMSI_" + System.currentTimeMillis());
        }
        if (vessel.getId() == null) {
            vessel.setId(Math.abs(vessel.getMmsi().hashCode()));
        }

        // Run Anomaly Evaluation
        var anomaly = anomalyDetectionService.evaluateVessel(vessel, riskZonesList);
        vessel.setRiskScore(anomaly.getRiskScore());

        // Check if an alert should be automatically generated
        Alert autoAlert = anomalyDetectionService.createAlertIfThreat(vessel, anomaly, alertIdSeq.incrementAndGet());
        if (autoAlert != null) {
            alertsMap.put(autoAlert.getId(), autoAlert);
        }

        vesselsMap.put(vessel.getMmsi(), vessel);
        return vessel;
    }

    // --- Incidents Operations ---
    public List<Incident> getAllIncidents(String severity, String type) {
        return incidentsMap.values().stream()
            .filter(inc -> severity == null || "all".equalsIgnoreCase(severity) || severity.equalsIgnoreCase(inc.getSeverity()))
            .filter(inc -> type == null || "all".equalsIgnoreCase(type) || type.equalsIgnoreCase(inc.getIncidentType()))
            .sorted(Comparator.comparing(Incident::getOccurredAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .collect(Collectors.toList());
    }

    public Incident createIncident(Incident incident) {
        int id = incidentIdSeq.incrementAndGet();
        incident.setId(id);
        if (incident.getOccurredAt() == null) {
            incident.setOccurredAt(Instant.now().toString());
        }
        if (incident.getReportedAt() == null) {
            incident.setReportedAt(Instant.now().toString());
        }
        incidentsMap.put(id, incident);
        return incident;
    }

    public IncidentSummary getIncidentSummary() {
        List<Incident> all = new ArrayList<>(incidentsMap.values());
        Map<String, Integer> bySeverity = new HashMap<>();
        bySeverity.put("critical", 0);
        bySeverity.put("high", 0);
        bySeverity.put("medium", 0);
        bySeverity.put("low", 0);

        Map<String, Integer> byType = new HashMap<>();

        for (Incident inc : all) {
            if (inc.getSeverity() != null) {
                bySeverity.put(inc.getSeverity(), bySeverity.getOrDefault(inc.getSeverity(), 0) + 1);
            }
            if (inc.getIncidentType() != null) {
                byType.put(inc.getIncidentType(), byType.getOrDefault(inc.getIncidentType(), 0) + 1);
            }
        }
        return new IncidentSummary(all.size(), bySeverity, byType);
    }

    public List<TrendPoint> getIncidentTrend() {
        Map<String, Integer> months = new TreeMap<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = 5; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            months.put(d.format(fmt), 0);
        }

        // Add base counts
        List<String> keys = new ArrayList<>(months.keySet());
        if (keys.size() >= 6) {
            months.put(keys.get(0), 3);
            months.put(keys.get(1), 5);
            months.put(keys.get(2), 4);
            months.put(keys.get(3), 7);
            months.put(keys.get(4), 6);
            months.put(keys.get(5), 8);
        }

        return months.entrySet().stream()
            .map(e -> new TrendPoint(e.getKey(), e.getValue()))
            .collect(Collectors.toList());
    }

    // --- Alerts Operations ---
    public List<Alert> getAllAlerts(Integer limit) {
        int max = limit != null && limit > 0 ? limit : 50;
        return alertsMap.values().stream()
            .sorted((a, b) -> {
                // Priority by critical > high > warning > info, then newest
                int prioA = getSeverityOrder(a.getSeverity());
                int prioB = getSeverityOrder(b.getSeverity());
                if (prioA != prioB) return Integer.compare(prioA, prioB);
                return String.valueOf(b.getCreatedAt()).compareTo(String.valueOf(a.getCreatedAt()));
            })
            .limit(max)
            .collect(Collectors.toList());
    }

    private int getSeverityOrder(String severity) {
        if (severity == null) return 99;
        return switch (severity.toLowerCase()) {
            case "critical" -> 0;
            case "high" -> 1;
            case "warning" -> 2;
            default -> 3;
        };
    }

    public Alert markAlertRead(int id) {
        Alert alert = alertsMap.get(id);
        if (alert != null) {
            alert.setIsRead(true);
        }
        return alert;
    }

    // --- Risk Zones Operations ---
    public List<RiskZone> getRiskZones() {
        return Collections.unmodifiableList(riskZonesList);
    }

    // --- Detections Operations ---
    public List<Detection> getDetections() {
        return Collections.unmodifiableList(detectionsList);
    }

    // --- Dashboard Stats ---
    public DashboardStats getDashboardStats() {
        int vesselsWatched = vesselsMap.size();
        int activeIncidents = (int) incidentsMap.values().stream()
            .filter(i -> "critical".equalsIgnoreCase(i.getSeverity()) || "high".equalsIgnoreCase(i.getSeverity()))
            .count();

        int darkVessels24h = (int) vesselsMap.values().stream()
            .filter(v -> Boolean.TRUE.equals(v.getIsDark()))
            .count();

        int highRiskZones = (int) riskZonesList.stream()
            .filter(rz -> rz.getRiskLevel() != null && rz.getRiskLevel() >= 0.7)
            .count();

        String lastSatellitePass = detectionsList.isEmpty()
            ? Instant.now().minusSeconds(240).toString()
            : detectionsList.get(0).getCapturedAt();

        int unreadAlerts = (int) alertsMap.values().stream()
            .filter(a -> !Boolean.TRUE.equals(a.getIsRead()))
            .count();

        return new DashboardStats(vesselsWatched, activeIncidents, darkVessels24h, highRiskZones, lastSatellitePass, unreadAlerts);
    }
}
