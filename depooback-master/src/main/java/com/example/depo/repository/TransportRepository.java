package com.example.depo.repository;

import com.example.depo.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TransportRepository extends JpaRepository<Transport, Long> {
    
    @Query("SELECT t FROM Transport t " +
           "LEFT JOIN FETCH t.order o " +
           "LEFT JOIN FETCH o.supplier " +
           "LEFT JOIN FETCH o.createdBy " +
           "ORDER BY t.id")
    List<Transport> findAllWithRelations();
    
    Optional<Transport> findByOrderId(Long orderId);
}

