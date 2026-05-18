import React, { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import {
  Plus,
  Trash2,
  Settings,
  X,
  Check,
  Edit3,
  Layers,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Square,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AssetPickerModal } from '../ui/AssetPickerModal';
import { formatPrice } from '../../lib/utils';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  CreateProductVariantsDocument,
  UpdateProductVariantsDocument,
  DeleteProductVariantDocument,
  AddOptionGroupToProductDocument,
  RemoveOptionGroupFromProductDocument,
  CreateProductOptionGroupDocument,
  CreateProductOptionDocument,
  DeleteProductOptionDocument,
  AdminProductDocument,
  AdminProductOptionGroupsDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';

interface OptionGroup {
  id: string;
  code: string;
  name: string;
  options: Array<{ id: string; code: string; name: string }>;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  priceWithTax: number;
  stockOnHand: number;
  enabled: boolean;
  options: Array<{
    id: string;
    code: string;
    name: string;
    group?: { id: string; code: string; name: string };
  }>;
  featuredAsset?: {
    id: string;
    preview: string;
  } | null;
  customFields?: {
    minStockAlert?: number | null;
    originalPrice?: number | null;
    discountPercent?: number | null;
  };
}

interface VariantManagerProps {
  productId: string;
  productName: string;
  optionGroups: OptionGroup[];
  variants: ProductVariant[];
  allOptionGroups: OptionGroup[];
  onRefetch: () => void;
}

// Constants
const COMBINATIONS_PER_PAGE = 20;

// Generate all possible combinations from option groups
function generateCombinations(optionGroups: OptionGroup[]): Array<{ optionIds: string[]; label: string; codes: string[] }> {
  if (optionGroups.length === 0) return [];

  const combinations: Array<{ optionIds: string[]; label: string; codes: string[] }> = [];

  function generate(groupIndex: number, currentIds: string[], currentLabels: string[], currentCodes: string[]) {
    if (groupIndex === optionGroups.length) {
      combinations.push({
        optionIds: [...currentIds],
        label: currentLabels.join(' / '),
        codes: [...currentCodes],
      });
      return;
    }

    const group = optionGroups[groupIndex];
    for (const option of group.options) {
      generate(
        groupIndex + 1,
        [...currentIds, option.id],
        [...currentLabels, option.name],
        [...currentCodes, option.code.toUpperCase()]
      );
    }
  }

  generate(0, [], [], []);
  return combinations;
}

// Validate SKU uniqueness
function validateSkuUniqueness(newSkus: string[], existingSkus: string[]): string[] {
  const duplicates: string[] = [];
  const allSkus = new Set(existingSkus);
  for (const sku of newSkus) {
    if (allSkus.has(sku)) duplicates.push(sku);
    allSkus.add(sku);
  }
  return duplicates;
}

// Check if a variant exists for given option IDs
function variantExistsForOptions(variants: ProductVariant[], optionIds: string[]): ProductVariant | undefined {
  return variants.find(v => {
    const variantOptionIds = v.options.map(o => o.id).sort();
    const targetIds = [...optionIds].sort();
    return variantOptionIds.length === targetIds.length &&
      variantOptionIds.every((id, i) => id === targetIds[i]);
  });
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  productId,
  productName,
  optionGroups,
  variants,
  allOptionGroups,
  onRefetch,
}) => {
  const dispatch = useAppDispatch();

  // UI State
  const [showCreateOptionGroup, setShowCreateOptionGroup] = useState(false);
  const [showAddOption, setShowAddOption] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(optionGroups.map(g => g.id)));
  const [showGenerateSection, setShowGenerateSection] = useState(false);

  // Form state
  const [newOptionGroupName, setNewOptionGroupName] = useState('');
  const [newOptionGroupCode, setNewOptionGroupCode] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionCode, setNewOptionCode] = useState('');
  const [selectedExistingGroup, setSelectedExistingGroup] = useState('');

  // Generation state
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number>(0);
  const [skuPrefix, setSkuPrefix] = useState<string>('');

  // Editing state
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [variantEdits, setVariantEdits] = useState<Record<string, {
    sku: string;
    price: number;
    stock: number;
    enabled: boolean;
    originalPrice: number;
    discountPercent: number;
  }>>({});

  // Delete confirmation
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);

  // Variant asset picker
  const [variantAssetPickerId, setVariantAssetPickerId] = useState<string | null>(null);

  // Bulk delete state
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Pagination state for combinations
  const [combinationPage, setCombinationPage] = useState(0);

  // Mutations
  const [createOptionGroup, { loading: creatingOptionGroup }] = useMutation(CreateProductOptionGroupDocument);
  const [createOption, { loading: creatingOption }] = useMutation(CreateProductOptionDocument);
  const [deleteOption] = useMutation(DeleteProductOptionDocument);
  const [addOptionGroupToProduct] = useMutation(AddOptionGroupToProductDocument);
  const [removeOptionGroupFromProduct, { loading: removingOptionGroup }] = useMutation(RemoveOptionGroupFromProductDocument);
  const [createVariants, { loading: creatingVariants }] = useMutation(CreateProductVariantsDocument);
  const [updateVariants, { loading: updatingVariants }] = useMutation(UpdateProductVariantsDocument);
  const [deleteVariant, { loading: deletingVariant }] = useMutation(DeleteProductVariantDocument);

  // Computed values
  const allCombinations = useMemo(() => generateCombinations(optionGroups), [optionGroups]);

  const existingCombinationKeys = useMemo(() => {
    return new Set(variants.map(v => v.options.map(o => o.id).sort().join('-')));
  }, [variants]);

  const missingCombinations = useMemo(() => {
    return allCombinations.filter(c => !existingCombinationKeys.has([...c.optionIds].sort().join('-')));
  }, [allCombinations, existingCombinationKeys]);

  const availableOptionGroups = useMemo(() => {
    const productGroupIds = new Set(optionGroups.map(g => g.id));
    return allOptionGroups.filter(g => !productGroupIds.has(g.id));
  }, [optionGroups, allOptionGroups]);

  // Paginated combinations
  const totalCombinationPages = Math.ceil(missingCombinations.length / COMBINATIONS_PER_PAGE);
  const paginatedCombinations = useMemo(() => {
    return missingCombinations.slice(
      combinationPage * COMBINATIONS_PER_PAGE,
      (combinationPage + 1) * COMBINATIONS_PER_PAGE
    );
  }, [missingCombinations, combinationPage]);

  // Existing variant SKUs for validation
  const existingSkus = useMemo(() => variants.map(v => v.sku), [variants]);

  // Handlers
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCreateOptionGroup = async () => {
    if (!newOptionGroupName.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'error' }));
      return;
    }

    const code = newOptionGroupCode.trim() ||
      newOptionGroupName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      const result = await createOptionGroup({
        variables: {
          input: {
            code,
            translations: [{ languageCode: LanguageCode.Fr, name: newOptionGroupName.trim() }],
            options: [],
          },
        },
        refetchQueries: [{ query: AdminProductOptionGroupsDocument }],
      });

      if (result.data?.createProductOptionGroup?.id) {
        await addOptionGroupToProduct({
          variables: {
            productId,
            optionGroupId: result.data.createProductOptionGroup.id,
          },
        });
        dispatch(addToast({ message: "Groupe d'options créé et ajouté!", type: 'success' }));
        setShowCreateOptionGroup(false);
        setNewOptionGroupName('');
        setNewOptionGroupCode('');
        onRefetch();
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la création', type: 'error' }));
    }
  };

  const handleAddExistingOptionGroup = async (groupId: string) => {
    if (!groupId) return;
    setSelectedExistingGroup('');

    // Check if already assigned (client-side validation)
    if (optionGroups.some(g => g.id === groupId)) {
      dispatch(addToast({ message: "Ce groupe d'options est déjà assigné à ce produit", type: 'warning' }));
      return;
    }

    try {
      const result = await addOptionGroupToProduct({
        variables: { productId, optionGroupId: groupId },
        refetchQueries: [
          { query: AdminProductDocument, variables: { id: productId } },
          { query: AdminProductOptionGroupsDocument },
        ],
        awaitRefetchQueries: true,
      });

      if (result.errors && result.errors.length > 0) {
        dispatch(addToast({
          message: result.errors[0].message || "Erreur lors de l'ajout du groupe",
          type: 'error'
        }));
        return;
      }

      dispatch(addToast({ message: "Groupe d'options ajouté!", type: 'success' }));
      // Expand the newly added group
      setExpandedGroups(prev => new Set([...prev, groupId]));
      onRefetch();
    } catch (err: any) {
      const errorMessage = err?.graphQLErrors?.[0]?.message || err?.message || 'Erreur';
      // Check if it's the "already assigned" error
      if (errorMessage.includes('already assigned')) {
        dispatch(addToast({ message: "Ce groupe d'options est déjà assigné à ce produit", type: 'warning' }));
      } else {
        dispatch(addToast({ message: errorMessage, type: 'error' }));
      }
    }
  };

  const handleRemoveOptionGroup = async (groupId: string) => {
    try {
      const result = await removeOptionGroupFromProduct({
        variables: { productId, optionGroupId: groupId, force: false },
      });

      if (result.data?.removeOptionGroupFromProduct?.__typename === 'ProductOptionInUseError') {
        const error = result.data.removeOptionGroupFromProduct as any;
        dispatch(addToast({
          message: `Ce groupe est utilisé par ${error.productVariantCount} variante(s). Supprimez d'abord les variantes.`,
          type: 'error',
        }));
      } else {
        dispatch(addToast({ message: "Groupe d'options retiré!", type: 'success' }));
        onRefetch();
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleCreateOption = async (groupId: string) => {
    if (!newOptionName.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'error' }));
      return;
    }

    const code = newOptionCode.trim() ||
      newOptionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      await createOption({
        variables: {
          input: {
            productOptionGroupId: groupId,
            code,
            translations: [{ languageCode: LanguageCode.Fr, name: newOptionName.trim() }],
          },
        },
        refetchQueries: [
          { query: AdminProductOptionGroupsDocument },
          { query: AdminProductDocument, variables: { id: productId } },
        ],
      });

      dispatch(addToast({ message: 'Option créée!', type: 'success' }));
      setShowAddOption(null);
      setNewOptionName('');
      setNewOptionCode('');
      onRefetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      const result = await deleteOption({
        variables: { id: optionId },
        refetchQueries: [
          { query: AdminProductOptionGroupsDocument },
          { query: AdminProductDocument, variables: { id: productId } },
        ],
      });

      if (result.data?.deleteProductOption?.result === 'DELETED') {
        dispatch(addToast({ message: 'Option supprimée!', type: 'success' }));
        onRefetch();
      } else {
        dispatch(addToast({
          message: result.data?.deleteProductOption?.message || 'Erreur lors de la suppression',
          type: 'error',
        }));
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const toggleCombinationSelection = (key: string) => {
    setSelectedCombinations(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAllMissing = () => {
    setSelectedCombinations(new Set(missingCombinations.map(c => c.optionIds.join('-'))));
  };

  const deselectAll = () => {
    setSelectedCombinations(new Set());
  };

  // Generate SKU preview for a combination
  const generateSkuForCombination = (combination: { codes: string[] }): string => {
    const prefix = skuPrefix.trim() || productName.substring(0, 3).toUpperCase();
    return `${prefix}-${combination.codes.join('-')}`;
  };

  const handleGenerateVariants = async () => {
    if (selectedCombinations.size === 0) {
      dispatch(addToast({ message: 'Sélectionnez au moins une combinaison', type: 'error' }));
      return;
    }

    const prefix = skuPrefix.trim() || productName.substring(0, 3).toUpperCase();

    // Build the variants to create
    const variantsToCreate = Array.from(selectedCombinations).map((key, index) => {
      const optionIds = key.split('-');
      const combination = missingCombinations.find(c => c.optionIds.join('-') === key);

      return {
        productId,
        sku: `${prefix}-${combination?.codes.join('-') || optionIds.join('-')}`,
        price: Math.round(basePrice * 100),
        stockOnHand: baseStock,
        optionIds,
        translations: [{
          languageCode: LanguageCode.Fr,
          name: combination?.label || `Variant ${index + 1}`,
        }],
      };
    });

    // Validate SKU uniqueness
    const newSkus = variantsToCreate.map(v => v.sku);
    const duplicates = validateSkuUniqueness(newSkus, existingSkus);

    if (duplicates.length > 0) {
      dispatch(addToast({
        message: `SKU en double détectés: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`,
        type: 'error',
      }));
      return;
    }

    try {
      const result = await createVariants({
        variables: { input: variantsToCreate },
        refetchQueries: [{ query: AdminProductDocument, variables: { id: productId } }],
        awaitRefetchQueries: true,
      });

      const created = result.data?.createProductVariants?.filter(Boolean) || [];
      if (created.length > 0) {
        dispatch(addToast({ message: `${created.length} variante(s) créée(s)!`, type: 'success' }));
        setSelectedCombinations(new Set());
        setShowGenerateSection(false);
        setCombinationPage(0);
        onRefetch();
      } else {
        dispatch(addToast({ message: "Erreur: aucune variante n'a été créée", type: 'error' }));
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la création', type: 'error' }));
    }
  };

  const startEditingVariant = (variant: ProductVariant) => {
    setEditingVariant(variant.id);
    setVariantEdits({
      ...variantEdits,
      [variant.id]: {
        sku: variant.sku,
        price: Number(variant.price ?? 0) / 100,
        stock: variant.stockOnHand ?? 0,
        enabled: variant.enabled ?? true,
        originalPrice: Number(variant.customFields?.originalPrice ?? 0) / 100,
        discountPercent: variant.customFields?.discountPercent ?? 0,
      },
    });
  };

  const cancelEditingVariant = () => {
    if (editingVariant) {
      setVariantEdits(prev => {
        const next = { ...prev };
        delete next[editingVariant];
        return next;
      });
    }
    setEditingVariant(null);
  };

  const handleVariantUpdate = async (variantId: string) => {
    const edits = variantEdits[variantId];
    if (!edits) {
      dispatch(addToast({ message: 'Aucune modification à enregistrer', type: 'warning' }));
      return;
    }

    try {
      const result = await updateVariants({
        variables: {
          input: [{
            id: variantId,
            sku: edits.sku,
            price: Math.round(edits.price * 100),
            stockOnHand: edits.stock,
            enabled: edits.enabled,
            customFields: {
              originalPrice: edits.originalPrice > 0 ? Math.round(edits.originalPrice * 100) : null,
              discountPercent: edits.discountPercent > 0 ? edits.discountPercent : null,
            },
          }],
        },
      });

      const updated = result.data?.updateProductVariants?.filter(Boolean);
      if (!updated || updated.length === 0) {
        dispatch(addToast({ message: 'Erreur: la mise à jour a échoué', type: 'error' }));
        return;
      }

      dispatch(addToast({ message: 'Variante mise à jour!', type: 'success' }));
      setEditingVariant(null);
      setVariantEdits(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      onRefetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleSetVariantFeaturedAsset = async (variantId: string, assetId: string | null) => {
    try {
      await updateVariants({
        variables: {
          input: [{ id: variantId, featuredAssetId: assetId }],
        },
      });
      dispatch(addToast({ message: 'Image de la variante mise à jour', type: 'success' }));
      onRefetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la mise à jour', type: 'error' }));
    }
    setVariantAssetPickerId(null);
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const result = await deleteVariant({
        variables: { id: variantId },
        refetchQueries: [{ query: AdminProductDocument, variables: { id: productId } }],
        awaitRefetchQueries: true,
      });

      if (result.data?.deleteProductVariant?.result === 'DELETED') {
        dispatch(addToast({ message: 'Variante supprimée!', type: 'success' }));
      } else {
        dispatch(addToast({
          message: result.data?.deleteProductVariant?.message || 'Erreur',
          type: 'error',
        }));
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
    setDeleteVariantId(null);
  };

  // Bulk delete handlers
  const toggleSelectForDelete = (variantId: string) => {
    setSelectedForDelete(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const selectAllVariants = () => {
    setSelectedForDelete(new Set(variants.map(v => v.id)));
  };

  const deselectAllVariants = () => {
    setSelectedForDelete(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedForDelete.size === 0) return;

    setBulkDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const variantId of selectedForDelete) {
      try {
        const result = await deleteVariant({
          variables: { id: variantId },
        });
        if (result.data?.deleteProductVariant?.result === 'DELETED') {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setBulkDeleting(false);
    setShowBulkDeleteConfirm(false);
    setSelectedForDelete(new Set());

    if (successCount > 0) {
      dispatch(addToast({
        message: `${successCount} variante(s) supprimée(s)${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
        type: errorCount > 0 ? 'warning' : 'success',
      }));
      onRefetch();
    } else {
      dispatch(addToast({ message: 'Erreur lors de la suppression', type: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Option Groups Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Groupes d'options
            </span>
            <div className="flex gap-2">
              {availableOptionGroups.length > 0 && (
                <select
                  value={selectedExistingGroup}
                  onChange={(e) => {
                    setSelectedExistingGroup(e.target.value);
                    if (e.target.value) {
                      handleAddExistingOptionGroup(e.target.value);
                    }
                  }}
                  className="text-sm bg-muted border border-border text-foreground rounded-lg px-3 py-1.5"
                >
                  <option value="">Ajouter existant...</option>
                  {availableOptionGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCreateOptionGroup(true)}
                icon={<Plus className="h-3 w-3" />}
              >
                Nouveau groupe
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create Option Group Form */}
          {showCreateOptionGroup && (
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-purple-300 mb-3">
                Créer un nouveau groupe d'options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  value={newOptionGroupName}
                  onChange={(e) => setNewOptionGroupName(e.target.value)}
                  placeholder="Nom (ex: Taille, Couleur)"
                />
                <Input
                  value={newOptionGroupCode}
                  onChange={(e) => setNewOptionGroupCode(e.target.value)}
                  placeholder="Code (optionnel, ex: size)"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateOptionGroup}
                  loading={creatingOptionGroup}
                >
                  Créer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateOptionGroup(false);
                    setNewOptionGroupName('');
                    setNewOptionGroupCode('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Option Groups List */}
          {optionGroups.length > 0 ? (
            <div className="space-y-3">
              {optionGroups.map(group => (
                <div key={group.id} className="border border-border rounded-lg bg-muted/30">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedGroups.has(group.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-foreground">{group.name}</span>
                      <Badge variant="default" className="text-xs">
                        {group.options.length} option(s)
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowAddOption(group.id)}
                        icon={<Plus className="h-3 w-3" />}
                      >
                        Option
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveOptionGroup(group.id)}
                        loading={removingOptionGroup}
                        icon={<Trash2 className="h-3 w-3" />}
                      />
                    </div>
                  </div>

                  {expandedGroups.has(group.id) && (
                    <div className="px-3 pb-3 border-t border-border">
                      {/* Add Option Form */}
                      {showAddOption === group.id && (
                        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mt-3 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <Input
                              value={newOptionName}
                              onChange={(e) => setNewOptionName(e.target.value)}
                              placeholder="Nom (ex: S, M, L, Rouge)"
                            />
                            <Input
                              value={newOptionCode}
                              onChange={(e) => setNewOptionCode(e.target.value)}
                              placeholder="Code (optionnel)"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleCreateOption(group.id)}
                              loading={creatingOption}
                            >
                              Ajouter
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowAddOption(null);
                                setNewOptionName('');
                                setNewOptionCode('');
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Options List */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {group.options.length > 0 ? (
                          group.options.map(option => (
                            <div
                              key={option.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg group"
                            >
                              <span className="text-sm text-foreground">{option.name}</span>
                              <span className="text-xs text-muted-foreground">({option.code})</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteOption(option.id)}
                                className="ml-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Aucune option - cliquez sur "+ Option" pour en ajouter
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucun groupe d'options</p>
              <p className="text-sm mt-1">
                Ajoutez des groupes d'options (ex: Taille, Couleur) pour créer des variantes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variant Generation Section */}
      {optionGroups.length > 0 && optionGroups.every(g => g.options.length > 0) && (
        <Card className="border-green-700/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-green-400" />
                Générer des variantes
                {missingCombinations.length > 0 && (
                  <Badge variant="warning" className="ml-2">
                    {missingCombinations.length} combinaison(s) manquante(s)
                  </Badge>
                )}
              </span>
              <Button
                type="button"
                size="sm"
                variant={showGenerateSection ? 'secondary' : 'primary'}
                onClick={() => setShowGenerateSection(!showGenerateSection)}
                icon={showGenerateSection ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              >
                {showGenerateSection ? 'Masquer' : 'Générer'}
              </Button>
            </CardTitle>
          </CardHeader>

          {showGenerateSection && (
            <CardContent>
              {missingCombinations.length > 0 ? (
                <div className="space-y-4">
                  {/* Generation Settings */}
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-300 mb-3">Paramètres par défaut</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Préfixe SKU"
                        value={skuPrefix}
                        onChange={(e) => setSkuPrefix(e.target.value)}
                        placeholder={productName.substring(0, 3).toUpperCase()}
                      />
                      <Input
                        label="Prix (DZD)"
                        type="number"
                        value={basePrice || ''}
                        onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                      <Input
                        label="Stock initial"
                        type="number"
                        value={baseStock || ''}
                        onChange={(e) => setBaseStock(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Combinations Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Combinaisons à créer ({selectedCombinations.size}/{missingCombinations.length} sélectionnée(s))
                      </h4>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="ghost" onClick={selectAllMissing}>
                          Tout sélectionner
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={deselectAll}>
                          Désélectionner
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {paginatedCombinations.map(combination => {
                        const key = combination.optionIds.join('-');
                        const isSelected = selectedCombinations.has(key);
                        const previewSku = generateSkuForCombination(combination);

                        return (
                          <label
                            key={key}
                            className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-green-500 bg-green-900/30'
                                : 'border-border hover:border-muted-foreground bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCombinationSelection(key)}
                                className="h-4 w-4 text-green-500 border-border rounded bg-card"
                              />
                              <span className="text-sm font-medium text-foreground">{combination.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-6 font-mono">
                              SKU: {previewSku}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalCombinationPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setCombinationPage(p => Math.max(0, p - 1))}
                          disabled={combinationPage === 0}
                          icon={<ChevronLeft className="h-4 w-4" />}
                        >
                          Précédent
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {combinationPage + 1} / {totalCombinationPages}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setCombinationPage(p => Math.min(totalCombinationPages - 1, p + 1))}
                          disabled={combinationPage >= totalCombinationPages - 1}
                          icon={<ChevronRight className="h-4 w-4" />}
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleGenerateVariants}
                      loading={creatingVariants}
                      disabled={selectedCombinations.size === 0}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Créer {selectedCombinations.size} variante(s)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-3 text-green-400" />
                  <p className="font-medium text-green-400">Toutes les combinaisons existent!</p>
                  <p className="text-sm mt-1">
                    Il y a {allCombinations.length} combinaison(s) possible(s) et toutes ont des variantes.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Existing Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Variantes existantes ({variants.length})
            </span>
            {variants.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedForDelete.size > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {selectedForDelete.size} sélectionnée(s)
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      icon={<Trash2 className="h-3 w-3" />}
                    >
                      Supprimer
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={selectedForDelete.size === variants.length ? deselectAllVariants : selectAllVariants}
                  icon={selectedForDelete.size === variants.length ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                >
                  {selectedForDelete.size === variants.length ? 'Désélectionner' : 'Tout'}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Options
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Prix
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Prix original
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Remise %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {variants.map(variant => (
                    <tr
                      key={variant.id}
                      className={`hover:bg-accent ${editingVariant === variant.id ? 'bg-primary/10' : ''} ${selectedForDelete.has(variant.id) ? 'bg-red-900/10' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedForDelete.has(variant.id)}
                          onChange={() => toggleSelectForDelete(variant.id)}
                          className="h-4 w-4 text-red-500 border-border rounded bg-card"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setVariantAssetPickerId(variant.id)}
                            title="Modifier l'image de la variante"
                            className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center hover:border-primary transition-colors flex-shrink-0"
                          >
                            {variant.featuredAsset?.preview ? (
                              <img
                                src={variant.featuredAsset.preview}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          {editingVariant === variant.id ? (
                            <Input
                              value={variantEdits[variant.id]?.sku ?? variant.sku}
                              onChange={(e) => setVariantEdits({
                                ...variantEdits,
                                [variant.id]: { ...variantEdits[variant.id], sku: e.target.value },
                              })}
                              className="w-40"
                            />
                          ) : (
                            <span className="font-mono text-sm text-foreground">{variant.sku}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {variant.options.map(opt => (
                            <Badge key={opt.id} variant="default" className="text-xs">
                              {opt.group?.name}: {opt.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingVariant === variant.id ? (
                          <Input
                            type="number"
                            value={variantEdits[variant.id]?.price ?? Number(variant.price ?? 0) / 100}
                            onChange={(e) => setVariantEdits({
                              ...variantEdits,
                              [variant.id]: { ...variantEdits[variant.id], price: parseFloat(e.target.value) || 0 },
                            })}
                            className="w-28"
                            min="0"
                          />
                        ) : (
                          <span className="font-medium text-foreground">
                            {formatPrice(Number(variant.price ?? 0) / 100)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingVariant === variant.id ? (
                          <Input
                            type="number"
                            value={variantEdits[variant.id]?.stock ?? variant.stockOnHand}
                            onChange={(e) => setVariantEdits({
                              ...variantEdits,
                              [variant.id]: { ...variantEdits[variant.id], stock: parseInt(e.target.value) || 0 },
                            })}
                            className="w-24"
                            min="0"
                          />
                        ) : (
                          <span className={`font-medium ${
                            variant.stockOnHand === 0 ? 'text-red-400' :
                            variant.stockOnHand < 10 ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {variant.stockOnHand}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingVariant === variant.id ? (
                          <Input
                            type="number"
                            value={variantEdits[variant.id]?.originalPrice ?? 0}
                            onChange={(e) => setVariantEdits({
                              ...variantEdits,
                              [variant.id]: { ...variantEdits[variant.id], originalPrice: parseFloat(e.target.value) || 0 },
                            })}
                            className="w-28"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            {variant.customFields?.originalPrice
                              ? formatPrice(variant.customFields.originalPrice / 100)
                              : '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingVariant === variant.id ? (
                          <Input
                            type="number"
                            value={variantEdits[variant.id]?.discountPercent ?? 0}
                            onChange={(e) => setVariantEdits({
                              ...variantEdits,
                              [variant.id]: { ...variantEdits[variant.id], discountPercent: parseInt(e.target.value) || 0 },
                            })}
                            className="w-20"
                            min="0"
                            max="100"
                            placeholder="0"
                          />
                        ) : (
                          variant.customFields?.discountPercent
                            ? <Badge variant="danger">-{variant.customFields.discountPercent}%</Badge>
                            : <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingVariant === variant.id ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={variantEdits[variant.id]?.enabled ?? variant.enabled}
                              onChange={(e) => setVariantEdits({
                                ...variantEdits,
                                [variant.id]: { ...variantEdits[variant.id], enabled: e.target.checked },
                              })}
                              className="h-4 w-4 text-primary border-border rounded bg-card"
                            />
                            <span className="text-sm">Actif</span>
                          </label>
                        ) : (
                          <Badge variant={variant.enabled ? 'success' : 'default'}>
                            {variant.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingVariant === variant.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVariantUpdate(variant.id)}
                              loading={updatingVariants}
                              icon={<Check className="h-3 w-3" />}
                            >
                              Sauver
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditingVariant}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startEditingVariant(variant)}
                              icon={<Edit3 className="h-3 w-3" />}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteVariantId(variant.id)}
                              icon={<Trash2 className="h-3 w-3" />}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucune variante</p>
              <p className="text-sm mt-1">
                {optionGroups.length > 0
                  ? "Utilisez la section 'Générer des variantes' ci-dessus pour créer des variantes"
                  : "Ajoutez d'abord des groupes d'options pour pouvoir créer des variantes"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteVariantId}
        onClose={() => setDeleteVariantId(null)}
        onConfirm={() => deleteVariantId && handleDeleteVariant(deleteVariantId)}
        title="Supprimer la variante"
        message="Êtes-vous sûr de vouloir supprimer cette variante? Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deletingVariant}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Supprimer ${selectedForDelete.size} variante(s)`}
        message={`Êtes-vous sûr de vouloir supprimer ${selectedForDelete.size} variante(s)? Cette action est irréversible.`}
        confirmText="Supprimer tout"
        variant="danger"
        loading={bulkDeleting}
      />

      {/* Variant featured-asset picker */}
      <AssetPickerModal
        isOpen={variantAssetPickerId !== null}
        onClose={() => setVariantAssetPickerId(null)}
        onSelect={(assets) => {
          if (assets.length > 0 && variantAssetPickerId) {
            handleSetVariantFeaturedAsset(variantAssetPickerId, assets[0].id);
          } else if (variantAssetPickerId) {
            // Allow clearing
            handleSetVariantFeaturedAsset(variantAssetPickerId, null);
          }
        }}
        multiple={false}
        selectedIds={
          variantAssetPickerId
            ? (() => {
                const v = variants.find((x) => x.id === variantAssetPickerId);
                return v?.featuredAsset?.id ? [v.featuredAsset.id] : [];
              })()
            : []
        }
        title="Image de la variante"
      />
    </div>
  );
};
