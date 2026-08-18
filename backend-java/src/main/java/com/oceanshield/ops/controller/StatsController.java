package com.oceanshield.ops.controller;

import com.oceanshield.ops.model.DashboardStats;
import com.oceanshield.ops.service.MaritimeDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final MaritimeDataService maritimeDataService;

    public StatsController(MaritimeDataService maritimeDataService) {
        this.maritimeDataService = maritimeDataService;
    }

    @GetMapping
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(maritimeDataService.getDashboardStats());
    }
}
