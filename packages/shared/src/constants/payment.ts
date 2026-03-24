export const PAYMENT_STATUS_LABELS = {
  PENDING: 'En attente',
  PAID: 'Payée',
  FAILED: 'Échec',
  REFUNDED: 'Remboursée',
  CANCELLED: 'Annulée',
} as const;

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;

export const PAYMENT_METHOD_LABELS = {
  CASH_ON_DELIVERY: 'Paiement à la livraison',
  CIB: 'CIB (Carte bancaire)',
  BARIDIMOB: 'BaridiMob',
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_LABELS;
export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;
