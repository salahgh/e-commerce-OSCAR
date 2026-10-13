// One slide per product asset, shared by the on-page slider and the lightbox.
// The preview file is what the storefront already serves and is stored at the
// photo's full size, so it is also what the zoomed view loads.

export type GalleryAsset = {
  id: string;
  preview: string;
  width?: number | null;
  height?: number | null;
};

export type GallerySlide = {
  key: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export function gallerySlides(assets: GalleryAsset[], productName: string): GallerySlide[] {
  return assets.map((a) => {
    const slide: GallerySlide = { key: a.id, src: a.preview, alt: productName };
    if (a.width && a.height) {
      slide.width = a.width;
      slide.height = a.height;
    }
    return slide;
  });
}
