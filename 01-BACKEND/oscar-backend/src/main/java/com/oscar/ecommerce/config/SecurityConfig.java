package com.oscar.ecommerce.config;

import com.oscar.ecommerce.security.JwtAuthenticationEntryPoint;
import com.oscar.ecommerce.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final Environment environment;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception ->
                    exception.authenticationEntryPoint(unauthorizedHandler)
                )
                .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // Check if dev profile is active
        boolean isDevMode = Arrays.asList(environment.getActiveProfiles()).contains("dev");

        if (isDevMode) {
            // Development mode: Allow all requests without authentication
            http.authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
            );
            System.out.println("⚠️  SECURITY DISABLED - Running in development mode");
        } else {
            // Production mode: Enforce authentication
            http.authorizeHttpRequests(auth -> auth
                    // Public endpoints
                    .requestMatchers("/graphql").permitAll()
                    .requestMatchers("/playground").permitAll()
                    .requestMatchers("/voyager").permitAll()
                    .requestMatchers("/graphiql").permitAll()
                    .requestMatchers("/gui/**").permitAll()
                    .requestMatchers("/vendor/**").permitAll()
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/actuator/info").permitAll()

                    // Admin endpoints
                    .requestMatchers("/actuator/**").hasRole("ADMIN")

                    // All other requests must be authenticated
                    .anyRequest().authenticated()
            );

            http.authenticationProvider(authenticationProvider());
            http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from frontend, backoffice, and mobile
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",     // Next.js Frontend
                "http://localhost:3001",     // React Backoffice
                "http://localhost:19006",    // Expo mobile dev
                "exp://localhost:19000",     // Expo alternative
                "https://oscar-fashion.com", // Production frontend
                "https://admin.oscar-fashion.com" // Production backoffice
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
