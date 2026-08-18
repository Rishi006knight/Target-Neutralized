package com.oceanshield.ops.service;

import com.oceanshield.ops.model.Alert;
import com.oceanshield.ops.model.RiskZone;
import com.oceanshield.ops.model.Vessel;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AnomalyDetectionService {

    public static class AnomalyResult {
        private String anomalyType;
        private String severity;
        private double riskScore;
        private String message;

        public AnomalyResult(String anomalyType, String severity, double riskScore, String message) {
            this.anomalyType = anomalyType;
            this.severity = severity;
            this.riskScore = riskScore;
            this.message = message;
        }

        public String getAnomalyType() { return anomalyType; }
        public String getSeverity() { return severity; }
        public double getRiskScore() { return riskScore; }
        public String getMessage() { return message; }
    }

    /**
     * Calculates distance between coordinates in Kilometers using Haversine formula
     */
    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Checks if coordinates fall within any active risk zone bounding box
     */
    public RiskZone findMatchingRiskZone(double lat, double lng, List<RiskZone> riskZones) {
        if (riskZones == null) return null;
        for (RiskZone rz : riskZones) {
            if (rz.getLatMin() != null && rz.getLatMax() != null &&
                rz.getLngMin() != null && rz.getLngMax() != null) {
                if (lat >= rz.getLatMin() && lat <= rz.getLatMax() &&
                    lng >= rz.getLngMin() && lng <= rz.getLngMax()) {
                    return rz;
                }
            }
        }
        return null;
    }

    /**
     * Analyzes vessel telemetry and computes a dynamic risk score and threat classification
     */
    public AnomalyResult evaluateVessel(Vessel vessel, List<RiskZone> riskZones) {
        if (vessel == null || vessel.getLat() == null || vessel.getLng() == null) {
            return new AnomalyResult("normal", "info", 0.05, "Normal transit.");
        }

        RiskZone zone = findMatchingRiskZone(vessel.getLat(), vessel.getLng(), riskZones);
        double riskScore = 0.05;
        String anomalyType = "normal";
        String severity = "info";
        String message = "Vessel " + vessel.getName() + " [MMSI: " + vessel.getMmsi() + "] operating within normal bounds.";

        // 1. Dark Vessel Detection
        if (Boolean.TRUE.equals(vessel.getIsDark())) {
            riskScore += 0.45;
            anomalyType = "ais_gap";
            severity = "high";
            message = "Transponder Blackout: " + vessel.getName() + " dropped AIS transmission in monitored waters.";
        }

        // 2. High-Risk Piracy Corridor Transit
        if (zone != null) {
            riskScore += (zone.getRiskLevel() != null ? zone.getRiskLevel() : 0.5) * 0.4;
            if ("normal".equals(anomalyType)) {
                anomalyType = "hotspot_entry";
                severity = (zone.getRiskLevel() != null && zone.getRiskLevel() > 0.8) ? "high" : "warning";
                message = "High-Risk Zone Transit: " + vessel.getName() + " entered " + zone.getName() + " (" + zone.getZoneType().toUpperCase() + ").";
            } else if (Boolean.TRUE.equals(vessel.getIsDark())) {
                severity = "critical";
                message = "CRITICAL THREAT: Dark vessel " + vessel.getName() + " maneuvering inside " + zone.getName() + ". Possible interception posture.";
                riskScore = Math.min(0.98, riskScore + 0.35);
            }
        }

        // 3. Speed / Intercept Profile
        double speed = vessel.getSpeed() != null ? vessel.getSpeed() : 0.0;
        if (speed > 24.0) {
            if (zone != null || Boolean.TRUE.equals(vessel.getIsDark())) {
                riskScore = Math.min(0.95, riskScore + 0.3);
                anomalyType = "high_speed_approach";
                severity = "critical";
                message = "High-Speed Intercept Profile: " + vessel.getName() + " moving at " + String.format("%.1f", speed) + " kts in " + (zone != null ? zone.getName() : "security corridor") + ".";
            }
        } else if (speed < 1.0 && zone != null && !Boolean.TRUE.equals(vessel.getIsDark())) {
            riskScore = Math.min(0.85, riskScore + 0.25);
            anomalyType = "loitering";
            severity = "warning";
            message = "Vessel Loitering: " + vessel.getName() + " stationary/drifting (" + String.format("%.1f", speed) + " kts) in " + zone.getName() + ".";
        }

        riskScore = Math.min(1.0, Math.max(0.05, Math.round(riskScore * 100.0) / 100.0));
        return new AnomalyResult(anomalyType, severity, riskScore, message);
    }

    /**
     * Converts a high-risk anomaly into an actionable Alert object
     */
    public Alert createAlertIfThreat(Vessel vessel, AnomalyResult anomaly, int alertId) {
        if ("normal".equals(anomaly.getAnomalyType()) || anomaly.getRiskScore() < 0.40) {
            return null;
        }

        String title = switch (anomaly.getAnomalyType()) {
            case "ais_gap" -> "AIS Transponder Gap Detected";
            case "high_speed_approach" -> "High-Speed Intercept Warning";
            case "loitering" -> "Suspicious Choke Point Loitering";
            default -> "Hazard Zone Entry Alert";
        };

        return new Alert(
            alertId,
            anomaly.getSeverity(),
            title,
            anomaly.getMessage(),
            false,
            vessel.getMmsi(),
            null,
            Instant.now().toString()
        );
    }
}
