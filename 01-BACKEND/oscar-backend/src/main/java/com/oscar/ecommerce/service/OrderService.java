package com.oscar.ecommerce.service;

import com.oscar.ecommerce.domain.*;
import com.oscar.ecommerce.domain.enums.OrderStatus;
import com.oscar.ecommerce.domain.enums.PaymentMethod;
import com.oscar.ecommerce.dto.order.CreateOrderRequest;
import com.oscar.ecommerce.dto.order.OrderResponse;
import com.oscar.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.oscar.ecommerce.exception.ResourceNotFoundException;
import com.oscar.ecommerce.repository.CartRepository;
import com.oscar.ecommerce.repository.OrderRepository;
import com.oscar.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing orders
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;

    /**
     * Create order from user's cart
     */
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user", "userId", userId));

        // Validate cart is not empty
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot create order from empty cart");
        }

        // Validate stock availability for all items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getNameEn());
            }
        }

        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setNotes(request.getNotes());

        // Calculate amounts
        BigDecimal subtotal = cart.getTotalAmount();
        BigDecimal shippingCost = calculateShippingCost(subtotal);
        BigDecimal totalAmount = subtotal.add(shippingCost);

        order.setSubtotal(subtotal);
        order.setShippingCost(shippingCost);
        order.setTotalAmount(totalAmount);

        // Create order items from cart items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setSelectedSize(cartItem.getSelectedSize());
            orderItem.setSelectedColor(cartItem.getSelectedColor());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setSubtotal(cartItem.getSubtotal());

            orderItems.add(orderItem);

            // Reduce product stock
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
        }

        order.setItems(orderItems);

        // Save order
        order = orderRepository.save(order);
        log.info("Order created: {} for user {}", order.getOrderNumber(), user.getEmail());

        // Clear cart
        cartService.clearCart(userId);

        // TODO: Send order confirmation email
        // TODO: Process payment based on payment method

        return mapToResponse(order);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Verify order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to user");
        }

        return mapToResponse(order);
    }

    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));

        // Verify order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to user");
        }

        return mapToResponse(order);
    }

    /**
     * Get all orders for a user
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Page<Order> orders = orderRepository.findByUser(user, pageable);
        return orders.map(this::mapToResponse);
    }

    /**
     * Get all orders (admin only)
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findRecentOrders(pageable);
        return orders.map(this::mapToResponse);
    }

    /**
     * Get orders by status (admin only)
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByStatus(status, pageable);
        return orders.map(this::mapToResponse);
    }

    /**
     * Update order status (admin only)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus());
        OrderStatus oldStatus = order.getStatus();

        order.setStatus(newStatus);

        // Update timestamps based on status
        if (newStatus == OrderStatus.DELIVERED && oldStatus != OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        order = orderRepository.save(order);
        log.info("Order {} status updated from {} to {}", order.getOrderNumber(), oldStatus, newStatus);

        // TODO: Send status update email to customer

        return mapToResponse(order);
    }

    /**
     * Cancel order
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Verify order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to user");
        }

        // Check if order can be cancelled
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore product stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        }

        order = orderRepository.save(order);
        log.info("Order {} cancelled by user {}", order.getOrderNumber(), userId);

        // TODO: Process refund if payment was made

        return mapToResponse(order);
    }

    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Calculate shipping cost
     * TODO: Implement proper shipping cost calculation based on location, weight, etc.
     */
    private BigDecimal calculateShippingCost(BigDecimal subtotal) {
        // Free shipping for orders over 5000 DZD
        if (subtotal.compareTo(new BigDecimal("5000")) >= 0) {
            return BigDecimal.ZERO;
        }
        // Otherwise 500 DZD flat rate
        return new BigDecimal("500");
    }

    /**
     * Map Order to OrderResponse
     */
    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .items(order.getItems().stream()
                        .map(item -> OrderResponse.OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProduct().getId())
                                .productName(item.getProduct().getNameEn())
                                .productImage(item.getProduct().getImageUrls().isEmpty()
                                        ? null
                                        : item.getProduct().getImageUrls().get(0))
                                .quantity(item.getQuantity())
                                .selectedSize(item.getSelectedSize())
                                .selectedColor(item.getSelectedColor())
                                .price(item.getPrice())
                                .subtotal(item.getSubtotal())
                                .build())
                        .collect(Collectors.toList()))
                .subtotal(order.getSubtotal())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .phoneNumber(order.getPhoneNumber())
                .notes(order.getNotes())
                .trackingNumber(order.getTrackingNumber())
                .paidAt(order.getPaidAt())
                .deliveredAt(order.getDeliveredAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
