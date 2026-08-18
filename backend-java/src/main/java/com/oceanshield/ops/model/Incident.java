package com.oceanshield.ops.model;

import java.time.Instant;

public class Incident {
    private Integer id;
    private Double lat;
    private Double lng;
    private String incidentType; // boarding, hijack, approach, ais_gap, suspicious
    private String severity;     // critical, high, medium, low
    private String description;
    private String vesselName;
    private String vesselType;
    private String vesselFlag;
    private String occurredAt;
    private String reportedAt;
    private String dataSource;

    public Incident() {
        this.occurredAt = Instant.now().toString();
        this.reportedAt = Instant.now().toString();
        this.severity = "medium";
        this.incidentType = "suspicious";
        this.dataSource = "Manual Report";
    }

    public Incident(Integer id, Double lat, Double lng, String incidentType, String severity,
                    String description, String vesselName, String vesselType, String vesselFlag,
                    String occurredAt, String reportedAt, String dataSource) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.incidentType = incidentType;
        this.severity = severity;
        this.description = description;
        this.vesselName = vesselName;
        this.vesselType = vesselType;
        this.vesselFlag = vesselFlag;
        this.occurredAt = occurredAt != null ? occurredAt : Instant.now().toString();
        this.reportedAt = reportedAt != null ? reportedAt : Instant.now().toString();
        this.dataSource = dataSource != null ? dataSource : "Maritime Domain Awareness";
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String incidentType) { this.incidentType = incidentType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVesselName() { return vesselName; }
    public void setVesselName(String vesselName) { this.vesselName = vesselName; }

    public String getVesselType() { return vesselType; }
    public void setVesselType(String vesselType) { this.vesselType = vesselType; }

    public String getVesselFlag() { return vesselFlag; }
    public void setVesselFlag(String vesselFlag) { this.vesselFlag = vesselFlag; }

    public String getOccurredAt() { return occurredAt; }
    public void setOccurredAt(String occurredAt) { this.occurredAt = occurredAt; }

    public String getReportedAt() { return reportedAt; }
    public void setReportedAt(String reportedAt) { this.reportedAt = reportedAt; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
}
