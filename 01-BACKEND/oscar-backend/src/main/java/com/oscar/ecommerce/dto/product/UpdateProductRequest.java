package com.oscar.ecommerce.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateProductRequest {

    @Size(max = 200, message = "French name must not exceed 200 characters")
    private String nameFr;

    @Size(max = 200, message = "Arabic name must not exceed 200 characters")
    private String nameAr;

    @Size(max = 200, message = "English name must not exceed 200 characters")
    private String nameEn;

    @Size(max = 2000, message = "French description must not exceed 2000 characters")
    private String descriptionFr;

    @Size(max = 2000, message = "Arabic description must not exceed 2000 characters")
    private String descriptionAr;

    @Size(max = 2000, message = "English description must not exceed 2000 characters")
    private String descriptionEn;

    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    @DecimalMin(value = "0.0", message = "Sale price must be positive")
    private BigDecimal salePrice;

    @Min(value = 0, message = "Stock quantity must be positive")
    private Integer stockQuantity;

    private Long categoryId;

    private List<String> imageUrls;

    private List<String> availableSizes;

    private List<String> availableColors;

    private Boolean isFeatured;
}
