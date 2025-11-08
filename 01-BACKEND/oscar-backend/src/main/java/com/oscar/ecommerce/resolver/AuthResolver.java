package com.oscar.ecommerce.resolver;

import com.oscar.ecommerce.dto.auth.LoginRequest;
import com.oscar.ecommerce.dto.auth.LoginResponse;
import com.oscar.ecommerce.dto.auth.RegisterRequest;
import com.oscar.ecommerce.dto.auth.TokenRefreshRequest;
import com.oscar.ecommerce.service.AuthService;
import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * GraphQL resolver for authentication operations
 */
@Service
@GraphQLApi
@RequiredArgsConstructor
@Validated
@Slf4j
public class AuthResolver {

    private final AuthService authService;

    /**
     * Register a new user account
     *
     * Example GraphQL mutation:
     * mutation {
     *   register(input: {
     *     firstName: "John"
     *     lastName: "Doe"
     *     email: "john@example.com"
     *     password: "password123"
     *   }) {
     *     accessToken
     *     refreshToken
     *     userId
     *     email
     *     firstName
     *     lastName
     *     role
     *   }
     * }
     */
    @GraphQLMutation(name = "register", description = "Register a new user account")
    public LoginResponse register(
            @GraphQLArgument(name = "input", description = "User registration details")
            @Valid RegisterRequest input) {

        log.info("GraphQL mutation: register - email: {}", input.getEmail());
        return authService.register(input);
    }

    /**
     * Authenticate a user and get tokens
     *
     * Example GraphQL mutation:
     * mutation {
     *   login(input: {
     *     email: "john@example.com"
     *     password: "password123"
     *   }) {
     *     accessToken
     *     refreshToken
     *     userId
     *     email
     *     firstName
     *     lastName
     *     role
     *   }
     * }
     */
    @GraphQLMutation(name = "login", description = "Authenticate user and receive access tokens")
    public LoginResponse login(
            @GraphQLArgument(name = "input", description = "Login credentials")
            @Valid LoginRequest input) {

        log.info("GraphQL mutation: login - email: {}", input.getEmail());
        return authService.login(input);
    }

    /**
     * Refresh access token using refresh token
     *
     * Example GraphQL mutation:
     * mutation {
     *   refreshToken(input: {
     *     refreshToken: "your-refresh-token"
     *   }) {
     *     accessToken
     *     refreshToken
     *     userId
     *     email
     *   }
     * }
     */
    @GraphQLMutation(name = "refreshToken", description = "Refresh access token using refresh token")
    public LoginResponse refreshToken(
            @GraphQLArgument(name = "input", description = "Refresh token")
            @Valid TokenRefreshRequest input) {

        log.info("GraphQL mutation: refreshToken");
        return authService.refreshToken(input);
    }

    /**
     * Request password reset
     *
     * Example GraphQL mutation:
     * mutation {
     *   forgotPassword(email: "john@example.com")
     * }
     */
    @GraphQLMutation(name = "forgotPassword", description = "Request password reset email")
    public Boolean forgotPassword(
            @GraphQLArgument(name = "email", description = "User email address")
            String email) {

        log.info("GraphQL mutation: forgotPassword - email: {}", email);
        authService.forgotPassword(email);
        return true;
    }

    /**
     * Reset password using reset token
     *
     * Example GraphQL mutation:
     * mutation {
     *   resetPassword(token: "reset-token", newPassword: "newpassword123")
     * }
     */
    @GraphQLMutation(name = "resetPassword", description = "Reset password using reset token")
    public Boolean resetPassword(
            @GraphQLArgument(name = "token", description = "Password reset token")
            String token,
            @GraphQLArgument(name = "newPassword", description = "New password")
            String newPassword) {

        log.info("GraphQL mutation: resetPassword");
        authService.resetPassword(token, newPassword);
        return true;
    }
}
