package com.oscar.ecommerce.dto.user;

import io.leangen.graphql.annotations.GraphQLQuery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User profile response DTO for GraphQL
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    @GraphQLQuery(name = "id", description = "User ID")
    private Long id;

    @GraphQLQuery(name = "firstName", description = "First name")
    private String firstName;

    @GraphQLQuery(name = "lastName", description = "Last name")
    private String lastName;

    @GraphQLQuery(name = "email", description = "Email address")
    private String email;

    @GraphQLQuery(name = "phone", description = "Phone number")
    private String phone;

    @GraphQLQuery(name = "role", description = "User role")
    private String role;

    @GraphQLQuery(name = "isActive", description = "Is account active")
    private Boolean isActive;

    @GraphQLQuery(name = "emailVerified", description = "Is email verified")
    private Boolean emailVerified;

    @GraphQLQuery(name = "createdAt", description = "Account creation date")
    private LocalDateTime createdAt;

    @GraphQLQuery(name = "updatedAt", description = "Last update date")
    private LocalDateTime updatedAt;
}
