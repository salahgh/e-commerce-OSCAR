import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Save, Key, Shield } from 'lucide-react';
import {
  AdminRoleDocument,
  CreateRoleDocument,
  UpdateRoleDocument,
  Permission,
} from '../../graphql/generated/graphql';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { addToast } from '../../store/slices/uiSlice';
import { PERMISSION_CATEGORIES, PERMISSION_DESCRIPTIONS } from '../../config/permissions.config';

interface FormValues {
  code: string;
  description: string;
  permissions: string[];
}

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^[a-z_]+$/, 'Le code doit être en minuscules avec des underscores')
    .required('Le code est requis'),
  description: Yup.string().required('La description est requise'),
  permissions: Yup.array().of(Yup.string()).min(1, 'Au moins une permission est requise'),
});


export const RoleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = !!id;

  const { data: roleData, loading: loadingRole } = useQuery(AdminRoleDocument, {
    variables: { id: id! },
    skip: !isEdit,
  });

  const [createRole, { loading: creating }] = useMutation(CreateRoleDocument, {
    onCompleted: () => {
      dispatch(addToast({ type: 'success', message: 'Rôle créé avec succès' }));
      setTimeout(() => navigate('/users/roles'), 1500);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
    },
  });

  const [updateRole, { loading: updating }] = useMutation(UpdateRoleDocument, {
    onCompleted: () => {
      dispatch(addToast({ type: 'success', message: 'Rôle mis à jour avec succès' }));
      setTimeout(() => navigate('/users/roles'), 1500);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
    },
  });

  const role = roleData?.role;
  const loading = loadingRole;
  const submitting = creating || updating;

  const initialValues: FormValues = {
    code: role?.code || '',
    description: role?.description || '',
    permissions: (role?.permissions as string[]) || [],
  };

  const handleSubmit = (values: FormValues) => {
    if (isEdit) {
      updateRole({
        variables: {
          input: {
            id: id!,
            code: values.code,
            description: values.description,
            permissions: values.permissions as Permission[],
          },
        },
      });
    } else {
      createRole({
        variables: {
          input: {
            code: values.code,
            description: values.description,
            permissions: values.permissions as Permission[],
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

  if (isEdit && !role) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Rôle non trouvé</p>
          <button
            onClick={() => navigate('/users/roles')}
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
          onClick={() => navigate('/users/roles')}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? 'Modifier le rôle' : 'Nouveau rôle'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? `Modification du rôle "${role?.code}"`
              : 'Créer un nouveau rôle avec des permissions personnalisées'}
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card border-border">
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Informations du rôle
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Code *</label>
                    <Field
                      type="text"
                      name="code"
                      disabled={isEdit}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                      placeholder="manager_role"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minuscules et underscores uniquement
                    </p>
                    <ErrorMessage name="code" component="p" className="mt-1 text-sm text-red-400" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description *
                    </label>
                    <Field
                      type="text"
                      name="description"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Gestionnaire des commandes"
                    />
                    <ErrorMessage
                      name="description"
                      component="p"
                      className="mt-1 text-sm text-red-400"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Permissions */}
            <Card className="bg-card border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-400" />
                    Permissions *
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {values.permissions.length} sélectionnée
                    {values.permissions.length > 1 ? 's' : ''}
                  </span>
                </div>

                {errors.permissions && touched.permissions && (
                  <p className="mb-4 text-sm text-red-400">{errors.permissions as string}</p>
                )}

                <div className="space-y-6">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, { label, permissions }]) => {
                    const selectedCount = permissions.filter((p) =>
                      values.permissions.includes(p)
                    ).length;
                    const allSelected = selectedCount === permissions.length;

                    return (
                      <div
                        key={category}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <div className="bg-background px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue('permissions', [
                                    ...new Set([...values.permissions, ...permissions]),
                                  ]);
                                } else {
                                  setFieldValue(
                                    'permissions',
                                    values.permissions.filter((p) => !(permissions as string[]).includes(p))
                                  );
                                }
                              }}
                              className="h-4 w-4 text-primary rounded border-border bg-card focus:ring-primary"
                            />
                            <span className="font-medium text-foreground">{label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {selectedCount}/{permissions.length}
                          </span>
                        </div>

                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {permissions.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={values.permissions.includes(permission)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('permissions', [
                                      ...values.permissions,
                                      permission,
                                    ]);
                                  } else {
                                    setFieldValue(
                                      'permissions',
                                      values.permissions.filter((p) => p !== permission)
                                    );
                                  }
                                }}
                                className="h-4 w-4 text-primary rounded border-border bg-card focus:ring-primary"
                              />
                              <span className="text-sm text-foreground">
                                {PERMISSION_DESCRIPTIONS[permission]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/users/roles')}
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
