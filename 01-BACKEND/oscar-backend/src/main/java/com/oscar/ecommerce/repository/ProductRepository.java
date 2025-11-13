package com.oscar.ecommerce.repository;

import com.oscar.ecommerce.domain.Product;
import com.oscar.ecommerce.domain.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findProductById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"category"})
    Optional<Product> findBySku(String sku);

    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByIsActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByCategory(Category category, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByCategoryAndIsActiveTrue(Category category, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByStockQuantityLessThanEqualAndIsActiveTrue(Integer minStock);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.nameFr) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.nameAr) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.nameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "p.basePrice BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                    @Param("maxPrice") BigDecimal maxPrice,
                                    Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findNewArrivals(Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "ORDER BY p.viewCount DESC")
    Page<Product> findPopularProducts(Pageable pageable);
}
