package com.example.depo.repository;


import com.example.depo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Gjen kategori sipas emrit
    Optional<Category> findByName(String name);

    // Kontrollon nëse ekziston kategori me këtë emër
    boolean existsByName(String name);
}

