package com.oscar.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * OSCAR Fashion E-commerce Backend Application
 * GraphQL API with Spring Boot 3.x
 *
 * @author OSCAR Fashion Development Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("""

            ╔═══════════════════════════════════════════════════════╗
            ║   OSCAR Fashion E-commerce API                       ║
            ║   GraphQL Endpoint: http://localhost:8080/graphql   ║
            ║   Playground: http://localhost:8080/playground       ║
            ║   Voyager: http://localhost:8080/voyager            ║
            ╚═══════════════════════════════════════════════════════╝

            """);
    }
}
