import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Truck,
  CreditCard,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  User,
} from 'lucide-react';
import { AdminOrdersDocument } from '../../graphql/generated/graphql';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatDateTime } from '../../lib/utils';

// Order status configuration with icons
const ORDER_STATUS: Record<
  string,
  {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }
> = {
  AddingItems: {
    label: 'En cours',
    variant: 'default',
    icon: <ShoppingCart className="h-3.5 w-3.5" />,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
  },
  ArrangingPayment: {
    label: 'Paiement',
    variant: 'info',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  PaymentAuthorized: {
    label: 'Autorisé',
    variant: 'info',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  PaymentSettled: {
    label: 'Payé',
    variant: 'success',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  PartiallyShipped: {
    label: 'Part. expédié',
    variant: 'warning',
    icon: <Package className="h-3.5 w-3.5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  Shipped: {
    label: 'Expédié',
    variant: 'info',
    icon: <Truck className="h-3.5 w-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  PartiallyDelivered: {
    label: 'Part. livré',
    variant: 'warning',
    icon: <Package className="h-3.5 w-3.5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  Delivered: {
    label: 'Livré',
    variant: 'success',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  Modifying: {
    label: 'Modification',
    variant: 'warning',
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  ArrangingAdditionalPayment: {
    label: 'Paiement add.',
    variant: 'info',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  Cancelled: {
    label: 'Annulé',
    variant: 'danger',
    icon: <X className="h-3.5 w-3.5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
};

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
];

// Date presets
const DATE_PRESETS = [
  { label: "Aujourd'hui", getValue: () => {
    const today = new Date().toISOString().split('T')[0];
    return { from: today, to: today };
  }},
  { label: 'Hier', getValue: () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return { from: yesterday, to: yesterday };
  }},
  { label: '7 derniers jours', getValue: () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    return { from: weekAgo, to: today };
  }},
  { label: '30 derniers jours', getValue: () => {
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    return { from: monthAgo, to: today };
  }},
  { label: 'Ce mois', getValue: () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    return { from: firstDay, to: today };
  }},
  { label: 'Mois dernier', getValue: () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    return { from: firstDay, to: lastDay };
  }},
];

// Amount presets
const AMOUNT_PRESETS = [
  { label: '< 5,000 DZD', min: '', max: '5000' },
  { label: '5,000 - 10,000 DZD', min: '5000', max: '10000' },
  { label: '10,000 - 25,000 DZD', min: '10000', max: '25000' },
  { label: '25,000 - 50,000 DZD', min: '25000', max: '50000' },
  { label: '> 50,000 DZD', min: '50000', max: '' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (récent)', field: 'orderPlacedAt', direction: 'DESC' },
  { value: 'date_asc', label: 'Date (ancien)', field: 'orderPlacedAt', direction: 'ASC' },
  { value: 'amount_desc', label: 'Montant (élevé)', field: 'totalWithTax', direction: 'DESC' },
  { value: 'amount_asc', label: 'Montant (bas)', field: 'totalWithTax', direction: 'ASC' },
  { value: 'code_asc', label: 'Code (A-Z)', field: 'code', direction: 'ASC' },
  { value: 'code_desc', label: 'Code (Z-A)', field: 'code', direction: 'DESC' },
];

export const OrderList: React.FC = () => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [wilayaFilter, setWilayaFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [hasCustomerFilter, setHasCustomerFilter] = useState<'all' | 'with' | 'without'>('all');
  const [sortOption, setSortOption] = useState('date_desc');

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePresets, setShowDatePresets] = useState(false);
  const [showAmountPresets, setShowAmountPresets] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  // Build date filters
  const buildDateFilter = () => {
    if (!dateFrom && !dateTo) return undefined;
    const filter: Record<string, string> = {};
    if (dateFrom) filter.after = new Date(dateFrom).toISOString();
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filter.before = endDate.toISOString();
    }
    return filter;
  };

  // Build amount filters
  const buildAmountFilter = () => {
    if (!minAmount && !maxAmount) return undefined;
    const filter: Record<string, number> = {};
    if (minAmount) filter.gte = Math.round(parseFloat(minAmount) * 100);
    if (maxAmount) filter.lte = Math.round(parseFloat(maxAmount) * 100);
    return filter;
  };

  const dateFilter = buildDateFilter();
  const amountFilter = buildAmountFilter();
  const currentSort = SORT_OPTIONS.find(s => s.value === sortOption) || SORT_OPTIONS[0];

  const { data, loading, error } = useQuery(AdminOrdersDocument, {
    variables: {
      options: {
        skip: currentPage * pageSize,
        take: pageSize,
        sort: { [currentSort.field]: currentSort.direction as any },
        filter: {
          ...(searchTerm && { code: { contains: searchTerm } }),
          ...(statusFilter.length === 1 && { state: { eq: statusFilter[0] } }),
          ...(statusFilter.length > 1 && { state: { in: statusFilter } }),
          ...(dateFilter && { orderPlacedAt: dateFilter }),
          ...(amountFilter && { totalWithTax: amountFilter }),
        },
      },
    },
  });

  const orders = data?.orders?.items || [];
  const totalItems = data?.orders?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Local filters (custom fields and customer presence)
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (wilayaFilter) {
      result = result.filter((o) => o.customFields?.wilaya === wilayaFilter);
    }

    if (hasCustomerFilter === 'with') {
      result = result.filter((o) => o.customer);
    } else if (hasCustomerFilter === 'without') {
      result = result.filter((o) => !o.customer);
    }

    return result;
  }, [orders, wilayaFilter, hasCustomerFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalWithTax || 0), 0);
    const avgValue = filteredOrders.length > 0 ? totalValue / filteredOrders.length : 0;
    const byStatus: Record<string, number> = {};
    filteredOrders.forEach(o => {
      byStatus[o.state] = (byStatus[o.state] || 0) + 1;
    });
    return { totalValue, avgValue, byStatus };
  }, [filteredOrders]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setWilayaFilter('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setHasCustomerFilter('all');
    setSortOption('date_desc');
    setCurrentPage(0);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setCurrentPage(0);
  };

  const applyDatePreset = (preset: typeof DATE_PRESETS[0]) => {
    const { from, to } = preset.getValue();
    setDateFrom(from);
    setDateTo(to);
    setShowDatePresets(false);
    setCurrentPage(0);
  };

  const applyAmountPreset = (preset: typeof AMOUNT_PRESETS[0]) => {
    setMinAmount(preset.min);
    setMaxAmount(preset.max);
    setShowAmountPresets(false);
    setCurrentPage(0);
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter.length > 0,
    wilayaFilter,
    dateFrom || dateTo,
    minAmount || maxAmount,
    hasCustomerFilter !== 'all',
  ].filter(Boolean).length;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center bg-gray-800 rounded-xl p-8 border border-gray-700">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium mb-2">Erreur de chargement</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            <RotateCcw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ShoppingCart className="h-7 w-7 text-blue-400" />
              </div>
              Commandes
            </h1>
            <p className="text-gray-400 mt-2">
              Gérez et suivez toutes vos commandes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{totalItems}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Valeur totale</p>
                <p className="text-lg font-bold text-white">{formatPrice(stats.totalValue / 100)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Panier moyen</p>
                <p className="text-lg font-bold text-white">{formatPrice(stats.avgValue / 100)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">En attente</p>
                <p className="text-lg font-bold text-white">
                  {(stats.byStatus['PaymentSettled'] || 0) + (stats.byStatus['ArrangingPayment'] || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Truck className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Expédiées</p>
                <p className="text-lg font-bold text-white">
                  {(stats.byStatus['Shipped'] || 0) + (stats.byStatus['Delivered'] || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Main Search Row */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par code de commande, client..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-4 py-3 pr-10 border border-gray-600 rounded-xl bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              className="min-w-[140px]"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-850 border-b border-gray-700 space-y-6">
            {/* Status Filter - Multi-select chips */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Statut de commande
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ORDER_STATUS).map(([key, config]) => {
                  const isSelected = statusFilter.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleStatusFilter(key)}
                      className={`
                        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isSelected
                          ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-offset-gray-800 ring-current`
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                        }
                      `}
                    >
                      {config.icon}
                      {config.label}
                      {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date and Amount Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Période
                </label>
                <div className="space-y-3">
                  {/* Date Presets */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDatePresets(!showDatePresets)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 transition-colors"
                    >
                      <span>Période prédéfinie</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showDatePresets ? 'rotate-180' : ''}`} />
                    </button>
                    {showDatePresets && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                        {DATE_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyDatePreset(preset)}
                            className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Custom Date Range */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setCurrentPage(0);
                        }}
                        className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <span className="text-gray-500">→</span>
                    <div className="relative flex-1">
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setCurrentPage(0);
                        }}
                        className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={() => { setDateFrom(''); setDateTo(''); }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Montant (DZD)
                </label>
                <div className="space-y-3">
                  {/* Amount Presets */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAmountPresets(!showAmountPresets)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 transition-colors"
                    >
                      <span>Fourchette prédéfinie</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showAmountPresets ? 'rotate-180' : ''}`} />
                    </button>
                    {showAmountPresets && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                        {AMOUNT_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyAmountPreset(preset)}
                            className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Custom Amount Range */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => {
                        setMinAmount(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => {
                        setMaxAmount(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {(minAmount || maxAmount) && (
                      <button
                        onClick={() => { setMinAmount(''); setMaxAmount(''); }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Wilaya Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Wilaya
                </label>
                <select
                  value={wilayaFilter}
                  onChange={(e) => {
                    setWilayaFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Toutes les wilayas</option>
                  {WILAYAS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Customer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </label>
                <select
                  value={hasCustomerFilter}
                  onChange={(e) => {
                    setHasCustomerFilter(e.target.value as 'all' | 'with' | 'without');
                    setCurrentPage(0);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="all">Toutes les commandes</option>
                  <option value="with">Avec client identifié</option>
                  <option value="without">Clients anonymes</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="w-full"
                  disabled={activeFiltersCount === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser ({activeFiltersCount})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Pills */}
        {activeFiltersCount > 0 && !showFilters && (
          <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-700 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Filtres actifs:</span>
            {statusFilter.map(status => (
              <span
                key={status}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
              >
                {ORDER_STATUS[status]?.label || status}
                <button onClick={() => toggleStatusFilter(status)} className="hover:text-blue-300">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom || dateTo}
                <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="hover:text-purple-300">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(minAmount || maxAmount) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                {minAmount ? `${minAmount} DZD` : '0'} → {maxAmount ? `${maxAmount} DZD` : '∞'}
                <button onClick={() => { setMinAmount(''); setMaxAmount(''); }} className="hover:text-green-300">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {wilayaFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                {wilayaFilter}
                <button onClick={() => setWilayaFilter('')} className="hover:text-yellow-300">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-300 ml-2"
            >
              Tout effacer
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-gray-400 mt-4">Chargement des commandes...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-gray-700/30 rounded-full mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-500" />
            </div>
            <p className="text-gray-300 text-lg font-medium mb-2">Aucune commande trouvée</p>
            <p className="text-gray-500 text-sm mb-4">Essayez d'ajuster vos filtres</p>
            {activeFiltersCount > 0 && (
              <Button onClick={resetFilters} variant="secondary">
                <RotateCcw className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Wilaya
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredOrders.map((order) => {
                    const statusConfig = ORDER_STATUS[order.state] || {
                      label: order.state,
                      variant: 'default' as const,
                      icon: <Package className="h-3.5 w-3.5" />,
                      color: 'text-gray-400',
                      bgColor: 'bg-gray-500/20',
                    };
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-700/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                              {statusConfig.icon}
                            </div>
                            <div>
                              <Link
                                to={`/orders/${order.id}`}
                                className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                              >
                                #{order.code}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {order.customer ? (
                            <Link
                              to={`/customers/${order.customer.id}`}
                              className="group/customer"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                  {(order.customer.firstName?.[0] || '') + (order.customer.lastName?.[0] || '')}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-100 group-hover/customer:text-blue-400 transition-colors">
                                    {order.customer.firstName} {order.customer.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.customer.emailAddress}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Anonyme</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {order.customFields?.wilaya ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-300">{order.customFields.wilaya}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white">
                            {formatPrice(order.totalWithTax / 100)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {order.orderPlacedAt
                              ? formatDateTime(order.orderPlacedAt)
                              : formatDateTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  Affichage de <span className="font-medium text-white">{currentPage * pageSize + 1}</span> à{' '}
                  <span className="font-medium text-white">
                    {Math.min((currentPage + 1) * pageSize, totalItems)}
                  </span>{' '}
                  sur <span className="font-medium text-white">{totalItems}</span> commandes
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Première page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Dernière page"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
