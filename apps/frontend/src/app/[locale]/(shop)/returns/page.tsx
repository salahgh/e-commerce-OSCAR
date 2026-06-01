'use client';

import Link from 'next/link';
import { RefreshCw, Package, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';

export default function ReturnsPage() {
  const t = useTranslations('returns');

  const eligibleItems = [
    t('eligibleItem1'),
    t('eligibleItem2'),
    t('eligibleItem3'),
    t('eligibleItem4'),
  ];

  const nonEligibleItems = [
    t('nonEligibleItem1'),
    t('nonEligibleItem2'),
    t('nonEligibleItem3'),
    t('nonEligibleItem4'),
    t('nonEligibleItem5'),
  ];

  const returnSteps = [
    {
      step: 1,
      title: t('step1Title'),
      description: t('step1Description'),
      icon: CheckCircle,
    },
    {
      step: 2,
      title: t('step2Title'),
      description: t('step2Description'),
      icon: Package,
    },
    {
      step: 3,
      title: t('step3Title'),
      description: t('step3Description'),
      icon: RefreshCw,
    },
    {
      step: 4,
      title: t('step4Title'),
      description: t('step4Description'),
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
            <p className="text-xl text-gray-100">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Policy Overview */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('overviewReturnDays')}</h3>
                <p className="text-gray-600">{t('overviewReturnLabel')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('overviewRefundDays')}</h3>
                <p className="text-gray-600">{t('overviewRefundLabel')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('overviewFreeLabel')}</h3>
                <p className="text-gray-600">{t('overviewFreeSubLabel')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Return */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('howToReturnTitle')}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {returnSteps.map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.step < 4 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligible / Non-Eligible */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eligible */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-green-500 text-white px-6 py-4 flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <h3 className="font-semibold text-lg">{t('eligibleTitle')}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {eligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Non-Eligible */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-500 text-white px-6 py-4 flex items-center gap-3">
                <XCircle className="h-6 w-6" />
                <h3 className="font-semibold text-lg">{t('nonEligibleTitle')}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {nonEligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Exchange Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('exchangesTitle')}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  {t('sizeExchangeTitle')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('sizeExchangeDescription')}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('sizeExchangeBenefit1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t('sizeExchangeBenefit2')}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('itemExchangeTitle')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('itemExchangeDescription')}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    {t('itemExchangeNote1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    {t('itemExchangeNote2')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('refundTitle')}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('refundDelayTitle')}</h3>
                  <p className="text-gray-600">
                    {t('refundDelayDescription')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('refundMethodTitle')}</h3>
                  <p className="text-gray-600">
                    {t('refundMethodDescription')}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>{t('refundMethodCib')}</li>
                    <li>{t('refundMethodBaridimob')}</li>
                    <li>{t('refundMethodCod')}</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('returnFeesTitle')}</h3>
                  <p className="text-gray-600">
                    {t('returnFeesDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Defective Products */}
        <section className="mb-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('defectiveTitle')}</h3>
                <p className="text-gray-700 mb-4">
                  {t('defectiveDescription')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>+213 23 XX XX XX</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>retours@oscarfashion.dz</span>
                  </div>
                </div>
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
              <h3 className="text-xl font-bold mb-2">{t('ctaTitle')}</h3>
              <p className="text-gray-100">
                {t('ctaSubtitle')}
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">{t('ctaButton')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
