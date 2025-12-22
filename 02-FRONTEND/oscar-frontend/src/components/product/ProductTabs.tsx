'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProductTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function ProductTabs({ tabs, defaultTab, className }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="border-b border-border">
        <div className="flex gap-8 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-4 px-1 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">{activeContent}</div>
    </div>
  );
}

// Pre-built product description tab content
interface ProductDescriptionTabProps {
  description: string;
}

export function ProductDescriptionTab({ description }: ProductDescriptionTabProps) {
  return (
    <div
      className="prose prose-sm max-w-none text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}

// Pre-built specifications tab content
interface Specification {
  label: string;
  value: string;
}

interface ProductSpecificationsTabProps {
  specifications: Specification[];
}

export function ProductSpecificationsTab({ specifications }: ProductSpecificationsTabProps) {
  return (
    <div className="space-y-3">
      {specifications.map((spec, index) => (
        <div
          key={index}
          className={cn(
            'flex justify-between py-3 text-sm',
            index !== specifications.length - 1 && 'border-b border-border'
          )}
        >
          <span className="text-muted-foreground">{spec.label}</span>
          <span className="font-medium text-foreground">{spec.value}</span>
        </div>
      ))}
    </div>
  );
}

// Pre-built shipping info tab content
interface ProductShippingTabProps {
  shippingInfo?: {
    freeShippingThreshold?: number;
    estimatedDelivery?: string;
    returnPolicy?: string;
  };
}

export function ProductShippingTab({ shippingInfo }: ProductShippingTabProps) {
  const defaultInfo = {
    freeShippingThreshold: 5000,
    estimatedDelivery: '3-5 jours ouvrables',
    returnPolicy: '14 jours pour retourner votre commande',
  };

  const info = { ...defaultInfo, ...shippingInfo };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-2">Livraison</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            Livraison gratuite pour les commandes de plus de{' '}
            {info.freeShippingThreshold?.toLocaleString('fr-DZ')} DA
          </li>
          <li>Delai de livraison estime: {info.estimatedDelivery}</li>
          <li>Livraison disponible partout en Algerie</li>
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-2">Retours</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{info.returnPolicy}</li>
          <li>Remboursement complet si le produit est retourne dans son etat d'origine</li>
          <li>Frais de retour a la charge du client sauf en cas de defaut</li>
        </ul>
      </div>
    </div>
  );
}

// Pre-built reviews tab content (placeholder)
interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductReviewsTabProps {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export function ProductReviewsTab({
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
}: ProductReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Aucun avis pour ce produit pour le moment.
        </p>
        <button className="text-primary font-medium hover:underline">
          Soyez le premier a donner votre avis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'h-5 w-5',
                  i < Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{totalReviews} avis</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-border last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{review.author}</span>
              <span className="text-sm text-muted-foreground">{review.date}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  )}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
