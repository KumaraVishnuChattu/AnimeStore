package com.animestore.service;

import com.animestore.dto.AuthResponse;
import com.animestore.dto.LoginRequest;
import com.animestore.dto.RegisterRequest;
import com.animestore.entity.User;
import com.animestore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Simple thread-safe in-memory token store: token -> userId
    private final Map<String, Long> tokenStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate 4-digit OTP
        if (request.getOtp() == null || !request.getOtp().matches("^\\d{4}$")) {
            return AuthResponse.error("Invalid OTP: must be a 4-digit code");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            return AuthResponse.error("Email is already registered");
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create and save user
        User user = new User(
                request.getEmail().trim().toLowerCase(),
                hashedPassword,
                request.getMobileNumber() != null ? request.getMobileNumber().trim() : null
        );
        user = userRepository.save(user);

        // Generate session token
        String token = "tok_" + user.getId() + "_" + UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, user.getId());

        return new AuthResponse(
                true,
                "Registration successful",
                token,
                user.getId(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getCreatedAt()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return AuthResponse.error("Invalid email or password");
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return AuthResponse.error("Invalid email or password");
        }

        // Generate session token
        String token = "tok_" + user.getId() + "_" + UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, user.getId());

        return new AuthResponse(
                true,
                "Login successful",
                token,
                user.getId(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getCreatedAt()
        );
    }

    public Optional<User> resolveUser(String authHeader, Long userIdHeader) {
        // 1. Check explicit X-User-Id header if valid
        if (userIdHeader != null) {
            Optional<User> u = userRepository.findById(userIdHeader);
            if (u.isPresent()) {
                return u;
            }
        }

        // 2. Check Authorization header
        if (authHeader != null && !authHeader.isBlank()) {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
            Long userId = tokenStore.get(token);
            if (userId != null) {
                return userRepository.findById(userId);
            }
            // Parse token formatted as tok_<userId>_<uuid>
            if (token.startsWith("tok_")) {
                try {
                    String[] parts = token.split("_");
                    if (parts.length >= 2) {
                        Long parsedId = Long.parseLong(parts[1]);
                        return userRepository.findById(parsedId);
                    }
                } catch (Exception ignored) {
                }
            }
        }

        return Optional.empty();
    }
}
