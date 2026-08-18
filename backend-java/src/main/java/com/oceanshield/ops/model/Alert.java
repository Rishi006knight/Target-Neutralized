package com.oceanshield.ops.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class Alert {
    private Integer id;
    private String severity; // critical, high, warning, info
    private String title;
    private String message;

    @JsonProperty("isRead")
    private Boolean isRead;

    private String relatedVesselMmsi;
    private Integer relatedIncidentId;
    private String createdAt;

    public Alert() {
        this.isRead = false;
        this.severity = "info";
        this.createdAt = Instant.now().toString();
    }

    public Alert(Integer id, String severity, String title, String message,
                 Boolean isRead, String relatedVesselMmsi, Integer relatedIncidentId, String createdAt) {
        this.id = id;
        this.severity = severity != null ? severity : "info";
        this.title = title;
        this.message = message;
        this.isRead = isRead != null ? isRead : false;
        this.relatedVesselMmsi = relatedVesselMmsi;
        this.relatedIncidentId = relatedIncidentId;
        this.createdAt = createdAt != null ? createdAt : Instant.now().toString();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getRelatedVesselMmsi() { return relatedVesselMmsi; }
    public void setRelatedVesselMmsi(String relatedVesselMmsi) { this.relatedVesselMmsi = relatedVesselMmsi; }

    public Integer getRelatedIncidentId() { return relatedIncidentId; }
    public void setRelatedIncidentId(Integer relatedIncidentId) { this.relatedIncidentId = relatedIncidentId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
