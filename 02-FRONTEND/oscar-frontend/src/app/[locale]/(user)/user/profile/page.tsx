'use client';

import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Card } from '@/components/ui';
import { User, Mail, Phone, Edit2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  phone: Yup.string().matches(
    /^(05|06|07)[0-9]{8}$/,
    'Numéro de téléphone invalide (ex: 0XXXXXXXXX)'
  ),
});

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      await updateProfile(values);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            leftIcon={<Edit2 className="h-4 w-4" />}
            onClick={() => setIsEditing(true)}
          >
            Modifier
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <Card>
        <Card.Content className="p-6">
          <Formik
            initialValues={{
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      Prénom <span className="text-error">*</span>
                    </label>
                    <Field name="firstName">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="firstName"
                          type="text"
                          placeholder="Votre prénom"
                          leftIcon={<User className="h-5 w-5 text-gray-400" />}
                          error={touched.firstName && errors.firstName ? errors.firstName : ''}
                          disabled={!isEditing}
                        />
                      )}
                    </Field>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      Nom <span className="text-error">*</span>
                    </label>
                    <Field name="lastName">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="lastName"
                          type="text"
                          placeholder="Votre nom"
                          leftIcon={<User className="h-5 w-5 text-gray-400" />}
                          error={touched.lastName && errors.lastName ? errors.lastName : ''}
                          disabled={!isEditing}
                        />
                      )}
                    </Field>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-error">*</span>
                  </label>
                  <Field name="email">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                        error={touched.email && errors.email ? errors.email : ''}
                        disabled={!isEditing}
                      />
                    )}
                  </Field>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <Field name="phone">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="phone"
                        type="tel"
                        placeholder="0X XX XX XX XX"
                        leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                        error={touched.phone && errors.phone ? errors.phone : ''}
                        disabled={!isEditing}
                      />
                    )}
                  </Field>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      leftIcon={<Save className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Enregistrer
                    </Button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </Card.Content>
      </Card>

      {/* Account Info */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Informations du compte</h2>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date de création</span>
              <span className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                  : 'Non disponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut du compte</span>
              <span className="font-medium text-green-600">Actif</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type de compte</span>
              <span className="font-medium">Client</span>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Danger Zone */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-error">Zone dangereuse</h2>
        </Card.Header>
        <Card.Content>
          <p className="text-sm text-gray-600 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement
            supprimées.
          </p>
          <Button variant="destructive" size="sm">
            Supprimer mon compte
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
