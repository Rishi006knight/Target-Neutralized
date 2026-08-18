package com.oceanshield.ops.controller;

import com.oceanshield.ops.model.Detection;
import com.oceanshield.ops.service.MaritimeDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detections")
@CrossOrigin(origins = "*")
public class DetectionController {

    private final MaritimeDataService maritimeDataService;

    public DetectionController(MaritimeDataService maritimeDataService) {
        this.maritimeDataService = maritimeDataService;
    }

    @GetMapping
    public ResponseEntity<List<Detection>> getDetections() {
        return ResponseEntity.ok(maritimeDataService.getDetections());
    }
}
