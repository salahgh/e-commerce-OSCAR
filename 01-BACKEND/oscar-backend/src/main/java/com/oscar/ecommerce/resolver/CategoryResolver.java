package com.oscar.ecommerce.resolver;

import com.oscar.ecommerce.dto.category.CategoryResponse;
import com.oscar.ecommerce.dto.category.CreateCategoryRequest;
import com.oscar.ecommerce.dto.category.UpdateCategoryRequest;
import com.oscar.ecommerce.service.CategoryService;
import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * GraphQL resolver for category operations
 */
@Service
@GraphQLApi
@RequiredArgsConstructor
@Validated
@Slf4j
public class CategoryResolver {

    private final CategoryService categoryService;

    /**
     * Get all categories (flat list)
     *
     * Example GraphQL query:
     * query {
     *   categories {
     *     id
     *     slug
     *     nameFr
     *     nameEn
     *     nameAr
     *     imageUrl
     *     displayOrder
     *     parentId
     *     parentName
     *     productCount
     *   }
     * }
     */
    @GraphQLQuery(name = "categories", description = "Get all categories (flat list)")
    public List<CategoryResponse> getAllCategories() {
        log.info("GraphQL query: categories");
        return categoryService.getAllCategories();
    }

    /**
     * Get all active categories
     *
     * Example GraphQL query:
     * query {
     *   activeCategories {
     *     id
     *     slug
     *     nameFr
     *     imageUrl
     *   }
     * }
     */
    @GraphQLQuery(name = "activeCategories", description = "Get all active categories")
    public List<CategoryResponse> getActiveCategories() {
        log.info("GraphQL query: activeCategories");
        return categoryService.getActiveCategories();
    }

    /**
     * Get category tree (hierarchical structure)
     *
     * Example GraphQL query:
     * query {
     *   categoryTree {
     *     id
     *     nameFr
     *     children {
     *       id
     *       nameFr
     *       children {
     *         id
     *         nameFr
     *       }
     *     }
     *   }
     * }
     */
    @GraphQLQuery(name = "categoryTree", description = "Get category tree (hierarchical structure)")
    public List<CategoryResponse> getCategoryTree() {
        log.info("GraphQL query: categoryTree");
        return categoryService.getCategoryTree();
    }

    /**
     * Get category by ID
     *
     * Example GraphQL query:
     * query {
     *   category(id: 1) {
     *     id
     *     slug
     *     nameFr
     *     nameAr
     *     nameEn
     *     descriptionFr
     *     imageUrl
     *     children {
     *       id
     *       nameFr
     *     }
     *     productCount
     *   }
     * }
     */
    @GraphQLQuery(name = "category", description = "Get category by ID")
    public CategoryResponse getCategoryById(
            @GraphQLArgument(name = "id", description = "Category ID")
            Long id) {

        log.info("GraphQL query: category - id: {}", id);
        return categoryService.getCategoryById(id);
    }

    /**
     * Get category by slug
     *
     * Example GraphQL query:
     * query {
     *   categoryBySlug(slug: "vetements-hommes") {
     *     id
     *     slug
     *     nameFr
     *     children {
     *       id
     *       nameFr
     *     }
     *   }
     * }
     */
    @GraphQLQuery(name = "categoryBySlug", description = "Get category by slug")
    public CategoryResponse getCategoryBySlug(
            @GraphQLArgument(name = "slug", description = "Category slug")
            String slug) {

        log.info("GraphQL query: categoryBySlug - slug: {}", slug);
        return categoryService.getCategoryBySlug(slug);
    }

    /**
     * Get root categories (no parent)
     *
     * Example GraphQL query:
     * query {
     *   rootCategories {
     *     id
     *     slug
     *     nameFr
     *     imageUrl
     *   }
     * }
     */
    @GraphQLQuery(name = "rootCategories", description = "Get root categories (no parent)")
    public List<CategoryResponse> getRootCategories() {
        log.info("GraphQL query: rootCategories");
        return categoryService.getRootCategories();
    }

    /**
     * Get subcategories of a category
     *
     * Example GraphQL query:
     * query {
     *   subcategories(parentId: 1) {
     *     id
     *     slug
     *     nameFr
     *     parentName
     *   }
     * }
     */
    @GraphQLQuery(name = "subcategories", description = "Get subcategories of a category")
    public List<CategoryResponse> getSubcategories(
            @GraphQLArgument(name = "parentId", description = "Parent category ID")
            Long parentId) {

        log.info("GraphQL query: subcategories - parentId: {}", parentId);
        return categoryService.getSubcategories(parentId);
    }

    /**
     * Create a new category (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   createCategory(input: {
     *     slug: "vetements-hommes"
     *     nameFr: "Vêtements Hommes"
     *     nameAr: "ملابس رجالية"
     *     nameEn: "Men's Clothing"
     *     descriptionFr: "Collection de vêtements pour hommes"
     *     imageUrl: "https://example.com/men.jpg"
     *     displayOrder: 1
     *     parentId: null
     *   }) {
     *     id
     *     slug
     *     nameFr
     *   }
     * }
     */
    @GraphQLMutation(name = "createCategory", description = "Create a new category (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createCategory(
            @GraphQLArgument(name = "input", description = "Category creation details")
            @Valid CreateCategoryRequest input) {

        log.info("GraphQL mutation: createCategory - slug: {}", input.getSlug());
        return categoryService.createCategory(input);
    }

    /**
     * Update a category (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   updateCategory(id: 1, input: {
     *     nameFr: "Vêtements Hommes (Nouveau)"
     *     displayOrder: 2
     *     isActive: true
     *   }) {
     *     id
     *     slug
     *     nameFr
     *     displayOrder
     *     isActive
     *   }
     * }
     */
    @GraphQLMutation(name = "updateCategory", description = "Update a category (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategory(
            @GraphQLArgument(name = "id", description = "Category ID")
            Long id,
            @GraphQLArgument(name = "input", description = "Category update details")
            @Valid UpdateCategoryRequest input) {

        log.info("GraphQL mutation: updateCategory - id: {}", id);
        return categoryService.updateCategory(id, input);
    }

    /**
     * Delete a category (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   deleteCategory(id: 1)
     * }
     */
    @GraphQLMutation(name = "deleteCategory", description = "Delete a category (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteCategory(
            @GraphQLArgument(name = "id", description = "Category ID")
            Long id) {

        log.info("GraphQL mutation: deleteCategory - id: {}", id);
        categoryService.deleteCategory(id);
        return true;
    }
}
