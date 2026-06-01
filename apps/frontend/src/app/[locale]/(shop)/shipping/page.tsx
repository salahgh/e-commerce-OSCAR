'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui';

interface ShippingZone {
  nameKey: string;
  wilayas: string[];
  delayKey: string;
  price: string;
}

const shippingZones: ShippingZone[] = [
  {
    nameKey: 'zone1Name',
    wilayas: ['Alger', 'Blida', 'Boumerdès', 'Tipaza'],
    delayKey: 'zone1Delay',
    price: '300 DZD',
  },
  {
    nameKey: 'zone2Name',
    wilayas: ['Oran', 'Constantine', 'Annaba', 'Béjaïa', 'Skikda', 'Jijel', 'Mostaganem', 'Chlef', 'Tizi Ouzou'],
    delayKey: 'zone2Delay',
    price: '400 DZD',
  },
  {
    nameKey: 'zone3Name',
    wilayas: ['Sétif', 'Batna', 'M\'sila', 'Djelfa', 'Tiaret', 'Biskra', 'Médéa', 'Bouira', 'Bordj Bou Arréridj'],
    delayKey: 'zone3Delay',
    price: '500 DZD',
  },
  {
    nameKey: 'zone4Name',
    wilayas: ['Ouargla', 'Ghardaïa', 'Béchar', 'Adrar', 'Tamanrasset', 'Illizi', 'Tindouf'],
    delayKey: 'zone4Delay',
    price: '800 DZD',
  },
];

const features = [
  {
    icon: Truck,
    titleKey: 'featureNationalTitle',
    descriptionKey: 'featureNationalDescription',
  },
  {
    icon: Clock,
    titleKey: 'featureTrackingTitle',
    descriptionKey: 'featureTrackingDescription',
  },
  {
    icon: Package,
    titleKey: 'featurePackagingTitle',
    descriptionKey: 'featurePackagingDescription',
  },
  {
    icon: CheckCircle,
    titleKey: 'featureFreeTitle',
    descriptionKey: 'featureFreeDescription',
  },
];

export default function ShippingPage() {
  const t = useTranslations('shipping');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
            <p className="text-xl text-gray-100">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t(feature.titleKey)}</h3>
              <p className="text-sm text-gray-600">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>

        {/* Shipping Zones */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('zonesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingZones.map((zone, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary text-white px-6 py-4">
                  <h3 className="font-semibold text-lg">{t(zone.nameKey)}</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t(zone.delayKey)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium text-lg">{zone.price}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{zone.wilayas.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Shipping Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">{t('freeShippingTitle')}</h3>
                <p className="text-green-100">
                  {t('freeShippingDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('processTitle')}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step1Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('step1Description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step2Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('step2Description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step3Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('step3Description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step4Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('step4Description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('notesTitle')}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('noteVerificationTitle')}</h3>
                  <p className="text-gray-600">
                    {t('noteVerificationDescription')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('noteContactTitle')}</h3>
                  <p className="text-gray-600">
                    {t('noteContactDescription')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('noteAttemptsTitle')}</h3>
                  <p className="text-gray-600">
                    {t('noteAttemptsDescription')}
                  </p>
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
                {t('ctaDescription')}
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
