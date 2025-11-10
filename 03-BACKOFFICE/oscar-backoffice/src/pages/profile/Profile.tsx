import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { MeDocument, UpdateProfileDocument, ChangePasswordDocument, DeleteMyAccountDocument } from '../../graphql/generated/graphql';
import { formatDate } from '../../lib/utils';
import { User, Lock, Trash2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Query current user profile
  const { data, loading, error, refetch } = useQuery(MeDocument);

  // Update profile mutation
  const [updateProfile, { loading: updating }] = useMutation(UpdateProfileDocument, {
    onCompleted: () => {
      dispatch(addToast({ message: 'Profil mis à jour avec succès', type: 'success' }));
      refetch();
    },
    onError: (error) => {
      dispatch(addToast({ message: error.message || 'Erreur lors de la mise à jour', type: 'error' }));
    },
  });

  // Change password mutation
  const [changePassword, { loading: changingPassword }] = useMutation(ChangePasswordDocument, {
    onCompleted: () => {
      dispatch(addToast({ message: 'Mot de passe modifié avec succès', type: 'success' }));
      setShowPasswordModal(false);
      passwordFormik.resetForm();
    },
    onError: (error) => {
      dispatch(addToast({ message: error.message || 'Erreur lors du changement de mot de passe', type: 'error' }));
    },
  });

  // Delete account mutation
  const [deleteAccount, { loading: deleting }] = useMutation(DeleteMyAccountDocument, {
    onCompleted: () => {
      dispatch(addToast({ message: 'Compte supprimé avec succès', type: 'success' }));
      dispatch(logout());
      navigate('/login');
    },
    onError: (error) => {
      dispatch(addToast({ message: error.message || 'Erreur lors de la suppression', type: 'error' }));
    },
  });

  // Profile form
  const profileFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Prénom requis'),
      lastName: Yup.string().required('Nom requis'),
      email: Yup.string().email('Email invalide').required('Email requis'),
      phone: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        await updateProfile({
          variables: {
            input: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone || null,
            },
          },
        });
      } catch (error) {
        console.error('Update profile error:', error);
      }
    },
  });

  // Password form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Mot de passe actuel requis'),
      newPassword: Yup.string()
        .min(8, 'Minimum 8 caractères')
        .matches(/[A-Z]/, 'Au moins une majuscule')
        .matches(/[a-z]/, 'Au moins une minuscule')
        .matches(/[0-9]/, 'Au moins un chiffre')
        .required('Nouveau mot de passe requis'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
        .required('Confirmation requise'),
    }),
    onSubmit: async (values) => {
      try {
        await changePassword({
          variables: {
            input: {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            },
          },
        });
      } catch (error) {
        console.error('Change password error:', error);
      }
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (data?.me) {
      profileFormik.setValues({
        firstName: data.me.firstName || '',
        lastName: data.me.lastName || '',
        email: data.me.email || '',
        phone: data.me.phone || '',
      });
    }
  }, [data]);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
    } catch (error) {
      console.error('Delete account error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement du profil...</div>
      </div>
    );
  }

  if (error || !data?.me) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erreur: {error?.message || 'Profil non trouvé'}</div>
      </div>
    );
  }

  const user = data.me;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Informations Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  name="firstName"
                  value={profileFormik.values.firstName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  placeholder="Prénom"
                />
                {profileFormik.touched.firstName && profileFormik.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{profileFormik.errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  name="lastName"
                  value={profileFormik.values.lastName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  placeholder="Nom"
                />
                {profileFormik.touched.lastName && profileFormik.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{profileFormik.errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  placeholder="email@exemple.com"
                />
                {profileFormik.touched.email && profileFormik.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{profileFormik.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <Input
                  name="phone"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  placeholder="+213 XXX XXX XXX"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Rôle:</span>
                  <span className="ml-2 text-gray-900">{user.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Inscription:</span>
                  <span className="ml-2 text-gray-900">{formatDate(String(user.createdAt))}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dernière modification:</span>
                  <span className="ml-2 text-gray-900">{formatDate(String(user.updatedAt))}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={updating || !profileFormik.isValid}>
                {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => profileFormik.resetForm()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Mot de passe</h3>
                <p className="text-sm text-gray-600">Modifiez votre mot de passe</p>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                Changer le mot de passe
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="font-medium text-red-900">Zone de danger</h3>
                <p className="text-sm text-red-600">Supprimer définitivement votre compte</p>
              </div>
              <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 size={16} className="mr-2" />
                Supprimer le compte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            passwordFormik.resetForm();
          }}
          title="Changer le mot de passe"
        >
          <form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="currentPassword"
                value={passwordFormik.values.currentPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                placeholder="••••••••"
              />
              {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="newPassword"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                placeholder="••••••••"
              />
              {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                placeholder="••••••••"
              />
              {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={changingPassword || !passwordFormik.isValid}>
                {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordModal(false);
                  passwordFormik.resetForm();
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteAccount}
          title="Supprimer le compte"
          message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues."
          confirmText="Oui, supprimer"
          cancelText="Annuler"
          variant="danger"
        />
      )}
    </div>
  );
};
