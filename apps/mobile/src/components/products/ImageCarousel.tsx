import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { spacing, makeThemedStyles, useThemeColors } from '../../theme';
import { ZoomableImage } from './ZoomableImage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageCarouselProps {
  images: string[];
  showThumbnails?: boolean;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  enableZoom?: boolean;
  height?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  showThumbnails = true,
  showIndicators = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  enableZoom = true,
  height = 400,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const modalFlatListRef = useRef<FlatList>(null);
  const colors = useThemeColors();
  const styles = useStyles();
  const { t } = useTranslation();

  // Auto play functionality
  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setActiveIndex(nextIndex);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, activeIndex, images.length, autoPlayInterval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  const handleModalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    if (index !== modalIndex && index >= 0 && index < images.length) {
      setModalIndex(index);
    }
  };

  const handleThumbnailPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const openModal = (index: number) => {
    if (enableZoom) {
      setModalIndex(index);
      setModalVisible(true);
    }
  };

  const renderMainImage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={enableZoom ? 0.9 : 1}
      onPress={() => openModal(index)}
      style={[styles.mainImageContainer, { height }]}
    >
      <Image source={{ uri: item }} style={styles.mainImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[styles.thumbnail, activeIndex === index && styles.thumbnailActive]}
      onPress={() => handleThumbnailPress(index)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item }} style={styles.thumbnailImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  const [isZoomed, setIsZoomed] = useState(false);

  const renderModalImage = ({ item }: { item: string }) => (
    <View style={styles.modalImageContainer}>
      <ZoomableImage uri={item} onZoomChange={setIsZoomed} />
    </View>
  );

  if (images.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Ionicons name="image-outline" size={64} color={colors.text.tertiary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Image Carousel */}
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderMainImage}
        keyExtractor={(_, index) => `main-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={`indicator-${index}`}
              style={[styles.indicator, activeIndex === index && styles.indicatorActive]}
            />
          ))}
        </View>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <FlatList
          data={images}
          renderItem={renderThumbnail}
          keyExtractor={(_, index) => `thumb-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
        />
      )}

      {/* Zoom/Lightbox Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <StatusBar backgroundColor={colors.black} barStyle="light-content" />
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>

          {/* Image Counter */}
          <View style={styles.counterContainer}>
            <Ionicons name="images-outline" size={16} color={colors.white} />
            <Text style={styles.counterText}>
              {modalIndex + 1} / {images.length}
            </Text>
          </View>

          {/* Zoom Hint */}
          {!isZoomed && (
            <View style={styles.zoomHint}>
              <Ionicons name="expand-outline" size={16} color={colors.white} />
              <Text style={styles.zoomHintText}>{t('products.pinchToZoom')}</Text>
            </View>
          )}

          {/* Modal Images */}
          <FlatList
            ref={modalFlatListRef}
            data={images}
            renderItem={renderModalImage}
            keyExtractor={(_, index) => `modal-${index}`}
            horizontal
            pagingEnabled={!isZoomed}
            scrollEnabled={!isZoomed}
            showsHorizontalScrollIndicator={false}
            onScroll={handleModalScroll}
            scrollEventThrottle={16}
            initialScrollIndex={modalIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />

          {/* Modal Indicators */}
          <View style={styles.modalIndicatorContainer}>
            {images.map((_, index) => (
              <View
                key={`modal-indicator-${index}`}
                style={[styles.modalIndicator, modalIndex === index && styles.modalIndicatorActive]}
              />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
    },
    mainImageContainer: {
      width: SCREEN_WIDTH,
      backgroundColor: colors.background,
    },
    mainImage: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.md,
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.white,
      opacity: 0.5,
      marginHorizontal: 4,
    },
    indicatorActive: {
      width: 24,
      opacity: 1,
      backgroundColor: colors.primary,
    },
    thumbnailsContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    thumbnail: {
      width: 60,
      height: 60,
      marginRight: spacing.sm,
      borderRadius: spacing.borderRadius.sm,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.transparent,
    },
    thumbnailActive: {
      borderColor: colors.primary,
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.black,
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.overlayWhite,
      justifyContent: 'center',
      alignItems: 'center',
    },
    counterContainer: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.overlayWhite,
      borderRadius: 12,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
    },
    counterText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    zoomHint: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.overlay,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    zoomHintText: {
      color: colors.white,
      fontSize: 12,
    },
    modalImageContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalIndicatorContainer: {
      position: 'absolute',
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.white,
      opacity: 0.5,
      marginHorizontal: 4,
    },
    modalIndicatorActive: {
      width: 24,
      opacity: 1,
    },
  })
);
