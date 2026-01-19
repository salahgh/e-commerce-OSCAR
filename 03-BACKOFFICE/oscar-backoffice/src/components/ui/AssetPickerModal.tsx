import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  Check,
  Image,
  RefreshCw,
  X,
  FileImage,
  Film,
  File,
} from 'lucide-react';
import { Modal, ModalContent, ModalFooter } from './Modal';
import {
  AdminAssetsDocument,
  CreateAssetsDocument,
  AssetType,
} from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';

interface Asset {
  id: string;
  name: string;
  preview: string;
  source: string;
  type: AssetType;
  width: number;
  height: number;
  fileSize: number;
}

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: Asset[]) => void;
  multiple?: boolean;
  selectedIds?: string[];
  title?: string;
}

const PAGE_SIZE = 18;

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
      return <FileImage className="h-8 w-8" />;
    case AssetType.Video:
      return <Film className="h-8 w-8" />;
    default:
      return <File className="h-8 w-8" />;
  }
};

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = 'Selectionner un media',
}) => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Query assets
  const { data, loading, refetch } = useQuery(AdminAssetsDocument, {
    variables: {
      options: {
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        filter: searchTerm
          ? {
              name: { contains: searchTerm },
            }
          : undefined,
        sort: { createdAt: 'DESC' as any },
      },
    },
    fetchPolicy: 'cache-and-network',
    skip: !isOpen,
  });

  // Upload mutation
  const [createAssets, { loading: uploading }] = useMutation(CreateAssetsDocument);

  const assets = data?.assets?.items || [];
  const totalItems = data?.assets?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Handle selection
  const toggleSelection = useCallback(
    (asset: Asset) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(asset.id)) {
          next.delete(asset.id);
        } else {
          if (!multiple) {
            next.clear();
          }
          next.add(asset.id);
        }
        return next;
      });
    },
    [multiple]
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    const selectedAssets = assets.filter((a: Asset) => selected.has(a.id));
    onSelect(selectedAssets);
  }, [assets, selected, onSelect]);

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
        const successAssets = uploadedAssets.filter((a: any) => a.__typename === 'Asset');
        const errorCount = uploadedAssets.filter((a: any) => a.__typename === 'MimeTypeError').length;

        if (successAssets.length > 0) {
          dispatch(
            addToast({
              message: `${successAssets.length} fichier(s) telecharge(s)`,
              type: 'success',
            })
          );
          // Auto-select uploaded assets
          const newSelected = new Set(selected);
          if (!multiple) {
            newSelected.clear();
          }
          successAssets.forEach((a: any) => newSelected.add(a.id));
          setSelected(newSelected);
          refetch();
          setShowUpload(false);
        }
        if (errorCount > 0) {
          dispatch(
            addToast({
              message: `${errorCount} fichier(s) rejete(s)`,
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
    [createAssets, dispatch, multiple, refetch, selected]
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

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <ModalContent className="p-0">
        {/* Search and Upload Toggle */}
        <div className="sticky top-0 bg-popover z-10 p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showUpload
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-accent'
              }`}
            >
              <Upload className="h-4 w-4" />
              Telecharger
            </button>
          </div>

          {/* Upload Zone */}
          {showUpload && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Telechargement...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Glissez vos fichiers ou{' '}
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
                </>
              )}
            </div>
          )}
        </div>

        {/* Assets Grid */}
        <div className="p-4 min-h-[400px]">
          {loading && assets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Image className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucun media trouve</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {assets.map((asset: Asset) => (
                <div
                  key={asset.id}
                  onClick={() => toggleSelection(asset)}
                  className={`group relative bg-muted rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selected.has(asset.id)
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  {/* Selection indicator */}
                  <div
                    className={`absolute top-1 right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selected.has(asset.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {selected.has(asset.id) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">+</span>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="aspect-square">
                    {asset.type === AssetType.Image ? (
                      <img
                        src={asset.preview}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {getAssetTypeIcon(asset.type)}
                      </div>
                    )}
                  </div>

                  {/* Name tooltip on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{asset.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter>
        {selected.size > 0 && (
          <span className="text-sm text-muted-foreground mr-auto">
            {selected.size} selectionne{selected.size > 1 ? 's' : ''}
          </span>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleConfirm}
          disabled={selected.size === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmer
        </button>
      </ModalFooter>
    </Modal>
  );
};
