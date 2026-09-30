package com.ticketbooking.service;

import com.ticketbooking.dto.AuthResponse;
import com.ticketbooking.dto.LoginRequest;
import com.ticketbooking.dto.RegisterRequest;
import com.ticketbooking.entity.Role;
import com.ticketbooking.entity.User;
import com.ticketbooking.exception.EmailAlreadyExistsException;
import com.ticketbooking.repository.UserRepository;
import com.ticketbooking.security.JwtUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @PostConstruct
    public void initDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@ticketbooking.com")) {
            User admin = new User(
                    "System Admin",
                    "admin@ticketbooking.com",
                    passwordEncoder.encode("Admin@123"),
                    Role.ADMIN
            );
            userRepository.save(admin);
            logger.info("Default ADMIN user initialized: admin@ticketbooking.com");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new EmailAlreadyExistsException("Email already in use: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        User user = new User(
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                role
        );

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getId()
        );

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        String token = jwtUtils.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
