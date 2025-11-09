package com.oscar.ecommerce.resolver;

import com.oscar.ecommerce.dto.cart.AddToCartRequest;
import com.oscar.ecommerce.dto.cart.CartResponse;
import com.oscar.ecommerce.dto.cart.UpdateCartItemRequest;
import com.oscar.ecommerce.service.CartService;
 import com.oscar.ecommerce.util.SecurityUtil;
import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * GraphQL resolver for shopping cart operations
 */
@Service
@GraphQLApi
@RequiredArgsConstructor
@Validated
@Slf4j
public class CartResolver {

    private final CartService cartService;

    /**
     * Get current user's cart
     *
     * Example GraphQL query:
     * query {
     *   myCart {
     *     id
     *     userId
     *     items {
     *       id
     *       productId
     *       productName
     *       productImage
     *       quantity
     *       selectedSize
     *       selectedColor
     *       price
     *       subtotal
     *     }
     *     totalAmount
     *     createdAt
     *     updatedAt
     *   }
     * }
     */
    @GraphQLQuery(name = "myCart", description = "Get current user's shopping cart")
    @PreAuthorize("isAuthenticated()")
    public CartResponse getMyCart() {
        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL query: myCart - userId: {}", userId);

        return cartService.getCart(userId);
    }

    /**
     * Add item to cart
     *
     * Example GraphQL mutation:
     * mutation {
     *   addToCart(input: {
     *     productId: 1
     *     quantity: 2
     *     selectedSize: "M"
     *     selectedColor: "Blue"
     *   }) {
     *     id
     *     items {
     *       id
     *       productName
     *       quantity
     *       subtotal
     *     }
     *     totalAmount
     *   }
     * }
     */
    @GraphQLMutation(name = "addToCart", description = "Add item to shopping cart")
    @PreAuthorize("isAuthenticated()")
    public CartResponse addToCart(
            @GraphQLArgument(name = "input", description = "Item to add to cart")
            @Valid AddToCartRequest input) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: addToCart - userId: {}, productId: {}", userId, input.getProductId());

        return cartService.addToCart(userId, input);
    }

    /**
     * Update cart item quantity
     *
     * Example GraphQL mutation:
     * mutation {
     *   updateCartItem(itemId: 1, input: {
     *     quantity: 3
     *   }) {
     *     id
     *     items {
     *       id
     *       productName
     *       quantity
     *       subtotal
     *     }
     *     totalAmount
     *   }
     * }
     */
    @GraphQLMutation(name = "updateCartItem", description = "Update cart item quantity")
    @PreAuthorize("isAuthenticated()")
    public CartResponse updateCartItem(
            @GraphQLArgument(name = "itemId", description = "Cart item ID")
            Long itemId,
            @GraphQLArgument(name = "input", description = "Updated quantity")
            @Valid UpdateCartItemRequest input) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: updateCartItem - userId: {}, itemId: {}", userId, itemId);

        return cartService.updateCartItem(userId, itemId, input);
    }

    /**
     * Remove item from cart
     *
     * Example GraphQL mutation:
     * mutation {
     *   removeFromCart(itemId: 1) {
     *     id
     *     items {
     *       id
     *       productName
     *       quantity
     *     }
     *     totalAmount
     *   }
     * }
     */
    @GraphQLMutation(name = "removeFromCart", description = "Remove item from shopping cart")
    @PreAuthorize("isAuthenticated()")
    public CartResponse removeFromCart(
            @GraphQLArgument(name = "itemId", description = "Cart item ID to remove")
            Long itemId) {

        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: removeFromCart - userId: {}, itemId: {}", userId, itemId);

        return cartService.removeFromCart(userId, itemId);
    }

    /**
     * Clear entire cart
     *
     * Example GraphQL mutation:
     * mutation {
     *   clearCart
     * }
     */
    @GraphQLMutation(name = "clearCart", description = "Clear all items from shopping cart")
    @PreAuthorize("isAuthenticated()")
    public Boolean clearCart() {
        Long userId = SecurityUtil.getCurrentUserId();
        log.info("GraphQL mutation: clearCart - userId: {}", userId);

        cartService.clearCart(userId);
        return true;
    }
}
