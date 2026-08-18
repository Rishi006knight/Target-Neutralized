package com.oceanshield.ops.model;

public class DashboardStats {
    private Integer vesselsWatched;
    private Integer activeIncidents;
    private Integer darkVessels24h;
    private Integer highRiskZones;
    private String lastSatellitePass;
    private Integer unreadAlerts;

    public DashboardStats() {}

    public DashboardStats(Integer vesselsWatched, Integer activeIncidents, Integer darkVessels24h,
                          Integer highRiskZones, String lastSatellitePass, Integer unreadAlerts) {
        this.vesselsWatched = vesselsWatched;
        this.activeIncidents = activeIncidents;
        this.darkVessels24h = darkVessels24h;
        this.highRiskZones = highRiskZones;
        this.lastSatellitePass = lastSatellitePass;
        this.unreadAlerts = unreadAlerts;
    }

    // Getters and Setters
    public Integer getVesselsWatched() { return vesselsWatched; }
    public void setVesselsWatched(Integer vesselsWatched) { this.vesselsWatched = vesselsWatched; }

    public Integer getActiveIncidents() { return activeIncidents; }
    public void setActiveIncidents(Integer activeIncidents) { this.activeIncidents = activeIncidents; }

    public Integer getDarkVessels24h() { return darkVessels24h; }
    public void setDarkVessels24h(Integer darkVessels24h) { this.darkVessels24h = darkVessels24h; }

    public Integer getHighRiskZones() { return highRiskZones; }
    public void setHighRiskZones(Integer highRiskZones) { this.highRiskZones = highRiskZones; }

    public String getLastSatellitePass() { return lastSatellitePass; }
    public void setLastSatellitePass(String lastSatellitePass) { this.lastSatellitePass = lastSatellitePass; }

    public Integer getUnreadAlerts() { return unreadAlerts; }
    public void setUnreadAlerts(Integer unreadAlerts) { this.unreadAlerts = unreadAlerts; }
}
