import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';
import { Accordion, AccordionItem } from '@/components/ui';

export default function FaqPage() {
  const t = useTranslations('FaqPage');
  const tInfo = useTranslations('InfoPage');
  const qa = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
  ];
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <Accordion type="single" defaultValue="faq-0">
        {qa.map((it, i) => (
          <AccordionItem key={i} value={`faq-${i}`} title={it.q}>
            {it.a}
          </AccordionItem>
        ))}
      </Accordion>
    </InfoPageLayout>
  );
}
