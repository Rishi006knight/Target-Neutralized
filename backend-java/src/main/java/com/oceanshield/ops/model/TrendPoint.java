package com.oceanshield.ops.model;

public class TrendPoint {
    private String month;
    private Integer count;

    public TrendPoint() {}

    public TrendPoint(String month, Integer count) {
        this.month = month;
        this.count = count;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }
}
