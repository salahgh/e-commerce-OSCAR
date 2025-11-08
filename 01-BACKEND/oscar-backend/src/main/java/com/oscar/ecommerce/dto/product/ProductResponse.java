package com.oscar.ecommerce.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String sku;

    // Multilingual fields
    private String nameFr;
    private String nameAr;
    private String nameEn;
    private String descriptionFr;
    private String descriptionAr;
    private String descriptionEn;

    // Pricing
    private BigDecimal basePrice;
    private BigDecimal salePrice;

    // Inventory
    private Integer stockQuantity;

    // Category
    private Long categoryId;
    private String categoryName;

    // Media and variants
    private List<String> imageUrls;
    private List<String> availableSizes;
    private List<String> availableColors;

    // Flags
    private Boolean isFeatured;
    private Long viewCount;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
