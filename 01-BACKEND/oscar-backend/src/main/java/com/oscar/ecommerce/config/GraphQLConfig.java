package com.oscar.ecommerce.config;

import graphql.scalars.ExtendedScalars;
import graphql.schema.GraphQLScalarType;
import io.leangen.graphql.ExtendedGeneratorConfiguration;
import io.leangen.graphql.GeneratorConfiguration;
import io.leangen.graphql.metadata.strategy.query.AnnotatedResolverBuilder;
import io.leangen.graphql.metadata.strategy.query.PublicResolverBuilder;
import io.leangen.graphql.metadata.strategy.value.jackson.JacksonValueMapperFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * GraphQL SPQR configuration
 */
@Configuration
public class GraphQLConfig {

    /**
     * Configure GraphQL schema generation
     */
    // GraphQL SPQR auto-configuration will handle this
    // No custom configuration needed

    /**
     * Register custom GraphQL scalars
     */
    @Bean
    public GraphQLScalarType bigDecimalScalar() {
        return ExtendedScalars.GraphQLBigDecimal;
    }

    @Bean
    public GraphQLScalarType longScalar() {
        return ExtendedScalars.GraphQLLong;
    }

    @Bean
    public GraphQLScalarType dateTimeScalar() {
        return ExtendedScalars.DateTime;
    }
}
