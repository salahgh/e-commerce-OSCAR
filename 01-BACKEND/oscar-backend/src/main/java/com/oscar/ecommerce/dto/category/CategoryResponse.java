package com.oscar.ecommerce.dto.category;

import io.leangen.graphql.annotations.GraphQLQuery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Category response DTO for GraphQL
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    @GraphQLQuery(name = "id", description = "Category ID")
    private Long id;

    @GraphQLQuery(name = "slug", description = "URL-friendly slug")
    private String slug;

    @GraphQLQuery(name = "nameFr", description = "Name in French")
    private String nameFr;

    @GraphQLQuery(name = "nameAr", description = "Name in Arabic")
    private String nameAr;

    @GraphQLQuery(name = "nameEn", description = "Name in English")
    private String nameEn;

    @GraphQLQuery(name = "descriptionFr", description = "Description in French")
    private String descriptionFr;

    @GraphQLQuery(name = "descriptionAr", description = "Description in Arabic")
    private String descriptionAr;

    @GraphQLQuery(name = "descriptionEn", description = "Description in English")
    private String descriptionEn;

    @GraphQLQuery(name = "imageUrl", description = "Category image URL")
    private String imageUrl;

    @GraphQLQuery(name = "displayOrder", description = "Display order for sorting")
    private Integer displayOrder;

    @GraphQLQuery(name = "isActive", description = "Is category active")
    private Boolean isActive;

    @GraphQLQuery(name = "parentId", description = "Parent category ID (null if root)")
    private Long parentId;

    @GraphQLQuery(name = "parentName", description = "Parent category name")
    private String parentName;

    @GraphQLQuery(name = "children", description = "Child categories")
    private List<CategoryResponse> children;

    @GraphQLQuery(name = "productCount", description = "Number of products in this category")
    private Long productCount;

    @GraphQLQuery(name = "createdAt", description = "Creation timestamp")
    private LocalDateTime createdAt;

    @GraphQLQuery(name = "updatedAt", description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
