package com.ticketbooking.service;

import com.ticketbooking.dto.AuthResponse;
import com.ticketbooking.dto.LoginRequest;
import com.ticketbooking.dto.RegisterRequest;
import com.ticketbooking.entity.Role;
import com.ticketbooking.entity.User;
import com.ticketbooking.exception.EmailAlreadyExistsException;
import com.ticketbooking.repository.UserRepository;
import com.ticketbooking.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("John Doe", "john@example.com", "Password@123", Role.CUSTOMER);
        savedUser = new User("John Doe", "john@example.com", "encodedPassword", Role.CUSTOMER);
        savedUser.setId(1L);
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtils.generateToken("john@example.com", "CUSTOMER", 1L)).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals(1L, response.getUserId());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest loginRequest = new LoginRequest("john@example.com", "Password@123");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(savedUser));
        when(jwtUtils.generateToken("john@example.com", "CUSTOMER", 1L)).thenReturn("mock.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals(1L, response.getUserId());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
