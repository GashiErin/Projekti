package com.example.depo.repository;

import com.example.depo.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    // Gjen role sipas emrit (p.sh. "ADMIN", "EMPLOYEE")
    Optional<Role> findByName(String name);

    // Opsionale: kontrollon nëse ekziston role me këtë emër
    boolean existsByName(String name);
}

