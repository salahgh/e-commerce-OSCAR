'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import type { GallerySlide } from '@/lib/catalog/gallery-slides';

/**
 * Fullscreen view of the product photos: fitted to the screen, pinch /
 * double-tap / wheel / click to zoom, drag to pan, swipe or arrows between
 * photos. `index` is controlled by the gallery so both stay on the same photo.
 */
export function ProductLightbox({
  slides,
  open,
  index,
  onClose,
  onIndexChange,
}: {
  slides: GallerySlide[];
  open: boolean;
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const t = useTranslations('ProductPage');
  const single = slides.length <= 1;

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom]}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      carousel={{ finite: true, padding: 0, imageFit: 'contain' }}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true, doubleClickMaxStops: 2 }}
      controller={{ closeOnBackdropClick: true }}
      render={single ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
      labels={{
        Close: t('zoomClose'),
        Previous: t('galleryPrev'),
        Next: t('galleryNext'),
        'Zoom in': t('zoomIn'),
        'Zoom out': t('zoomOut'),
      }}
      styles={{ root: { zIndex: 200 }, container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
    />
  );
}
