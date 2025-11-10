import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../lib/utils';
import { UsersDocument, UsersByRoleDocument, ToggleUserStatusDocument } from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';

export const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [roleFilter, setRoleFilter] = useState('');

  // Use filtered or all users query
  const { data: allData, loading: allLoading, error: allError } = useQuery(UsersDocument, {
    variables: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
    skip: roleFilter !== '',
  });

  const { data: filteredData, loading: filteredLoading, error: filteredError } = useQuery(UsersByRoleDocument, {
    variables: { role: roleFilter, page, size },
    skip: roleFilter === '',
  });

  const data = roleFilter ? filteredData?.usersByRole : allData?.users;
  const loading = roleFilter ? filteredLoading : allLoading;
  const error = roleFilter ? filteredError : allError;

  const [toggleUserStatus, { loading: toggling }] = useMutation(ToggleUserStatusDocument, {
    refetchQueries: [
      { query: UsersDocument, variables: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' } },
      ...(roleFilter ? [{ query: UsersByRoleDocument, variables: { role: roleFilter, page, size } }] : []),
    ],
  });

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await toggleUserStatus({ variables: { userId } });
      dispatch(
        addToast({
          message: `Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`,
          type: 'success',
        })
      );
    } catch (error: any) {
      console.error('Toggle user status error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors du changement de statut',
          type: 'error',
        })
      );
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-gray-600 mt-1">Gérez les utilisateurs et administrateurs</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              options={[
                { value: '', label: 'Tous les rôles' },
                { value: 'CUSTOMER', label: 'Clients' },
                { value: 'ADMIN', label: 'Administrateurs' },
              ]}
            />
            <Button variant="outline" onClick={() => { setRoleFilter(''); setPage(0); }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Chargement...' : error ? 'Erreur' : `${data?.totalElements || 0} utilisateurs`}
            {roleFilter && ` (rôle: ${roleFilter === 'CUSTOMER' ? 'Clients' : 'Administrateurs'})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement des utilisateurs...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          )}

          {!loading && !error && data?.content && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="info">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(String(user.createdAt))}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'success' : 'default'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={user.isActive ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleStatus(Number(user.id), user.isActive)}
                        disabled={toggling}
                      >
                        {user.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
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
