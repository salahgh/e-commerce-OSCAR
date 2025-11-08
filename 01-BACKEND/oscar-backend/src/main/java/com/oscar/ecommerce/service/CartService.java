package com.oscar.ecommerce.service;

import com.oscar.ecommerce.domain.Cart;
import com.oscar.ecommerce.domain.CartItem;
import com.oscar.ecommerce.domain.Product;
import com.oscar.ecommerce.domain.User;
import com.oscar.ecommerce.dto.cart.AddToCartRequest;
import com.oscar.ecommerce.dto.cart.CartResponse;
import com.oscar.ecommerce.dto.cart.UpdateCartItemRequest;
import com.oscar.ecommerce.exception.ResourceNotFoundException;
import com.oscar.ecommerce.repository.CartRepository;
import com.oscar.ecommerce.repository.ProductRepository;
import com.oscar.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Service for managing shopping cart operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Get user's cart
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createCartForUser(user));

        return mapToResponse(cart);
    }

    /**
     * Add item to cart
     */
    @Transactional
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        // Check stock availability
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getNameEn());
        }

        // Get or create cart
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createCartForUser(user));

        // Check if product already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId())
                        && item.getSelectedSize().equals(request.getSelectedSize())
                        && item.getSelectedColor().equals(request.getSelectedColor()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();

            // Check stock for new quantity
            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getNameEn());
            }

            item.setQuantity(newQuantity);
            item.setSubtotal(product.getSalePrice() != null
                    ? product.getSalePrice().multiply(BigDecimal.valueOf(newQuantity))
                    : product.getBasePrice().multiply(BigDecimal.valueOf(newQuantity)));
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setSelectedSize(request.getSelectedSize());
            newItem.setSelectedColor(request.getSelectedColor());
            newItem.setPrice(product.getSalePrice() != null ? product.getSalePrice() : product.getBasePrice());
            newItem.setSubtotal(newItem.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

            cart.getItems().add(newItem);
        }

        // Update cart total
        updateCartTotal(cart);

        cart = cartRepository.save(cart);
        log.info("Added product {} to cart for user {}", product.getNameEn(), user.getEmail());

        return mapToResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartResponse updateCartItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user", "userId", userId));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        // Check stock availability
        if (item.getProduct().getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock for product: " + item.getProduct().getNameEn());
        }

        // Update quantity and subtotal
        item.setQuantity(request.getQuantity());
        item.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        // Update cart total
        updateCartTotal(cart);

        cart = cartRepository.save(cart);
        log.info("Updated cart item {} for user {}", itemId, user.getEmail());

        return mapToResponse(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartResponse removeFromCart(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user", "userId", userId));

        cart.getItems().removeIf(item -> item.getId().equals(itemId));

        // Update cart total
        updateCartTotal(cart);

        cart = cartRepository.save(cart);
        log.info("Removed item {} from cart for user {}", itemId, user.getEmail());

        return mapToResponse(cart);
    }

    /**
     * Clear cart
     */
    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user", "userId", userId));

        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);

        cartRepository.save(cart);
        log.info("Cleared cart for user {}", user.getEmail());
    }

    /**
     * Create cart for new user
     */
    private Cart createCartForUser(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setTotalAmount(BigDecimal.ZERO);
        return cartRepository.save(cart);
    }

    /**
     * Update cart total amount
     */
    private void updateCartTotal(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalAmount(total);
    }

    /**
     * Map Cart to CartResponse
     */
    private CartResponse mapToResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(cart.getItems().stream()
                        .map(item -> CartResponse.CartItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProduct().getId())
                                .productName(item.getProduct().getNameEn())
                                .productImage(item.getProduct().getImageUrls().isEmpty()
                                        ? null
                                        : item.getProduct().getImageUrls().get(0))
                                .quantity(item.getQuantity())
                                .selectedSize(item.getSelectedSize())
                                .selectedColor(item.getSelectedColor())
                                .price(item.getPrice())
                                .subtotal(item.getSubtotal())
                                .build())
                        .toList())
                .totalAmount(cart.getTotalAmount())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
