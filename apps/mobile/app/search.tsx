import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSearchProductsQuery } from '../src/graphql/generated/graphql';
import { SimpleProduct } from '../src/components/products/ProductCard';
import { ProductCardFigma, FigmaProduct } from '../src/components/home/ProductCardFigma';
import { LoadingSpinner, EmptyState } from '../src/components/ui';
import { colors, spacing, typography } from '../src/theme';
import { formatPrice } from '../src/utils/vendureAdapters';

const SEARCH_HISTORY_KEY = '@oscar_search_history';
const MAX_HISTORY_ITEMS = 10;
const SEARCH_DEBOUNCE_MS = 300;

// Popular/trending searches (can be fetched from API)
const popularSearches = [
  'Robe',
  'Chemise',
  'Pantalon',
  'Veste',
  'Chaussures',
  'Sac',
  'Bijoux',
  'Accessoires',
];

export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch search results
  const { data, loading, error } = useSearchProductsQuery({
    variables: {
      input: { term: debouncedQuery, take: 20, groupByProduct: true },
    },
    skip: !debouncedQuery || debouncedQuery.length < 2,
  });

  // Transform Vendure search results to SimpleProduct format
  const searchResults: SimpleProduct[] = (data?.search?.items || []).map((item: any) => {
    const price = item.priceWithTax;
    const priceValue = price?.__typename === 'SinglePrice' ? price.value : price?.min;
    return {
      id: item.productId,
      name: item.productName,
      slug: item.slug,
      description: item.description,
      imageUrl: item.productAsset?.preview,
      price: formatPrice(priceValue || 0),
      inStock: item.inStock,
    };
  });

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
    // Auto-focus search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery.trim());
        setShowResults(true);
      } else {
        setDebouncedQuery('');
        setShowResults(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (query: string) => {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      const updatedHistory = [
        trimmedQuery,
        ...searchHistory.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase()),
      ].slice(0, MAX_HISTORY_ITEMS);

      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const removeHistoryItem = async (item: string) => {
    try {
      const updatedHistory = searchHistory.filter(
        (h) => h.toLowerCase() !== item.toLowerCase()
      );
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  };

  const handleSearch = useCallback(() => {
    Keyboard.dismiss();
    if (searchQuery.trim().length >= 2) {
      saveSearchHistory(searchQuery.trim());
      setDebouncedQuery(searchQuery.trim());
      setShowResults(true);
    }
  }, [searchQuery, searchHistory]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    saveSearchHistory(suggestion);
    setDebouncedQuery(suggestion);
    setShowResults(true);
    Keyboard.dismiss();
  }, [searchHistory]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setShowResults(false);
    searchInputRef.current?.focus();
  }, []);

  const handleGoBack = useCallback(() => {
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  }, []);

  const handleProductPress = useCallback((product: SimpleProduct) => {
    router.push(`/products/${product.id}`);
  }, []);

  const handleViewAllResults = useCallback(() => {
    if (debouncedQuery) {
      router.push(`/(tabs)/explore?q=${encodeURIComponent(debouncedQuery)}`);
    }
  }, [debouncedQuery]);

  // Render search suggestion item
  const renderSuggestionItem = ({ item, isHistory = false }: { item: string; isHistory?: boolean }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionLeft}>
        <Ionicons
          name={isHistory ? 'time-outline' : 'search-outline'}
          size={20}
          color={colors.text.tertiary}
        />
        <Text style={styles.suggestionText}>{item}</Text>
      </View>
      {isHistory && (
        <TouchableOpacity
          onPress={() => removeHistoryItem(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Render product result item
  const renderProductItem = ({ item }: { item: SimpleProduct }) => (
    <View style={styles.productItem}>
      <ProductCardFigma
        product={{ ...item, rating: 0, reviewCount: 0 }}
        onPress={() => handleProductPress(item)}
      />
    </View>
  );

  // Render suggestions (history + popular)
  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      {/* Search History */}
      {searchHistory.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('search.recentSearches', 'Recent Searches')}</Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={styles.clearText}>{t('common.clearAll', 'Clear All')}</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item) => (
            <View key={item}>
              {renderSuggestionItem({ item, isHistory: true })}
            </View>
          ))}
        </View>
      ) : null}

      {/* Popular Searches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('search.popularSearches', 'Popular Searches')}</Text>
        <View style={styles.popularTags}>
          {popularSearches.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.popularTag}
              onPress={() => handleSuggestionPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.popularTagText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Render search results
  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('search.searching', 'Searching...')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{t('common.error', 'Something went wrong')}</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title={t('search.noResults', 'No results found')}
          message={t('search.noResultsMessage', `No products found for "${debouncedQuery}". Try a different search term.`)}
        />
      );
    }

    return (
      <View style={styles.resultsContainer}>
        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchResults.length} {t('search.results', 'results')} for "{debouncedQuery}"
          </Text>
          <TouchableOpacity onPress={handleViewAllResults}>
            <Text style={styles.viewAllText}>{t('common.viewAll', 'View All')}</Text>
          </TouchableOpacity>
        </View>

        {/* Results Grid */}
        <FlatList
          data={searchResults}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id?.toString() || ''}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsGrid}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={t('search.placeholder', 'Search products...')}
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {showResults ? renderResults() : renderSuggestions()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  clearText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  suggestionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  popularTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularTagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  resultsGrid: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
});
