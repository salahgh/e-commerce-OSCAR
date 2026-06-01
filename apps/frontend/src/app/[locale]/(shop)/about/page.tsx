import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Heart, Award, Users, Globe, Sparkles, Target, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'À Propos - OSCAR Fashion',
  description: 'Découvrez l\'histoire d\'OSCAR Fashion, notre mission et nos valeurs. La mode algérienne redéfinie.',
};

export default async function AboutPage() {
  const t = await getTranslations('about');

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('valuePassionTitle'),
      description: t('valuePassionDescription'),
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t('valueQualityTitle'),
      description: t('valueQualityDescription'),
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('valueServiceTitle'),
      description: t('valueServiceDescription'),
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('valueAccessibilityTitle'),
      description: t('valueAccessibilityDescription'),
    },
  ];

  const milestones = [
    { year: '2018', title: t('milestone2018Title'), description: t('milestone2018Description') },
    { year: '2019', title: t('milestone2019Title'), description: t('milestone2019Description') },
    { year: '2021', title: t('milestone2021Title'), description: t('milestone2021Description') },
    { year: '2023', title: t('milestone2023Title'), description: t('milestone2023Description') },
    { year: '2024', title: t('milestone2024Title'), description: t('milestone2024Description') },
  ];

  const stats = [
    { value: '50K+', label: t('statClientsLabel') },
    { value: '48', label: t('statWilayasLabel') },
    { value: '1000+', label: t('statProductsLabel') },
    { value: '24h', label: t('statSupportLabel') },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('heroTitle')}</h1>
            <p className="text-xl text-gray-100">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('storyEyebrow')}</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">{t('storyTitle')}</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  {t('storyParagraph1')}
                </p>
                <p>
                  {t('storyParagraph2')}
                </p>
                <p>
                  {t('storyParagraph3')}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Sparkles className="h-24 w-24 text-primary mx-auto mb-4" />
                    <p className="text-2xl font-bold text-gray-900">{t('since2018')}</p>
                    <p className="text-gray-600">{t('serviceTagline')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('missionTitle')}</h3>
              <p className="text-gray-600">
                {t('missionDescription')}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-secondary">
              <div className="w-14 h-14 bg-secondary/30 rounded-xl flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('visionTitle')}</h3>
              <p className="text-gray-600">
                {t('visionDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('valuesEyebrow')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">{t('valuesTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('timelineEyebrow')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">{t('timelineTitle')}</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
                      <span className="text-3xl font-bold text-primary">{milestone.year}</span>
                      <h3 className="text-xl font-semibold mt-2">{milestone.title}</h3>
                      <p className="text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-primary rounded-full border-4 border-white shadow" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">{t('commitmentTitle')}</h2>
                <p className="text-gray-600 mb-6">
                  {t('commitmentDescription')}
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    {t('commitmentItem1')}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    {t('commitmentItem2')}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    {t('commitmentItem3')}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    {t('commitmentItem4')}
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-6xl font-bold mb-4">100%</p>
                  <p className="text-xl">{t('satisfactionGuaranteed')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">{t('ctaDiscoverButton')}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link href="/contact">{t('ctaContactButton')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
