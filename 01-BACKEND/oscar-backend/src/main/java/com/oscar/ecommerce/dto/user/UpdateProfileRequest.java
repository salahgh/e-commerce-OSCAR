package com.oscar.ecommerce.dto.user;

import io.leangen.graphql.annotations.GraphQLInputField;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating user profile
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @GraphQLInputField(name = "firstName", description = "First name")
    private String firstName;

    @GraphQLInputField(name = "lastName", description = "Last name")
    private String lastName;

    @GraphQLInputField(name = "email", description = "Email address")
    @Email(message = "Invalid email format")
    private String email;

    @GraphQLInputField(name = "phone", description = "Phone number")
    private String phone;
}
