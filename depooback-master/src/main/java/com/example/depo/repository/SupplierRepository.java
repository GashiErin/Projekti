package com.example.depo.repository;


import com.example.depo.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    // Gjen furnitor sipas emrit
    Optional<Supplier> findByName(String name);

    // Kontrollon nëse ekziston furnitor me këtë emër
    boolean existsByName(String name);
}
