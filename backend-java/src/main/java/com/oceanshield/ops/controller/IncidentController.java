package com.oceanshield.ops.controller;

import com.oceanshield.ops.model.Incident;
import com.oceanshield.ops.model.IncidentSummary;
import com.oceanshield.ops.model.TrendPoint;
import com.oceanshield.ops.service.MaritimeDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final MaritimeDataService maritimeDataService;

    public IncidentController(MaritimeDataService maritimeDataService) {
        this.maritimeDataService = maritimeDataService;
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(maritimeDataService.getAllIncidents(severity, type));
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        Incident created = maritimeDataService.createIncident(incident);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/summary")
    public ResponseEntity<IncidentSummary> getIncidentSummary() {
        return ResponseEntity.ok(maritimeDataService.getIncidentSummary());
    }

    @GetMapping("/trend")
    public ResponseEntity<List<TrendPoint>> getIncidentTrend() {
        return ResponseEntity.ok(maritimeDataService.getIncidentTrend());
    }
}
