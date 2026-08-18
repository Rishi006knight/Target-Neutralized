package com.oceanshield.ops.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class Vessel {
    private Integer id;
    private String mmsi;
    private String name;
    private String type;
    private String flag;
    private Double lat;
    private Double lng;
    private Double speed;
    private Double heading;

    @JsonProperty("isDark")
    private Boolean isDark;

    private Double riskScore;
    private String lastSeenAt;

    public Vessel() {
        this.lastSeenAt = Instant.now().toString();
        this.isDark = false;
        this.riskScore = 0.1;
    }

    public Vessel(Integer id, String mmsi, String name, String type, String flag,
                  Double lat, Double lng, Double speed, Double heading,
                  Boolean isDark, Double riskScore, String lastSeenAt) {
        this.id = id;
        this.mmsi = mmsi;
        this.name = name;
        this.type = type;
        this.flag = flag;
        this.lat = lat;
        this.lng = lng;
        this.speed = speed;
        this.heading = heading;
        this.isDark = isDark != null ? isDark : false;
        this.riskScore = riskScore != null ? riskScore : 0.1;
        this.lastSeenAt = lastSeenAt != null ? lastSeenAt : Instant.now().toString();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getMmsi() { return mmsi; }
    public void setMmsi(String mmsi) { this.mmsi = mmsi; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFlag() { return flag; }
    public void setFlag(String flag) { this.flag = flag; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Double getSpeed() { return speed; }
    public void setSpeed(Double speed) { this.speed = speed; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public Boolean getIsDark() { return isDark; }
    public void setIsDark(Boolean isDark) { this.isDark = isDark; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public String getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(String lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}
