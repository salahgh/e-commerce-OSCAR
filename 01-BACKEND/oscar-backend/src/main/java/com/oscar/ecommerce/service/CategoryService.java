package com.oscar.ecommerce.service;

import com.oscar.ecommerce.domain.Category;
import com.oscar.ecommerce.dto.category.CategoryResponse;
import com.oscar.ecommerce.dto.category.CreateCategoryRequest;
import com.oscar.ecommerce.dto.category.UpdateCategoryRequest;
import com.oscar.ecommerce.exception.ResourceNotFoundException;
import com.oscar.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing product categories
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Get all categories (flat list)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        log.debug("Fetching all categories");
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active categories
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        log.debug("Fetching all active categories");
        return categoryRepository.findByIsActive(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get category tree (hierarchical structure)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        log.debug("Building category tree");
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::mapToResponseWithChildren)
                .collect(Collectors.toList());
    }

    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        log.debug("Fetching category with id: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        return mapToResponseWithChildren(category);
    }

    /**
     * Get category by slug
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        log.debug("Fetching category with slug: {}", slug);
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));

        return mapToResponseWithChildren(category);
    }

    /**
     * Get root categories (no parent)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        log.debug("Fetching root categories");
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get subcategories of a category
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getSubcategories(Long parentId) {
        log.debug("Fetching subcategories for parent id: {}", parentId);
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", parentId));

        return parent.getChildren().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new category (Admin only)
     */
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.info("Creating new category with slug: {}", request.getSlug());

        // Check if slug already exists
        if (categoryRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }

        Category category = new Category();
        category.setSlug(request.getSlug());
        category.setNameFr(request.getNameFr());
        category.setNameAr(request.getNameAr());
        category.setNameEn(request.getNameEn());
        category.setDescriptionFr(request.getDescriptionFr());
        category.setDescriptionAr(request.getDescriptionAr());
        category.setDescriptionEn(request.getDescriptionEn());
        category.setImageUrl(request.getImageUrl());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        category.setIsActive(true);

        // Set parent if provided
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getParentId()));
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with id: {}", savedCategory.getId());

        return mapToResponse(savedCategory);
    }

    /**
     * Update a category (Admin only)
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        log.info("Updating category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Update fields if provided
        if (request.getSlug() != null && !request.getSlug().equals(category.getSlug())) {
            // Check if new slug already exists
            if (categoryRepository.findBySlug(request.getSlug()).isPresent()) {
                throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
            }
            category.setSlug(request.getSlug());
        }

        if (request.getNameFr() != null) {
            category.setNameFr(request.getNameFr());
        }
        if (request.getNameAr() != null) {
            category.setNameAr(request.getNameAr());
        }
        if (request.getNameEn() != null) {
            category.setNameEn(request.getNameEn());
        }
        if (request.getDescriptionFr() != null) {
            category.setDescriptionFr(request.getDescriptionFr());
        }
        if (request.getDescriptionAr() != null) {
            category.setDescriptionAr(request.getDescriptionAr());
        }
        if (request.getDescriptionEn() != null) {
            category.setDescriptionEn(request.getDescriptionEn());
        }
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        // Update parent if provided
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getParentId()));
            category.setParent(parent);
        }

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", id);

        return mapToResponse(updatedCategory);
    }

    /**
     * Delete a category (Admin only)
     */
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Check if category has products
        if (!category.getProducts().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with existing products. " +
                    "Please reassign or delete products first.");
        }

        // Check if category has children
        if (category.hasChildren()) {
            throw new IllegalStateException("Cannot delete category with subcategories. " +
                    "Please delete subcategories first.");
        }

        categoryRepository.delete(category);
        log.info("Category deleted successfully: {}", id);
    }

    /**
     * Map Category entity to CategoryResponse DTO (without children)
     */
    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .slug(category.getSlug())
                .nameFr(category.getNameFr())
                .nameAr(category.getNameAr())
                .nameEn(category.getNameEn())
                .descriptionFr(category.getDescriptionFr())
                .descriptionAr(category.getDescriptionAr())
                .descriptionEn(category.getDescriptionEn())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getNameEn() : null)
                .productCount((long) category.getProducts().size())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Map Category entity to CategoryResponse DTO (with children recursively)
     */
    private CategoryResponse mapToResponseWithChildren(Category category) {
        CategoryResponse response = mapToResponse(category);

        // Recursively map children
        if (category.hasChildren()) {
            List<CategoryResponse> children = category.getChildren().stream()
                    .map(this::mapToResponseWithChildren)
                    .collect(Collectors.toList());
            response.setChildren(children);
        } else {
            response.setChildren(new ArrayList<>());
        }

        return response;
    }
}
