import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, Shield, RefreshCw, Truck, ChevronRight } from 'lucide-react';

// Legal page content
const legalContent: Record<string, { title: string; icon: React.ReactNode; description: string; lastUpdated: string; sections: { title: string; content: string[] }[] }> = {
  'terms': {
    title: 'Conditions Générales de Vente',
    icon: <FileText className="h-8 w-8" />,
    description: 'Les conditions générales de vente régissant vos achats sur OSCAR Fashion.',
    lastUpdated: '15 Décembre 2024',
    sections: [
      {
        title: '1. Objet',
        content: [
          'Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre OSCAR Fashion et ses clients.',
          'Toute commande passée sur notre site implique l\'acceptation sans réserve des présentes CGV.',
        ],
      },
      {
        title: '2. Produits',
        content: [
          'Les produits proposés sont ceux qui figurent sur le site OSCAR Fashion, dans la limite des stocks disponibles.',
          'Les photographies des produits sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit offert.',
          'OSCAR Fashion se réserve le droit de modifier ses produits à tout moment.',
        ],
      },
      {
        title: '3. Prix',
        content: [
          'Les prix sont indiqués en Dinars Algériens (DZD) et toutes taxes comprises (TTC).',
          'OSCAR Fashion se réserve le droit de modifier ses prix à tout moment.',
          'Les produits sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande.',
        ],
      },
      {
        title: '4. Commande',
        content: [
          'L\'acheteur qui souhaite acheter un produit doit obligatoirement créer un compte client.',
          'Le client s\'engage à fournir des informations exactes lors de sa commande.',
          'OSCAR Fashion se réserve le droit d\'annuler toute commande en cas d\'informations erronées.',
        ],
      },
      {
        title: '5. Paiement',
        content: [
          'Le paiement s\'effectue par carte bancaire CIB, BaridiMob, ou à la livraison (COD).',
          'La commande est validée après confirmation du paiement ou sélection du mode de paiement à la livraison.',
          'En cas de paiement par carte, la transaction est sécurisée via le système SATIM.',
        ],
      },
      {
        title: '6. Livraison',
        content: [
          'Les livraisons sont effectuées à l\'adresse indiquée lors de la commande.',
          'Les délais de livraison sont donnés à titre indicatif et peuvent varier selon la wilaya.',
          'En cas de retard significatif, le client sera informé dans les plus brefs délais.',
        ],
      },
      {
        title: '7. Droit de rétractation',
        content: [
          'Le client dispose d\'un délai de 7 jours à compter de la réception pour retourner un produit.',
          'Les produits doivent être retournés dans leur état et emballage d\'origine.',
          'Les frais de retour sont à la charge du client sauf en cas de produit défectueux.',
        ],
      },
      {
        title: '8. Garantie',
        content: [
          'Tous nos produits bénéficient de la garantie légale de conformité.',
          'En cas de défaut de conformité, le client peut demander le remplacement ou le remboursement du produit.',
        ],
      },
      {
        title: '9. Protection des données',
        content: [
          'Les données personnelles collectées sont traitées conformément à notre politique de confidentialité.',
          'Le client dispose d\'un droit d\'accès, de modification et de suppression de ses données.',
        ],
      },
      {
        title: '10. Litiges',
        content: [
          'Les présentes CGV sont soumises au droit algérien.',
          'En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.',
          'Les tribunaux d\'Alger seront seuls compétents pour tout litige relatif aux présentes CGV.',
        ],
      },
    ],
  },
  'privacy': {
    title: 'Politique de Confidentialité',
    icon: <Shield className="h-8 w-8" />,
    description: 'Comment nous collectons, utilisons et protégeons vos données personnelles.',
    lastUpdated: '15 Décembre 2024',
    sections: [
      {
        title: '1. Introduction',
        content: [
          'OSCAR Fashion s\'engage à protéger la vie privée de ses utilisateurs.',
          'Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.',
        ],
      },
      {
        title: '2. Données collectées',
        content: [
          'Informations d\'identification : nom, prénom, adresse email, numéro de téléphone.',
          'Informations de livraison : adresse postale, wilaya, code postal.',
          'Informations de paiement : les données de carte bancaire sont traitées de manière sécurisée par nos partenaires de paiement.',
          'Données de navigation : cookies, adresse IP, type de navigateur.',
        ],
      },
      {
        title: '3. Utilisation des données',
        content: [
          'Traitement et suivi de vos commandes.',
          'Gestion de votre compte client.',
          'Communication concernant vos commandes (confirmation, expédition, livraison).',
          'Envoi de newsletters et offres promotionnelles (avec votre consentement).',
          'Amélioration de nos services et de l\'expérience utilisateur.',
        ],
      },
      {
        title: '4. Cookies',
        content: [
          'Notre site utilise des cookies pour améliorer votre expérience de navigation.',
          'Cookies essentiels : nécessaires au fonctionnement du site.',
          'Cookies analytiques : nous aident à comprendre comment vous utilisez notre site.',
          'Cookies marketing : utilisés pour vous proposer des publicités pertinentes.',
          'Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur.',
        ],
      },
      {
        title: '5. Partage des données',
        content: [
          'Nous ne vendons jamais vos données personnelles à des tiers.',
          'Vos données peuvent être partagées avec nos partenaires de livraison pour l\'acheminement de vos commandes.',
          'Les prestataires de paiement ont accès aux données nécessaires pour traiter vos transactions.',
        ],
      },
      {
        title: '6. Sécurité des données',
        content: [
          'Nous utilisons des protocoles de sécurité SSL pour protéger vos données.',
          'L\'accès à vos données est strictement limité au personnel autorisé.',
          'Nous effectuons des audits réguliers de sécurité.',
        ],
      },
      {
        title: '7. Vos droits',
        content: [
          'Droit d\'accès : vous pouvez demander une copie de vos données personnelles.',
          'Droit de rectification : vous pouvez corriger vos données à tout moment.',
          'Droit de suppression : vous pouvez demander la suppression de vos données.',
          'Droit d\'opposition : vous pouvez vous opposer au traitement de vos données à des fins marketing.',
          'Pour exercer ces droits, contactez-nous à privacy@oscarfashion.dz',
        ],
      },
      {
        title: '8. Conservation des données',
        content: [
          'Vos données sont conservées pendant la durée de votre relation client avec nous.',
          'Après clôture de votre compte, certaines données peuvent être conservées pour des obligations légales.',
        ],
      },
      {
        title: '9. Modifications',
        content: [
          'Cette politique peut être mise à jour périodiquement.',
          'Nous vous informerons de tout changement significatif par email ou via notre site.',
        ],
      },
    ],
  },
  'returns': {
    title: 'Politique de Retour',
    icon: <RefreshCw className="h-8 w-8" />,
    description: 'Tout ce que vous devez savoir sur les retours et échanges chez OSCAR Fashion.',
    lastUpdated: '15 Décembre 2024',
    sections: [
      {
        title: '1. Délai de retour',
        content: [
          'Vous disposez de 7 jours à compter de la réception de votre commande pour effectuer un retour.',
          'Passé ce délai, aucun retour ne sera accepté sauf en cas de défaut de fabrication.',
        ],
      },
      {
        title: '2. Conditions de retour',
        content: [
          'Les articles doivent être retournés dans leur état d\'origine, non portés et non lavés.',
          'Toutes les étiquettes doivent être attachées.',
          'L\'emballage d\'origine doit être inclus et en bon état.',
          'Les articles soldés ou en promotion sont échangeables mais non remboursables.',
        ],
      },
      {
        title: '3. Articles non retournables',
        content: [
          'Sous-vêtements et maillots de bain pour des raisons d\'hygiène.',
          'Articles personnalisés ou sur commande.',
          'Articles endommagés par le client.',
          'Articles retournés sans étiquette ou dans un état non conforme.',
        ],
      },
      {
        title: '4. Procédure de retour',
        content: [
          '1. Connectez-vous à votre compte et accédez à la section "Mes Commandes".',
          '2. Sélectionnez la commande concernée et cliquez sur "Demander un retour".',
          '3. Indiquez le motif du retour et les articles concernés.',
          '4. Imprimez le bon de retour généré.',
          '5. Emballez soigneusement les articles avec le bon de retour.',
          '6. Déposez le colis dans un point relais ou contactez notre service client pour un enlèvement.',
        ],
      },
      {
        title: '5. Frais de retour',
        content: [
          'Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou d\'erreur de notre part.',
          'En cas de produit défectueux, les frais de retour sont remboursés.',
        ],
      },
      {
        title: '6. Échanges',
        content: [
          'Les échanges sont possibles pour une taille ou une couleur différente, sous réserve de disponibilité.',
          'Si l\'article souhaité n\'est plus disponible, un avoir ou un remboursement sera proposé.',
        ],
      },
      {
        title: '7. Remboursement',
        content: [
          'Le remboursement est effectué sous 7 à 14 jours ouvrés après réception et vérification de l\'article retourné.',
          'Le remboursement est effectué via le même mode de paiement utilisé lors de l\'achat.',
          'Pour les paiements à la livraison, le remboursement est effectué par virement bancaire.',
        ],
      },
      {
        title: '8. Articles défectueux',
        content: [
          'Si vous recevez un article défectueux, contactez notre service client dans les 48h suivant la réception.',
          'Prenez des photos du défaut et envoyez-les à notre service client.',
          'Nous vous proposerons un échange ou un remboursement intégral, frais de livraison inclus.',
        ],
      },
    ],
  },
  'shipping': {
    title: 'Information Livraison',
    icon: <Truck className="h-8 w-8" />,
    description: 'Délais, tarifs et zones de livraison pour vos commandes OSCAR Fashion.',
    lastUpdated: '15 Décembre 2024',
    sections: [
      {
        title: '1. Zones de livraison',
        content: [
          'OSCAR Fashion livre dans toutes les 48 wilayas d\'Algérie.',
          'Nous ne livrons actuellement qu\'en Algérie. Les livraisons internationales ne sont pas disponibles.',
        ],
      },
      {
        title: '2. Délais de livraison',
        content: [
          'Zone 1 (Alger et environs) : 1 à 2 jours ouvrés.',
          'Zone 2 (Villes côtières) : 2 à 4 jours ouvrés.',
          'Zone 3 (Hauts plateaux) : 3 à 5 jours ouvrés.',
          'Zone 4 (Sud) : 5 à 7 jours ouvrés.',
          'Ces délais sont indicatifs et peuvent varier en période de forte affluence.',
        ],
      },
      {
        title: '3. Tarifs de livraison',
        content: [
          'Zone 1 (Alger et environs) : 300 - 400 DZD',
          'Zone 2 (Villes côtières) : 400 - 500 DZD',
          'Zone 3 (Hauts plateaux) : 500 - 600 DZD',
          'Zone 4 (Sud) : 600 - 800 DZD',
          'Livraison gratuite pour les commandes supérieures à 10,000 DZD.',
        ],
      },
      {
        title: '4. Partenaires de livraison',
        content: [
          'Nous travaillons avec des partenaires de confiance pour assurer vos livraisons.',
          'Yalidine : notre partenaire principal pour les livraisons rapides.',
          'ZR Express : pour les zones éloignées.',
          'Service de livraison interne pour la région d\'Alger.',
        ],
      },
      {
        title: '5. Suivi de commande',
        content: [
          'Un numéro de suivi vous est envoyé par SMS et email dès l\'expédition de votre commande.',
          'Vous pouvez suivre votre colis en temps réel depuis votre espace client.',
          'Des notifications automatiques vous informent à chaque étape de la livraison.',
        ],
      },
      {
        title: '6. Réception de la commande',
        content: [
          'Le livreur vous contactera avant la livraison pour confirmer votre disponibilité.',
          'En cas d\'absence, une nouvelle tentative de livraison sera programmée.',
          'Après 3 tentatives infructueuses, le colis sera retourné à notre entrepôt.',
        ],
      },
      {
        title: '7. Vérification à la réception',
        content: [
          'Vérifiez l\'état du colis avant de signer le bon de livraison.',
          'En cas de colis endommagé, refusez la livraison ou émettez des réserves.',
          'Vérifiez le contenu du colis dans les 24h et signalez toute anomalie.',
        ],
      },
      {
        title: '8. Livraison Express',
        content: [
          'Service disponible uniquement pour la région d\'Alger.',
          'Livraison le jour même pour les commandes passées avant 12h.',
          'Supplément de 500 DZD pour ce service.',
        ],
      },
      {
        title: '9. Points relais',
        content: [
          'Vous pouvez choisir la livraison en point relais lors de votre commande.',
          'Les points relais sont disponibles dans les principales villes.',
          'Votre colis sera conservé 7 jours maximum au point relais.',
        ],
      },
    ],
  },
};

interface LegalPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return Object.keys(legalContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = legalContent[slug];

  if (!page) {
    return { title: 'Page non trouvée' };
  }

  return {
    title: `${page.title} - OSCAR Fashion`,
    description: page.description,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = legalContent[slug];

  if (!page) {
    notFound();
  }

  const navItems = Object.entries(legalContent).map(([key, value]) => ({
    slug: key,
    title: value.title,
    icon: value.icon,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              {page.icon}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{page.title}</h1>
            <p className="text-lg text-gray-100">{page.description}</p>
            <p className="text-sm text-gray-200 mt-4">Dernière mise à jour : {page.lastUpdated}</p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Pages légales</h3>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/legal/${item.slug}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.slug === slug
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-sm font-medium">{item.title}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                {page.sections.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-gray-600 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Vous avez des questions concernant cette page ? N'hésitez pas à nous contacter.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Contactez-nous
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
