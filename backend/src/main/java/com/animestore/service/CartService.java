package com.animestore.service;

import com.animestore.dto.AddCartRequest;
import com.animestore.dto.CartItemDto;
import com.animestore.dto.CartResponse;
import com.animestore.entity.CartItem;
import com.animestore.entity.Product;
import com.animestore.entity.User;
import com.animestore.repository.CartItemRepository;
import com.animestore.repository.ProductRepository;
import com.animestore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.044"); // 4.4%

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartResponse getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        return buildCartResponse(items);
    }

    @Transactional
    public CartResponse addToCart(Long userId, AddCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + request.getProductId()));

        int addQty = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, product.getId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + addQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(user, product, addQty);
            cartItemRepository.save(newItem);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponse updateCartItem(Long userId, Long cartItemId, int quantity) {
        Optional<CartItem> itemOpt = cartItemRepository.findById(cartItemId);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            if (item.getUser().getId().equals(userId)) {
                if (quantity <= 0) {
                    cartItemRepository.delete(item);
                } else {
                    item.setQuantity(quantity);
                    cartItemRepository.save(item);
                }
            }
        }
        return getCart(userId);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long cartItemId) {
        Optional<CartItem> itemOpt = cartItemRepository.findById(cartItemId);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            if (item.getUser().getId().equals(userId)) {
                cartItemRepository.delete(item);
            }
        }
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartResponse buildCartResponse(List<CartItem> items) {
        List<CartItemDto> dtoList = items.stream().map(item -> new CartItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getDescription(),
                item.getProduct().getPrice(),
                item.getProduct().getRating(),
                item.getProduct().getImageUrl(),
                item.getQuantity()
        )).collect(Collectors.toList());

        BigDecimal subtotal = dtoList.stream()
                .map(CartItemDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal platformFee = subtotal.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(platformFee);
        int totalItems = dtoList.stream().mapToInt(CartItemDto::getQuantity).sum();

        return new CartResponse(dtoList, subtotal, platformFee, totalAmount, totalItems);
    }
}
