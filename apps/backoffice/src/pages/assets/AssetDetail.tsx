import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { X, Save, Trash2, Target, Copy, Check } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminAssetDocument,
  UpdateAssetDocument,
  DeleteAssetDocument,
} from '../../graphql/generated/graphql';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { formatDate } from '../../lib/utils';

interface AssetDetailModalProps {
  assetId: string;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | null>(null);
  const [showFocalPointEditor, setShowFocalPointEditor] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Query asset
  const { data, loading } = useQuery(AdminAssetDocument, {
    variables: { id: assetId },
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [updateAsset, { loading: updating }] = useMutation(UpdateAssetDocument);
  const [deleteAsset, { loading: deleting }] = useMutation(DeleteAssetDocument);

  const asset = data?.asset;

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setFocalPoint(asset.focalPoint || null);
    }
  }, [asset]);

  const handleSave = async () => {
    try {
      await updateAsset({
        variables: {
          input: {
            id: assetId,
            name,
            focalPoint: focalPoint || undefined,
          },
        },
      });
      dispatch(addToast({ message: 'Media mis a jour', type: 'success' }));
      onUpdate?.();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset({
        variables: {
          input: {
            assetId,
            force: false,
          },
        },
      });
      dispatch(addToast({ message: 'Media supprime', type: 'success' }));
      setShowDeleteDialog(false);
      onDelete?.();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFocalPoint({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  const copyUrl = () => {
    if (asset?.source) {
      navigator.clipboard.writeText(asset.source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !asset) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Chargement..." size="lg">
        <ModalContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title="Modifier le media" size="lg">
        <ModalContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                {asset.type === 'IMAGE' ? (
                  <div
                    className={`relative cursor-crosshair ${showFocalPointEditor ? 'ring-2 ring-primary' : ''}`}
                    onClick={showFocalPointEditor ? handleFocalPointClick : undefined}
                  >
                    <img
                      src={asset.preview}
                      alt={asset.name}
                      className="w-full object-contain max-h-96"
                    />
                    {focalPoint && (
                      <div
                        className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-primary bg-primary/30 rounded-full"
                        style={{
                          left: `${focalPoint.x * 100}%`,
                          top: `${focalPoint.y * 100}%`,
                        }}
                      >
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                ) : asset.type === 'VIDEO' ? (
                  <video src={asset.source} controls className="w-full max-h-96" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <p className="text-muted-foreground">Apercu non disponible</p>
                  </div>
                )}
              </div>

              {asset.type === 'IMAGE' && (
                <button
                  type="button"
                  onClick={() => setShowFocalPointEditor(!showFocalPointEditor)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    showFocalPointEditor
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  {showFocalPointEditor ? 'Cliquez sur l\'image' : 'Definir le point focal'}
                </button>
              )}

              {focalPoint && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Point focal: X={focalPoint.x}, Y={focalPoint.y}</span>
                  <button
                    type="button"
                    onClick={() => setFocalPoint(null)}
                    className="text-destructive hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Informations</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Type:</dt>
                  <dd className="text-foreground">{asset.mimeType}</dd>
                  <dt className="text-muted-foreground">Dimensions:</dt>
                  <dd className="text-foreground">
                    {asset.width} x {asset.height} px
                  </dd>
                  <dt className="text-muted-foreground">Taille:</dt>
                  <dd className="text-foreground">{formatFileSize(asset.fileSize)}</dd>
                  <dt className="text-muted-foreground">Cree le:</dt>
                  <dd className="text-foreground">{formatDate(asset.createdAt)}</dd>
                  <dt className="text-muted-foreground">Modifie le:</dt>
                  <dd className="text-foreground">{formatDate(asset.updatedAt)}</dd>
                </dl>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={asset.source}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-muted text-foreground text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="p-2 border border-border rounded-lg hover:bg-accent"
                    title="Copier l'URL"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {asset.tags && asset.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                      >
                        {tag.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <PermissionGate anyOf={['DeleteAsset', 'DeleteCatalog']} disableMode>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </PermissionGate>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Annuler
          </button>
          <PermissionGate anyOf={['UpdateAsset', 'UpdateCatalog']} disableMode>
            <button
              type="button"
              onClick={handleSave}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updating ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </PermissionGate>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le media"
        message={`Etes-vous sur de vouloir supprimer "${asset.name}"? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </>
  );
};
