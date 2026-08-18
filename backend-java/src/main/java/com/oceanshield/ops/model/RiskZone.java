package com.oceanshield.ops.model;

public class RiskZone {
    private Integer id;
    private String name;
    private Double centerLat;
    private Double centerLng;
    private Double riskLevel;
    private Integer incidentCount;
    private String trend; // up, down, stable
    private String zoneType; // piracy, theft, smuggling, trafficking, disputed
    private Double latMin;
    private Double latMax;
    private Double lngMin;
    private Double lngMax;

    public RiskZone() {}

    public RiskZone(Integer id, String name, Double centerLat, Double centerLng,
                    Double riskLevel, Integer incidentCount, String trend, String zoneType,
                    Double latMin, Double latMax, Double lngMin, Double lngMax) {
        this.id = id;
        this.name = name;
        this.centerLat = centerLat;
        this.centerLng = centerLng;
        this.riskLevel = riskLevel;
        this.incidentCount = incidentCount != null ? incidentCount : 0;
        this.trend = trend != null ? trend : "stable";
        this.zoneType = zoneType != null ? zoneType : "piracy";
        this.latMin = latMin;
        this.latMax = latMax;
        this.lngMin = lngMin;
        this.lngMax = lngMax;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getCenterLat() { return centerLat; }
    public void setCenterLat(Double centerLat) { this.centerLat = centerLat; }

    public Double getCenterLng() { return centerLng; }
    public void setCenterLng(Double centerLng) { this.centerLng = centerLng; }

    public Double getRiskLevel() { return riskLevel; }
    public void setRiskLevel(Double riskLevel) { this.riskLevel = riskLevel; }

    public Integer getIncidentCount() { return incidentCount; }
    public void setIncidentCount(Integer incidentCount) { this.incidentCount = incidentCount; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public String getZoneType() { return zoneType; }
    public void setZoneType(String zoneType) { this.zoneType = zoneType; }

    public Double getLatMin() { return latMin; }
    public void setLatMin(Double latMin) { this.latMin = latMin; }

    public Double getLatMax() { return latMax; }
    public void setLatMax(Double latMax) { this.latMax = latMax; }

    public Double getLngMin() { return lngMin; }
    public void setLngMin(Double lngMin) { this.lngMin = lngMin; }

    public Double getLngMax() { return lngMax; }
    public void setLngMax(Double lngMax) { this.lngMax = lngMax; }
}
