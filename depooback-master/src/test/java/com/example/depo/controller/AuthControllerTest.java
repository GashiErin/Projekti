package com.example.depo.controller;

import com.example.depo.dto.RegisterRequest;
import com.example.depo.entity.Role;
import com.example.depo.entity.User;
import com.example.depo.repository.RoleRepository;
import com.example.depo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(userRepository, roleRepository, passwordEncoder);
    }

    @Test
    void registerRejectsDuplicateUsername() {
        RegisterRequest request = registerRequest();
        when(userRepository.existsByUsername("employee1")).thenReturn(true);

        ResponseEntity<?> response = authController.register(request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo("Username already exists");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerCreatesEmployeeRoleWhenMissingAndSavesUser() {
        RegisterRequest request = registerRequest();
        Role employeeRole = new Role();
        employeeRole.setName("EMPLOYEE");

        when(userRepository.existsByUsername("employee1")).thenReturn(false);
        when(userRepository.existsByEmail("employee1@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret1")).thenReturn("encoded-secret");
        when(roleRepository.findByName("EMPLOYEE")).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(employeeRole);

        ResponseEntity<?> response = authController.register(request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("User registered successfully");
        assertThat(savedUser.getValue().getUsername()).isEqualTo("employee1");
        assertThat(savedUser.getValue().getEmail()).isEqualTo("employee1@example.com");
        assertThat(savedUser.getValue().getPassword()).isEqualTo("encoded-secret");
        assertThat(savedUser.getValue().getRoles())
                .extracting(Role::getName)
                .containsExactly("EMPLOYEE");
    }

    private RegisterRequest registerRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("employee1");
        request.setEmail("employee1@example.com");
        request.setPassword("secret1");
        return request;
    }
}
