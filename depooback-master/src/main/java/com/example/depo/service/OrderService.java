package com.example.depo.service;

import com.example.depo.dto.OrderItemRequest;
import com.example.depo.dto.OrderRequest;
import com.example.depo.entity.*;
import com.example.depo.repository.OrderRepository;
import com.example.depo.repository.ProductRepository;
import com.example.depo.repository.SupplierRepository;
import com.example.depo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order createOrder(OrderRequest request) {

        // 🔐 Get authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("User not authenticated");
        }

        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 📦 Supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // 🧾 Order
        Order order = new Order();
        order.setOrderDate(LocalDate.now());
        order.setStatus("CREATED");
        order.setSupplier(supplier);
        order.setCreatedBy(user);

        // 📦 Order items
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());

            items.add(item);
        }

        order.setItems(items);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAllWithRelations();
        // Filter out order items with missing products (products that were deleted)
        for (Order order : orders) {
            if (order.getItems() != null) {
                order.getItems().removeIf(item -> item.getProduct() == null);
            }
        }
        return orders;
    }

    @Transactional
    public Order receiveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("RECEIVED");
        return order;
    }
}
