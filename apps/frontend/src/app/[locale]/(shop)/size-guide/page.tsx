'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Ruler, User, Shirt, Footprints, HelpCircle, Info, Mail } from 'lucide-react';
import { Button } from '@/components/ui';

type Category = 'women' | 'men' | 'shoes';

interface SizeData {
  size: string;
  eu?: string;
  us?: string;
  uk?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  footLength?: string;
}

const womenSizes: SizeData[] = [
  { size: 'XS', eu: '34', us: '2', uk: '6', chest: '80-84', waist: '60-64', hips: '86-90' },
  { size: 'S', eu: '36', us: '4', uk: '8', chest: '84-88', waist: '64-68', hips: '90-94' },
  { size: 'M', eu: '38', us: '6', uk: '10', chest: '88-92', waist: '68-72', hips: '94-98' },
  { size: 'L', eu: '40', us: '8', uk: '12', chest: '92-96', waist: '72-76', hips: '98-102' },
  { size: 'XL', eu: '42', us: '10', uk: '14', chest: '96-100', waist: '76-80', hips: '102-106' },
  { size: 'XXL', eu: '44', us: '12', uk: '16', chest: '100-104', waist: '80-84', hips: '106-110' },
];

const menSizes: SizeData[] = [
  { size: 'XS', eu: '44', us: 'XS', uk: '34', chest: '86-90', waist: '72-76', hips: '86-90' },
  { size: 'S', eu: '46', us: 'S', uk: '36', chest: '90-94', waist: '76-80', hips: '90-94' },
  { size: 'M', eu: '48', us: 'M', uk: '38', chest: '94-98', waist: '80-84', hips: '94-98' },
  { size: 'L', eu: '50', us: 'L', uk: '40', chest: '98-102', waist: '84-88', hips: '98-102' },
  { size: 'XL', eu: '52', us: 'XL', uk: '42', chest: '102-106', waist: '88-92', hips: '102-106' },
  { size: 'XXL', eu: '54', us: 'XXL', uk: '44', chest: '106-110', waist: '92-96', hips: '106-110' },
];

const shoeSizes: SizeData[] = [
  { size: '36', eu: '36', us: '5.5', uk: '3.5', footLength: '22.5' },
  { size: '37', eu: '37', us: '6.5', uk: '4.5', footLength: '23' },
  { size: '38', eu: '38', us: '7.5', uk: '5.5', footLength: '24' },
  { size: '39', eu: '39', us: '8.5', uk: '6.5', footLength: '24.5' },
  { size: '40', eu: '40', us: '9', uk: '7', footLength: '25' },
  { size: '41', eu: '41', us: '9.5', uk: '7.5', footLength: '26' },
  { size: '42', eu: '42', us: '10', uk: '8', footLength: '26.5' },
  { size: '43', eu: '43', us: '10.5', uk: '8.5', footLength: '27' },
  { size: '44', eu: '44', us: '11', uk: '9', footLength: '28' },
  { size: '45', eu: '45', us: '12', uk: '10', footLength: '28.5' },
];

const measurementTips = [
  {
    titleKey: 'tipChestTitle',
    descriptionKey: 'tipChestDescription',
    icon: Shirt,
  },
  {
    titleKey: 'tipWaistTitle',
    descriptionKey: 'tipWaistDescription',
    icon: Ruler,
  },
  {
    titleKey: 'tipHipsTitle',
    descriptionKey: 'tipHipsDescription',
    icon: User,
  },
  {
    titleKey: 'tipFootTitle',
    descriptionKey: 'tipFootDescription',
    icon: Footprints,
  },
] as const;

export default function SizeGuidePage() {
  const t = useTranslations('sizeGuide');
  const [activeCategory, setActiveCategory] = useState<Category>('women');

  const categories = [
    { id: 'women' as Category, label: t('categoryWomen'), icon: User },
    { id: 'men' as Category, label: t('categoryMen'), icon: User },
    { id: 'shoes' as Category, label: t('categoryShoes'), icon: Footprints },
  ];

  const getSizeData = () => {
    switch (activeCategory) {
      case 'women':
        return womenSizes;
      case 'men':
        return menSizes;
      case 'shoes':
        return shoeSizes;
      default:
        return womenSizes;
    }
  };

  const getTableHeaders = () => {
    if (activeCategory === 'shoes') {
      return [t('headerSize'), 'EU', 'US', 'UK', t('headerFootLength')];
    }
    return [t('headerSize'), 'EU', 'US', 'UK', t('headerChest'), t('headerWaist'), t('headerHips')];
  };

  const getRowData = (item: SizeData) => {
    if (activeCategory === 'shoes') {
      return [item.size, item.eu, item.us, item.uk, item.footLength];
    }
    return [item.size, item.eu, item.us, item.uk, item.chest, item.waist, item.hips];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ruler className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
            <p className="text-xl text-gray-100">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl shadow-lg p-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <cat.icon className="h-5 w-5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Table */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {getTableHeaders().map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getSizeData().map((item, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {getRowData(item).map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-6 py-4 text-sm ${
                            cellIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to Measure */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('howToMeasureTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {measurementTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <tip.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t(tip.titleKey)}</h3>
                <p className="text-sm text-gray-600">{t(tip.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('adviceTitle')}</h3>
                <p className="text-gray-600">
                  {t('adviceSubtitle')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('adviceSoftTapeTitle')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('adviceSoftTapeDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('adviceUnderwearTitle')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('adviceUnderwearDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('adviceHelpTitle')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('adviceHelpDescription')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('adviceBetweenSizesTitle')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('adviceBetweenSizesDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('adviceReviewsTitle')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('adviceReviewsDescription')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('adviceExchangeTitle')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('adviceExchangeDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Mini Section */}
        <section className="mb-12">
          <div className="bg-gray-100 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">{t('faqTitle')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('faqStandardQuestion')}</h4>
                <p className="text-sm text-gray-600">
                  {t('faqStandardAnswer')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('faqFitQuestion')}</h4>
                <p className="text-sm text-gray-600">
                  {t('faqFitAnswer')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('faqExchangeQuestion')}</h4>
                <p className="text-sm text-gray-600">
                  {t('faqExchangeAnswer')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('faqFootQuestion')}</h4>
                <p className="text-sm text-gray-600">
                  {t('faqFootAnswer')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="h-8 w-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">{t('contactTitle')}</h3>
              <p className="text-gray-100">
                {t('contactSubtitle')}
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">{t('contactButton')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
