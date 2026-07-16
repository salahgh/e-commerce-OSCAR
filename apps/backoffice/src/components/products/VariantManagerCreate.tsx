import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Settings,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
  Package,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatPrice } from '../../lib/utils';

// Types for local state management (not GraphQL types)
export interface LocalOptionGroup {
  id: string; // Can be temp ID (temp-xxx) for new groups or real ID for existing
  code: string;
  name: string;
  isNew: boolean; // True if created locally, false if selected from existing
  options: LocalOption[];
}

export interface LocalOption {
  id: string; // Can be temp ID for new options
  code: string;
  name: string;
  isNew: boolean;
}

export interface LocalVariant {
  id: string; // Temp ID
  sku: string;
  price: number; // In display units (not cents)
  stock: number;
  optionIds: string[];
  optionLabels: string; // e.g., "S / Red"
}

interface ExistingOptionGroup {
  id: string;
  code: string;
  name: string;
  options: Array<{ id: string; code: string; name: string }>;
}

interface VariantManagerCreateProps {
  productName: string;
  allOptionGroups: ExistingOptionGroup[];
  selectedOptionGroups: LocalOptionGroup[];
  pendingVariants: LocalVariant[];
  onOptionGroupsChange: (groups: LocalOptionGroup[]) => void;
  onVariantsChange: (variants: LocalVariant[]) => void;
}

// Generate all possible combinations from option groups
function generateCombinations(
  optionGroups: LocalOptionGroup[]
): Array<{ optionIds: string[]; label: string; codes: string[] }> {
  if (optionGroups.length === 0) return [];
  if (optionGroups.some((g) => g.options.length === 0)) return [];

  const combinations: Array<{ optionIds: string[]; label: string; codes: string[] }> = [];

  function generate(
    groupIndex: number,
    currentIds: string[],
    currentLabels: string[],
    currentCodes: string[]
  ) {
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

// Generate temp ID
let tempIdCounter = 0;
function generateTempId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++tempIdCounter}`;
}

// Build a Vendure-safe code from a display name: transliterate accents instead of
// dropping them ("Écru" → "ecru", not "cru") and never return an empty string
// (an empty code makes createProductOption fail server-side).
export function nameToCode(name: string): string {
  const code = name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return code || `opt-${Date.now().toString(36)}`;
}

export const VariantManagerCreate: React.FC<VariantManagerCreateProps> = ({
  productName,
  allOptionGroups,
  selectedOptionGroups,
  pendingVariants,
  onOptionGroupsChange,
  onVariantsChange,
}) => {
  // UI State
  const [showCreateOptionGroup, setShowCreateOptionGroup] = useState(false);
  const [showAddOption, setShowAddOption] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(selectedOptionGroups.map((g) => g.id))
  );
  const [showGenerateSection, setShowGenerateSection] = useState(false);

  // Form state
  const [newOptionGroupName, setNewOptionGroupName] = useState('');
  const [newOptionGroupCode, setNewOptionGroupCode] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionCode, setNewOptionCode] = useState('');

  // Generation state
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number>(0);
  const [skuPrefix, setSkuPrefix] = useState<string>('');

  // Editing state
  const [editingVariant, setEditingVariant] = useState<string | null>(null);

  // Computed values
  const allCombinations = useMemo(() => generateCombinations(selectedOptionGroups), [selectedOptionGroups]);

  const existingCombinationKeys = useMemo(() => {
    return new Set(pendingVariants.map((v) => [...v.optionIds].sort().join('-')));
  }, [pendingVariants]);

  const missingCombinations = useMemo(() => {
    return allCombinations.filter((c) => !existingCombinationKeys.has([...c.optionIds].sort().join('-')));
  }, [allCombinations, existingCombinationKeys]);

  // Vendure option groups belong to exactly ONE product, so "reusing" an existing
  // group means CLONING it for this product. Groups are offered as templates,
  // deduplicated by name (the catalog accumulates one group per product, e.g. 8× "Taille").
  const availableOptionGroups = useMemo(() => {
    const selectedNames = new Set(selectedOptionGroups.map((g) => g.name.trim().toLowerCase()));
    const byName = new Map<string, ExistingOptionGroup>();
    for (const g of allOptionGroups) {
      const key = g.name.trim().toLowerCase();
      if (selectedNames.has(key)) continue;
      const prev = byName.get(key);
      if (!prev || g.options.length > prev.options.length) byName.set(key, g);
    }
    return Array.from(byName.values());
  }, [selectedOptionGroups, allOptionGroups]);

  // Handlers
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCreateOptionGroup = () => {
    if (!newOptionGroupName.trim()) return;

    const code = newOptionGroupCode.trim() || nameToCode(newOptionGroupName);

    const newGroup: LocalOptionGroup = {
      id: generateTempId('temp-group'),
      code,
      name: newOptionGroupName.trim(),
      isNew: true,
      options: [],
    };

    onOptionGroupsChange([...selectedOptionGroups, newGroup]);
    setExpandedGroups((prev) => new Set([...prev, newGroup.id]));
    setShowCreateOptionGroup(false);
    setNewOptionGroupName('');
    setNewOptionGroupCode('');
  };

  const handleAddExistingOptionGroup = (groupId: string) => {
    const existingGroup = allOptionGroups.find((g) => g.id === groupId);
    if (!existingGroup) return;

    // CLONE the group: Vendure forbids attaching a group that already belongs to
    // another product ("already assigned" error), so reuse = copy as new entities.
    const localGroup: LocalOptionGroup = {
      id: generateTempId('temp-group'),
      code: existingGroup.code,
      name: existingGroup.name,
      isNew: true,
      options: existingGroup.options.map((o) => ({
        id: generateTempId('temp-option'),
        code: o.code,
        name: o.name,
        isNew: true,
      })),
    };

    onOptionGroupsChange([...selectedOptionGroups, localGroup]);
    setExpandedGroups((prev) => new Set([...prev, localGroup.id]));
  };

  const handleRemoveOptionGroup = (groupId: string) => {
    // Check if any pending variants use this group's options
    const group = selectedOptionGroups.find((g) => g.id === groupId);
    if (group) {
      const groupOptionIds = new Set(group.options.map((o) => o.id));
      const variantsUsingGroup = pendingVariants.filter((v) =>
        v.optionIds.some((id) => groupOptionIds.has(id))
      );

      if (variantsUsingGroup.length > 0) {
        // Remove variants that use this group
        const filteredVariants = pendingVariants.filter(
          (v) => !v.optionIds.some((id) => groupOptionIds.has(id))
        );
        onVariantsChange(filteredVariants);
      }
    }

    onOptionGroupsChange(selectedOptionGroups.filter((g) => g.id !== groupId));
  };

  const handleCreateOption = (groupId: string) => {
    if (!newOptionName.trim()) return;

    const code = newOptionCode.trim() || nameToCode(newOptionName);

    const newOption: LocalOption = {
      id: generateTempId('temp-option'),
      code,
      name: newOptionName.trim(),
      isNew: true,
    };

    const updatedGroups = selectedOptionGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, options: [...g.options, newOption] };
      }
      return g;
    });

    onOptionGroupsChange(updatedGroups);
    setShowAddOption(null);
    setNewOptionName('');
    setNewOptionCode('');
  };

  const handleDeleteOption = (groupId: string, optionId: string) => {
    // Remove any variants that use this option
    const filteredVariants = pendingVariants.filter((v) => !v.optionIds.includes(optionId));
    if (filteredVariants.length !== pendingVariants.length) {
      onVariantsChange(filteredVariants);
    }

    const updatedGroups = selectedOptionGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, options: g.options.filter((o) => o.id !== optionId) };
      }
      return g;
    });

    onOptionGroupsChange(updatedGroups);
  };

  const toggleCombinationSelection = (key: string) => {
    setSelectedCombinations((prev) => {
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
    setSelectedCombinations(new Set(missingCombinations.map((c) => c.optionIds.join('-'))));
  };

  const deselectAll = () => {
    setSelectedCombinations(new Set());
  };

  const handleGenerateVariants = () => {
    if (selectedCombinations.size === 0) return;

    const prefix = skuPrefix.trim() || productName.substring(0, 3).toUpperCase();

    const newVariants: LocalVariant[] = Array.from(selectedCombinations).map((key) => {
      const combination = missingCombinations.find((c) => c.optionIds.join('-') === key);
      if (!combination) return null;

      return {
        id: generateTempId('temp-variant'),
        sku: `${prefix}-${combination.codes.join('-')}`,
        price: basePrice,
        stock: baseStock,
        optionIds: combination.optionIds,
        optionLabels: combination.label,
      };
    }).filter(Boolean) as LocalVariant[];

    onVariantsChange([...pendingVariants, ...newVariants]);
    setSelectedCombinations(new Set());
    setShowGenerateSection(false);
  };

  const handleUpdateVariant = (variantId: string, field: keyof LocalVariant, value: string | number) => {
    const updatedVariants = pendingVariants.map((v) => {
      if (v.id === variantId) {
        return { ...v, [field]: value };
      }
      return v;
    });
    onVariantsChange(updatedVariants);
  };

  const handleDeleteVariant = (variantId: string) => {
    onVariantsChange(pendingVariants.filter((v) => v.id !== variantId));
  };

  return (
    <div className="space-y-6">
      {/* Empty State Guide */}
      {selectedOptionGroups.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Créer des variantes de produit</h3>
              <ol className="text-sm space-y-2 max-w-md mx-auto text-left list-decimal list-inside">
                <li>Ajoutez des groupes d'options (ex: Taille, Couleur)</li>
                <li>Ajoutez des options à chaque groupe (ex: S, M, L)</li>
                <li>Générez les variantes à partir des combinaisons</li>
              </ol>
              <div className="flex justify-center gap-3 mt-6">
                {availableOptionGroups.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddExistingOptionGroup(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-sm bg-muted border border-border text-foreground rounded-lg px-3 py-2"
                  >
                    <option value="">Ajouter un groupe existant...</option>
                    {availableOptionGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  type="button"
                  onClick={() => setShowCreateOptionGroup(true)}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Nouveau groupe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Option Groups Section */}
      {(selectedOptionGroups.length > 0 || showCreateOptionGroup) && (
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
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddExistingOptionGroup(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-sm bg-muted border border-border text-foreground rounded-lg px-3 py-1.5"
                  >
                    <option value="">Ajouter existant...</option>
                    {availableOptionGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
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
                  <Button type="button" size="sm" onClick={handleCreateOptionGroup}>
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
            {selectedOptionGroups.length > 0 && (
              <div className="space-y-3">
                {selectedOptionGroups.map((group) => (
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
                        {group.isNew && (
                          <Badge variant="info" className="text-xs">
                            Nouveau
                          </Badge>
                        )}
                        <Badge variant="default" className="text-xs">
                          {group.options.length} option(s)
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                            group.options.map((option) => (
                              <div
                                key={option.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg group"
                              >
                                <span className="text-sm text-foreground">{option.name}</span>
                                <span className="text-xs text-muted-foreground">({option.code})</span>
                                {option.isNew && (
                                  <Badge variant="info" className="text-xs ml-1">
                                    Nouveau
                                  </Badge>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOption(group.id, option.id)}
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Variant Generation Section */}
      {selectedOptionGroups.length > 0 && selectedOptionGroups.every((g) => g.options.length > 0) && (
        <Card className="border-green-700/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-green-400" />
                Générer des variantes
                {missingCombinations.length > 0 && (
                  <Badge variant="warning" className="ml-2">
                    {missingCombinations.length} combinaison(s) disponible(s)
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
                        placeholder={productName.substring(0, 3).toUpperCase() || 'SKU'}
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
                        Combinaisons à créer ({selectedCombinations.size} sélectionnée(s))
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {missingCombinations.map((combination) => {
                        const key = combination.optionIds.join('-');
                        const isSelected = selectedCombinations.has(key);
                        const previewSku = `${skuPrefix.trim() || productName.substring(0, 3).toUpperCase()}-${combination.codes.join('-')}`;

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
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleGenerateVariants}
                      disabled={selectedCombinations.size === 0}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Ajouter {selectedCombinations.size} variante(s)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                  <p className="font-medium text-green-400">Toutes les combinaisons ont des variantes!</p>
                  <p className="text-sm mt-1">
                    Il y a {allCombinations.length} combinaison(s) possible(s) et toutes ont des variantes.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Pending Variants Table */}
      {pendingVariants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Variantes à créer ({pendingVariants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Options
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Prix (DZD)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-accent">
                      <td className="px-4 py-3">
                        <Input
                          value={variant.sku}
                          onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                          className="w-40 font-mono text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{variant.optionLabels}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={variant.price || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="w-28"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={variant.stock || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)
                          }
                          className="w-24"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteVariant(variant.id)}
                          icon={<Trash2 className="h-3 w-3" />}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
