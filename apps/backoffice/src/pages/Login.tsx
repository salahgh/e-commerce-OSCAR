import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { loginSuccess, loginStart, loginFailure } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import { AdminLoginDocument } from '../graphql/generated/graphql';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Nom d'utilisateur requis"),
  password: Yup.string().min(4, 'Minimum 4 caracteres').required('Mot de passe requis'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(AdminLoginDocument);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      rememberMe: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        dispatch(loginStart());

        const { data } = await loginMutation({
          variables: {
            username: values.username,
            password: values.password,
            rememberMe: values.rememberMe,
          },
        });

        if (data?.login) {
          const result = data.login;

          // Check for CurrentUser (success)
          if ('id' in result && 'identifier' in result) {
            dispatch(
              loginSuccess({
                user: {
                  id: result.id,
                  identifier: result.identifier,
                  channels: result.channels.map((ch) => ({
                    id: ch.id,
                    code: ch.code,
                    token: ch.token,
                    permissions: ch.permissions as string[],
                  })),
                },
              })
            );
            dispatch(addToast({ message: 'Connexion reussie!', type: 'success' }));
            navigate('/');
          }
          // Check for InvalidCredentialsError
          else if ('errorCode' in result) {
            dispatch(loginFailure());
            setError(result.message || 'Identifiants incorrects');
          }
        }
      } catch (err: any) {
        console.error('Login error:', err);
        dispatch(loginFailure());
        setError(err.message || 'Une erreur est survenue lors de la connexion');
      }
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg">
              <img src="/oscar-logo.svg" alt="OSCAR Najar" className="h-16 w-auto" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Back-Office OSCAR</h1>
          <p className="text-center text-muted-foreground mb-8">
            Connectez-vous pour acceder au panneau d'administration
          </p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                {...formik.getFieldProps('username')}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors ${
                  formik.touched.username && formik.errors.username
                    ? 'border-destructive'
                    : 'border-input'
                }`}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? 'border-destructive'
                    : 'border-input'
                }`}
                placeholder="••••••••"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...formik.getFieldProps('rememberMe')}
                checked={formik.values.rememberMe}
                className="h-4 w-4 text-primary bg-card border-input rounded focus:ring-ring"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-muted-foreground">
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || formik.isSubmitting}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading || formik.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          2025 OSCAR Fashion. Tous droits reserves.
        </p>
      </div>
    </div>
  );
};
