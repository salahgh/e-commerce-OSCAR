import { Metadata } from 'next';
import { HomePageJsonLd } from '@/components/seo';
import { generateMetadata as genMeta, pageMeta } from '@/lib/seo';
import { HomePageContent } from '@/components/home/HomePageContent';

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: pageMeta.home.title,
    description: pageMeta.home.description,
    canonical: '',
    openGraph: {
      type: 'website',
    },
  });
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomePageJsonLd />
      <div className="max-w-[1440px] mx-auto py-6">
        <HomePageContent />
      </div>
    </div>
  );
}
