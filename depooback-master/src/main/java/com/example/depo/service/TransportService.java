package com.example.depo.service;

import com.example.depo.dto.TransportRequest;
import com.example.depo.entity.Order;
import com.example.depo.entity.Transport;
import com.example.depo.repository.OrderRepository;
import com.example.depo.repository.TransportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final TransportRepository transportRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Transport createTransport(TransportRequest request) {
        // Check if transport already exists for this order
        transportRepository.findByOrderId(request.getOrderId())
            .ifPresent(t -> {
                throw new RuntimeException("Transport already exists for this order");
            });

        // Get the order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Create transport
        Transport transport = new Transport();
        transport.setOrder(order);
        transport.setTransportCompany(request.getTransportCompany());
        transport.setTrackingNumber(request.getTrackingNumber());
        transport.setDeliveryDate(request.getDeliveryDate());
        transport.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");

        return transportRepository.save(transport);
    }

    @Transactional(readOnly = true)
    public List<Transport> getAllTransports() {
        return transportRepository.findAllWithRelations();
    }

    @Transactional
    public Transport updateTransport(Long id, TransportRequest request) {
        Transport transport = transportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport not found"));

        if (request.getTransportCompany() != null) {
            transport.setTransportCompany(request.getTransportCompany());
        }
        if (request.getTrackingNumber() != null) {
            transport.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getDeliveryDate() != null) {
            transport.setDeliveryDate(request.getDeliveryDate());
        }
        if (request.getStatus() != null) {
            transport.setStatus(request.getStatus());
        }

        return transportRepository.save(transport);
    }

    @Transactional
    public void deleteTransport(Long id) {
        if (!transportRepository.existsById(id)) {
            throw new RuntimeException("Transport not found");
        }
        transportRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Transport getTransportById(Long id) {
        return transportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport not found"));
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersNeedingTransport() {
        // Get all orders with RECEIVED status
        List<Order> allOrders = orderRepository.findAllWithRelations();
        
        // Get all order IDs that already have transport
        List<Long> ordersWithTransport = transportRepository.findAll().stream()
                .map(t -> t.getOrder().getId())
                .toList();
        
        // Filter: RECEIVED status and no transport assigned
        return allOrders.stream()
                .filter(order -> "RECEIVED".equals(order.getStatus()))
                .filter(order -> !ordersWithTransport.contains(order.getId()))
                .toList();
    }
}

