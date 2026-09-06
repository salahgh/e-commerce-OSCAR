/**
 * Storefront analytics — the single entry point pages and contexts import.
 *
 * Every funnel event is fanned out to each ad pixel (Meta, TikTok) so both
 * platforms always see the identical funnel. Each pixel module stays a no-op
 * unless its NEXT_PUBLIC_*_PIXEL_ID is set, so any subset can be enabled per
 * environment.
 */

import * as meta from './meta-pixel';
import * as tiktok from './tiktok-pixel';

type Item = Parameters<typeof meta.trackViewContent>[0];
type CartItem = Parameters<typeof meta.trackAddToCart>[0];
type Cart = Parameters<typeof meta.trackInitiateCheckout>[0];
type Order = Parameters<typeof meta.trackPurchase>[0];

export function trackPageView(): void {
  meta.trackPageView();
  tiktok.trackPageView();
}

export function trackViewContent(item: Item): void {
  meta.trackViewContent(item);
  tiktok.trackViewContent(item);
}

export function trackAddToCart(item: CartItem): void {
  meta.trackAddToCart(item);
  tiktok.trackAddToCart(item);
}

export function trackInitiateCheckout(cart: Cart): void {
  meta.trackInitiateCheckout(cart);
  tiktok.trackInitiateCheckout(cart);
}

export function trackPurchase(order: Order): void {
  meta.trackPurchase(order);
  tiktok.trackPurchase(order);
}
