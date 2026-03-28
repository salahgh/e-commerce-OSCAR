import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useGetNewArrivalsQuery,
  useSearchProductsQuery,
  useGetBannerSlidesQuery,
} from '@/src/graphql/generated/graphql';
import {
  SearchHeader,
  CategoryTabs,
  SectionHeader,
  ProductCardFigma,
  PromoBanner,
} from '@/src/components/home';
import type { FigmaProduct } from '@/src/components/home';
import { LoadingSpinner, ErrorState } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import { formatPrice } from '@/src/utils/vendureAdapters';
import { parseProductDiscount } from '@/src/utils/discountParser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [bannerIndex, setBannerIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Fetch banner slides from Vendure "banners" collection
  const {
    data: bannerData,
    error: bannerError,
    refetch: refetchBanners,
  } = useGetBannerSlidesQuery();

  const bannerSlides = (bannerData?.collection?.children ?? [])
    .filter((child) => child.featuredAsset?.preview)
    .sort((a, b) => (a.customFields?.displayOrder ?? 0) - (b.customFields?.displayOrder ?? 0));

  // Fetch featured products (best sellers)
  const {
    data: featuredData,
    loading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useSearchProductsQuery({
    variables: {
      input: {
        take: 10,
        groupByProduct: true,
        ...(selectedCategory ? { collectionSlug: selectedCategory } : {}),
      },
    },
  });

  // Fetch new arrivals
  const {
    data: newArrivalsData,
    loading: newArrivalsLoading,
    refetch: refetchNewArrivals,
  } = useGetNewArrivalsQuery({
    variables: { take: 10 },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBanners(),
        refetchFeatured(),
        refetchNewArrivals(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBanners, refetchFeatured, refetchNewArrivals]);

  const handleSeeAllNewArrivals = () => {
    router.push('/products?sort=newest');
  };
  //
  // const handleSeeAllBestSellers = () => {
  //   router.push('/products?featured=true');
  // };

  // const loading = featuredLoading && newArrivalsLoading;

  // if (loading && !refreshing) {
  //   return <LoadingSpinner />;
  // }
  //
  // if (featuredError) {
  //   return (
  //     <ErrorState
  //       title={t('common.error')}
  //       message={featuredError.message}
  //       onRetry={handleRefresh}
  //     />
  //   );
  // }

  // Transform search results to FigmaProduct format
  // const transformSearchItem = (item: any): FigmaProduct => {
  //   const price = item.priceWithTax;
  //   const priceValue = price?.__typename === 'SinglePrice' ? price.value : price?.min;
  //   return {
  //     id: item.productId,
  //     name: item.productName,
  //     slug: item.slug,
  //     imageUrl: item.productAsset?.preview,
  //     price: formatPrice(priceValue || 0),
  //     inStock: item.inStock,
  //     rating: 4,
  //     reviewCount: 2,
  //   };
  // };

  // Transform product items to FigmaProduct format
  const transformProductItem = (product: any): FigmaProduct => {
    const defaultVariant = product.variants?.[0];
    const priceInCents = defaultVariant?.priceWithTax ?? 0;
    const discount = parseProductDiscount(product.collections, priceInCents);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.featuredAsset?.preview,
      price: formatPrice(discount.salePrice),
      originalPrice: discount.hasDiscount ? formatPrice(discount.originalPrice) : null,
      discountPercent: discount.hasDiscount ? discount.percentage : null,
      inStock: defaultVariant?.stockLevel !== 'OUT_OF_STOCK',
      rating: 4,
      reviewCount: 2,
    };
  };

  // const bestSellers: FigmaProduct[] = (featuredData?.search?.items || []).map(transformSearchItem);
  const newArrivals: FigmaProduct[] = (newArrivalsData?.products?.items || []).map(transformProductItem);
  // // Picked-for-you: combine and deduplicate
  // const pickedForYou: FigmaProduct[] = [...newArrivals, ...bestSellers]
  //   .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
  //   .slice(0, 6);
  //
  const handleBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index !== bannerIndex && index >= 0 && index < bannerSlides.length) {
      setBannerIndex(index);
    }
  };

  // Render a horizontal product list
  const renderProductRow = (products: FigmaProduct[]) => (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View style={styles.productCardWrapper}>
          <ProductCardFigma product={item} />
        </View>
      )}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.productListContent}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >

        {/* 1. Search Header */}
        <SearchHeader />

        {/* 2. Category Tabs — dynamic from backend */}
        <CategoryTabs onCategoryChange={setSelectedCategory} />

        {/* 3. Banner Carousel — driven by Vendure "banners" collection */}
        {bannerSlides.length > 0 && (
          <View style={styles.bannerSection}>
            <Animated.FlatList
              data={bannerSlides}
              renderItem={({ item }) => (
                <View style={styles.bannerSlide}>
                  <PromoBanner
                    imageUrl={item.featuredAsset!.preview}
                    height={190}
                    onPress={() => item.slug && router.push(`/products?category=${item.slug}` as any)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={handleBannerScroll}
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
            />
            {/* Pagination Dots */}
            {bannerSlides.length > 1 && (
              <View style={styles.dotsContainer}>
                {bannerSlides.map((_, i) => {
                  const inputRange = [
                    (i - 1) * SCREEN_WIDTH,
                    i * SCREEN_WIDTH,
                    (i + 1) * SCREEN_WIDTH,
                  ];
                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
                    extrapolate: 'clamp',
                  });
                  const dotOpacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.4, 1, 0.4],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      key={i}
                      style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* 4. New Arrivals */}
        {newArrivals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t('home.newArrivals')} onSeeAll={handleSeeAllNewArrivals} />
            {renderProductRow(newArrivals)}
          </View>
        )}

        {/* 5. Promo Banner */}
        {/*<PromoBanner*/}
        {/*  imageUrl={promoBanner1}*/}
        {/*  onPress={() => router.push('/products')}*/}
        {/*/>*/}

        {/* 6. Best Sellers */}
        {/*{bestSellers.length > 0 && (*/}
        {/*  <View style={styles.section}>*/}
        {/*    <SectionHeader title={t('home.bestSellers')} onSeeAll={handleSeeAllBestSellers} />*/}
        {/*    {renderProductRow(bestSellers)}*/}
        {/*  </View>*/}
        {/*)}*/}

        {/* 7. Another Promo Banner */}
        {/*<PromoBanner*/}
        {/*  imageUrl={promoBanner2}*/}
        {/*  onPress={() => router.push('/products')}*/}
        {/*/>*/}

        {/* 8. Picked for You — 2-column grid, NO "See All" */}
        {/*{pickedForYou.length > 0 && (*/}
        {/*  <View style={styles.section}>*/}
        {/*    <SectionHeader title={t('home.pickedForYou')} />*/}
        {/*    <View style={styles.gridContainer}>*/}
        {/*      {pickedForYou.map((product) => (*/}
        {/*        <View key={product.id} style={styles.gridItem}>*/}
        {/*          <ProductCardFigma product={product} />*/}
        {/*        </View>*/}
        {/*      ))}*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*)}*/}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bannerSection: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  bannerSlide: {
    width: SCREEN_WIDTH,
    height: 190 + spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  productListContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  productCardWrapper: {
    // Let the card define its own width (170px)
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },
});
