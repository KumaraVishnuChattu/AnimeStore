package com.animestore.service;

import com.animestore.dto.CheckoutItemDto;
import com.animestore.dto.CheckoutRequest;
import com.animestore.dto.OrderItemDto;
import com.animestore.dto.OrderResponse;
import com.animestore.entity.*;
import com.animestore.repository.CartItemRepository;
import com.animestore.repository.OrderRepository;
import com.animestore.repository.ProductRepository;
import com.animestore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.044"); // 4.4%

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<OrderItemData> itemsToOrder = new ArrayList<>();
        boolean isCartCheckout = false;

        // 1. Direct Buy Check
        if (request.getIsDirectBuy() && request.getDirectItem() != null) {
            CheckoutItemDto dItem = request.getDirectItem();
            Product product = productRepository.findById(dItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + dItem.getProductId()));
            itemsToOrder.add(new OrderItemData(product, dItem.getQuantity()));
        }
        // 2. Specific Items List Checkout
        else if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CheckoutItemDto itemDto : request.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemDto.getProductId()));
                itemsToOrder.add(new OrderItemData(product, itemDto.getQuantity()));
            }
        }
        // 3. Fallback: Entire Cart Checkout
        else {
            isCartCheckout = true;
            List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
            if (cartItems.isEmpty()) {
                throw new IllegalStateException("Cart is empty");
            }
            for (CartItem ci : cartItems) {
                itemsToOrder.add(new OrderItemData(ci.getProduct(), ci.getQuantity()));
            }
        }

        if (itemsToOrder.isEmpty()) {
            throw new IllegalStateException("No items to checkout");
        }

        // Calculate Pricing
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemData data : itemsToOrder) {
            BigDecimal lineTotal = data.product.getPrice().multiply(BigDecimal.valueOf(data.quantity));
            subtotal = subtotal.add(lineTotal);
        }

        // Platform fee 4.4%
        BigDecimal platformFee = subtotal.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(platformFee);

        // Create Order
        Order order = new Order(
                user,
                subtotal,
                platformFee,
                totalAmount,
                request.getShippingAddress(),
                "CONFIRMED"
        );

        for (OrderItemData data : itemsToOrder) {
            OrderItem orderItem = new OrderItem(
                    order,
                    data.product,
                    data.quantity,
                    data.product.getPrice()
            );
            order.addItem(orderItem);
        }

        order = orderRepository.save(order);

        // If checking out from cart, clear user cart items
        if (isCartCheckout || (!request.getIsDirectBuy() && (request.getItems() == null || request.getItems().isEmpty()))) {
            cartItemRepository.deleteByUserId(userId);
        }

        return toOrderResponse(order);
    }

    public List<OrderResponse> getMyOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> new OrderItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getQuantity(),
                item.getUnitPrice()
        )).collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getSubtotal(),
                order.getPlatformFee(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getStatus(),
                order.getCreatedAt(),
                itemDtos
        );
    }

    private static class OrderItemData {
        Product product;
        int quantity;

        OrderItemData(Product product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }
    }
}
