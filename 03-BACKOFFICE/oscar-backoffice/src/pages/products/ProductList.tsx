import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Plus, Search, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatPrice } from '../../lib/utils';
import { graphql } from '../../graphql/generated';

const PRODUCTS_QUERY = graphql(`
  query Products($page: Int, $size: Int, $sortBy: String, $sortDirection: String) {
    products(page: $page, size: $size, sortBy: $sortBy, sortDirection: $sortDirection) {
      content {
        id
        sku
        nameFr
        basePrice
        salePrice
        stockQuantity
        categoryName
        isFeatured
        imageUrls
      }
      totalElements
      totalPages
      number
      size
    }
  }
`);

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: {
      page,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <Button onClick={() => navigate('/products/new')} icon={<Plus className="h-5 w-5" />}>
          Nouveau Produit
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher un produit..."
              icon={<Search className="h-5 w-5" />}
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Toutes les catégories</option>
              <option value="hommes">Hommes</option>
              <option value="femmes">Femmes</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <Button variant="outline">Filtrer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Chargement...' : error ? 'Erreur' : `${data?.products?.totalElements || 0} produits`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement des produits...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          )}

          {!loading && !error && data?.products?.content && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.content.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.nameFr}</TableCell>
                    <TableCell className="text-sm text-gray-600">{product.categoryName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {product.salePrice ? (
                          <>
                            <span className="font-semibold">{formatPrice(Number(product.salePrice))}</span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(Number(product.basePrice))}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">{formatPrice(Number(product.basePrice))}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(product.stockQuantity || 0) > 50 ? 'success' : 'warning'}>
                        {product.stockQuantity} unités
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/products/${product.id}`)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
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
