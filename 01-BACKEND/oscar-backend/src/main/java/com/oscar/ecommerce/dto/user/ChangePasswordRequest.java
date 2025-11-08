package com.oscar.ecommerce.dto.user;

import io.leangen.graphql.annotations.GraphQLInputField;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for changing password
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @GraphQLInputField(name = "currentPassword", description = "Current password")
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @GraphQLInputField(name = "newPassword", description = "New password")
    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
}
