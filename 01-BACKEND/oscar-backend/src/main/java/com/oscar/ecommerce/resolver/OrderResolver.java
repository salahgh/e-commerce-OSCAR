package com.oscar.ecommerce.resolver;

import com.oscar.ecommerce.domain.enums.OrderStatus;
import com.oscar.ecommerce.dto.order.CreateOrderRequest;
import com.oscar.ecommerce.dto.order.OrderResponse;
import com.oscar.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.oscar.ecommerce.service.OrderService;
import com.oscar.ecommerce.util.SecurityUtil;
import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * GraphQL resolver for order operations
 */
@Service
@GraphQLApi
@RequiredArgsConstructor
@Validated
@Slf4j
public class OrderResolver {

    private final OrderService orderService;

    /**
     * Get current user's orders
     *
     * Example GraphQL query:
     * query {
     *   myOrders(page: 0, size: 10) {
     *     content {
     *       id
     *       orderNumber
     *       status
     *       totalAmount
     *       createdAt
     *       items {
     *         productName
     *         quantity
     *         price
     *       }
     *     }
     *     totalElements
     *     totalPages
     *   }
     * }
     */
    @GraphQLQuery(name = "myOrders", description = "Get current user's orders")
    @PreAuthorize("isAuthenticated()")
    public Page<OrderResponse> getMyOrders(
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "10")
            int size) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL query: myOrders - userId: {}, page: {}", userId, page);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        return orderService.getUserOrders(userId, pageable);
    }

    /**
     * Get a specific order by ID
     *
     * Example GraphQL query:
     * query {
     *   order(id: 1) {
     *     id
     *     orderNumber
     *     status
     *     paymentMethod
     *     items {
     *       id
     *       productName
     *       quantity
     *       selectedSize
     *       selectedColor
     *       price
     *       subtotal
     *     }
     *     subtotal
     *     shippingCost
     *     totalAmount
     *     shippingAddress
     *     phoneNumber
     *     trackingNumber
     *     createdAt
     *   }
     * }
     */
    @GraphQLQuery(name = "order", description = "Get order by ID")
    @PreAuthorize("isAuthenticated()")
    public OrderResponse getOrder(
            @GraphQLArgument(name = "id", description = "Order ID")
            Long id) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL query: order - userId: {}, orderId: {}", userId, id);

        return orderService.getOrder(id, userId);
    }

    /**
     * Get order by order number
     *
     * Example GraphQL query:
     * query {
     *   orderByNumber(orderNumber: "ORD-1234567890-ABC123") {
     *     id
     *     orderNumber
     *     status
     *     totalAmount
     *   }
     * }
     */
    @GraphQLQuery(name = "orderByNumber", description = "Get order by order number")
    @PreAuthorize("isAuthenticated()")
    public OrderResponse getOrderByNumber(
            @GraphQLArgument(name = "orderNumber", description = "Order number")
            String orderNumber) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL query: orderByNumber - userId: {}, orderNumber: {}", userId, orderNumber);

        return orderService.getOrderByNumber(orderNumber, userId);
    }

    /**
     * Create order from cart
     *
     * Example GraphQL mutation:
     * mutation {
     *   createOrder(input: {
     *     paymentMethod: "CASH_ON_DELIVERY"
     *     shippingAddress: "123 Main St, Algiers, Algeria"
     *     phoneNumber: "0555123456"
     *     notes: "Please call before delivery"
     *   }) {
     *     id
     *     orderNumber
     *     status
     *     totalAmount
     *     items {
     *       productName
     *       quantity
     *       price
     *     }
     *   }
     * }
     */
    @GraphQLMutation(name = "createOrder", description = "Create order from shopping cart")
    @PreAuthorize("isAuthenticated()")
    public OrderResponse createOrder(
            @GraphQLArgument(name = "input", description = "Order details")
            @Valid CreateOrderRequest input) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: createOrder - userId: {}", userId);

        return orderService.createOrder(userId, input);
    }

    /**
     * Cancel an order
     *
     * Example GraphQL mutation:
     * mutation {
     *   cancelOrder(id: 1) {
     *     id
     *     orderNumber
     *     status
     *   }
     * }
     */
    @GraphQLMutation(name = "cancelOrder", description = "Cancel an order")
    @PreAuthorize("isAuthenticated()")
    public OrderResponse cancelOrder(
            @GraphQLArgument(name = "id", description = "Order ID")
            Long id) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: cancelOrder - userId: {}, orderId: {}", userId, id);

        return orderService.cancelOrder(id, userId);
    }

    // ==================== ADMIN OPERATIONS ====================

    /**
     * Get all orders (Admin only)
     *
     * Example GraphQL query:
     * query {
     *   allOrders(page: 0, size: 20) {
     *     content {
     *       id
     *       orderNumber
     *       userEmail
     *       status
     *       totalAmount
     *       createdAt
     *     }
     *     totalElements
     *     totalPages
     *   }
     * }
     */
    @GraphQLQuery(name = "allOrders", description = "Get all orders (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponse> getAllOrders(
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: allOrders - page: {}", page);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        return orderService.getAllOrders(pageable);
    }

    /**
     * Get orders by status (Admin only)
     *
     * Example GraphQL query:
     * query {
     *   ordersByStatus(status: "PENDING", page: 0, size: 20) {
     *     content {
     *       id
     *       orderNumber
     *       userEmail
     *       status
     *       totalAmount
     *     }
     *   }
     * }
     */
    @GraphQLQuery(name = "ordersByStatus", description = "Get orders by status (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponse> getOrdersByStatus(
            @GraphQLArgument(name = "status", description = "Order status")
            String status,
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: ordersByStatus - status: {}, page: {}", status, page);

        OrderStatus orderStatus = OrderStatus.valueOf(status);
        Pageable pageable = PageRequest.of(page, size);

        return orderService.getOrdersByStatus(orderStatus, pageable);
    }

    /**
     * Update order status (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   updateOrderStatus(id: 1, input: {
     *     status: "SHIPPED"
     *     trackingNumber: "TRK123456789"
     *   }) {
     *     id
     *     orderNumber
     *     status
     *     trackingNumber
     *   }
     * }
     */
    @GraphQLMutation(name = "updateOrderStatus", description = "Update order status (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse updateOrderStatus(
            @GraphQLArgument(name = "id", description = "Order ID")
            Long id,
            @GraphQLArgument(name = "input", description = "Order status update")
            @Valid UpdateOrderStatusRequest input) {

        log.info("GraphQL mutation: updateOrderStatus - orderId: {}, status: {}", id, input.getStatus());

        return orderService.updateOrderStatus(id, input);
    }
}
