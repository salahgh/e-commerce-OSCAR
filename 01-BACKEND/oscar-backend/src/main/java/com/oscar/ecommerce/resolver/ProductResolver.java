package com.oscar.ecommerce.resolver;

import com.oscar.ecommerce.dto.product.CreateProductRequest;
import com.oscar.ecommerce.dto.product.ProductResponse;
import com.oscar.ecommerce.dto.product.UpdateProductRequest;
import com.oscar.ecommerce.service.ProductService;
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
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.util.List;

/**
 * GraphQL resolver for product operations
 */
@Service
@GraphQLApi
@RequiredArgsConstructor
@Validated
@Slf4j
public class ProductResolver {

    private final ProductService productService;

    /**
     * Get all products with pagination
     *
     * Example GraphQL query:
     * query {
     *   products(page: 0, size: 10) {
     *     content {
     *       id
     *       sku
     *       nameEn
     *       basePrice
     *       salePrice
     *       imageUrls
     *       categoryName
     *     }
     *     totalElements
     *     totalPages
     *   }
     * }
     */
    @GraphQLQuery(name = "products", description = "Get all active products with pagination")
    public Page<ProductResponse> getProducts(
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size,
            @GraphQLArgument(name = "sortBy", description = "Sort field", defaultValue = "createdAt")
            String sortBy,
            @GraphQLArgument(name = "sortDirection", description = "Sort direction (ASC or DESC)", defaultValue = "DESC")
            String sortDirection) {

        log.info("GraphQL query: products - page: {}, size: {}", page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return productService.getAllProducts(pageable);
    }

    /**
     * Get a single product by ID
     *
     * Example GraphQL query:
     * query {
     *   product(id: 1) {
     *     id
     *     sku
     *     nameEn
     *     nameFr
     *     nameAr
     *     descriptionEn
     *     basePrice
     *     salePrice
     *     stockQuantity
     *     categoryName
     *     imageUrls
     *     availableSizes
     *     availableColors
     *     viewCount
     *   }
     * }
     */
    @GraphQLQuery(name = "product", description = "Get product by ID")
    public ProductResponse getProduct(
            @GraphQLArgument(name = "id", description = "Product ID")
            Long id) {

        log.info("GraphQL query: product - id: {}", id);
        return productService.getProductById(id);
    }

    /**
     * Get product by SKU
     *
     * Example GraphQL query:
     * query {
     *   productBySku(sku: "SHIRT-001") {
     *     id
     *     sku
     *     nameEn
     *     basePrice
     *   }
     * }
     */
    @GraphQLQuery(name = "productBySku", description = "Get product by SKU")
    public ProductResponse getProductBySku(
            @GraphQLArgument(name = "sku", description = "Product SKU")
            String sku) {

        log.info("GraphQL query: productBySku - sku: {}", sku);
        return productService.getProductBySku(sku);
    }

    /**
     * Search products by keyword
     *
     * Example GraphQL query:
     * query {
     *   searchProducts(keyword: "shirt", page: 0, size: 10) {
     *     content {
     *       id
     *       nameEn
     *       basePrice
     *     }
     *     totalElements
     *   }
     * }
     */
    @GraphQLQuery(name = "searchProducts", description = "Search products by keyword (searches FR/AR/EN names)")
    public Page<ProductResponse> searchProducts(
            @GraphQLArgument(name = "keyword", description = "Search keyword")
            String keyword,
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: searchProducts - keyword: {}", keyword);

        Pageable pageable = PageRequest.of(page, size);
        return productService.searchProducts(keyword, pageable);
    }

    /**
     * Get products by category
     *
     * Example GraphQL query:
     * query {
     *   productsByCategory(categoryId: 1, page: 0, size: 10) {
     *     content {
     *       id
     *       nameEn
     *       basePrice
     *       categoryName
     *     }
     *     totalElements
     *   }
     * }
     */
    @GraphQLQuery(name = "productsByCategory", description = "Get products by category")
    public Page<ProductResponse> getProductsByCategory(
            @GraphQLArgument(name = "categoryId", description = "Category ID")
            Long categoryId,
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: productsByCategory - categoryId: {}", categoryId);

        Pageable pageable = PageRequest.of(page, size);
        return productService.getProductsByCategory(categoryId, pageable);
    }

    /**
     * Get products by price range
     *
     * Example GraphQL query:
     * query {
     *   productsByPriceRange(minPrice: 1000, maxPrice: 5000, page: 0, size: 10) {
     *     content {
     *       id
     *       nameEn
     *       basePrice
     *     }
     *   }
     * }
     */
    @GraphQLQuery(name = "productsByPriceRange", description = "Get products by price range")
    public Page<ProductResponse> getProductsByPriceRange(
            @GraphQLArgument(name = "minPrice", description = "Minimum price")
            BigDecimal minPrice,
            @GraphQLArgument(name = "maxPrice", description = "Maximum price")
            BigDecimal maxPrice,
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: productsByPriceRange - min: {}, max: {}", minPrice, maxPrice);

        Pageable pageable = PageRequest.of(page, size);
        return productService.getProductsByPriceRange(minPrice, maxPrice, pageable);
    }

    /**
     * Get featured products
     *
     * Example GraphQL query:
     * query {
     *   featuredProducts {
     *     id
     *     nameEn
     *     basePrice
     *     imageUrls
     *   }
     * }
     */
    @GraphQLQuery(name = "featuredProducts", description = "Get featured products")
    public List<ProductResponse> getFeaturedProducts() {
        log.info("GraphQL query: featuredProducts");
        return productService.getFeaturedProducts();
    }

    /**
     * Get new arrivals
     *
     * Example GraphQL query:
     * query {
     *   newArrivals(page: 0, size: 10) {
     *     content {
     *       id
     *       nameEn
     *       basePrice
     *       createdAt
     *     }
     *   }
     * }
     */
    @GraphQLQuery(name = "newArrivals", description = "Get new arrivals (sorted by creation date)")
    public Page<ProductResponse> getNewArrivals(
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: newArrivals");

        Pageable pageable = PageRequest.of(page, size);
        return productService.getNewArrivals(pageable);
    }

    /**
     * Get popular products
     *
     * Example GraphQL query:
     * query {
     *   popularProducts(page: 0, size: 10) {
     *     content {
     *       id
     *       nameEn
     *       basePrice
     *       viewCount
     *     }
     *   }
     * }
     */
    @GraphQLQuery(name = "popularProducts", description = "Get popular products (sorted by view count)")
    public Page<ProductResponse> getPopularProducts(
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: popularProducts");

        Pageable pageable = PageRequest.of(page, size);
        return productService.getPopularProducts(pageable);
    }

    /**
     * Get low stock products (Admin only)
     *
     * Example GraphQL query:
     * query {
     *   lowStockProducts(threshold: 10) {
     *     id
     *     nameEn
     *     stockQuantity
     *   }
     * }
     */
    @GraphQLQuery(name = "lowStockProducts", description = "Get products with low stock (Admin only)")
   @PreAuthorize("hasRole('ADMIN')")
    public List<ProductResponse> getLowStockProducts(
            @GraphQLArgument(name = "threshold", description = "Stock threshold", defaultValue = "10")
            Integer threshold) {

        log.info("GraphQL query: lowStockProducts - threshold: {}", threshold);
        return productService.getLowStockProducts(threshold);
    }

    /**
     * Create a new product (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   createProduct(input: {
     *     sku: "SHIRT-001"
     *     nameEn: "Cotton Shirt"
     *     nameFr: "Chemise en coton"
     *     nameAr: "قميص قطني"
     *     descriptionEn: "High quality cotton shirt"
     *     basePrice: 2500
     *     stockQuantity: 100
     *     categoryId: 1
     *     imageUrls: ["https://example.com/shirt.jpg"]
     *     availableSizes: ["S", "M", "L", "XL"]
     *     availableColors: ["White", "Black", "Blue"]
     *   }) {
     *     id
     *     sku
     *     nameEn
     *     basePrice
     *   }
     * }
     */
    @GraphQLMutation(name = "createProduct", description = "Create a new product (Admin only)")
   @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse createProduct(
            @GraphQLArgument(name = "input", description = "Product creation details")
            @Valid CreateProductRequest input) {

        log.info("GraphQL mutation: createProduct - sku: {}", input.getSku());
        return productService.createProduct(input);
    }

    /**
     * Update a product (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   updateProduct(id: 1, input: {
     *     basePrice: 2800
     *     stockQuantity: 150
     *   }) {
     *     id
     *     sku
     *     nameEn
     *     basePrice
     *     stockQuantity
     *   }
     * }
     */
    @GraphQLMutation(name = "updateProduct", description = "Update a product (Admin only)")
   @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse updateProduct(
            @GraphQLArgument(name = "id", description = "Product ID")
            Long id,
            @GraphQLArgument(name = "input", description = "Product update details")
            @Valid UpdateProductRequest input) {

        log.info("GraphQL mutation: updateProduct - id: {}", id);
        return productService.updateProduct(id, input);
    }

    /**
     * Delete a product (soft delete - Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   deleteProduct(id: 1)
     * }
     */
    @GraphQLMutation(name = "deleteProduct", description = "Delete a product (soft delete - Admin only)")
   @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteProduct(
            @GraphQLArgument(name = "id", description = "Product ID")
            Long id) {

        log.info("GraphQL mutation: deleteProduct - id: {}", id);
        productService.deleteProduct(id);
        return true;
    }
}
