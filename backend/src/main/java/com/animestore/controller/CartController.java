package com.animestore.controller;

import com.animestore.dto.AddCartRequest;
import com.animestore.dto.CartResponse;
import com.animestore.entity.User;
import com.animestore.service.AuthService;
import com.animestore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    public CartController(CartService cartService, AuthService authService) {
        this.cartService = cartService;
        this.authService = authService;
    }

    private Optional<User> authenticate(String authHeader, Long userIdHeader) {
        return authService.resolveUser(authHeader, userIdHeader);
    }

    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        CartResponse response = cartService.getCart(user.get().getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader,
            @Valid @RequestBody AddCartRequest request) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        try {
            CartResponse response = cartService.addToCart(user.get().getId(), request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/item/{id}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long id,
            @RequestParam("quantity") int quantity,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        CartResponse response = cartService.updateCartItem(user.get().getId(), id, quantity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/item/{id}")
    public ResponseEntity<?> removeCartItem(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        CartResponse response = cartService.removeCartItem(user.get().getId(), id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader) {
        Optional<User> user = authenticate(authHeader, userIdHeader);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication required"));
        }
        cartService.clearCart(user.get().getId());
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }
}
