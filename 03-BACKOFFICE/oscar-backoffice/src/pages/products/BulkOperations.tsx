import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Check,
  X,
  AlertTriangle,
  Package,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminProductsDocument,
  DeleteProductDocument,
  UpdateProductDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Tabs } from '../../components/ui/Tabs';
import { formatPrice } from '../../lib/utils';

export const BulkOperations: React.FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable' | 'delete' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);

  // Queries
  const { data, loading, refetch } = useQuery(AdminProductsDocument, {
    variables: {
      options: {
        take: 100,
        sort: { createdAt: 'DESC' as any },
      },
    },
  });

  // Mutations
  const [updateProduct] = useMutation(UpdateProductDocument);
  const [deleteProduct] = useMutation(DeleteProductDocument);

  const products = data?.products?.items || [];

  // Toggle product selection
  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  // Select/Deselect all
  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  // Execute bulk action
  const executeBulkAction = async () => {
    if (!bulkAction || selectedProducts.size === 0) return;

    setProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const productId of selectedProducts) {
      try {
        if (bulkAction === 'delete') {
          await deleteProduct({ variables: { id: productId } });
        } else {
          await updateProduct({
            variables: {
              input: {
                id: productId,
                enabled: bulkAction === 'enable',
              },
            },
          });
        }
        successCount++;
      } catch (err) {
        errorCount++;
      }
    }

    setProcessing(false);
    setBulkAction(null);
    setSelectedProducts(new Set());
    refetch();

    dispatch(
      addToast({
        message: `${successCount} produits traités${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`,
        type: errorCount > 0 ? 'warning' : 'success',
      })
    );
  };

  // Handle CSV file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      dispatch(
        addToast({
          message: 'Veuillez sélectionner un fichier CSV',
          type: 'error',
        })
      );
      return;
    }

    setImportFile(file);

    // Parse CSV preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim());

      const preview = lines.slice(1, 6).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setImportPreview(preview);
    };
    reader.readAsText(file);
  };

  // Export products to CSV
  const exportProducts = () => {
    const headers = ['ID', 'Name', 'Name FR', 'Name AR', 'SKU', 'Price', 'Stock', 'Enabled'];
    const rows = products.map((p) => {
      const variant = p.variants?.[0];
      return [
        p.id,
        `"${p.name}"`,
        `"${p.customFields?.nameFr || ''}"`,
        `"${p.customFields?.nameAr || ''}"`,
        variant?.sku || '',
        variant?.price || 0,
        variant?.stockOnHand || 0,
        p.enabled ? 'true' : 'false',
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oscar-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    dispatch(
      addToast({
        message: `${products.length} produits exportés`,
        type: 'success',
      })
    );
  };

  const tabs = [
    {
      id: 'bulk-actions',
      label: 'Actions en masse',
      icon: <Package className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedProducts.size === products.length
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>
              {selectedProducts.size > 0 && (
                <Badge variant="info">{selectedProducts.size} produit(s) sélectionné(s)</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBulkAction('enable')}
                disabled={selectedProducts.size === 0}
                icon={<Eye className="h-4 w-4" />}
              >
                Activer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBulkAction('disable')}
                disabled={selectedProducts.size === 0}
                icon={<EyeOff className="h-4 w-4" />}
              >
                Désactiver
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkAction('delete')}
                disabled={selectedProducts.size === 0}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Supprimer
              </Button>
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun produit</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {products.map((product) => {
                const variant = product.variants?.[0];
                const isSelected = selectedProducts.has(product.id);

                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {product.featuredAsset?.preview ? (
                      <img
                        src={product.featuredAsset.preview}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {variant?.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(variant?.price || 0)}</p>
                      <Badge variant={product.enabled ? 'success' : 'default'} className="text-xs">
                        {product.enabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'import',
      label: 'Importer',
      icon: <Upload className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Importer des produits</h3>
            <p className="text-sm text-gray-500 mt-1">
              Importez vos produits depuis un fichier CSV
            </p>
          </div>

          {/* File Upload */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">
              {importFile ? importFile.name : 'Cliquez pour sélectionner un fichier CSV'}
            </p>
            <p className="text-sm text-gray-500 mt-1">ou glissez-déposez le fichier ici</p>
          </div>

          {/* Import Preview */}
          {importPreview.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Aperçu des données</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {Object.keys(importPreview[0]).map((header) => (
                        <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-3 py-2 text-gray-600">
                            {String(value).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setImportFile(null);
                    setImportPreview([]);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  icon={<Upload className="h-4 w-4" />}
                  onClick={() => {
                    dispatch(
                      addToast({
                        message: 'Import via CSV disponible dans une prochaine version',
                        type: 'info',
                      })
                    );
                  }}
                >
                  Importer
                </Button>
              </div>
            </div>
          )}

          {/* CSV Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Format CSV attendu</h4>
            <p className="text-sm text-blue-800 mb-2">
              Le fichier doit contenir les colonnes suivantes:
            </p>
            <code className="block text-xs bg-blue-100 p-2 rounded text-blue-900">
              name,nameFr,nameAr,description,price,sku,stock
            </code>
          </div>
        </div>
      ),
    },
    {
      id: 'export',
      label: 'Exporter',
      icon: <Download className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Exporter les produits</h3>
            <p className="text-sm text-gray-500 mt-1">Téléchargez vos produits au format CSV</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Export CSV complet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Exporte tous les produits avec leurs informations
                </p>
              </div>
              <Button icon={<Download className="h-4 w-4" />} onClick={exportProducts}>
                Télécharger CSV
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Données exportées</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>ID</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Nom</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Nom FR</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Nom AR</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>SKU</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Prix</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Statut</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              L'export inclut uniquement le premier variant de chaque produit. Pour un export
              complet des variants, utilisez l'interface Vendure Admin.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opérations en masse</h1>
          <p className="text-gray-600 mt-1">Gérez vos produits en lot</p>
        </div>
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Actualiser
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <Tabs tabs={tabs} defaultTab="bulk-actions" />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={executeBulkAction}
        title={
          bulkAction === 'delete'
            ? 'Supprimer les produits'
            : bulkAction === 'enable'
              ? 'Activer les produits'
              : 'Désactiver les produits'
        }
        message={
          <div>
            <p>
              Êtes-vous sûr de vouloir{' '}
              {bulkAction === 'delete'
                ? 'supprimer'
                : bulkAction === 'enable'
                  ? 'activer'
                  : 'désactiver'}{' '}
              <strong>{selectedProducts.size}</strong> produit(s) ?
            </p>
            {bulkAction === 'delete' && (
              <p className="mt-2 text-red-600">Cette action est irréversible.</p>
            )}
          </div>
        }
        confirmText={
          bulkAction === 'delete' ? 'Supprimer' : bulkAction === 'enable' ? 'Activer' : 'Désactiver'
        }
        variant={bulkAction === 'delete' ? 'danger' : 'info'}
        loading={processing}
      />
    </div>
  );
};
