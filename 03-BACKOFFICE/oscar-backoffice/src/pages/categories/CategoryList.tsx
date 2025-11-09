import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { graphql } from '../../graphql/generated';

const CATEGORIES_QUERY = graphql(`
  query Categories {
    categories {
      id
      slug
      nameFr
      displayOrder
      isActive
      productCount
    }
  }
`);

export const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(CATEGORIES_QUERY);

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

      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Chargement...' : error ? 'Erreur' : `${data?.categories?.length || 0} catégories`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement des catégories...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          )}

          {!loading && !error && data?.categories && (
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
                {data.categories.map((category) => (
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
