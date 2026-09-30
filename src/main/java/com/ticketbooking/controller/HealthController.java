package com.ticketbooking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;

    @Autowired
    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("application", "Real-Time Ticket & Seat Booking System");
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());

        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            status.put("database", valid ? "CONNECTED" : "UNREACHABLE");
            status.put("databaseCatalog", connection.getCatalog());
        } catch (Exception e) {
            status.put("database", "ERROR: " + e.getMessage());
        }

        return ResponseEntity.ok(status);
    }
}
