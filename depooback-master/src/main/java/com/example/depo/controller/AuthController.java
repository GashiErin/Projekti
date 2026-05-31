package com.example.depo.controller;

import com.example.depo.dto.RegisterRequest;
import com.example.depo.entity.Role;
import com.example.depo.entity.User;
import com.example.depo.repository.RoleRepository;
import com.example.depo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // User registration
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Assign default role - create if it doesn't exist
        Role role = roleRepository.findByName("EMPLOYEE")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("EMPLOYEE");
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(role);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    // Get current logged-in user info
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Get roles from database
        java.util.List<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toList());
        
        // Get authorities from Spring Security (for debugging)
        java.util.List<String> authorities = authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(java.util.stream.Collectors.toList());
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("name", user.getUsername());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("roles", roleNames);
        userInfo.put("authorities", authorities); // For debugging
        
        return ResponseEntity.ok(userInfo);
    }
}
