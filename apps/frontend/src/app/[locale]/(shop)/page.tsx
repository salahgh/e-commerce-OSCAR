import { useTranslations } from 'next-intl';
import { SortOrder } from '@oscar/graphql-shop/generated';
import {
  BannerCarousel,
  ProductRail,
  ProductGridSection,
  CustomerReviews,
} from '@/components/home';
import { CategoryCircles } from '@/components/patterns';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="px-6 pb-20 pt-8">
      <div className="mx-auto flex w-full max-w-[1392px] flex-col gap-[68px]">
        {/* Hero */}
        <BannerCarousel settingKey="hero" fallbackSrcs={['/images/home/hero-1.png']} alt={t('hero.alt')} priority />

        {/* Shop by category */}
        <CategoryCircles />

        {/* New arrivals */}
        <ProductRail
          title={t('newArrivals')}
          viewAllLabel={t('viewAll')}
          sort={{ createdAt: SortOrder.Desc }}
        />

        {/* Best sellers */}
        <ProductRail
          title={t('bestSellers')}
          viewAllLabel={t('viewAll')}
          sort={{ viewCount: SortOrder.Desc }}
        />

        {/* Promo banner */}
        <BannerCarousel settingKey="banner" fallbackSrcs={['/images/home/banner-1.png']} alt={t('promo.alt')} />

        {/* Product grid */}
        <ProductGridSection />

        {/* Customer reviews */}
        <CustomerReviews />
      </div>
    </div>
  );
}
