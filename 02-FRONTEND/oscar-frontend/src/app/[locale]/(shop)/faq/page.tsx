'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, ShoppingBag, Truck, CreditCard, RefreshCw, User, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    title: 'Commandes',
    icon: <ShoppingBag className="h-5 w-5" />,
    items: [
      {
        question: 'Comment passer une commande ?',
        answer: 'Pour passer une commande, naviguez dans notre catalogue, ajoutez les articles souhaités à votre panier, puis suivez le processus de paiement. Vous pouvez créer un compte ou commander en tant qu\'invité.',
      },
      {
        question: 'Puis-je modifier ma commande après l\'avoir passée ?',
        answer: 'Vous pouvez modifier votre commande dans l\'heure suivant sa validation. Passé ce délai, contactez notre service client au plus vite. Si la commande n\'a pas encore été préparée, nous ferons notre possible pour la modifier.',
      },
      {
        question: 'Comment annuler ma commande ?',
        answer: 'Pour annuler une commande, accédez à votre espace client dans "Mes Commandes" et cliquez sur "Annuler". Si la commande a déjà été expédiée, vous devrez procéder à un retour une fois le colis reçu.',
      },
      {
        question: 'Comment suivre ma commande ?',
        answer: 'Dès l\'expédition de votre commande, vous recevez un email et un SMS avec un numéro de suivi. Vous pouvez également suivre votre colis depuis votre espace client dans la section "Mes Commandes".',
      },
      {
        question: 'Que faire si je n\'ai pas reçu de confirmation de commande ?',
        answer: 'Vérifiez d\'abord vos spams. Si vous ne trouvez pas l\'email, connectez-vous à votre compte pour vérifier si la commande apparaît. En cas de problème, contactez notre service client avec les détails de votre commande.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Livraison',
    icon: <Truck className="h-5 w-5" />,
    items: [
      {
        question: 'Quels sont les délais de livraison ?',
        answer: 'Les délais varient selon votre wilaya : 1-2 jours pour Alger et environs, 2-4 jours pour les villes côtières, 3-5 jours pour les hauts plateaux, et 5-7 jours pour le Sud. Ces délais sont indicatifs.',
      },
      {
        question: 'Combien coûte la livraison ?',
        answer: 'Les frais de livraison varient de 300 à 800 DZD selon votre zone. La livraison est GRATUITE pour toute commande supérieure à 10,000 DZD.',
      },
      {
        question: 'Livrez-vous dans ma wilaya ?',
        answer: 'Oui ! Nous livrons dans les 48 wilayas d\'Algérie. Aucune zone n\'est exclue de notre service de livraison.',
      },
      {
        question: 'Puis-je choisir une date de livraison ?',
        answer: 'Malheureusement, nous ne proposons pas encore la sélection d\'une date précise. Cependant, notre livreur vous contactera avant la livraison pour confirmer votre disponibilité.',
      },
      {
        question: 'Que faire si je suis absent lors de la livraison ?',
        answer: 'Le livreur tentera de vous joindre par téléphone. En cas d\'absence, une nouvelle tentative sera programmée. Après 3 tentatives infructueuses, le colis sera retourné à notre entrepôt.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Paiement',
    icon: <CreditCard className="h-5 w-5" />,
    items: [
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: 'Nous acceptons le paiement par carte CIB/EDAHABIA, BaridiMob, et le paiement à la livraison (COD). Tous les paiements en ligne sont sécurisés via la plateforme SATIM.',
      },
      {
        question: 'Le paiement en ligne est-il sécurisé ?',
        answer: 'Absolument. Nous utilisons le protocole SSL et la plateforme de paiement SATIM, qui est le standard de sécurité bancaire en Algérie. Vos données de carte ne sont jamais stockées sur nos serveurs.',
      },
      {
        question: 'Puis-je payer en plusieurs fois ?',
        answer: 'Nous ne proposons pas encore le paiement en plusieurs fois. Cependant, vous pouvez utiliser le paiement à la livraison pour régler votre commande à la réception.',
      },
      {
        question: 'Comment fonctionne le paiement à la livraison ?',
        answer: 'Sélectionnez "Paiement à la livraison" lors du checkout. Vous paierez en espèces au livreur lors de la réception de votre colis. Un reçu vous sera remis.',
      },
      {
        question: 'Ma transaction a échoué, que faire ?',
        answer: 'Vérifiez que votre carte est active et dispose de fonds suffisants. Si le problème persiste, essayez avec un autre moyen de paiement ou contactez votre banque. Aucun montant n\'est débité en cas d\'échec.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Retours & Échanges',
    icon: <RefreshCw className="h-5 w-5" />,
    items: [
      {
        question: 'Quelle est votre politique de retour ?',
        answer: 'Vous disposez de 7 jours après réception pour retourner un article. Il doit être non porté, avec ses étiquettes, dans son emballage d\'origine. Les articles soldés sont échangeables mais non remboursables.',
      },
      {
        question: 'Comment effectuer un retour ?',
        answer: 'Connectez-vous à votre compte, allez dans "Mes Commandes", sélectionnez l\'article à retourner et suivez les instructions. Vous recevrez un bon de retour à imprimer et joindre au colis.',
      },
      {
        question: 'Les frais de retour sont-ils à ma charge ?',
        answer: 'Oui, les frais de retour sont à votre charge sauf en cas de produit défectueux ou d\'erreur de notre part. Dans ces cas, nous prenons en charge les frais.',
      },
      {
        question: 'Combien de temps prend le remboursement ?',
        answer: 'Une fois le retour reçu et validé, le remboursement est effectué sous 7 à 14 jours ouvrés. Il sera crédité sur le même moyen de paiement utilisé lors de l\'achat.',
      },
      {
        question: 'Puis-je échanger un article contre une autre taille ?',
        answer: 'Oui, les échanges de taille sont possibles sous réserve de disponibilité. Suivez la procédure de retour et indiquez la taille souhaitée. Si elle n\'est pas disponible, vous serez remboursé.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Mon Compte',
    icon: <User className="h-5 w-5" />,
    items: [
      {
        question: 'Comment créer un compte ?',
        answer: 'Cliquez sur "Se connecter" puis "Créer un compte". Renseignez votre email, créez un mot de passe, et complétez vos informations. Un email de vérification vous sera envoyé.',
      },
      {
        question: 'J\'ai oublié mon mot de passe, que faire ?',
        answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.',
      },
      {
        question: 'Comment modifier mes informations personnelles ?',
        answer: 'Connectez-vous à votre compte et accédez à "Mon Profil". Vous pouvez y modifier votre nom, email, téléphone et adresses de livraison.',
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Pour supprimer votre compte, contactez notre service client à privacy@oscarfashion.dz. Notez que cette action est irréversible et vos données seront supprimées.',
      },
      {
        question: 'Puis-je commander sans créer de compte ?',
        answer: 'Oui, vous pouvez commander en tant qu\'invité. Cependant, créer un compte vous permet de suivre vos commandes, sauvegarder vos adresses et accéder à votre historique d\'achats.',
      },
    ],
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (question: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(question)) {
      newOpenItems.delete(question);
    } else {
      newOpenItems.add(question);
    }
    setOpenItems(newOpenItems);
  };

  const filteredCategories = searchQuery
    ? faqCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqCategories;

  const currentCategory = filteredCategories.find((cat) => cat.id === activeCategory) || filteredCategories[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Questions Fréquentes</h1>
            <p className="text-xl text-gray-100 mb-8">
              Trouvez rapidement les réponses à vos questions
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 px-2">Catégories</h3>
              <nav className="space-y-1">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeCategory === category.id && !searchQuery
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.title}</span>
                    <span className={`ml-auto text-sm ${
                      activeCategory === category.id && !searchQuery ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {category.items.length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {searchQuery ? (
              // Search Results
              <div className="space-y-6">
                <p className="text-gray-600">
                  {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} résultat(s) pour "{searchQuery}"
                </p>
                {filteredCategories.map((category) => (
                  <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
                      <span className="text-primary">{category.icon}</span>
                      <h2 className="font-semibold text-gray-900">{category.title}</h2>
                    </div>
                    <div className="p-6">
                      {category.items.map((item) => (
                        <FAQAccordion
                          key={item.question}
                          item={item}
                          isOpen={openItems.has(item.question)}
                          onToggle={() => toggleItem(item.question)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Category View
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
                  <span className="text-primary">{currentCategory?.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{currentCategory?.title}</h2>
                </div>
                <div className="p-6">
                  {currentCategory?.items.map((item) => (
                    <FAQAccordion
                      key={item.question}
                      item={item}
                      isOpen={openItems.has(item.question)}
                      onToggle={() => toggleItem(item.question)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-8 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
                  <p className="text-gray-100">
                    Notre équipe est disponible pour vous aider. N'hésitez pas à nous contacter.
                  </p>
                </div>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
