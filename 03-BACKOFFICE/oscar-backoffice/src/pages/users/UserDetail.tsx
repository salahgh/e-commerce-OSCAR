import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { UserDocument } from '../../graphql/generated/graphql';
import { formatDate } from '../../lib/utils';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(UserDocument, {
    variables: { id: id ? parseInt(id) : 0 },
    skip: !id,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erreur: {error?.message || 'Utilisateur non trouvé'}</div>
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Détails de l'utilisateur</p>
          </div>
        </div>
        <Badge variant={user.isActive ? 'success' : 'default'}>
          {user.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User size={20} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={20} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
                <div className="mt-1">
                  <Badge variant={user.emailVerified ? 'success' : 'warning'} size="sm">
                    {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
                  </Badge>
                </div>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Shield size={20} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Rôle</p>
                <Badge variant="info">{user.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Informations du Compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Statut du compte</p>
              <Badge variant={user.isActive ? 'success' : 'default'} className="mt-1">
                {user.isActive ? 'Compte actif' : 'Compte désactivé'}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-600">Date d'inscription</p>
              <p className="font-medium text-gray-900">{formatDate(String(user.createdAt))}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Dernière modification</p>
              <p className="font-medium text-gray-900">{formatDate(String(user.updatedAt))}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">ID Utilisateur</p>
              <p className="font-medium text-gray-900">#{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Complémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">-</p>
              <p className="text-sm text-gray-600 mt-2">Commandes totales</p>
              <p className="text-xs text-gray-500 mt-1">Bientôt disponible</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">-</p>
              <p className="text-sm text-gray-600 mt-2">Montant dépensé</p>
              <p className="text-xs text-gray-500 mt-1">Bientôt disponible</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">-</p>
              <p className="text-sm text-gray-600 mt-2">Produits dans le panier</p>
              <p className="text-xs text-gray-500 mt-1">Bientôt disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/users`)}>
              Retour à la liste
            </Button>
            <Button variant="outline" disabled>
              Voir les commandes
            </Button>
            <Button variant="outline" disabled>
              Envoyer un email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
