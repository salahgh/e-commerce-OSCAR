import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Image,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Upload,
  Trash2,
  Edit3,
  Eye,
  X,
  Check,
  FileImage,
  Film,
  File,
  RefreshCw,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminAssetsDocument,
  CreateAssetsDocument,
  DeleteAssetsDocument,
  AssetType,
} from '../../graphql/generated/graphql';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AssetDetailModal } from './AssetDetail';
import { formatDate } from '../../lib/utils';
import { PermissionGate } from '../../components/auth/PermissionGate';

type ViewMode = 'grid' | 'list';
type TypeFilter = 'all' | 'image' | 'video';
type SortOption = 'createdAt_DESC' | 'createdAt_ASC' | 'name_ASC' | 'name_DESC' | 'fileSize_DESC' | 'fileSize_ASC';

const PAGE_SIZE = 24;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'createdAt_DESC', label: 'Plus recents' },
  { value: 'createdAt_ASC', label: 'Plus anciens' },
  { value: 'name_ASC', label: 'Nom (A-Z)' },
  { value: 'name_DESC', label: 'Nom (Z-A)' },
  { value: 'fileSize_DESC', label: 'Taille (grande)' },
  { value: 'fileSize_ASC', label: 'Taille (petite)' },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getAssetTypeIcon = (type: AssetType) => {
  switch (type) {
    case AssetType.Image:
      return <FileImage className="h-5 w-5" />;
    case AssetType.Video:
      return <Film className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

export const AssetList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt_DESC');
  const [page, setPage] = useState(1);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Build filter based on search and type filter
  const buildFilter = () => {
    const filter: any = {};

    if (searchTerm) {
      filter.name = { contains: searchTerm };
    }

    if (typeFilter === 'image') {
      filter.type = { eq: AssetType.Image };
    } else if (typeFilter === 'video') {
      filter.type = { eq: AssetType.Video };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  };

  // Build sort option
  const buildSort = () => {
    const [field, direction] = sortOption.split('_');
    return { [field]: direction as any };
  };

  // Query assets
  const { data, loading, error, refetch } = useQuery(AdminAssetsDocument, {
    variables: {
      options: {
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        filter: buildFilter(),
        sort: buildSort(),
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [createAssets, { loading: uploading }] = useMutation(CreateAssetsDocument);
  const [deleteAssets, { loading: deleting }] = useMutation(DeleteAssetsDocument);

  const assets = data?.assets?.items || [];
  const totalItems = data?.assets?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      try {
        const result = await createAssets({
          variables: {
            input: fileArray.map((file) => ({ file })),
          },
        });

        const uploadedAssets = result.data?.createAssets || [];
        const successCount = uploadedAssets.filter((a: any) => a.__typename === 'Asset').length;
        const errorCount = uploadedAssets.filter((a: any) => a.__typename === 'MimeTypeError').length;

        if (successCount > 0) {
          dispatch(
            addToast({
              message: `${successCount} fichier(s) telecharge(s) avec succes`,
              type: 'success',
            })
          );
          refetch();
        }
        if (errorCount > 0) {
          dispatch(
            addToast({
              message: `${errorCount} fichier(s) rejete(s) (type non autorise)`,
              type: 'error',
            })
          );
        }
      } catch (err: any) {
        dispatch(
          addToast({
            message: err.message || 'Erreur lors du telechargement',
            type: 'error',
          })
        );
      }
    },
    [createAssets, dispatch, refetch]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  // Handle selection
  const toggleSelection = useCallback((id: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedAssets.size === assets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assets.map((a: any) => a.id)));
    }
  }, [assets, selectedAssets.size]);

  // Handle bulk delete
  const handleBulkDelete = async (force: boolean = false) => {
    try {
      const result = await deleteAssets({
        variables: {
          input: {
            assetIds: Array.from(selectedAssets),
            force: force,
          },
        },
      });

      const response = result.data?.deleteAssets;

      if (response?.result === 'DELETED') {
        dispatch(
          addToast({
            message: `${selectedAssets.size} fichier(s) supprime(s)`,
            type: 'success',
          })
        );
        setSelectedAssets(new Set());
        setShowDeleteDialog(false);
        refetch();
      } else if (response?.result === 'NOT_DELETED') {
        // Assets are in use, ask if user wants to force delete
        const shouldForce = window.confirm(
          `${response.message || 'Certains fichiers sont utilisés par des produits.'}\n\nVoulez-vous forcer la suppression ?`
        );
        if (shouldForce) {
          await handleBulkDelete(true);
        } else {
          setShowDeleteDialog(false);
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
          <h1 className="text-3xl font-bold text-foreground">Medias</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} fichier{totalItems > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vue grille"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vue liste"
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          <PermissionGate anyOf={['CreateAsset', 'CreateCatalog']} disableMode>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              <Upload className="h-5 w-5" />
              Telecharger
              <input
                type="file"
                multiple
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </label>
          </PermissionGate>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Telechargement en cours...</span>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              Glissez-deposez vos fichiers ici ou{' '}
              <label className="text-primary cursor-pointer hover:underline">
                parcourez
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </label>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Images et videos acceptees. Taille max: 10 MB
            </p>
          </>
        )}
      </div>

      {/* Search, Filters and Actions */}
      <div className="bg-card rounded-lg shadow p-4 space-y-4">
        {/* Top row: Search and type filter */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
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

          {/* Type filter buttons */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => {
                setTypeFilter('all');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => {
                setTypeFilter('image');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                typeFilter === 'image'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileImage className="h-4 w-4" />
              Images
            </button>
            <button
              onClick={() => {
                setTypeFilter('video');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                typeFilter === 'video'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Film className="h-4 w-4" />
              Videos
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setPage(1);
              }}
              className="appearance-none pl-10 pr-8 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {sortOption.includes('DESC') ? (
              <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            ) : (
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            )}
          </div>
        </div>

        {/* Bottom row: Selection actions */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {selectedAssets.size} selectionne(s)
            </span>
            <button
              onClick={() => setSelectedAssets(new Set())}
              className="p-2 text-muted-foreground hover:text-foreground"
              title="Deselectionner tout"
            >
              <X className="h-5 w-5" />
            </button>
            <PermissionGate anyOf={['DeleteAsset', 'DeleteCatalog']} disableMode>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </PermissionGate>
          </div>
        )}
      </div>

      {/* Assets Grid/List */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading && assets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Chargement...</span>
            </div>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Image className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun media trouve</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((asset: any) => (
                <div
                  key={asset.id}
                  className={`group relative bg-muted rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedAssets.has(asset.id)
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setPreviewAsset(asset)}
                >
                  {/* Selection checkbox */}
                  <div
                    className={`absolute top-2 left-2 z-10 ${
                      selectedAssets.has(asset.id) || 'opacity-0 group-hover:opacity-100'
                    } transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(asset.id);
                    }}
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedAssets.has(asset.id)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-white/80 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {selectedAssets.has(asset.id) && <Check className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="aspect-square">
                    {asset.type === 'IMAGE' ? (
                      <img
                        src={asset.preview}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        {getAssetTypeIcon(asset.type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-sm font-medium text-foreground truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(asset.fileSize)}
                    </p>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewAsset(asset);
                      }}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      title="Apercu"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <PermissionGate anyOf={['UpdateAsset', 'UpdateCatalog']} disableMode>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAsset(asset.id);
                        }}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedAssets.size === assets.length && assets.length > 0}
                      onChange={selectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Apercu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Dimensions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Taille
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assets.map((asset: any) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => toggleSelection(asset.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {asset.type === 'IMAGE' ? (
                        <img
                          src={asset.preview}
                          alt={asset.name}
                          className="h-12 w-12 rounded object-contain"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          {getAssetTypeIcon(asset.type)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-xs">
                        {asset.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{asset.mimeType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {asset.width} x {asset.height}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(asset.fileSize)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(asset.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                          title="Apercu"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <PermissionGate anyOf={['UpdateAsset', 'UpdateCatalog']} disableMode>
                          <button
                            onClick={() => setEditingAsset(asset.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-background/50 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {page} sur {totalPages} ({totalItems} fichiers)
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

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewAsset(null)}
        >
          <button
            onClick={() => setPreviewAsset(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            {previewAsset.type === 'IMAGE' ? (
              <img
                src={previewAsset.source}
                alt={previewAsset.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : previewAsset.type === 'VIDEO' ? (
              <video
                src={previewAsset.source}
                controls
                className="max-w-full max-h-[70vh] rounded-lg"
              />
            ) : (
              <div className="bg-card p-8 rounded-lg text-center">
                <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground">{previewAsset.name}</p>
              </div>
            )}
            <div className="mt-4 text-center text-white">
              <p className="font-medium">{previewAsset.name}</p>
              <p className="text-sm text-white/70">
                {previewAsset.width} x {previewAsset.height} - {formatFileSize(previewAsset.fileSize)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <AssetDetailModal
          assetId={editingAsset}
          onClose={() => setEditingAsset(null)}
          onUpdate={() => {
            refetch();
            setEditingAsset(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => handleBulkDelete(false)}
        title="Supprimer les medias"
        message={`Etes-vous sur de vouloir supprimer ${selectedAssets.size} fichier(s)? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
