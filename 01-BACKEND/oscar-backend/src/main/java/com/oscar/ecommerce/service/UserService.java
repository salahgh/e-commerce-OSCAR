package com.oscar.ecommerce.service;

import com.oscar.ecommerce.domain.User;
import com.oscar.ecommerce.dto.user.ChangePasswordRequest;
import com.oscar.ecommerce.dto.user.UpdateProfileRequest;
import com.oscar.ecommerce.dto.user.UserProfileResponse;
import com.oscar.ecommerce.exception.AuthenticationException;
import com.oscar.ecommerce.exception.ResourceNotFoundException;
import com.oscar.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user profiles
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;

    /**
     * Get user profile by ID
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        log.debug("Fetching profile for user id: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return mapToResponse(user);
    }

    /**
     * Get user profile by email
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByEmail(String email) {
        log.debug("Fetching profile for user email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return mapToResponse(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating profile for user id: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Update fields if provided
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if email is already taken
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());
            user.setEmailVerified(false); // Require re-verification
        }

        if (request.getPhone() != null) {
            user.setPhoneNumber(request.getPhone());
        }

        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", userId);

        return mapToResponse(updatedUser);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        log.info("Changing password for user id: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify current password
//        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
//            throw new AuthenticationException("Current password is incorrect");
//        }

        // Validate new password is different
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
//        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", userId);
    }

    /**
     * Delete user account
     */
    @Transactional
    public void deleteAccount(Long userId) {
        log.info("Deleting account for user id: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Soft delete - just deactivate the account
        user.setIsActive(false);
        userRepository.save(user);

        log.info("Account deactivated successfully for user: {}", userId);
    }

    /**
     * Get all users (Admin only)
     */
    @Transactional(readOnly = true)
    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {
        log.debug("Fetching all users with pagination");

        return userRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get users by role (Admin only)
     */
    @Transactional(readOnly = true)
    public Page<UserProfileResponse> getUsersByRole(String role, Pageable pageable) {
        log.debug("Fetching users with role: {}", role);

        return userRepository.findByRole(com.oscar.ecommerce.domain.enums.UserRole.valueOf(role), pageable)
                .map(this::mapToResponse);
    }

    /**
     * Activate/Deactivate user account (Admin only)
     */
    @Transactional
    public UserProfileResponse toggleUserStatus(Long userId) {
        log.info("Toggling status for user id: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);

        log.info("User status toggled successfully: {}", userId);

        return mapToResponse(updatedUser);
    }

    /**
     * Map User entity to UserProfileResponse DTO
     */
    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
