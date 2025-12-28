/**
 * RBAC Permission Configuration for Oscar Backoffice
 * Maps Vendure permissions to pages, routes, and UI elements
 */

// All Vendure permissions enumeration
export type Permission =
  | 'Authenticated'
  | 'SuperAdmin'
  | 'Owner'
  | 'Public'
  // Administrator
  | 'CreateAdministrator'
  | 'ReadAdministrator'
  | 'UpdateAdministrator'
  | 'DeleteAdministrator'
  // Asset
  | 'CreateAsset'
  | 'ReadAsset'
  | 'UpdateAsset'
  | 'DeleteAsset'
  // Catalog (Products, Collections, Facets)
  | 'CreateCatalog'
  | 'ReadCatalog'
  | 'UpdateCatalog'
  | 'DeleteCatalog'
  // Channel
  | 'CreateChannel'
  | 'ReadChannel'
  | 'UpdateChannel'
  | 'DeleteChannel'
  // Collection
  | 'CreateCollection'
  | 'ReadCollection'
  | 'UpdateCollection'
  | 'DeleteCollection'
  // Country
  | 'CreateCountry'
  | 'ReadCountry'
  | 'UpdateCountry'
  | 'DeleteCountry'
  // Customer
  | 'CreateCustomer'
  | 'ReadCustomer'
  | 'UpdateCustomer'
  | 'DeleteCustomer'
  // Customer Group
  | 'CreateCustomerGroup'
  | 'ReadCustomerGroup'
  | 'UpdateCustomerGroup'
  | 'DeleteCustomerGroup'
  // Facet
  | 'CreateFacet'
  | 'ReadFacet'
  | 'UpdateFacet'
  | 'DeleteFacet'
  // Order
  | 'CreateOrder'
  | 'ReadOrder'
  | 'UpdateOrder'
  | 'DeleteOrder'
  // Payment Method
  | 'CreatePaymentMethod'
  | 'ReadPaymentMethod'
  | 'UpdatePaymentMethod'
  | 'DeletePaymentMethod'
  // Product
  | 'CreateProduct'
  | 'ReadProduct'
  | 'UpdateProduct'
  | 'DeleteProduct'
  // Promotion
  | 'CreatePromotion'
  | 'ReadPromotion'
  | 'UpdatePromotion'
  | 'DeletePromotion'
  // Seller
  | 'CreateSeller'
  | 'ReadSeller'
  | 'UpdateSeller'
  | 'DeleteSeller'
  // Settings
  | 'ReadSettings'
  | 'UpdateSettings'
  | 'UpdateGlobalSettings'
  // Shipping Method
  | 'CreateShippingMethod'
  | 'ReadShippingMethod'
  | 'UpdateShippingMethod'
  | 'DeleteShippingMethod'
  // Stock Location
  | 'CreateStockLocation'
  | 'ReadStockLocation'
  | 'UpdateStockLocation'
  | 'DeleteStockLocation'
  // System
  | 'CreateSystem'
  | 'ReadSystem'
  | 'UpdateSystem'
  | 'DeleteSystem'
  // Tag
  | 'CreateTag'
  | 'ReadTag'
  | 'UpdateTag'
  | 'DeleteTag'
  // Tax Category
  | 'CreateTaxCategory'
  | 'ReadTaxCategory'
  | 'UpdateTaxCategory'
  | 'DeleteTaxCategory'
  // Tax Rate
  | 'CreateTaxRate'
  | 'ReadTaxRate'
  | 'UpdateTaxRate'
  | 'DeleteTaxRate'
  // Zone
  | 'CreateZone'
  | 'ReadZone'
  | 'UpdateZone'
  | 'DeleteZone';

/**
 * Page-to-permission mapping
 * Defines which permissions are required to VIEW each page
 * Uses "anyOf" logic - user needs at least one of the listed permissions
 */
export const PAGE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard': ['ReadCatalog', 'ReadOrder', 'ReadCustomer'],
  '/products': ['ReadCatalog'],
  '/products/new': ['CreateCatalog'],
  '/products/:id': ['ReadCatalog'],
  '/products/:id/edit': ['UpdateCatalog'],
  '/orders': ['ReadOrder'],
  '/orders/:id': ['ReadOrder'],
  '/customers': ['ReadCustomer'],
  '/customers/new': ['CreateCustomer'],
  '/customers/:id': ['ReadCustomer'],
  '/customers/:id/edit': ['UpdateCustomer'],
  '/users': ['ReadAdministrator'],
  '/users/new': ['CreateAdministrator'],
  '/users/:id': ['ReadAdministrator'],
  '/users/:id/edit': ['UpdateAdministrator'],
  '/users/roles': ['ReadAdministrator'],
  '/users/roles/new': ['CreateAdministrator'],
  '/users/roles/:id/edit': ['UpdateAdministrator'],
  '/settings': ['ReadSettings'],
  '/reports': ['ReadOrder', 'ReadCustomer'],
  '/profile': ['Authenticated'],
};

/**
 * CRUD permission patterns per entity
 * Maps entity names to their CRUD permissions
 */
export const CRUD_PERMISSIONS: Record<
  string,
  { create?: Permission; read: Permission; update?: Permission; delete?: Permission }
> = {
  products: {
    create: 'CreateCatalog',
    read: 'ReadCatalog',
    update: 'UpdateCatalog',
    delete: 'DeleteCatalog',
  },
  orders: {
    create: 'CreateOrder',
    read: 'ReadOrder',
    update: 'UpdateOrder',
    delete: 'DeleteOrder',
  },
  customers: {
    create: 'CreateCustomer',
    read: 'ReadCustomer',
    update: 'UpdateCustomer',
    delete: 'DeleteCustomer',
  },
  administrators: {
    create: 'CreateAdministrator',
    read: 'ReadAdministrator',
    update: 'UpdateAdministrator',
    delete: 'DeleteAdministrator',
  },
  settings: {
    read: 'ReadSettings',
    update: 'UpdateSettings',
  },
  promotions: {
    create: 'CreatePromotion',
    read: 'ReadPromotion',
    update: 'UpdatePromotion',
    delete: 'DeletePromotion',
  },
  assets: {
    create: 'CreateAsset',
    read: 'ReadAsset',
    update: 'UpdateAsset',
    delete: 'DeleteAsset',
  },
};

/**
 * Sidebar menu permission configuration
 * Defines which permissions are required to see each menu item
 */
export interface SidebarPermission {
  permissions: Permission[];
  mode: 'anyOf' | 'allOf';
}

export const SIDEBAR_PERMISSIONS: Record<string, SidebarPermission> = {
  dashboard: { permissions: ['ReadCatalog', 'ReadOrder', 'ReadCustomer'], mode: 'anyOf' },
  products: { permissions: ['ReadCatalog'], mode: 'anyOf' },
  orders: { permissions: ['ReadOrder'], mode: 'anyOf' },
  customers: { permissions: ['ReadCustomer'], mode: 'anyOf' },
  users: { permissions: ['ReadAdministrator'], mode: 'anyOf' },
  roles: { permissions: ['ReadAdministrator'], mode: 'anyOf' },
  settings: { permissions: ['ReadSettings'], mode: 'anyOf' },
  reports: { permissions: ['ReadOrder', 'ReadCustomer'], mode: 'anyOf' },
};

/**
 * Permission categories for Role Form UI
 * Organizes all Vendure permissions into logical groups for easier management
 */
export const PERMISSION_CATEGORIES: Record<string, { label: string; permissions: Permission[] }> = {
  catalogue: {
    label: 'Catalogue (Produits)',
    permissions: ['CreateCatalog', 'ReadCatalog', 'UpdateCatalog', 'DeleteCatalog'],
  },
  products: {
    label: 'Produits',
    permissions: ['CreateProduct', 'ReadProduct', 'UpdateProduct', 'DeleteProduct'],
  },
  collections: {
    label: 'Collections',
    permissions: ['CreateCollection', 'ReadCollection', 'UpdateCollection', 'DeleteCollection'],
  },
  facets: {
    label: 'Facettes',
    permissions: ['CreateFacet', 'ReadFacet', 'UpdateFacet', 'DeleteFacet'],
  },
  assets: {
    label: 'Ressources (Images)',
    permissions: ['CreateAsset', 'ReadAsset', 'UpdateAsset', 'DeleteAsset'],
  },
  orders: {
    label: 'Commandes',
    permissions: ['CreateOrder', 'ReadOrder', 'UpdateOrder', 'DeleteOrder'],
  },
  customers: {
    label: 'Clients',
    permissions: ['CreateCustomer', 'ReadCustomer', 'UpdateCustomer', 'DeleteCustomer'],
  },
  customerGroups: {
    label: 'Groupes de clients',
    permissions: [
      'CreateCustomerGroup',
      'ReadCustomerGroup',
      'UpdateCustomerGroup',
      'DeleteCustomerGroup',
    ],
  },
  administrators: {
    label: 'Administrateurs',
    permissions: [
      'CreateAdministrator',
      'ReadAdministrator',
      'UpdateAdministrator',
      'DeleteAdministrator',
    ],
  },
  promotions: {
    label: 'Promotions',
    permissions: ['CreatePromotion', 'ReadPromotion', 'UpdatePromotion', 'DeletePromotion'],
  },
  shipping: {
    label: 'Livraison',
    permissions: [
      'CreateShippingMethod',
      'ReadShippingMethod',
      'UpdateShippingMethod',
      'DeleteShippingMethod',
    ],
  },
  payments: {
    label: 'Paiements',
    permissions: [
      'CreatePaymentMethod',
      'ReadPaymentMethod',
      'UpdatePaymentMethod',
      'DeletePaymentMethod',
    ],
  },
  taxes: {
    label: 'Taxes',
    permissions: [
      'CreateTaxCategory',
      'ReadTaxCategory',
      'UpdateTaxCategory',
      'DeleteTaxCategory',
      'CreateTaxRate',
      'ReadTaxRate',
      'UpdateTaxRate',
      'DeleteTaxRate',
    ],
  },
  zones: {
    label: 'Zones et Pays',
    permissions: [
      'CreateZone',
      'ReadZone',
      'UpdateZone',
      'DeleteZone',
      'CreateCountry',
      'ReadCountry',
      'UpdateCountry',
      'DeleteCountry',
    ],
  },
  channels: {
    label: 'Canaux',
    permissions: ['CreateChannel', 'ReadChannel', 'UpdateChannel', 'DeleteChannel'],
  },
  sellers: {
    label: 'Vendeurs',
    permissions: ['CreateSeller', 'ReadSeller', 'UpdateSeller', 'DeleteSeller'],
  },
  stock: {
    label: 'Stock',
    permissions: [
      'CreateStockLocation',
      'ReadStockLocation',
      'UpdateStockLocation',
      'DeleteStockLocation',
    ],
  },
  tags: {
    label: 'Tags',
    permissions: ['CreateTag', 'ReadTag', 'UpdateTag', 'DeleteTag'],
  },
  settings: {
    label: 'Paramètres',
    permissions: ['ReadSettings', 'UpdateSettings', 'UpdateGlobalSettings'],
  },
  system: {
    label: 'Système',
    permissions: ['SuperAdmin', 'CreateSystem', 'ReadSystem', 'UpdateSystem', 'DeleteSystem'],
  },
};

/**
 * Permission descriptions for tooltips
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  Authenticated: 'Utilisateur authentifié',
  SuperAdmin: 'Accès super administrateur (tous les droits)',
  Owner: 'Propriétaire de la ressource',
  Public: 'Accès public',
  // Administrator
  CreateAdministrator: 'Créer des administrateurs',
  ReadAdministrator: 'Voir les administrateurs',
  UpdateAdministrator: 'Modifier les administrateurs',
  DeleteAdministrator: 'Supprimer des administrateurs',
  // Asset
  CreateAsset: 'Télécharger des fichiers/images',
  ReadAsset: 'Voir les fichiers/images',
  UpdateAsset: 'Modifier les fichiers/images',
  DeleteAsset: 'Supprimer des fichiers/images',
  // Catalog
  CreateCatalog: 'Créer des produits et collections',
  ReadCatalog: 'Voir le catalogue',
  UpdateCatalog: 'Modifier le catalogue',
  DeleteCatalog: 'Supprimer du catalogue',
  // Channel
  CreateChannel: 'Créer des canaux',
  ReadChannel: 'Voir les canaux',
  UpdateChannel: 'Modifier les canaux',
  DeleteChannel: 'Supprimer des canaux',
  // Collection
  CreateCollection: 'Créer des collections',
  ReadCollection: 'Voir les collections',
  UpdateCollection: 'Modifier les collections',
  DeleteCollection: 'Supprimer des collections',
  // Country
  CreateCountry: 'Créer des pays',
  ReadCountry: 'Voir les pays',
  UpdateCountry: 'Modifier les pays',
  DeleteCountry: 'Supprimer des pays',
  // Customer
  CreateCustomer: 'Créer des clients',
  ReadCustomer: 'Voir les clients',
  UpdateCustomer: 'Modifier les clients',
  DeleteCustomer: 'Supprimer des clients',
  // Customer Group
  CreateCustomerGroup: 'Créer des groupes de clients',
  ReadCustomerGroup: 'Voir les groupes de clients',
  UpdateCustomerGroup: 'Modifier les groupes de clients',
  DeleteCustomerGroup: 'Supprimer des groupes de clients',
  // Facet
  CreateFacet: 'Créer des facettes',
  ReadFacet: 'Voir les facettes',
  UpdateFacet: 'Modifier les facettes',
  DeleteFacet: 'Supprimer des facettes',
  // Order
  CreateOrder: 'Créer des commandes',
  ReadOrder: 'Voir les commandes',
  UpdateOrder: 'Modifier les commandes',
  DeleteOrder: 'Annuler des commandes',
  // Payment Method
  CreatePaymentMethod: 'Créer des méthodes de paiement',
  ReadPaymentMethod: 'Voir les méthodes de paiement',
  UpdatePaymentMethod: 'Modifier les méthodes de paiement',
  DeletePaymentMethod: 'Supprimer des méthodes de paiement',
  // Product
  CreateProduct: 'Créer des produits',
  ReadProduct: 'Voir les produits',
  UpdateProduct: 'Modifier les produits',
  DeleteProduct: 'Supprimer des produits',
  // Promotion
  CreatePromotion: 'Créer des promotions',
  ReadPromotion: 'Voir les promotions',
  UpdatePromotion: 'Modifier les promotions',
  DeletePromotion: 'Supprimer des promotions',
  // Seller
  CreateSeller: 'Créer des vendeurs',
  ReadSeller: 'Voir les vendeurs',
  UpdateSeller: 'Modifier les vendeurs',
  DeleteSeller: 'Supprimer des vendeurs',
  // Settings
  ReadSettings: 'Voir les paramètres',
  UpdateSettings: 'Modifier les paramètres',
  UpdateGlobalSettings: 'Modifier les paramètres globaux',
  // Shipping Method
  CreateShippingMethod: 'Créer des méthodes de livraison',
  ReadShippingMethod: 'Voir les méthodes de livraison',
  UpdateShippingMethod: 'Modifier les méthodes de livraison',
  DeleteShippingMethod: 'Supprimer des méthodes de livraison',
  // Stock Location
  CreateStockLocation: 'Créer des emplacements de stock',
  ReadStockLocation: 'Voir les emplacements de stock',
  UpdateStockLocation: 'Modifier les emplacements de stock',
  DeleteStockLocation: 'Supprimer des emplacements de stock',
  // System
  CreateSystem: 'Créer des éléments système',
  ReadSystem: 'Voir les éléments système',
  UpdateSystem: 'Modifier les éléments système',
  DeleteSystem: 'Supprimer des éléments système',
  // Tag
  CreateTag: 'Créer des tags',
  ReadTag: 'Voir les tags',
  UpdateTag: 'Modifier les tags',
  DeleteTag: 'Supprimer des tags',
  // Tax Category
  CreateTaxCategory: 'Créer des catégories de taxes',
  ReadTaxCategory: 'Voir les catégories de taxes',
  UpdateTaxCategory: 'Modifier les catégories de taxes',
  DeleteTaxCategory: 'Supprimer des catégories de taxes',
  // Tax Rate
  CreateTaxRate: 'Créer des taux de taxe',
  ReadTaxRate: 'Voir les taux de taxe',
  UpdateTaxRate: 'Modifier les taux de taxe',
  DeleteTaxRate: 'Supprimer des taux de taxe',
  // Zone
  CreateZone: 'Créer des zones',
  ReadZone: 'Voir les zones',
  UpdateZone: 'Modifier les zones',
  DeleteZone: 'Supprimer des zones',
};

/**
 * Get human-readable description for a permission
 */
export function getPermissionDescription(permission: Permission): string {
  return PERMISSION_DESCRIPTIONS[permission] || permission;
}

/**
 * Get all permissions as a flat array
 */
export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSION_CATEGORIES).flatMap((cat) => cat.permissions);
}

/**
 * Get required permissions for a route path
 */
export function getRoutePermissions(path: string): Permission[] | null {
  // Direct match
  if (PAGE_PERMISSIONS[path]) {
    return PAGE_PERMISSIONS[path];
  }

  // Pattern matching for dynamic routes
  for (const [pattern, permissions] of Object.entries(PAGE_PERMISSIONS)) {
    const regex = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '$');
    if (regex.test(path)) {
      return permissions;
    }
  }

  return null;
}
