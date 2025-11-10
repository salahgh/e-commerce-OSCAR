import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Trash2, List, GitBranch, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { CategoriesDocument, DeleteCategoryDocument, ActiveCategoriesDocument, CategoryBySlugDocument } from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { CategoryTree } from '../../components/categories/CategoryTree';

export const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [slugSearch, setSlugSearch] = useState('');

  // Query for slug search
  const { data: searchData, loading: searchLoading, error: searchError } = useQuery(CategoryBySlugDocument, {
    variables: { slug: slugSearch },
    skip: !slugSearch,
  });

  // Query for active categories only
  const { data: activeData, loading: activeLoading, error: activeError } = useQuery(ActiveCategoriesDocument, {
    skip: !showActiveOnly || !!slugSearch,
  });

  const { data, loading, error } = useQuery(CategoriesDocument, {
    skip: showActiveOnly || !!slugSearch,
  });

  // Determine which data to display
  let displayData, displayLoading, displayError;
  if (slugSearch) {
    displayData = searchData?.categoryBySlug ? { categories: [searchData.categoryBySlug] } : { categories: [] };
    displayLoading = searchLoading;
    displayError = searchError;
  } else if (showActiveOnly) {
    displayData = { categories: activeData?.activeCategories || [] };
    displayLoading = activeLoading;
    displayError = activeError;
  } else {
    displayData = data;
    displayLoading = loading;
    displayError = error;
  }

  const [deleteCategory, { loading: deleting }] = useMutation(DeleteCategoryDocument, {
    refetchQueries: [
      { query: CategoriesDocument },
      ...(showActiveOnly ? [{ query: ActiveCategoriesDocument }] : []),
    ],
  });

  const handleDeleteClick = (id: number, name: string) => {
    setCategoryToDelete({ id, name });
  };

  const handleResetFilters = () => {
    setShowActiveOnly(false);
    setSlugSearch('');
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory({
        variables: { id: categoryToDelete.id },
      });

      dispatch(
        addToast({
          message: 'Catégorie supprimée avec succès',
          type: 'success',
        })
      );
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error('Delete category error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors de la suppression',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-600 mt-1">Gérez les catégories de produits</p>
        </div>
        <Button onClick={() => navigate('/categories/new')} icon={<Plus className="h-5 w-5" />}>
          Nouvelle Catégorie
        </Button>
      </div>

      {/* Filters and View Mode */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Rechercher par slug..."
                icon={<Search className="h-5 w-5" />}
                value={slugSearch}
                onChange={(e) => setSlugSearch(e.target.value)}
              />
              <Button
                variant={showActiveOnly ? 'primary' : 'outline'}
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                icon={<Filter className="h-5 w-5" />}
              >
                Actives uniquement
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                onClick={() => setViewMode('list')}
                icon={<List className="h-5 w-5" />}
              >
                Liste
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'primary' : 'outline'}
                onClick={() => setViewMode('tree')}
                icon={<GitBranch className="h-5 w-5" />}
              >
                Arborescence
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree View */}
      {viewMode === 'tree' && <CategoryTree />}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {displayLoading ? 'Chargement...' : displayError ? 'Erreur' : `${displayData?.categories?.length || 0} catégories`}
              {slugSearch && ` (recherche: ${slugSearch})`}
              {showActiveOnly && ' (Actives uniquement)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {displayLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Chargement des catégories...</div>
              </div>
            )}

            {displayError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-500">Erreur: {displayError.message}</div>
              </div>
            )}

            {!displayLoading && !displayError && displayData?.categories && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.nameFr}</TableCell>
                      <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                      <TableCell>{category.productCount} produits</TableCell>
                      <TableCell>{category.displayOrder}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? 'success' : 'default'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/categories/edit/${category.id}`)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(Number(category.id), category.nameFr || '')}
                            icon={<Trash2 className="h-4 w-4 text-red-600" />}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer "${categoryToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleting}
      />
    </div>
  );
};
