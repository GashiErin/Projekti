package com.example.depo.controller;

import com.example.depo.dto.AssignRoleRequest;
import com.example.depo.entity.Role;
import com.example.depo.entity.User;
import com.example.depo.repository.RoleRepository;
import com.example.depo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserController(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        List<Map<String, Object>> userList = users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            userMap.put("enabled", user.isEnabled());
            userMap.put("roles", user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList()));
            return userMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(userList);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("enabled", user.isEnabled());
        userMap.put("roles", user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(userMap);
    }

    @PostMapping("/assign-role")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> assignRole(@RequestBody AssignRoleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(request.getRoleName());
                    return roleRepository.save(newRole);
                });

        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Role assigned successfully");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("role", role.getName());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeRole(@PathVariable Long userId, @PathVariable String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.getRoles().remove(role);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Role removed successfully");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("role", role.getName());

        return ResponseEntity.ok(response);
    }
}

