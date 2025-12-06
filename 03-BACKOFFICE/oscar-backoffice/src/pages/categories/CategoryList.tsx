import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Package,
  Eye,
  EyeOff,
  Image,
  X,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminCollectionsDocument,
  DeleteCollectionDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../lib/utils';

export const CategoryList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data, loading, error, refetch } = useQuery(AdminCollectionsDocument, {
    variables: {
      options: {
        take: 100,
        sort: { position: 'ASC' as any },
      },
    },
  });

  const [deleteCollection, { loading: deleting }] = useMutation(DeleteCollectionDocument);

  const collections = data?.collections?.items || [];
  const totalItems = data?.collections?.totalItems || 0;

  // Build tree structure
  const buildTree = () => {
    const rootCollections = collections.filter((c) => !c.parentId || c.parentId === '1');
    const childMap = new Map<string, typeof collections>();

    collections.forEach((c) => {
      if (c.parentId && c.parentId !== '1') {
        const children = childMap.get(c.parentId) || [];
        children.push(c);
        childMap.set(c.parentId, children);
      }
    });

    return { rootCollections, childMap };
  };

  const { rootCollections, childMap } = buildTree();

  // Full-text search across all fields
  const searchCollections = useMemo(() => {
    if (!searchTerm.trim()) return null;

    const term = searchTerm.toLowerCase().trim();
    const matchedCollections = collections.filter((c) => {
      // Search in name
      if (c.name.toLowerCase().includes(term)) return true;
      // Search in slug
      if (c.slug.toLowerCase().includes(term)) return true;
      // Search in description
      if (c.description?.toLowerCase().includes(term)) return true;
      // Search in French name
      if (c.customFields?.nameFr?.toLowerCase().includes(term)) return true;
      // Search in Arabic name
      if (c.customFields?.nameAr?.toLowerCase().includes(term)) return true;
      // Search in French description
      if (c.customFields?.descriptionFr?.toLowerCase().includes(term)) return true;
      // Search in Arabic description
      if (c.customFields?.descriptionAr?.toLowerCase().includes(term)) return true;
      return false;
    });

    return matchedCollections;
  }, [collections, searchTerm]);

  // Apply visibility filter
  const applyVisibilityFilter = (items: typeof collections) => {
    if (!showOnlyPublic) return items;
    return items.filter((c) => !c.isPrivate);
  };

  // Get filtered collections based on search and visibility
  const getFilteredCollections = () => {
    if (searchCollections !== null) {
      return applyVisibilityFilter(searchCollections);
    }
    return applyVisibilityFilter(rootCollections);
  };

  const filteredRootCollections = getFilteredCollections();

  // Auto-expand all when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const allIds = new Set(collections.map((c) => c.id));
      setExpandedIds(allIds);
    }
  }, [searchTerm, collections]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isSearchFocused) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCollection({ variables: { id: deleteTarget.id } });
      dispatch(
        addToast({
          message: `Catégorie "${deleteTarget.name}" supprimée`,
          type: 'success',
        })
      );
      refetch();
    } catch (err) {
      dispatch(
        addToast({
          message: 'Erreur lors de la suppression',
          type: 'error',
        })
      );
    }
    setDeleteTarget(null);
  };

  const renderCollection = (collection: (typeof collections)[0], depth = 0) => {
    const children = childMap.get(collection.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(collection.id);
    const productCount = collection.productVariants?.totalItems || 0;

    return (
      <div key={collection.id}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 border-b border-gray-700 ${
            depth > 0 ? 'bg-gray-800/50' : ''
          }`}
          style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
        >
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => toggleExpand(collection.id)}
            className={`p-1 rounded hover:bg-gray-600 ${hasChildren ? 'visible' : 'invisible'}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* Image */}
          <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {collection.featuredAsset?.preview ? (
              <img
                src={collection.featuredAsset.preview}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-100 truncate">{collection.name}</span>
              {collection.isPrivate && (
                <span title="Privé">
                  <EyeOff className="h-4 w-4 text-gray-500" />
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {collection.customFields?.nameFr && (
                <span className="mr-3">FR: {collection.customFields.nameFr}</span>
              )}
              {collection.customFields?.nameAr && (
                <span dir="rtl">AR: {collection.customFields.nameAr}</span>
              )}
            </div>
          </div>

          {/* Product Count */}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Package className="h-4 w-4" />
            <span>{productCount}</span>
          </div>

          {/* Position */}
          <Badge variant="default" className="text-xs">
            Pos: {collection.position}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              to={`/categories/${collection.id}`}
              className="p-2 text-blue-400 hover:bg-blue-900/50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setDeleteTarget({ id: collection.id, name: collection.name })}
              className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>{children.map((child) => renderCollection(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Catégories</h1>
          <p className="text-gray-400 mt-1">
            {totalItems} catégorie{totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/categories/new">
          <Button icon={<Plus className="h-4 w-4" />}>Nouvelle catégorie</Button>
        </Link>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              className={cn(
                'absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors',
                isSearchFocused ? 'text-blue-500' : 'text-gray-500'
              )}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher par nom, slug, description (FR/AR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                'w-full pl-12 pr-20 py-3.5 border rounded-xl transition-all duration-200 outline-none text-gray-100 placeholder-gray-500',
                isSearchFocused
                  ? 'border-blue-500 ring-4 ring-blue-500/10 bg-gray-900'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-900'
              )}
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            ) : (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            {/* Visibility Filter */}
            <button
              onClick={() => setShowOnlyPublic(!showOnlyPublic)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200',
                showOnlyPublic
                  ? 'bg-green-900/50 border-green-600 text-green-400'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
              )}
            >
              {showOnlyPublic ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {showOnlyPublic ? 'Publiques' : 'Toutes'}
              </span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={cn(
                  'p-2.5 rounded-lg transition-all',
                  viewMode === 'tree'
                    ? 'bg-gray-800 text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                )}
                title="Vue arborescence"
              >
                <FolderTree className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={cn(
                  'p-2.5 rounded-lg transition-all',
                  viewMode === 'flat'
                    ? 'bg-gray-800 text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                )}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="font-medium text-gray-100">{filteredRootCollections.length}</span>
              {' '}resultat{filteredRootCollections.length !== 1 ? 's' : ''} pour{' '}
              <span className="font-medium text-blue-400">"{searchTerm}"</span>
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              Effacer
            </button>
          </div>
        )}
      </div>

      {/* Tree View */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredRootCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderTree className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">Aucune catégorie trouvée</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 font-medium text-sm text-gray-400">
              <div className="w-6" /> {/* Toggle space */}
              <div className="w-10" /> {/* Image space */}
              <div className="flex-1">Nom</div>
              <div className="w-16 text-center">Produits</div>
              <div className="w-20 text-center">Position</div>
              <div className="w-20 text-center">Actions</div>
            </div>

            {/* Tree */}
            {filteredRootCollections.map((collection) => renderCollection(collection))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        message={
          <div>
            <p>
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>{deleteTarget?.name}</strong>{' '}
              ?
            </p>
            <p className="mt-2 text-amber-600">Les sous-catégories seront également supprimées.</p>
          </div>
        }
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
