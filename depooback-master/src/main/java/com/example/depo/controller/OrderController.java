package com.example.depo.controller;

import com.example.depo.dto.OrderRequest;
import com.example.depo.entity.Order;
import com.example.depo.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}/receive")
    public Order receiveOrder(@PathVariable Long id) {
        return orderService.receiveOrder(id);
    }
}
