package com.oceanshield.ops.controller;

import com.oceanshield.ops.model.Alert;
import com.oceanshield.ops.service.MaritimeDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    private final MaritimeDataService maritimeDataService;

    public AlertController(MaritimeDataService maritimeDataService) {
        this.maritimeDataService = maritimeDataService;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts(@RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(maritimeDataService.getAllAlerts(limit));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Alert> markAlertReadPath(@PathVariable Integer id) {
        Alert alert = maritimeDataService.markAlertRead(id);
        if (alert == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(alert);
    }

    // Support PATCH /api/alerts?id=... for Next.js client compatibility
    @PatchMapping
    public ResponseEntity<Alert> markAlertReadQuery(@RequestParam Integer id) {
        Alert alert = maritimeDataService.markAlertRead(id);
        if (alert == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(alert);
    }
}
