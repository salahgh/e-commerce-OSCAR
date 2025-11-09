import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { FileText } from 'lucide-react';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-600 mt-1">Générez et téléchargez des rapports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Rapport des Ventes</h3>
            <p className="text-sm text-gray-600">Télécharger le rapport des ventes mensuel</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Rapport d'Inventaire</h3>
            <p className="text-sm text-gray-600">État actuel du stock de produits</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Rapport Clients</h3>
            <p className="text-sm text-gray-600">Statistiques et informations clients</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
