package com.oscar.ecommerce.dto.category;

import io.leangen.graphql.annotations.GraphQLInputField;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryRequest {

    @GraphQLInputField(name = "slug", description = "URL-friendly slug (must be unique)")
    @NotBlank(message = "Slug is required")
    private String slug;

    @GraphQLInputField(name = "nameFr", description = "Name in French")
    @NotBlank(message = "French name is required")
    private String nameFr;

    @GraphQLInputField(name = "nameAr", description = "Name in Arabic")
    @NotBlank(message = "Arabic name is required")
    private String nameAr;

    @GraphQLInputField(name = "nameEn", description = "Name in English")
    private String nameEn;

    @GraphQLInputField(name = "descriptionFr", description = "Description in French")
    private String descriptionFr;

    @GraphQLInputField(name = "descriptionAr", description = "Description in Arabic")
    private String descriptionAr;

    @GraphQLInputField(name = "descriptionEn", description = "Description in English")
    private String descriptionEn;

    @GraphQLInputField(name = "imageUrl", description = "Category image URL")
    private String imageUrl;

    @GraphQLInputField(name = "displayOrder", description = "Display order for sorting")
    private Integer displayOrder;

    @GraphQLInputField(name = "parentId", description = "Parent category ID (null for root category)")
    private Long parentId;
}
