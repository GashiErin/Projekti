package com.example.depo.controller;

import com.example.depo.dto.TransportRequest;
import com.example.depo.entity.Order;
import com.example.depo.entity.Transport;
import com.example.depo.service.TransportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') || hasRole('TRANSPORT')")
    public ResponseEntity<List<Transport>> getAllTransports() {
        List<Transport> transports = transportService.getAllTransports();
        return ResponseEntity.ok(transports);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') || hasRole('TRANSPORT')")
    public ResponseEntity<Transport> getTransportById(@PathVariable Long id) {
        Transport transport = transportService.getTransportById(id);
        return ResponseEntity.ok(transport);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') || hasRole('TRANSPORT')")
    public ResponseEntity<Transport> createTransport(@RequestBody TransportRequest request) {
        Transport transport = transportService.createTransport(request);
        return ResponseEntity.ok(transport);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') || hasRole('TRANSPORT')")
    public ResponseEntity<Transport> updateTransport(@PathVariable Long id, @RequestBody TransportRequest request) {
        Transport transport = transportService.updateTransport(id, request);
        return ResponseEntity.ok(transport);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTransport(@PathVariable Long id) {
        transportService.deleteTransport(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders-needing-transport")
    @PreAuthorize("hasRole('ADMIN') || hasRole('TRANSPORT')")
    public ResponseEntity<List<Order>> getOrdersNeedingTransport() {
        List<Order> orders = transportService.getOrdersNeedingTransport();
        return ResponseEntity.ok(orders);
    }
}

