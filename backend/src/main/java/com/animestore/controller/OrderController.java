package com.animestore.controller;

import com.animestore.dto.CheckoutRequest;
import com.animestore.dto.OrderResponse;
import com.animestore.entity.User;
import com.animestore.service.AuthService;
import com.animestore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    private Optional<User> authenticate(String authHeader, Long userIdHeader) {
        return authService.resolveUser(authHeader, userIdHeader);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader,
            @Valid @RequestBody CheckoutRequest request) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        try {
            OrderResponse response = orderService.checkout(user.get().getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        List<OrderResponse> orders = orderService.getMyOrders(user.get().getId());
        return ResponseEntity.ok(orders);
    }
}
