import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';

const SIZE_CHART = [
  { size: 'XS', chest: '82-86', waist: '64-68', hip: '90-94' },
  { size: 'S', chest: '86-90', waist: '68-72', hip: '94-98' },
  { size: 'M', chest: '90-94', waist: '72-76', hip: '98-102' },
  { size: 'L', chest: '94-98', waist: '76-80', hip: '102-106' },
  { size: 'XL', chest: '98-102', waist: '80-84', hip: '106-110' },
  { size: 'XXL', chest: '102-106', waist: '84-88', hip: '110-114' },
];

export default function SizeGuidePage() {
  const t = useTranslations('SizeGuidePage');
  const tProduct = useTranslations('ProductPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <section>
        <h2>{t('howTitle')}</h2>
        <ol>
          <li>{t('how1')}</li>
          <li>{t('how2')}</li>
          <li>{t('how3')}</li>
        </ol>
      </section>
      <section>
        <div className="overflow-x-auto rounded border border-border">
          <table className="min-w-full divide-y divide-border text-14">
            <thead className="bg-bg-subtle text-content-muted">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{tProduct('sizeGuideHeaderSize')}</th>
                <th className="px-3 py-2 text-start font-medium">{tProduct('sizeGuideHeaderChest')}</th>
                <th className="px-3 py-2 text-start font-medium">{tProduct('sizeGuideHeaderWaist')}</th>
                <th className="px-3 py-2 text-start font-medium">{tProduct('sizeGuideHeaderHip')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SIZE_CHART.map((row) => (
                <tr key={row.size}>
                  <td className="px-3 py-2 font-medium text-content-strong">{row.size}</td>
                  <td className="px-3 py-2 text-content-muted">{row.chest}</td>
                  <td className="px-3 py-2 text-content-muted">{row.waist}</td>
                  <td className="px-3 py-2 text-content-muted">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-12 text-content-subtle">{t('footnote')}</p>
      </section>
    </InfoPageLayout>
  );
}
