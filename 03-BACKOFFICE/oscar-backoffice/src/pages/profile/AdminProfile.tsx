import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Shield, Calendar, Save } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  ActiveAdministratorDocument,
  UpdateActiveAdministratorDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const validationSchema = Yup.object({
  firstName: Yup.string().required('Prénom requis'),
  lastName: Yup.string().required('Nom requis'),
  emailAddress: Yup.string().email('Email invalide').required('Email requis'),
});

export const AdminProfile: React.FC = () => {
  const dispatch = useDispatch();

  const { data, loading, error, refetch } = useQuery(ActiveAdministratorDocument);
  const [updateAdmin, { loading: updating }] = useMutation(UpdateActiveAdministratorDocument);

  const admin = data?.activeAdministrator;

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  }) => {
    try {
      await updateAdmin({
        variables: {
          input: {
            firstName: values.firstName,
            lastName: values.lastName,
            emailAddress: values.emailAddress,
          },
        },
      });
      dispatch(
        addToast({
          message: 'Profil mis à jour avec succès',
          type: 'success',
        })
      );
      refetch();
    } catch (err) {
      dispatch(
        addToast({
          message: 'Erreur lors de la mise à jour',
          type: 'error',
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">
            {error ? `Erreur: ${error.message}` : 'Administrateur non trouvé'}
          </p>
        </div>
      </div>
    );
  }

  const roles = admin.user?.roles || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="h-24 w-24 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-400 font-bold text-3xl">
            {(admin.firstName?.[0] || '') + (admin.lastName?.[0] || '')}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-100">Mon Profil</h1>
        <p className="text-gray-400 mt-1">{admin.emailAddress}</p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-100">Informations</h2>
        </div>

        <Formik
          initialValues={{
            firstName: admin.firstName || '',
            lastName: admin.lastName || '',
            emailAddress: admin.emailAddress || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.firstName && errors.firstName ? String(errors.firstName) : undefined
                  }
                  required
                />
                <Input
                  label="Nom"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && errors.lastName ? String(errors.lastName) : undefined}
                  required
                />
              </div>
              <Input
                label="Email"
                name="emailAddress"
                type="email"
                value={values.emailAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.emailAddress && errors.emailAddress
                    ? String(errors.emailAddress)
                    : undefined
                }
                icon={<Mail className="h-4 w-4" />}
                required
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" loading={updating} icon={<Save className="h-4 w-4" />}>
                  Enregistrer
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Roles Card */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-100">Rôles</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <p className="text-gray-400">Aucun rôle assigné</p>
          ) : (
            roles.map((role) => (
              <Badge key={role.id} variant="info" className="text-sm">
                {role.code}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-100">Compte</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">ID</p>
            <p className="font-medium text-gray-100">{admin.id}</p>
          </div>
          <div>
            <p className="text-gray-400">Identifiant</p>
            <p className="font-medium text-gray-100">{admin.user?.identifier || admin.emailAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
