'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Users, Heart, Zap, Target, Coffee, ChevronDown, ChevronUp, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const jobPositions: JobPosition[] = [
  {
    id: 'dev-fullstack',
    title: 'Développeur Full Stack',
    department: 'Technologie',
    location: 'Alger',
    type: 'CDI - Temps plein',
    description: 'Rejoignez notre équipe technique pour développer et améliorer notre plateforme e-commerce. Vous travaillerez sur des projets variés utilisant les dernières technologies.',
    requirements: [
      '3+ ans d\'expérience en développement web',
      'Maîtrise de React, Node.js et TypeScript',
      'Expérience avec les bases de données SQL et NoSQL',
      'Connaissance des principes DevOps est un plus',
      'Bonne communication et esprit d\'équipe',
    ],
    benefits: [
      'Salaire compétitif',
      'Horaires flexibles',
      'Formation continue',
      'Équipement de travail fourni',
    ],
  },
  {
    id: 'marketing-digital',
    title: 'Responsable Marketing Digital',
    department: 'Marketing',
    location: 'Alger',
    type: 'CDI - Temps plein',
    description: 'Nous recherchons un(e) responsable marketing digital pour piloter nos campagnes d\'acquisition et de fidélisation clients sur tous les canaux digitaux.',
    requirements: [
      '5+ ans d\'expérience en marketing digital',
      'Expertise en SEO, SEA et réseaux sociaux',
      'Maîtrise des outils d\'analytics (Google Analytics, etc.)',
      'Expérience en e-commerce appréciée',
      'Créativité et capacité d\'analyse',
    ],
    benefits: [
      'Salaire compétitif + bonus',
      'Budget formation',
      'Télétravail partiel possible',
      'Environnement dynamique',
    ],
  },
  {
    id: 'service-client',
    title: 'Chargé(e) de Service Client',
    department: 'Service Client',
    location: 'Alger',
    type: 'CDI - Temps plein',
    description: 'Vous serez le premier point de contact de nos clients. Votre mission : offrir une expérience client exceptionnelle et résoudre les problèmes avec empathie.',
    requirements: [
      '1+ an d\'expérience en service client',
      'Excellentes compétences en communication',
      'Maîtrise du français et de l\'arabe',
      'Patience et sens de l\'écoute',
      'À l\'aise avec les outils informatiques',
    ],
    benefits: [
      'Salaire attractif',
      'Primes sur objectifs',
      'Formation complète assurée',
      'Évolution possible vers le management',
    ],
  },
  {
    id: 'logistique',
    title: 'Responsable Logistique',
    department: 'Opérations',
    location: 'Alger',
    type: 'CDI - Temps plein',
    description: 'Gérez notre entrepôt et optimisez notre chaîne logistique pour garantir des livraisons rapides et fiables à travers tout le pays.',
    requirements: [
      '3+ ans d\'expérience en logistique',
      'Expérience en gestion d\'entrepôt',
      'Connaissance des transporteurs algériens',
      'Capacité à gérer une équipe',
      'Sens de l\'organisation',
    ],
    benefits: [
      'Salaire compétitif',
      'Véhicule de fonction',
      'Téléphone professionnel',
      'Assurance santé',
    ],
  },
];

const companyValues = [
  {
    icon: Heart,
    title: 'Passion',
    description: 'Nous aimons ce que nous faisons et cela se reflète dans notre travail quotidien.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Nous croyons au pouvoir du travail d\'équipe et de l\'entraide.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Nous cherchons constamment à nous améliorer et à innover.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'Nous visons l\'excellence dans tout ce que nous entreprenons.',
  },
];

const perks = [
  'Salaire compétitif',
  'Horaires flexibles',
  'Formation continue',
  'Environnement moderne',
  'Équipe dynamique',
  'Évolution de carrière',
  'Café et snacks gratuits',
  'Événements d\'équipe',
];

function JobCard({ job, isOpen, onToggle }: { job: JobPosition; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {job.type}
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
              <h4 className="font-semibold text-gray-900 mb-2">Description du poste</h4>
              <p className="text-gray-600">{job.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Profil recherché</h4>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Ce que nous offrons</h4>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <Button size="lg" className="w-full md:w-auto">
              <Send className="h-5 w-5 mr-2" />
              Postuler maintenant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareersPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rejoignez l'aventure Oscar</h1>
            <p className="text-xl text-gray-100 mb-8">
              Construisez votre carrière avec nous et participez à la transformation du e-commerce en Algérie
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">{jobPositions.length}</span>
                <span className="text-sm ml-2">postes ouverts</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">50+</span>
                <span className="text-sm ml-2">collaborateurs</span>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">2018</span>
                <span className="text-sm ml-2">année de création</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ce qui nous anime au quotidien et guide toutes nos décisions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyValues.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Perks Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Coffee className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Pourquoi nous rejoindre ?</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {perks.map((perk, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Postes Ouverts</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos opportunités actuelles et trouvez le poste qui vous correspond
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
                <h3 className="text-xl font-bold mb-2">Candidature spontanée</h3>
                <p className="text-gray-300">
                  Vous ne trouvez pas le poste idéal ? Envoyez-nous votre CV, nous sommes toujours à la recherche de talents !
                </p>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <a href="mailto:careers@oscarfashion.dz">
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer mon CV
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre processus de recrutement</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un processus simple et transparent en 4 étapes
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Candidature</h3>
                <p className="text-sm text-gray-600">
                  Envoyez votre CV et lettre de motivation via notre formulaire
                </p>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              </div>
              <div className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Entretien RH</h3>
                <p className="text-sm text-gray-600">
                  Premier échange pour mieux vous connaître et présenter Oscar
                </p>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              </div>
              <div className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Entretien technique</h3>
                <p className="text-sm text-gray-600">
                  Évaluation de vos compétences avec votre futur manager
                </p>
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Offre</h3>
                <p className="text-sm text-gray-600">
                  Proposition et intégration dans l'équipe Oscar
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
