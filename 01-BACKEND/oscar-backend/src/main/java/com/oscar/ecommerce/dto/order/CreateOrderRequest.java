package com.oscar.ecommerce.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "CASH_ON_DELIVERY|CIB|BARIDIMOB", message = "Invalid payment method")
    private String paymentMethod;

    @NotBlank(message = "Shipping address is required")
    @Size(max = 500, message = "Shipping address must not exceed 500 characters")
    private String shippingAddress;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+213|0)[5-7][0-9]{8}$", message = "Invalid Algerian phone number")
    private String phoneNumber;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
