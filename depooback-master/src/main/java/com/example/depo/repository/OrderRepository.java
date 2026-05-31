package com.example.depo.repository;

import com.example.depo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.supplier " +
           "LEFT JOIN FETCH o.createdBy " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product " +
           "ORDER BY o.id")
    List<Order> findAllWithRelations();
}

