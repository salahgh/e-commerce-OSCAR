import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  Search,
  Plus,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Lock,
  Palette,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminFacetListDocument,
  DeleteFacetDocument,
} from '../../graphql/generated/graphql';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { ColorSwatch } from '../../components/ui/ColorSwatch';

const PAGE_SIZE = 20;

type SortOption = 'name-asc' | 'name-desc' | 'code-asc' | 'code-desc' | 'created-desc' | 'created-asc';

const SORT_OPTIONS: Array<{ value: SortOption; label: string; sort: Record<string, 'ASC' | 'DESC'> }> = [
  { value: 'name-asc', label: 'Nom (A-Z)', sort: { name: 'ASC' } },
  { value: 'name-desc', label: 'Nom (Z-A)', sort: { name: 'DESC' } },
  { value: 'code-asc', label: 'Code (A-Z)', sort: { code: 'ASC' } },
  { value: 'code-desc', label: 'Code (Z-A)', sort: { code: 'DESC' } },
  { value: 'created-desc', label: 'Plus récents', sort: { createdAt: 'DESC' } },
  { value: 'created-asc', label: 'Plus anciens', sort: { createdAt: 'ASC' } },
];

type VisibilityFilter = 'all' | 'public' | 'private';

export const FacetList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deletingFacet, setDeletingFacet] = useState<{ id: string; name: string } | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');

  // Build filter based on search and visibility
  const buildFilter = () => {
    const filter: Record<string, any> = {};
    if (searchTerm) {
      filter.name = { contains: searchTerm };
    }
    if (visibilityFilter === 'private') {
      filter.isPrivate = { eq: true };
    } else if (visibilityFilter === 'public') {
      filter.isPrivate = { eq: false };
    }
    return Object.keys(filter).length > 0 ? filter : undefined;
  };

  const sortConfig =
    SORT_OPTIONS.find((o) => o.value === sortOption)?.sort ?? { name: 'ASC' };

  // Query facets
  const { data, loading, error, refetch } = useQuery(AdminFacetListDocument, {
    variables: {
      options: {
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        filter: buildFilter(),
        sort: sortConfig as any,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Delete mutation
  const [deleteFacet, { loading: deleting }] = useMutation(DeleteFacetDocument);

  const facets = data?.facets?.items || [];
  const totalItems = data?.facets?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Determine if a facet is a "color" facet (has values with colorHex)
  const isColorFacet = (facet: any): boolean => {
    return facet.values?.some((v: any) => v.customFields?.colorHex);
  };

  // Handle delete
  const handleDelete = async (force: boolean = false) => {
    if (!deletingFacet) return;

    try {
      const result = await deleteFacet({
        variables: {
          id: deletingFacet.id,
          force,
        },
      });

      const response = result.data?.deleteFacet;

      if (response?.result === 'DELETED') {
        dispatch(
          addToast({
            message: `Attribut "${deletingFacet.name}" supprime`,
            type: 'success',
          })
        );
        setDeletingFacet(null);
        refetch();
      } else if (response?.result === 'NOT_DELETED') {
        const shouldForce = window.confirm(
          `${response.message || 'Cet attribut est utilise par des produits.'}\n\nVoulez-vous forcer la suppression ?`
        );
        if (shouldForce) {
          await handleDelete(true);
        } else {
          setDeletingFacet(null);
        }
      } else {
        dispatch(
          addToast({
            message: response?.message || 'Erreur lors de la suppression',
            type: 'error',
          })
        );
      }
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || 'Erreur lors de la suppression',
          type: 'error',
        })
      );
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reessayer
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
          <h1 className="text-3xl font-bold text-foreground">Attributs</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} attribut{totalItems > 1 ? 's' : ''} au total
          </p>
        </div>
        <PermissionGate anyOf={['CreateFacet', 'CreateCatalog']} disableMode>
          <Link
            to="/facets/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouvel attribut
          </Link>
        </PermissionGate>
      </div>

      {/* Search + filters */}
      <div className="bg-card rounded-lg shadow p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value as SortOption);
              setPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm outline-none"
            title="Trier"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => {
              setVisibilityFilter(e.target.value as VisibilityFilter);
              setPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm outline-none"
            title="Visibilité"
          >
            <option value="all">Toutes les visibilités</option>
            <option value="public">Public uniquement</option>
            <option value="private">Privé uniquement</option>
          </select>
          <span className="text-xs text-muted-foreground ml-auto">
            {totalItems} attribut(s)
          </span>
        </div>
      </div>

      {/* Facets Grid */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading && facets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Chargement...</span>
            </div>
          </div>
        ) : facets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Tag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun attribut trouve</p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Effacer la recherche
              </button>
            ) : (
              <Link
                to="/facets/new"
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Creer votre premier attribut
              </Link>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facets.map((facet: any) => {
                const colorFacet = isColorFacet(facet);
                const valueCount = facet.values?.length || 0;

                return (
                  <div
                    key={facet.id}
                    className="group relative border border-border rounded-lg p-4 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/facets/${facet.id}`)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {colorFacet ? (
                            <Palette className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-foreground truncate">
                            {facet.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-1 truncate">
                          {facet.code}
                        </p>
                      </div>

                      {/* Private badge */}
                      {facet.isPrivate && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          Prive
                        </div>
                      )}
                    </div>

                    {/* Values preview */}
                    <div className="mb-3">
                      {colorFacet ? (
                        <div className="flex flex-wrap gap-1">
                          {facet.values?.slice(0, 8).map((value: any) => (
                            <ColorSwatch
                              key={value.id}
                              color={value.name}
                              hex={value.customFields?.colorHex}
                              size="sm"
                            />
                          ))}
                          {valueCount > 8 && (
                            <span className="text-xs text-muted-foreground self-center ml-1">
                              +{valueCount - 8}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {facet.values?.slice(0, 4).map((value: any) => (
                            <span
                              key={value.id}
                              className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                            >
                              {value.name}
                            </span>
                          ))}
                          {valueCount > 4 && (
                            <span className="text-xs text-muted-foreground self-center">
                              +{valueCount - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        {valueCount} valeur{valueCount > 1 ? 's' : ''}
                      </span>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PermissionGate anyOf={['UpdateFacet', 'UpdateCatalog']} disableMode>
                          <button
                            onClick={() => navigate(`/facets/${facet.id}`)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </PermissionGate>
                        <PermissionGate anyOf={['DeleteFacet', 'DeleteCatalog']} disableMode>
                          <button
                            onClick={() => setDeletingFacet({ id: facet.id, name: facet.name })}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-background/50 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {page} sur {totalPages} ({totalItems} attributs)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Precedent
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingFacet}
        onClose={() => setDeletingFacet(null)}
        onConfirm={() => handleDelete(false)}
        title="Supprimer l'attribut"
        message={`Etes-vous sur de vouloir supprimer l'attribut "${deletingFacet?.name}"? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default FacetList;
