package com.example.depo.controller;

import com.example.depo.dto.ProductRequest;
import com.example.depo.entity.Product;
import com.example.depo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAll() {
        return productService.getAllProducts();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> create(@RequestBody ProductRequest request) {
        Product product = productService.createProduct(request);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updatePrice(@PathVariable Long id, @RequestBody Map<String, BigDecimal> request) {
        Product product = productService.updatePrice(id, request.get("price"));
        return ResponseEntity.ok(product);
    }
}

