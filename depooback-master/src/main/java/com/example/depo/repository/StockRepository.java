package com.example.depo.repository;

import com.example.depo.entity.Product;
import com.example.depo.entity.Stock;
import com.example.depo.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByProductAndWarehouse(Product p, Warehouse w);
}
