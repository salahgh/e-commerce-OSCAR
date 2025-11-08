package com.oscar.ecommerce.resolver;

import com.oscar.ecommerce.dto.user.ChangePasswordRequest;
import com.oscar.ecommerce.dto.user.UpdateProfileRequest;
import com.oscar.ecommerce.dto.user.UserProfileResponse;
import com.oscar.ecommerce.service.UserService;
import com.oscar.ecommerce.util.SecurityUtil;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * GraphQL resolver for user profile operations
 */
@Service
@GraphQLApi
@RequiredArgsConstructor
@Validated
@Slf4j
public class UserResolver {

    private final UserService userService;

    /**
     * Get current user's profile
     *
     * Example GraphQL query:
     * query {
     *   me {
     *     id
     *     firstName
     *     lastName
     *     email
     *     phone
     *     role
     *     emailVerified
     *     createdAt
     *   }
     * }
     */
    @GraphQLQuery(name = "me", description = "Get current authenticated user's profile")
    @PreAuthorize("isAuthenticated()")
    public UserProfileResponse getCurrentUserProfile() {
        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL query: me - userId: {}", userId);

        return userService.getProfile(userId);
    }

    /**
     * Get user by ID (Admin only)
     *
     * Example GraphQL query:
     * query {
     *   user(id: 1) {
     *     id
     *     firstName
     *     lastName
     *     email
     *     role
     *     isActive
     *   }
     * }
     */
    @GraphQLQuery(name = "user", description = "Get user by ID (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileResponse getUserById(
            @GraphQLArgument(name = "id", description = "User ID")
            Long id) {

        log.info("GraphQL query: user - id: {}", id);
        return userService.getProfile(id);
    }

    /**
     * Get all users (Admin only)
     *
     * Example GraphQL query:
     * query {
     *   users(page: 0, size: 20) {
     *     content {
     *       id
     *       firstName
     *       lastName
     *       email
     *       role
     *       isActive
     *       createdAt
     *     }
     *     totalElements
     *     totalPages
     *   }
     * }
     */
    @GraphQLQuery(name = "users", description = "Get all users (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserProfileResponse> getAllUsers(
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size,
            @GraphQLArgument(name = "sortBy", description = "Sort field", defaultValue = "createdAt")
            String sortBy,
            @GraphQLArgument(name = "sortDirection", description = "Sort direction (ASC or DESC)", defaultValue = "DESC")
            String sortDirection) {

        log.info("GraphQL query: users - page: {}, size: {}", page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return userService.getAllUsers(pageable);
    }

    /**
     * Get users by role (Admin only)
     *
     * Example GraphQL query:
     * query {
     *   usersByRole(role: "CUSTOMER", page: 0, size: 20) {
     *     content {
     *       id
     *       firstName
     *       lastName
     *       email
     *     }
     *     totalElements
     *   }
     * }
     */
    @GraphQLQuery(name = "usersByRole", description = "Get users by role (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserProfileResponse> getUsersByRole(
            @GraphQLArgument(name = "role", description = "User role (CUSTOMER, ADMIN, SUPER_ADMIN)")
            String role,
            @GraphQLArgument(name = "page", description = "Page number (0-based)", defaultValue = "0")
            int page,
            @GraphQLArgument(name = "size", description = "Page size", defaultValue = "20")
            int size) {

        log.info("GraphQL query: usersByRole - role: {}, page: {}", role, page);

        Pageable pageable = PageRequest.of(page, size);
        return userService.getUsersByRole(role, pageable);
    }

    /**
     * Update current user's profile
     *
     * Example GraphQL mutation:
     * mutation {
     *   updateProfile(input: {
     *     firstName: "John"
     *     lastName: "Doe"
     *     phone: "0555123456"
     *   }) {
     *     id
     *     firstName
     *     lastName
     *     email
     *     phone
     *     updatedAt
     *   }
     * }
     */
    @GraphQLMutation(name = "updateProfile", description = "Update current user's profile")
    @PreAuthorize("isAuthenticated()")
    public UserProfileResponse updateProfile(
            @GraphQLArgument(name = "input", description = "Profile update details")
            @Valid UpdateProfileRequest input) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: updateProfile - userId: {}", userId);

        return userService.updateProfile(userId, input);
    }

    /**
     * Change password
     *
     * Example GraphQL mutation:
     * mutation {
     *   changePassword(input: {
     *     currentPassword: "oldpassword123"
     *     newPassword: "newpassword456"
     *   })
     * }
     */
    @GraphQLMutation(name = "changePassword", description = "Change current user's password")
    @PreAuthorize("isAuthenticated()")
    public Boolean changePassword(
            @GraphQLArgument(name = "input", description = "Password change details")
            @Valid ChangePasswordRequest input) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: changePassword - userId: {}", userId);

        userService.changePassword(userId, input);
        return true;
    }

    /**
     * Delete current user's account
     *
     * Example GraphQL mutation:
     * mutation {
     *   deleteMyAccount
     * }
     */
    @GraphQLMutation(name = "deleteMyAccount", description = "Delete current user's account (soft delete)")
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteMyAccount() {
        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: deleteMyAccount - userId: {}", userId);

        userService.deleteAccount(userId);
        return true;
    }

    /**
     * Toggle user account status (Admin only)
     *
     * Example GraphQL mutation:
     * mutation {
     *   toggleUserStatus(userId: 1) {
     *     id
     *     firstName
     *     lastName
     *     isActive
     *   }
     * }
     */
    @GraphQLMutation(name = "toggleUserStatus", description = "Activate/Deactivate user account (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileResponse toggleUserStatus(
            @GraphQLArgument(name = "userId", description = "User ID")
            Long userId) {

        log.info("GraphQL mutation: toggleUserStatus - userId: {}", userId);
        return userService.toggleUserStatus(userId);
    }
}
