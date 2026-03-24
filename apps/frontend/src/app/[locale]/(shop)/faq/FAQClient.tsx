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

export const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    title: 'Commandes',
    icon: <ShoppingBag className="h-5 w-5" />,
    items: [
      {
        question: 'Comment passer une commande ?',
        answer: 'Pour passer une commande, naviguez dans notre catalogue, ajoutez les articles souhaites a votre panier, puis suivez le processus de paiement. Vous pouvez creer un compte ou commander en tant qu\'invite.',
      },
      {
        question: 'Puis-je modifier ma commande apres l\'avoir passee ?',
        answer: 'Vous pouvez modifier votre commande dans l\'heure suivant sa validation. Passe ce delai, contactez notre service client au plus vite. Si la commande n\'a pas encore ete preparee, nous ferons notre possible pour la modifier.',
      },
      {
        question: 'Comment annuler ma commande ?',
        answer: 'Pour annuler une commande, accedez a votre espace client dans "Mes Commandes" et cliquez sur "Annuler". Si la commande a deja ete expediee, vous devrez proceder a un retour une fois le colis recu.',
      },
      {
        question: 'Comment suivre ma commande ?',
        answer: 'Des l\'expedition de votre commande, vous recevez un email et un SMS avec un numero de suivi. Vous pouvez egalement suivre votre colis depuis votre espace client dans la section "Mes Commandes".',
      },
      {
        question: 'Que faire si je n\'ai pas recu de confirmation de commande ?',
        answer: 'Verifiez d\'abord vos spams. Si vous ne trouvez pas l\'email, connectez-vous a votre compte pour verifier si la commande apparait. En cas de probleme, contactez notre service client avec les details de votre commande.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Livraison',
    icon: <Truck className="h-5 w-5" />,
    items: [
      {
        question: 'Quels sont les delais de livraison ?',
        answer: 'Les delais varient selon votre wilaya : 1-2 jours pour Alger et environs, 2-4 jours pour les villes cotieres, 3-5 jours pour les hauts plateaux, et 5-7 jours pour le Sud. Ces delais sont indicatifs.',
      },
      {
        question: 'Combien coute la livraison ?',
        answer: 'Les frais de livraison varient de 300 a 800 DZD selon votre zone. La livraison est GRATUITE pour toute commande superieure a 10,000 DZD.',
      },
      {
        question: 'Livrez-vous dans ma wilaya ?',
        answer: 'Oui ! Nous livrons dans les 48 wilayas d\'Algerie. Aucune zone n\'est exclue de notre service de livraison.',
      },
      {
        question: 'Puis-je choisir une date de livraison ?',
        answer: 'Malheureusement, nous ne proposons pas encore la selection d\'une date precise. Cependant, notre livreur vous contactera avant la livraison pour confirmer votre disponibilite.',
      },
      {
        question: 'Que faire si je suis absent lors de la livraison ?',
        answer: 'Le livreur tentera de vous joindre par telephone. En cas d\'absence, une nouvelle tentative sera programmee. Apres 3 tentatives infructueuses, le colis sera retourne a notre entrepot.',
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
        answer: 'Nous acceptons le paiement par carte CIB/EDAHABIA, BaridiMob, et le paiement a la livraison (COD). Tous les paiements en ligne sont securises via la plateforme SATIM.',
      },
      {
        question: 'Le paiement en ligne est-il securise ?',
        answer: 'Absolument. Nous utilisons le protocole SSL et la plateforme de paiement SATIM, qui est le standard de securite bancaire en Algerie. Vos donnees de carte ne sont jamais stockees sur nos serveurs.',
      },
      {
        question: 'Puis-je payer en plusieurs fois ?',
        answer: 'Nous ne proposons pas encore le paiement en plusieurs fois. Cependant, vous pouvez utiliser le paiement a la livraison pour regler votre commande a la reception.',
      },
      {
        question: 'Comment fonctionne le paiement a la livraison ?',
        answer: 'Selectionnez "Paiement a la livraison" lors du checkout. Vous paierez en especes au livreur lors de la reception de votre colis. Un recu vous sera remis.',
      },
      {
        question: 'Ma transaction a echoue, que faire ?',
        answer: 'Verifiez que votre carte est active et dispose de fonds suffisants. Si le probleme persiste, essayez avec un autre moyen de paiement ou contactez votre banque. Aucun montant n\'est debite en cas d\'echec.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Retours & Echanges',
    icon: <RefreshCw className="h-5 w-5" />,
    items: [
      {
        question: 'Quelle est votre politique de retour ?',
        answer: 'Vous disposez de 7 jours apres reception pour retourner un article. Il doit etre non porte, avec ses etiquettes, dans son emballage d\'origine. Les articles soldes sont echangeables mais non remboursables.',
      },
      {
        question: 'Comment effectuer un retour ?',
        answer: 'Connectez-vous a votre compte, allez dans "Mes Commandes", selectionnez l\'article a retourner et suivez les instructions. Vous recevrez un bon de retour a imprimer et joindre au colis.',
      },
      {
        question: 'Les frais de retour sont-ils a ma charge ?',
        answer: 'Oui, les frais de retour sont a votre charge sauf en cas de produit defectueux ou d\'erreur de notre part. Dans ces cas, nous prenons en charge les frais.',
      },
      {
        question: 'Combien de temps prend le remboursement ?',
        answer: 'Une fois le retour recu et valide, le remboursement est effectue sous 7 a 14 jours ouvres. Il sera credite sur le meme moyen de paiement utilise lors de l\'achat.',
      },
      {
        question: 'Puis-je echanger un article contre une autre taille ?',
        answer: 'Oui, les echanges de taille sont possibles sous reserve de disponibilite. Suivez la procedure de retour et indiquez la taille souhaitee. Si elle n\'est pas disponible, vous serez rembourse.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Mon Compte',
    icon: <User className="h-5 w-5" />,
    items: [
      {
        question: 'Comment creer un compte ?',
        answer: 'Cliquez sur "Se connecter" puis "Creer un compte". Renseignez votre email, creez un mot de passe, et completez vos informations. Un email de verification vous sera envoye.',
      },
      {
        question: 'J\'ai oublie mon mot de passe, que faire ?',
        answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublie". Entrez votre email et vous recevrez un lien pour reinitialiser votre mot de passe.',
      },
      {
        question: 'Comment modifier mes informations personnelles ?',
        answer: 'Connectez-vous a votre compte et accedez a "Mon Profil". Vous pouvez y modifier votre nom, email, telephone et adresses de livraison.',
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Pour supprimer votre compte, contactez notre service client a privacy@oscarfashion.dz. Notez que cette action est irreversible et vos donnees seront supprimees.',
      },
      {
        question: 'Puis-je commander sans creer de compte ?',
        answer: 'Oui, vous pouvez commander en tant qu\'invite. Cependant, creer un compte vous permet de suivre vos commandes, sauvegarder vos adresses et acceder a votre historique d\'achats.',
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

export default function FAQClient() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Questions Frequentes</h1>
            <p className="text-xl text-gray-100 mb-8">
              Trouvez rapidement les reponses a vos questions
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
              <h3 className="font-semibold text-gray-900 mb-4 px-2">Categories</h3>
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
                  {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} resultat(s) pour "{searchQuery}"
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
                  <h3 className="text-xl font-bold mb-2">Vous n'avez pas trouve votre reponse ?</h3>
                  <p className="text-gray-100">
                    Notre equipe est disponible pour vous aider. N'hesitez pas a nous contacter.
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
