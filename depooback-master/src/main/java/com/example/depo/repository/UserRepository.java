package com.example.depo.repository;



import com.example.depo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Gjen përdorues sipas username
    Optional<User> findByUsername(String username);

    // Gjen përdorues sipas email
    Optional<User> findByEmail(String email);

    // Kontrollon nëse ekziston një username
    boolean existsByUsername(String username);

    // Opsionale: kontrollon nëse ekziston një email
    boolean existsByEmail(String email);
}
