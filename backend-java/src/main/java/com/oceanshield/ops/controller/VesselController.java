package com.oceanshield.ops.controller;

import com.oceanshield.ops.model.Vessel;
import com.oceanshield.ops.service.MaritimeDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vessels")
@CrossOrigin(origins = "*")
public class VesselController {

    private final MaritimeDataService maritimeDataService;

    public VesselController(MaritimeDataService maritimeDataService) {
        this.maritimeDataService = maritimeDataService;
    }

    @GetMapping
    public ResponseEntity<List<Vessel>> getAllVessels(
            @RequestParam(required = false) Boolean isDark,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(maritimeDataService.getAllVessels(isDark, search));
    }

    @GetMapping("/{mmsi}")
    public ResponseEntity<Vessel> getVesselByMmsi(@PathVariable String mmsi) {
        Vessel vessel = maritimeDataService.getVesselByMmsi(mmsi);
        if (vessel == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vessel);
    }

    @PostMapping("/telemetry")
    public ResponseEntity<Vessel> ingestTelemetry(@RequestBody Vessel vessel) {
        Vessel updated = maritimeDataService.addOrUpdateVessel(vessel);
        return ResponseEntity.ok(updated);
    }
}
