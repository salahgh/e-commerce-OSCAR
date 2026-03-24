import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  List,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminCollectionsDocument,
  DeleteCollectionDocument,
  UpdateCollectionDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../lib/utils';

// Helper to get translation by language
const getTranslation = (translations: any[] | undefined, lang: string, field: string): string => {
  if (!translations) return '';
  const translation = translations.find((t: any) => t.languageCode === lang);
  return translation?.[field] || '';
};

// Sortable Flat Item Component
interface SortableFlatItemProps {
  collection: any;
  collections: any[];
  onDelete: (id: string, name: string) => void;
  onOrderChange: (id: string, order: number) => void;
}

const SortableFlatItem: React.FC<SortableFlatItemProps> = ({ collection, collections, onDelete, onOrderChange }) => {
  const [editingOrder, setEditingOrder] = useState(false);
  const [orderValue, setOrderValue] = useState(String(collection.customFields?.displayOrder ?? ''));
  const orderInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const productCount = collection.productVariants?.totalItems || 0;
  const parent = collections.find((c: any) => c.id === collection.parentId);

  const handleOrderSubmit = () => {
    const newOrder = parseInt(orderValue, 10);
    if (!isNaN(newOrder) && newOrder !== collection.customFields?.displayOrder) {
      onOrderChange(collection.id, newOrder);
    }
    setEditingOrder(false);
  };

  const handleOrderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOrderSubmit();
    } else if (e.key === 'Escape') {
      setOrderValue(String(collection.customFields?.displayOrder ?? ''));
      setEditingOrder(false);
    }
  };

  useEffect(() => {
    if (editingOrder && orderInputRef.current) {
      orderInputRef.current.focus();
      orderInputRef.current.select();
    }
  }, [editingOrder]);

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-accent border-b border-border bg-card',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
        title="Glisser pour réorganiser"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Image */}
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
        {collection.featuredAsset?.preview ? (
          <img
            src={collection.featuredAsset.preview}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Name & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{getTranslation(collection.translations, 'fr', 'name') || collection.name}</span>
          {collection.isPrivate && (
            <span title="Privé">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {parent && parent.id !== '1' && (
            <span className="mr-2">
              <FolderTree className="h-3 w-3 inline mr-1" />
              {getTranslation(parent.translations, 'fr', 'name') || parent.name}
            </span>
          )}
          <span className="text-muted-foreground/70">/{collection.slug}</span>
        </div>
      </div>

      {/* Translations */}
      <div className="hidden lg:block text-sm text-muted-foreground max-w-48 truncate">
        {getTranslation(collection.translations, 'en', 'name') && <span>EN: {getTranslation(collection.translations, 'en', 'name')}</span>}
      </div>

      {/* Product Count */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Package className="h-4 w-4" />
        <span>{productCount}</span>
      </div>

      {/* Editable Order */}
      <div className="w-20 flex justify-center">
        {editingOrder ? (
          <input
            ref={orderInputRef}
            type="number"
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            onBlur={handleOrderSubmit}
            onKeyDown={handleOrderKeyDown}
            className="w-16 px-2 py-1 text-xs text-center border border-primary rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
          />
        ) : (
          <button
            onClick={() => setEditingOrder(true)}
            className="px-2 py-1 text-xs font-medium bg-muted hover:bg-accent rounded transition-colors cursor-pointer"
            title="Cliquer pour modifier l'ordre"
          >
            {collection.customFields?.displayOrder ?? '-'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link
          to={`/categories/${collection.id}`}
          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Modifier"
        >
          <Edit2 className="h-4 w-4" />
        </Link>
        <button
          onClick={() => onDelete(collection.id, collection.name)}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Sortable Tree Item Component
interface SortableTreeItemProps {
  collection: any;
  depth: number;
  childMap: Map<string, any[]>;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onOrderChange: (id: string, order: number) => void;
  renderChildren: (children: any[], depth: number) => React.ReactNode;
}

const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  collection,
  depth,
  childMap,
  expandedIds,
  onToggle,
  onDelete,
  onOrderChange,
  renderChildren,
}) => {
  const [editingOrder, setEditingOrder] = useState(false);
  const [orderValue, setOrderValue] = useState(String(collection.customFields?.displayOrder ?? ''));
  const orderInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const children = childMap.get(collection.id) || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(collection.id);
  const productCount = collection.productVariants?.totalItems || 0;

  const handleOrderSubmit = () => {
    const newOrder = parseInt(orderValue, 10);
    if (!isNaN(newOrder) && newOrder !== collection.customFields?.displayOrder) {
      onOrderChange(collection.id, newOrder);
    }
    setEditingOrder(false);
  };

  const handleOrderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOrderSubmit();
    } else if (e.key === 'Escape') {
      setOrderValue(String(collection.customFields?.displayOrder ?? ''));
      setEditingOrder(false);
    }
  };

  useEffect(() => {
    if (editingOrder && orderInputRef.current) {
      orderInputRef.current.focus();
      orderInputRef.current.select();
    }
  }, [editingOrder]);

  return (
    <div ref={setNodeRef} style={style as React.CSSProperties}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 hover:bg-accent border-b border-border',
          depth > 0 ? 'bg-card/50' : '',
          isDragging && 'shadow-lg ring-2 ring-primary bg-card'
        )}
        style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
          title="Glisser pour réorganiser"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => onToggle(collection.id)}
          className={`p-1 rounded hover:bg-muted ${hasChildren ? 'visible' : 'invisible'}`}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Image */}
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {collection.featuredAsset?.preview ? (
            <img
              src={collection.featuredAsset.preview}
              alt={collection.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{getTranslation(collection.translations, 'fr', 'name') || collection.name}</span>
            {collection.isPrivate && (
              <span title="Privé">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {getTranslation(collection.translations, 'en', 'name') && (
              <span className="mr-3">EN: {getTranslation(collection.translations, 'en', 'name')}</span>
            )}
            {getTranslation(collection.translations, 'ar', 'name') && (
              <span dir="rtl">AR: {getTranslation(collection.translations, 'ar', 'name')}</span>
            )}
          </div>
        </div>

        {/* Product Count */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{productCount}</span>
        </div>

        {/* Editable Order */}
        <div className="w-20 flex justify-center">
          {editingOrder ? (
            <input
              ref={orderInputRef}
              type="number"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              onBlur={handleOrderSubmit}
              onKeyDown={handleOrderKeyDown}
              className="w-16 px-2 py-1 text-xs text-center border border-primary rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
            />
          ) : (
            <button
              onClick={() => setEditingOrder(true)}
              className="px-2 py-1 text-xs font-medium bg-muted hover:bg-accent rounded transition-colors cursor-pointer"
              title="Cliquer pour modifier l'ordre"
            >
              {collection.customFields?.displayOrder ?? '-'}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            to={`/categories/${collection.id}`}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(collection.id, collection.name)}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>{renderChildren(children, depth + 1)}</div>
      )}
    </div>
  );
};

// Local storage keys
const STORAGE_KEY_EXPANDED = 'oscar-categories-expanded';
const STORAGE_KEY_VIEW_MODE = 'oscar-categories-view-mode';

export const CategoryList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Restore from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPANDED);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set();
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>(() => {
    // Restore from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIEW_MODE);
      if (saved === 'flat' || saved === 'tree') {
        return saved;
      }
    } catch {}
    return 'tree';
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persist expanded state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify([...expandedIds]));
    } catch {}
  }, [expandedIds]);

  // Persist view mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
    } catch {}
  }, [viewMode]);

  const { data, loading, error, refetch } = useQuery(AdminCollectionsDocument, {
    variables: {
      options: {
        take: 100,
        sort: { position: 'ASC' as any },
      },
    },
  });

  const [deleteCollection, { loading: deleting }] = useMutation(DeleteCollectionDocument);
  const [updateCollection] = useMutation(UpdateCollectionDocument);

  // Handle order change
  const handleOrderChange = async (id: string, order: number) => {
    try {
      await updateCollection({
        variables: {
          input: {
            id,
            customFields: {
              displayOrder: order,
            },
          },
        },
      });
      dispatch(
        addToast({
          message: `Ordre mis à jour`,
          type: 'success',
        })
      );
      refetch();
    } catch (err) {
      console.error('Order update error:', err);
      dispatch(
        addToast({
          message: 'Erreur lors de la mise à jour de l\'ordre',
          type: 'error',
        })
      );
    }
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const collections = data?.collections?.items || [];
  const totalItems = data?.collections?.totalItems || 0;

  // Sort function for collections - by displayOrder first, then by position
  const sortCollections = (items: typeof collections) => {
    return [...items].sort((a, b) => {
      // First sort by displayOrder (custom field)
      const orderA = a.customFields?.displayOrder ?? 999;
      const orderB = b.customFields?.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      // Then by position
      return (a.position ?? 0) - (b.position ?? 0);
    });
  };

  // Build tree structure
  const buildTree = () => {
    const rootCollections = sortCollections(
      collections.filter((c) => !c.parentId || c.parentId === '1')
    );
    const childMap = new Map<string, typeof collections>();

    collections.forEach((c) => {
      if (c.parentId && c.parentId !== '1') {
        const children = childMap.get(c.parentId) || [];
        children.push(c);
        childMap.set(c.parentId, children);
      }
    });

    // Sort children for each parent
    childMap.forEach((children, parentId) => {
      childMap.set(parentId, sortCollections(children));
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
      if (getTranslation(c.translations, 'fr', 'name')?.toLowerCase().includes(term)) return true;
      // Search in Arabic name
      if (getTranslation(c.translations, 'ar', 'name')?.toLowerCase().includes(term)) return true;
      // Search in French description
      if (getTranslation(c.translations, 'fr', 'description')?.toLowerCase().includes(term)) return true;
      // Search in Arabic description
      if (getTranslation(c.translations, 'ar', 'description')?.toLowerCase().includes(term)) return true;
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

  const expandAll = () => {
    const allIds = new Set(collections.map((c) => c.id));
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Get all collections for flat view (sorted by displayOrder then position)
  const flatCollections = useMemo(() => {
    let items = [...collections];
    if (showOnlyPublic) {
      items = items.filter((c) => !c.isPrivate);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      items = items.filter((c) => {
        if (c.name.toLowerCase().includes(term)) return true;
        if (c.slug.toLowerCase().includes(term)) return true;
        if (c.description?.toLowerCase().includes(term)) return true;
        if (getTranslation(c.translations, 'fr', 'name')?.toLowerCase().includes(term)) return true;
        if (getTranslation(c.translations, 'ar', 'name')?.toLowerCase().includes(term)) return true;
        return false;
      });
    }
    // Sort by displayOrder first, then position
    return items.sort((a, b) => {
      const orderA = a.customFields?.displayOrder ?? 999;
      const orderB = b.customFields?.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.position ?? 0) - (b.position ?? 0);
    });
  }, [collections, showOnlyPublic, searchTerm]);

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

  // Handle drag end - update displayOrder for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the collections
    const activeCollection = collections.find((c) => c.id === activeId);
    const overCollection = collections.find((c) => c.id === overId);

    if (!activeCollection || !overCollection) return;

    // Get the parent ID - we can only reorder within the same level
    const activeParentId = activeCollection.parentId || '1';
    const overParentId = overCollection.parentId || '1';

    // Only allow reordering within the same parent
    if (activeParentId !== overParentId) {
      dispatch(
        addToast({
          message: 'Déplacement entre différents parents non supporté',
          type: 'warning',
        })
      );
      return;
    }

    // Get siblings sorted by displayOrder
    const siblings = sortCollections(
      collections.filter((c) => (c.parentId || '1') === activeParentId)
    );

    const oldIndex = siblings.findIndex((c) => c.id === activeId);
    const newIndex = siblings.findIndex((c) => c.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const reordered = arrayMove(siblings, oldIndex, newIndex);

    // Update displayOrder for all items based on new positions
    try {
      const updates = reordered.map((item, index) =>
        updateCollection({
          variables: {
            input: {
              id: item.id,
              customFields: {
                displayOrder: index + 1,
              },
            },
          },
        })
      );

      await Promise.all(updates);

      dispatch(
        addToast({
          message: `Ordre des catégories mis à jour`,
          type: 'success',
        })
      );

      refetch();
    } catch (err) {
      console.error('Reorder error:', err);
      dispatch(
        addToast({
          message: 'Erreur lors de la réorganisation',
          type: 'error',
        })
      );
    }
  };

  // Render tree children with sortable context
  const renderTreeChildren = (children: typeof collections, depth: number) => {
    const childIds = children.map((c) => c.id);
    return (
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {children.map((child) => (
          <SortableTreeItem
            key={child.id}
            collection={child}
            depth={depth}
            childMap={childMap}
            expandedIds={expandedIds}
            onToggle={toggleExpand}
            onDelete={(id, name) => setDeleteTarget({ id, name })}
            onOrderChange={handleOrderChange}
            renderChildren={renderTreeChildren}
          />
        ))}
      </SortableContext>
    );
  };

  const renderCollection = (collection: (typeof collections)[0], depth = 0) => {
    const children = childMap.get(collection.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(collection.id);
    const productCount = collection.productVariants?.totalItems || 0;

    return (
      <div key={collection.id}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-accent border-b border-border ${
            depth > 0 ? 'bg-card/50' : ''
          }`}
          style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
        >
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => toggleExpand(collection.id)}
            className={`p-1 rounded hover:bg-muted ${hasChildren ? 'visible' : 'invisible'}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Image */}
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {collection.featuredAsset?.preview ? (
              <img
                src={collection.featuredAsset.preview}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{getTranslation(collection.translations, 'fr', 'name') || collection.name}</span>
              {collection.isPrivate && (
                <span title="Privé">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {getTranslation(collection.translations, 'en', 'name') && (
                <span className="mr-3">EN: {getTranslation(collection.translations, 'en', 'name')}</span>
              )}
              {getTranslation(collection.translations, 'ar', 'name') && (
                <span dir="rtl">AR: {getTranslation(collection.translations, 'ar', 'name')}</span>
              )}
            </div>
          </div>

          {/* Product Count */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setDeleteTarget({ id: collection.id, name: collection.name })}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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

  // Render flat list item
  const renderFlatItem = (collection: (typeof collections)[0]) => {
    const productCount = collection.productVariants?.totalItems || 0;
    const parent = collections.find((c) => c.id === collection.parentId);

    return (
      <div
        key={collection.id}
        className="flex items-center gap-3 px-4 py-3 hover:bg-accent border-b border-border"
      >
        {/* Image */}
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {collection.featuredAsset?.preview ? (
            <img
              src={collection.featuredAsset.preview}
              alt={collection.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{getTranslation(collection.translations, 'fr', 'name') || collection.name}</span>
            {collection.isPrivate && (
              <span title="Privé">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {parent && parent.id !== '1' && (
              <span className="mr-2">
                <FolderTree className="h-3 w-3 inline mr-1" />
                {getTranslation(parent.translations, 'fr', 'name') || parent.name}
              </span>
            )}
            <span className="text-muted-foreground/70">/{collection.slug}</span>
          </div>
        </div>

        {/* Translations */}
        <div className="hidden lg:block text-sm text-muted-foreground max-w-48 truncate">
          {getTranslation(collection.translations, 'en', 'name') && <span>EN: {getTranslation(collection.translations, 'en', 'name')}</span>}
        </div>

        {/* Product Count */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget({ id: collection.id, name: collection.name })}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-destructive text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
          <h1 className="text-3xl font-bold text-foreground">Catégories</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} catégorie{totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/categories/new">
          <Button icon={<Plus className="h-4 w-4" />}>Nouvelle catégorie</Button>
        </Link>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              className={cn(
                'absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors',
                isSearchFocused ? 'text-primary' : 'text-muted-foreground'
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
                'w-full pl-12 pr-20 py-3.5 border rounded-xl transition-all duration-200 outline-none text-foreground placeholder-muted-foreground',
                isSearchFocused
                  ? 'border-primary ring-4 ring-primary/10 bg-background'
                  : 'border-border hover:border-muted-foreground bg-background'
              )}
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
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
                  : 'bg-card border-border text-muted-foreground hover:bg-accent'
              )}
            >
              {showOnlyPublic ? <Eye className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              <span className="text-sm font-medium">{showOnlyPublic ? 'Publiques' : 'Toutes'}</span>
            </button>

            {/* Expand/Collapse Buttons (only for tree view) */}
            {viewMode === 'tree' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Tout déplier"
                >
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Déplier</span>
                </button>
                <button
                  onClick={collapseAll}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Tout replier"
                >
                  <ChevronsDownUp className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Replier</span>
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={cn(
                  'p-2.5 rounded-lg transition-all',
                  viewMode === 'tree'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
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
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
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
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredRootCollections.length}</span>{' '}
              resultat{filteredRootCollections.length !== 1 ? 's' : ''} pour{' '}
              <span className="font-medium text-primary">"{searchTerm}"</span>
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Effacer
            </button>
          </div>
        )}
      </div>

      {/* Categories View */}
      <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (viewMode === 'tree' ? filteredRootCollections : flatCollections).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderTree className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucune catégorie trouvée</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary hover:text-primary/80"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : viewMode === 'tree' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="divide-y divide-border">
              {/* Tree Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground">
                <div className="w-8" /> {/* Drag handle space */}
                <div className="w-6" /> {/* Toggle space */}
                <div className="w-10" /> {/* Image space */}
                <div className="flex-1">Nom</div>
                <div className="w-16 text-center">Produits</div>
                <div className="w-20 text-center">Ordre</div>
                <div className="w-20 text-center">Actions</div>
              </div>

              {/* Tree with Sortable Root Items */}
              <SortableContext
                items={filteredRootCollections.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredRootCollections.map((collection) => (
                  <SortableTreeItem
                    key={collection.id}
                    collection={collection}
                    depth={0}
                    childMap={childMap}
                    expandedIds={expandedIds}
                    onToggle={toggleExpand}
                    onDelete={(id, name) => setDeleteTarget({ id, name })}
                    onOrderChange={handleOrderChange}
                    renderChildren={renderTreeChildren}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="divide-y divide-border">
              {/* Flat Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground">
                <div className="w-8" /> {/* Drag handle space */}
                <div className="w-12" /> {/* Image space */}
                <div className="flex-1">Nom</div>
                <div className="hidden lg:block w-48">Traduction</div>
                <div className="w-16 text-center">Produits</div>
                <div className="w-20 text-center">Ordre</div>
                <div className="w-20 text-center">Actions</div>
              </div>

              {/* Flat List with Sortable Items */}
              <SortableContext
                items={flatCollections.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {flatCollections.map((collection) => (
                  <SortableFlatItem
                    key={collection.id}
                    collection={collection}
                    collections={collections}
                    onDelete={(id, name) => setDeleteTarget({ id, name })}
                    onOrderChange={handleOrderChange}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
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
