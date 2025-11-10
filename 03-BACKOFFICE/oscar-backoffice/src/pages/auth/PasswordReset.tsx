import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { ResetPasswordDocument } from '../../graphql/generated/graphql';
import { Lock, CheckCircle } from 'lucide-react';

export const PasswordReset: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetComplete, setResetComplete] = useState(false);
  const token = searchParams.get('token') || '';

  const [resetPassword, { loading }] = useMutation(ResetPasswordDocument, {
    onCompleted: () => {
      setResetComplete(true);
      dispatch(addToast({ message: 'Mot de passe réinitialisé avec succès', type: 'success' }));
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error) => {
      dispatch(addToast({ message: error.message || 'Erreur lors de la réinitialisation', type: 'error' }));
    },
  });

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
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
        await resetPassword({
          variables: {
            token,
            newPassword: values.newPassword,
          },
        });
      } catch (error) {
        console.error('Password reset error:', error);
      }
    },
  });

  useEffect(() => {
    if (!token) {
      dispatch(addToast({ message: 'Token de réinitialisation manquant', type: 'error' }));
      navigate('/login');
    }
  }, [token, dispatch, navigate]);

  if (resetComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe réinitialisé !</h2>
            <p className="text-gray-600 mb-4">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Lock size={24} />
            Réinitialiser le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="newPassword"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.newPassword}</p>
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
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formik.isValid}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
