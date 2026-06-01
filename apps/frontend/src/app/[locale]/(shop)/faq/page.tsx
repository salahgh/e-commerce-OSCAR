import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateMetadata as genMeta, pageMeta } from '@/lib/seo';
import { FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import FAQClient, { faqCategories } from './FAQClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return genMeta({
    title: pageMeta.faq.title,
    description: pageMeta.faq.description,
    canonical: `/${locale}/faq`,
    locale,
    keywords: [
      'faq',
      'questions frequentes',
      'aide',
      'support',
      'commande',
      'livraison',
      'retour',
      'paiement',
    ],
  });
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('faq');

  // Flatten all FAQs for structured data
  const allFaqs = faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    }))
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { name: t('breadcrumbHome'), url: `/${locale}` },
    { name: t('breadcrumbFaq') },
  ];

  return (
    <>
      {/* Structured Data */}
      <FAQJsonLd faqs={allFaqs} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Client Component */}
      <FAQClient />
    </>
  );
}
