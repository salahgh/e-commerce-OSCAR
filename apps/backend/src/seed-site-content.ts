import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { AssetService, ChannelService, RequestContext, bootstrapWorker } from '@vendure/core';
import { config } from './vendure-config';

/**
 * Seed the default channel's Site Content custom fields (header/footer/home).
 * Idempotent: re-uploads are skipped (assets are matched by filename) and the
 * channel fields are simply overwritten with the canonical defaults.
 *
 * Reused by `populate.ts` and runnable standalone:
 *   pnpm --filter @oscar/backend seed:site-content
 */
export async function seedSiteContent(
  ctx: RequestContext,
  channelService: ChannelService,
  assetService: AssetService,
): Promise<void> {
  const homeImagesDir = path.join(__dirname, '../../frontend/public/images/home');

  const uploadHomeImage = async (filename: string): Promise<string | number | undefined> => {
    const imgPath = path.join(homeImagesDir, filename);
    if (!fs.existsSync(imgPath)) {
      console.log(`  ⚠️  Home image not found, skipping: ${filename}`);
      return undefined;
    }
    const existing = await assetService.findAll(ctx, { filter: { name: { eq: filename } } });
    if (existing.items.length > 0) return existing.items[0].id;
    try {
      const stream = fs.createReadStream(imgPath);
      const result: any = await (assetService as any).createFromFileStream(stream, filename, ctx);
      return result && 'id' in result ? result.id : undefined;
    } catch (e: any) {
      console.log(`  ⚠️  Home image upload failed: ${filename}: ${e?.message ?? e}`);
      return undefined;
    }
  };

  const heroId = await uploadHomeImage('hero-1.png');
  const bannerId = await uploadHomeImage('banner-1.png');
  const reviewIds: Array<string | number> = [];
  for (const f of ['review-1.png', 'review-2.png', 'review-3.png', 'review-4.png', 'review-5.png']) {
    const id = await uploadHomeImage(f);
    if (id) reviewIds.push(id);
  }

  const channel = await channelService.getDefaultChannel();
  await channelService.update(ctx, {
    id: channel.id,
    customFields: {
      promoTextAr: 'شحن مجاني للطلبات التي تزيد قيمتها عن 12000 دينار جزائري',
      promoTextFr: 'Livraison gratuite pour les commandes de plus de 12000 DZD',
      promoTextEn: 'Free shipping on orders over 12,000 DZD',
      freeShippingThreshold: 12000,
      contactEmail: 'contact@oscarfashion.dz',
      contactPhone: '+213 555 000 000',
      footerAddressAr: 'شارع ديدوش مراد، الجزائر العاصمة 16000',
      footerAddressFr: 'Rue Didouche Mourad, Alger 16000',
      footerAddressEn: 'Didouche Mourad St, Algiers 16000',
      socialFacebook: 'https://facebook.com',
      socialInstagram: 'https://instagram.com',
      socialTwitter: 'https://twitter.com',
      socialLinkedin: 'https://linkedin.com',
      socialYoutube: 'https://youtube.com',
      appAppStore: 'https://apps.apple.com',
      appGooglePlay: 'https://play.google.com',
      reviewsTitleAr: 'آراء عملائنا',
      reviewsTitleFr: 'Avis de nos clients',
      reviewsTitleEn: 'Customer reviews',
      reviewsSubtitleAr: 'نفخر بثقة عملائنا ونسعى دائمًا لتقديم تجربة تسوق مميزة تلبي توقعاتهم وتفوقها.',
      reviewsSubtitleFr:
        'Nous sommes fiers de la confiance de nos clients et offrons toujours une expérience d’achat exceptionnelle.',
      reviewsSubtitleEn:
        'We take pride in our customers’ trust and always strive to deliver an outstanding shopping experience.',
      copyrightTextAr: 'OSCAR Fashion 2026 ©',
      copyrightTextFr: 'OSCAR Fashion 2026 ©',
      copyrightTextEn: 'OSCAR Fashion 2026 ©',
      // Hero & banner are both multi-image carousels — seed 2 each (reusing the
      // two available large images) so the carousels are demonstrable.
      ...(heroId || bannerId ? { heroImagesIds: [heroId, bannerId].filter(Boolean) } : {}),
      ...(bannerId || heroId ? { bannerImagesIds: [bannerId, heroId].filter(Boolean) } : {}),
      ...(reviewIds.length ? { reviewImagesIds: reviewIds } : {}),
    } as any,
  });
  console.log('  ✓ Site content seeded on default channel');
}

// Standalone runner
if (require.main === module) {
  (async () => {
    const { app } = await bootstrapWorker(config);
    const channelService = app.get(ChannelService);
    const assetService = app.get(AssetService);
    const channel = await channelService.getDefaultChannel();
    const ctx = new RequestContext({
      channel,
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
    } as any);
    await seedSiteContent(ctx, channelService, assetService);
    await app.close();
    process.exit(0);
  })().catch((err) => {
    console.error('❌ Site content seed failed:', err);
    process.exit(1);
  });
}
