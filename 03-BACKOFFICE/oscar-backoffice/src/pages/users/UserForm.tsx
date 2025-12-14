import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Save, Eye, EyeOff, Shield } from 'lucide-react';
import {
  AdminAdministratorDocument,
  AdminRolesDocument,
  CreateAdministratorDocument,
  UpdateAdministratorDocument,
} from '../../graphql/generated/graphql';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { addToast } from '../../store/slices/uiSlice';

interface FormValues {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  roleIds: string[];
}

const createValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  emailAddress: Yup.string().email('Email invalide').required("L'email est requis"),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation est requise'),
  roleIds: Yup.array().of(Yup.string()).min(1, 'Au moins un rôle est requis'),
});

const updateValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  emailAddress: Yup.string().email('Email invalide').required("L'email est requis"),
  password: Yup.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password')],
    'Les mots de passe ne correspondent pas'
  ),
  roleIds: Yup.array().of(Yup.string()).min(1, 'Au moins un rôle est requis'),
});

export const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = !!id;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: adminData, loading: loadingAdmin } = useQuery(AdminAdministratorDocument, {
    variables: { id: id! },
    skip: !isEdit,
  });

  const { data: rolesData, loading: loadingRoles } = useQuery(AdminRolesDocument, {
    variables: { options: { take: 100 } },
  });

  const [createAdmin, { loading: creating }] = useMutation(CreateAdministratorDocument, {
    onCompleted: () => {
      dispatch(addToast({ type: 'success', message: 'Administrateur créé avec succès' }));
      setTimeout(() => navigate('/users'), 1500);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
    },
  });

  const [updateAdmin, { loading: updating }] = useMutation(UpdateAdministratorDocument, {
    onCompleted: () => {
      dispatch(addToast({ type: 'success', message: 'Administrateur mis à jour avec succès' }));
      setTimeout(() => navigate('/users'), 1500);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
    },
  });

  const admin = adminData?.administrator;
  const roles = rolesData?.roles?.items || [];
  const loading = loadingAdmin || loadingRoles;
  const submitting = creating || updating;

  const formatRoleCode = (code: string): string => {
    if (code === '__super_admin_role__') return 'Super Admin';
    return code.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const initialValues: FormValues = {
    firstName: admin?.firstName || '',
    lastName: admin?.lastName || '',
    emailAddress: admin?.emailAddress || '',
    password: '',
    confirmPassword: '',
    roleIds: admin?.user?.roles?.map((r) => r.id) || [],
  };

  const handleSubmit = (values: FormValues) => {
    if (isEdit) {
      const input: any = {
        id,
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.emailAddress,
        roleIds: values.roleIds,
      };
      if (values.password) {
        input.password = values.password;
      }
      updateAdmin({ variables: { input } });
    } else {
      createAdmin({
        variables: {
          input: {
            firstName: values.firstName,
            lastName: values.lastName,
            emailAddress: values.emailAddress,
            password: values.password,
            roleIds: values.roleIds,
          },
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEdit && !admin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Administrateur non trouvé</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Modifier l'administrateur" : 'Nouvel administrateur'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? `Modification de ${admin?.firstName} ${admin?.lastName}`
              : 'Créer un nouveau compte administrateur'}
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={isEdit ? updateValidationSchema : createValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <Card className="lg:col-span-2 bg-card border-border">
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Informations personnelles
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Prénom *
                      </label>
                      <Field
                        type="text"
                        name="firstName"
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Jean"
                      />
                      <ErrorMessage
                        name="firstName"
                        component="p"
                        className="mt-1 text-sm text-red-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nom *
                      </label>
                      <Field
                        type="text"
                        name="lastName"
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Dupont"
                      />
                      <ErrorMessage
                        name="lastName"
                        component="p"
                        className="mt-1 text-sm text-red-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Field
                      type="email"
                      name="emailAddress"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="jean.dupont@example.com"
                    />
                    <ErrorMessage
                      name="emailAddress"
                      component="p"
                      className="mt-1 text-sm text-red-400"
                    />
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {isEdit ? 'Changer le mot de passe (optionnel)' : 'Mot de passe'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Mot de passe {!isEdit && '*'}
                        </label>
                        <div className="relative">
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="w-full px-4 py-3 pr-12 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="password"
                          component="p"
                          className="mt-1 text-sm text-red-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Confirmer {!isEdit && '*'}
                        </label>
                        <div className="relative">
                          <Field
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            className="w-full px-4 py-3 pr-12 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="confirmPassword"
                          component="p"
                          className="mt-1 text-sm text-red-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Roles Panel */}
              <Card className="bg-card border-border">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    Rôles *
                  </h2>

                  {errors.roleIds && touched.roleIds && (
                    <p className="mb-4 text-sm text-red-400">{errors.roleIds as string}</p>
                  )}

                  <div className="space-y-3">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          values.roleIds.includes(role.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-muted-foreground'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={values.roleIds.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue('roleIds', [...values.roleIds, role.id]);
                            } else {
                              setFieldValue(
                                'roleIds',
                                values.roleIds.filter((id) => id !== role.id)
                              );
                            }
                          }}
                          className="mt-1 h-4 w-4 text-primary rounded border-border bg-card focus:ring-primary"
                        />
                        <div>
                          <p className="font-medium text-foreground">{formatRoleCode(role.code)}</p>
                          {role.description && (
                            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          )}
                          {role.permissions && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {role.permissions.length} permission
                              {role.permissions.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" />
                    {isEdit ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {isEdit ? 'Enregistrer' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
