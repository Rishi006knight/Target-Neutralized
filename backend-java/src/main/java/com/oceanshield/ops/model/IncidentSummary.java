package com.oceanshield.ops.model;

import java.util.Map;

public class IncidentSummary {
    private Integer total;
    private Map<String, Integer> bySeverity;
    private Map<String, Integer> byType;

    public IncidentSummary() {}

    public IncidentSummary(Integer total, Map<String, Integer> bySeverity, Map<String, Integer> byType) {
        this.total = total;
        this.bySeverity = bySeverity;
        this.byType = byType;
    }

    // Getters and Setters
    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public Map<String, Integer> getBySeverity() { return bySeverity; }
    public void setBySeverity(Map<String, Integer> bySeverity) { this.bySeverity = bySeverity; }

    public Map<String, Integer> getByType() { return byType; }
    public void setByType(Map<String, Integer> byType) { this.byType = byType; }
}
