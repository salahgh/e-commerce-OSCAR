package com.oscar.ecommerce.service;

import com.oscar.ecommerce.domain.Category;
import com.oscar.ecommerce.domain.Product;
import com.oscar.ecommerce.dto.product.CreateProductRequest;
import com.oscar.ecommerce.dto.product.ProductResponse;
import com.oscar.ecommerce.dto.product.UpdateProductRequest;
import com.oscar.ecommerce.exception.ResourceNotFoundException;
import com.oscar.ecommerce.repository.CategoryRepository;
import com.oscar.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing products
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Get all active products with pagination
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findByIsActiveTrue(pageable);
        return products.map(this::mapToResponse);
    }

    /**
     * Get product by ID
     */
    @Transactional
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Increment view count
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);

        return mapToResponse(product);
    }

    /**
     * Get product by SKU
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));

        return mapToResponse(product);
    }

    /**
     * Search products by keyword
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(keyword, pageable);
        return products.map(this::mapToResponse);
    }

    /**
     * Get products by category
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        Page<Product> products = productRepository.findByCategoryAndIsActiveTrue(category, pageable);
        return products.map(this::mapToResponse);
    }

    /**
     * Get products by price range
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Page<Product> products = productRepository.findByPriceRange(minPrice, maxPrice, pageable);
        return products.map(this::mapToResponse);
    }

    /**
     * Get featured products
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        List<Product> products = productRepository.findByIsFeaturedTrueAndIsActiveTrue();
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get new arrivals
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getNewArrivals(Pageable pageable) {
        Page<Product> products = productRepository.findNewArrivals(pageable);
        return products.map(this::mapToResponse);
    }

    /**
     * Get popular products
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getPopularProducts(Pageable pageable) {
        Page<Product> products = productRepository.findPopularProducts(pageable);
        return products.map(this::mapToResponse);
    }

    /**
     * Get low stock products (admin only)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Integer threshold) {
        List<Product> products = productRepository.findByStockQuantityLessThanEqualAndIsActiveTrue(threshold);
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create new product (admin only)
     */
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Check if SKU already exists
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new IllegalArgumentException("Product with SKU " + request.getSku() + " already exists");
        }

        // Create product
        Product product = new Product();
        product.setSku(request.getSku());
        product.setNameFr(request.getNameFr());
        product.setNameAr(request.getNameAr());
        product.setNameEn(request.getNameEn());
        product.setDescriptionFr(request.getDescriptionFr());
        product.setDescriptionAr(request.getDescriptionAr());
        product.setDescriptionEn(request.getDescriptionEn());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setImageUrls(request.getImageUrls());
        product.setAvailableSizes(request.getAvailableSizes());
        product.setAvailableColors(request.getAvailableColors());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setIsActive(true);
        product.setViewCount(0L);

        product = productRepository.save(product);
        log.info("Product created: {} (SKU: {})", product.getNameEn(), product.getSku());

        return mapToResponse(product);
    }

    /**
     * Update product (admin only)
     */
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Update category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        // Update fields
        if (request.getNameFr() != null) product.setNameFr(request.getNameFr());
        if (request.getNameAr() != null) product.setNameAr(request.getNameAr());
        if (request.getNameEn() != null) product.setNameEn(request.getNameEn());
        if (request.getDescriptionFr() != null) product.setDescriptionFr(request.getDescriptionFr());
        if (request.getDescriptionAr() != null) product.setDescriptionAr(request.getDescriptionAr());
        if (request.getDescriptionEn() != null) product.setDescriptionEn(request.getDescriptionEn());
        if (request.getBasePrice() != null) product.setBasePrice(request.getBasePrice());
        if (request.getSalePrice() != null) product.setSalePrice(request.getSalePrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrls() != null) product.setImageUrls(request.getImageUrls());
        if (request.getAvailableSizes() != null) product.setAvailableSizes(request.getAvailableSizes());
        if (request.getAvailableColors() != null) product.setAvailableColors(request.getAvailableColors());
        if (request.getIsFeatured() != null) product.setIsFeatured(request.getIsFeatured());

        product = productRepository.save(product);
        log.info("Product updated: {} (ID: {})", product.getNameEn(), product.getId());

        return mapToResponse(product);
    }

    /**
     * Delete product (soft delete - admin only)
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(false);
        productRepository.save(product);

        log.info("Product soft deleted: {} (ID: {})", product.getNameEn(), product.getId());
    }

    /**
     * Map Product entity to ProductResponse DTO
     */
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .nameFr(product.getNameFr())
                .nameAr(product.getNameAr())
                .nameEn(product.getNameEn())
                .descriptionFr(product.getDescriptionFr())
                .descriptionAr(product.getDescriptionAr())
                .descriptionEn(product.getDescriptionEn())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .stockQuantity(product.getStockQuantity())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getNameEn())
                .imageUrls(product.getImageUrls())
                .availableSizes(product.getAvailableSizes())
                .availableColors(product.getAvailableColors())
                .isFeatured(product.getIsFeatured())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
