// The product gallery and its lightbox share one slide list built from the
// product's assets. Run: pnpm --filter @oscar/frontend test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gallerySlides } from './gallery-slides';

const asset = (id: string, extra: Partial<{ width: number; height: number; name: string }> = {}) => ({
  id,
  preview: `https://cdn/preview-${id}.jpg`,
  source: `https://cdn/source-${id}.jpg`,
  width: 3024,
  height: 4032,
  name: `${id}.jpg`,
  ...extra,
});

test('every asset becomes a slide that serves the preview file at full size', () => {
  const slides = gallerySlides([asset('a'), asset('b')], 'Saucony omni 9');
  assert.deepEqual(
    slides.map((s) => s.src),
    ['https://cdn/preview-a.jpg', 'https://cdn/preview-b.jpg'],
  );
  assert.deepEqual(slides[0], {
    key: 'a',
    src: 'https://cdn/preview-a.jpg',
    alt: 'Saucony omni 9',
    width: 3024,
    height: 4032,
  });
});

test('assets without known dimensions leave width and height out', () => {
  const [slide] = gallerySlides([asset('a', { width: 0, height: 0 })], 'X');
  assert.equal('width' in slide, false);
  assert.equal('height' in slide, false);
});

test('no assets means no slides', () => {
  assert.deepEqual(gallerySlides([], 'X'), []);
});
