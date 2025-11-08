package com.oscar.ecommerce.security;

import com.oscar.ecommerce.domain.User;
import com.oscar.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * Custom UserDetailsService implementation for loading user-specific data.
 * Supports loading users by email or by ID.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by username (email or ID).
     * This method is called by Spring Security during authentication.
     *
     * @param username The email or ID of the user
     * @return UserDetails object containing user information
     * @throws UsernameNotFoundException if user is not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user;

        // Try to parse as ID first (for JWT authentication)
        try {
            Long userId = Long.parseLong(username);
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        } catch (NumberFormatException e) {
            // If not a number, treat as email (for login)
            user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        }

        // Check if user is active
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User account is deactivated");
        }

        return UserPrincipal.create(user);
    }

    /**
     * Load user by ID.
     * Used specifically for JWT token authentication.
     *
     * @param userId The ID of the user
     * @return UserDetails object
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User account is deactivated");
        }

        return UserPrincipal.create(user);
    }
}
