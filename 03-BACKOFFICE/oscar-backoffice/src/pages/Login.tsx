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
  password: Yup.string().min(4, 'Minimum 4 caractères').required('Mot de passe requis'),
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
            dispatch(addToast({ message: 'Connexion réussie!', type: 'success' }));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
              O
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-100 mb-2">Back-Office OSCAR</h1>
          <p className="text-center text-gray-400 mb-8">
            Connectez-vous pour accéder au panneau d'administration
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                {...formik.getFieldProps('username')}
                className={`w-full px-4 py-3 border rounded-lg bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  formik.touched.username && formik.errors.username
                    ? 'border-red-500'
                    : 'border-gray-600'
                }`}
                placeholder="superadmin"
              />
              {formik.touched.username && formik.errors.username && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className={`w-full px-4 py-3 border rounded-lg bg-gray-900 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : 'border-gray-600'
                }`}
                placeholder="••••••••"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...formik.getFieldProps('rememberMe')}
                checked={formik.values.rememberMe}
                className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-400">
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || formik.isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading || formik.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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

          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-300 font-medium mb-2">Compte superadmin:</p>
            <p className="text-xs text-blue-400">Utilisateur: superadmin</p>
            <p className="text-xs text-blue-400">Mot de passe: superadmin123</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 OSCAR Fashion. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
