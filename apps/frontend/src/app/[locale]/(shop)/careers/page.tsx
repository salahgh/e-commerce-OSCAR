'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Users, Heart, Zap, Target, Coffee, ChevronDown, ChevronUp, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui';

interface JobPosition {
  id: string;
  titleKey: string;
  departmentKey: string;
  locationKey: string;
  typeKey: string;
  descriptionKey: string;
  requirementKeys: string[];
  benefitKeys: string[];
}

const jobPositions: JobPosition[] = [
  {
    id: 'dev-fullstack',
    titleKey: 'jobDevFullstackTitle',
    departmentKey: 'jobDevFullstackDepartment',
    locationKey: 'jobDevFullstackLocation',
    typeKey: 'jobDevFullstackType',
    descriptionKey: 'jobDevFullstackDescription',
    requirementKeys: [
      'jobDevFullstackRequirement1',
      'jobDevFullstackRequirement2',
      'jobDevFullstackRequirement3',
      'jobDevFullstackRequirement4',
      'jobDevFullstackRequirement5',
    ],
    benefitKeys: [
      'jobDevFullstackBenefit1',
      'jobDevFullstackBenefit2',
      'jobDevFullstackBenefit3',
      'jobDevFullstackBenefit4',
    ],
  },
  {
    id: 'marketing-digital',
    titleKey: 'jobMarketingDigitalTitle',
    departmentKey: 'jobMarketingDigitalDepartment',
    locationKey: 'jobMarketingDigitalLocation',
    typeKey: 'jobMarketingDigitalType',
    descriptionKey: 'jobMarketingDigitalDescription',
    requirementKeys: [
      'jobMarketingDigitalRequirement1',
      'jobMarketingDigitalRequirement2',
      'jobMarketingDigitalRequirement3',
      'jobMarketingDigitalRequirement4',
      'jobMarketingDigitalRequirement5',
    ],
    benefitKeys: [
      'jobMarketingDigitalBenefit1',
      'jobMarketingDigitalBenefit2',
      'jobMarketingDigitalBenefit3',
      'jobMarketingDigitalBenefit4',
    ],
  },
  {
    id: 'service-client',
    titleKey: 'jobServiceClientTitle',
    departmentKey: 'jobServiceClientDepartment',
    locationKey: 'jobServiceClientLocation',
    typeKey: 'jobServiceClientType',
    descriptionKey: 'jobServiceClientDescription',
    requirementKeys: [
      'jobServiceClientRequirement1',
      'jobServiceClientRequirement2',
      'jobServiceClientRequirement3',
      'jobServiceClientRequirement4',
      'jobServiceClientRequirement5',
    ],
    benefitKeys: [
      'jobServiceClientBenefit1',
      'jobServiceClientBenefit2',
      'jobServiceClientBenefit3',
      'jobServiceClientBenefit4',
    ],
  },
  {
    id: 'logistique',
    titleKey: 'jobLogistiqueTitle',
    departmentKey: 'jobLogistiqueDepartment',
    locationKey: 'jobLogistiqueLocation',
    typeKey: 'jobLogistiqueType',
    descriptionKey: 'jobLogistiqueDescription',
    requirementKeys: [
      'jobLogistiqueRequirement1',
      'jobLogistiqueRequirement2',
      'jobLogistiqueRequirement3',
      'jobLogistiqueRequirement4',
      'jobLogistiqueRequirement5',
    ],
    benefitKeys: [
      'jobLogistiqueBenefit1',
      'jobLogistiqueBenefit2',
      'jobLogistiqueBenefit3',
      'jobLogistiqueBenefit4',
    ],
  },
];

const companyValues = [
  {
    icon: Heart,
    titleKey: 'valuePassionTitle',
    descriptionKey: 'valuePassionDescription',
  },
  {
    icon: Users,
    titleKey: 'valueCollaborationTitle',
    descriptionKey: 'valueCollaborationDescription',
  },
  {
    icon: Zap,
    titleKey: 'valueInnovationTitle',
    descriptionKey: 'valueInnovationDescription',
  },
  {
    icon: Target,
    titleKey: 'valueExcellenceTitle',
    descriptionKey: 'valueExcellenceDescription',
  },
];

const perkKeys = [
  'perkCompetitiveSalary',
  'perkFlexibleHours',
  'perkContinuousTraining',
  'perkModernEnvironment',
  'perkDynamicTeam',
  'perkCareerGrowth',
  'perkFreeCoffeeSnacks',
  'perkTeamEvents',
];

function JobCard({ job, isOpen, onToggle }: { job: JobPosition; isOpen: boolean; onToggle: () => void }) {
  const t = useTranslations('careers');

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t(job.titleKey)}</h3>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {t(job.departmentKey)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {t(job.locationKey)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t(job.typeKey)}
              </span>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-6 w-6 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t">
          <div className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('jobDescriptionHeading')}</h4>
              <p className="text-gray-600">{t(job.descriptionKey)}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('jobRequirementsHeading')}</h4>
              <ul className="space-y-2">
                {job.requirementKeys.map((reqKey) => (
                  <li key={reqKey} className="flex items-start gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {t(reqKey)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('jobBenefitsHeading')}</h4>
              <ul className="space-y-2">
                {job.benefitKeys.map((benefitKey) => (
                  <li key={benefitKey} className="flex items-start gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {t(benefitKey)}
                  </li>
                ))}
              </ul>
            </div>

            <Button size="lg" className="w-full md:w-auto">
              <Send className="h-5 w-5 mr-2" />
              {t('applyNowButton')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareersPage() {
  const t = useTranslations('careers');
  const [openJob, setOpenJob] = useState<string | null>(null);

  const toggleJob = (jobId: string) => {
    setOpenJob(openJob === jobId ? null : jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
            <p className="text-xl text-gray-100 mb-8">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{jobPositions.length}</span>
                <span className="text-sm ml-2">{t('statsOpenPositions')}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">50+</span>
                <span className="text-sm ml-2">{t('statsEmployees')}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">2018</span>
                <span className="text-sm ml-2">{t('statsFoundedYear')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('valuesHeading')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('valuesSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyValues.map((value) => (
              <div key={value.titleKey} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t(value.titleKey)}</h3>
                <p className="text-sm text-gray-600">{t(value.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Perks Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Coffee className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">{t('perksHeading')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {perkKeys.map((perkKey) => (
                <div key={perkKey} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">{t(perkKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('openPositionsHeading')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('openPositionsSubtitle')}
            </p>
          </div>
          <div className="space-y-4">
            {jobPositions.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isOpen={openJob === job.id}
                onToggle={() => toggleJob(job.id)}
              />
            ))}
          </div>
        </section>

        {/* Spontaneous Application */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">{t('spontaneousApplicationTitle')}</h3>
                <p className="text-gray-300">
                  {t('spontaneousApplicationDescription')}
                </p>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <a href="mailto:careers@oscarfashion.dz">
                  <Send className="h-5 w-5 mr-2" />
                  {t('sendCvButton')}
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('processHeading')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('processSubtitle')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('processStep1Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('processStep1Description')}
                </p>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              </div>
              <div className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('processStep2Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('processStep2Description')}
                </p>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              </div>
              <div className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('processStep3Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('processStep3Description')}
                </p>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('processStep4Title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('processStep4Description')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
