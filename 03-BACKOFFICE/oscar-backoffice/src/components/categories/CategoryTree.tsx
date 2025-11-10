import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Edit } from 'lucide-react';
import { CategoryTreeDocument } from '../../graphql/generated/graphql';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface CategoryTreeItemProps {
  category: unknown;
  level?: number;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category, level = 0 }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors ${
          level > 0 ? `ml-${level * 6}` : ''
        }`}
        style={{ marginLeft: level * 24 }}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Folder icon */}
        {isExpanded ? (
          <FolderOpen className="h-5 w-5 text-blue-500" />
        ) : (
          <Folder className="h-5 w-5 text-gray-500" />
        )}

        {/* Category name */}
        <span className="font-medium text-gray-900 flex-1">{category.nameFr}</span>

        {/* Product count */}
        <span className="text-sm text-gray-500">
          {category.productCount || 0} produit{(category.productCount || 0) > 1 ? 's' : ''}
        </span>

        {/* Active status */}
        <Badge variant={category.isActive ? 'success' : 'default'}>
          {category.isActive ? 'Active' : 'Inactive'}
        </Badge>

        {/* Edit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/categories/edit/${category.id}`)}
          icon={<Edit className="h-4 w-4" />}
        />
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {category.children?.map((child) => (
            child && <CategoryTreeItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC = () => {
  const { data, loading, error } = useQuery(CategoryTreeDocument);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Chargement de l'arborescence...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">Erreur: {error.message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.categoryTree || data.categoryTree.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Aucune catégorie trouvée</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-1">
          {data.categoryTree.map((category) => (
            category && <CategoryTreeItem key={category.id} category={category} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
