package com.oscar.ecommerce.domain.enums;

public enum OrderStatus {
    PENDING,           // Order created, payment pending
    CONFIRMED,         // Payment confirmed
    PROCESSING,        // Order being prepared
    SHIPPED,          // Order shipped
    DELIVERED,        // Order delivered
    CANCELLED,        // Order cancelled
    REFUNDED          // Order refunded
}
