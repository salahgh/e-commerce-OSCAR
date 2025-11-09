import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { loginSuccess } from '../store/slices/authSlice';
import { graphql } from '../graphql/generated';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
});

const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginRequestInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      tokenType
      expiresIn
      userId
      email
      firstName
      lastName
      role
    }
  }
`);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = React.useState('');
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');

        const { data } = await loginMutation({
          variables: {
            input: {
              email: values.email,
              password: values.password,
            },
          },
        });

        if (data?.login) {
          const loginResponse = data.login;

          // Store token in localStorage
          if (loginResponse.accessToken) {
            localStorage.setItem('admin_token', loginResponse.accessToken);
          }
          if (loginResponse.refreshToken) {
            localStorage.setItem('refresh_token', loginResponse.refreshToken);
          }

          // Prepare user object for Redux store
          const user = {
            id: String(loginResponse.userId || ''),
            email: loginResponse.email || '',
            firstName: loginResponse.firstName || '',
            lastName: loginResponse.lastName || '',
            role: loginResponse.role || 'CUSTOMER',
            phoneNumber: '',
            emailVerified: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          dispatch(loginSuccess({ user, token: loginResponse.accessToken || '' }));
          navigate('/');
        } else {
          setError('Email ou mot de passe incorrect');
        }
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message || 'Une erreur est survenue lors de la connexion');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              O
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Back-Office OSCAR
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Connectez-vous pour accéder au panneau d'administration
          </p>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              {...formik.getFieldProps('email')}
              error={formik.touched.email ? formik.errors.email : undefined}
              placeholder="admin@oscarfashion.dz"
            />

            <Input
              label="Mot de passe"
              type="password"
              {...formik.getFieldProps('password')}
              error={formik.touched.password ? formik.errors.password : undefined}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading || formik.isSubmitting}
              className="w-full"
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Compte de test:</p>
            <p className="text-xs text-blue-600">Email: admin@oscarfashion.dz</p>
            <p className="text-xs text-blue-600">Mot de passe: password123</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 OSCAR Fashion. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
