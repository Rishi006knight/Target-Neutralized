package com.oceanshield.ops.model;

import java.time.Instant;

public class Detection {
    private Integer id;
    private Double lat;
    private Double lng;
    private String detectionType;
    private Double confidence;
    private String imageUrl;
    private String sceneId;
    private Integer vesselCount;
    private Integer darkVesselCount;
    private String capturedAt;
    private String createdAt;

    public Detection() {
        this.capturedAt = Instant.now().toString();
        this.createdAt = Instant.now().toString();
    }

    public Detection(Integer id, Double lat, Double lng, String detectionType, Double confidence,
                     String imageUrl, String sceneId, Integer vesselCount, Integer darkVesselCount,
                     String capturedAt, String createdAt) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.detectionType = detectionType;
        this.confidence = confidence;
        this.imageUrl = imageUrl;
        this.sceneId = sceneId;
        this.vesselCount = vesselCount;
        this.darkVesselCount = darkVesselCount;
        this.capturedAt = capturedAt != null ? capturedAt : Instant.now().toString();
        this.createdAt = createdAt != null ? createdAt : Instant.now().toString();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getDetectionType() { return detectionType; }
    public void setDetectionType(String detectionType) { this.detectionType = detectionType; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getSceneId() { return sceneId; }
    public void setSceneId(String sceneId) { this.sceneId = sceneId; }

    public Integer getVesselCount() { return vesselCount; }
    public void setVesselCount(Integer vesselCount) { this.vesselCount = vesselCount; }

    public Integer getDarkVesselCount() { return darkVesselCount; }
    public void setDarkVesselCount(Integer darkVesselCount) { this.darkVesselCount = darkVesselCount; }

    public String getCapturedAt() { return capturedAt; }
    public void setCapturedAt(String capturedAt) { this.capturedAt = capturedAt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
