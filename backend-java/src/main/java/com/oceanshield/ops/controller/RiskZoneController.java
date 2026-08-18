package com.oceanshield.ops.controller;

import com.oceanshield.ops.model.RiskZone;
import com.oceanshield.ops.service.MaritimeDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risk-zones")
@CrossOrigin(origins = "*")
public class RiskZoneController {

    private final MaritimeDataService maritimeDataService;

    public RiskZoneController(MaritimeDataService maritimeDataService) {
        this.maritimeDataService = maritimeDataService;
    }

    @GetMapping
    public ResponseEntity<List<RiskZone>> getRiskZones() {
        return ResponseEntity.ok(maritimeDataService.getRiskZones());
    }
}
