import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { addToast } from '../store/slices/uiSlice';
import { loginSuccess } from '../store/slices/authSlice';
import { LoginDocument, ForgotPasswordDocument } from '../graphql/generated/graphql';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = React.useState('');
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [loginMutation, { loading }] = useMutation(LoginDocument);
  const [forgotPasswordMutation, { loading: forgotPasswordLoading }] = useMutation(ForgotPasswordDocument, {
    onCompleted: () => {
      dispatch(addToast({
        message: 'Un email de réinitialisation a été envoyé à votre adresse',
        type: 'success'
      }));
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    },
    onError: (error) => {
      dispatch(addToast({
        message: error.message || 'Erreur lors de l\'envoi de l\'email',
        type: 'error'
      }));
    },
  });

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail || !/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      dispatch(addToast({ message: 'Veuillez entrer un email valide', type: 'error' }));
      return;
    }
    await forgotPasswordMutation({ variables: { email: forgotPasswordEmail } });
  };

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

            <div>
              <Input
                label="Mot de passe"
                type="password"
                {...formik.getFieldProps('password')}
                error={formik.touched.password ? formik.errors.password : undefined}
                placeholder="••••••••"
              />
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <Modal
          isOpen={showForgotPassword}
          onClose={() => {
            setShowForgotPassword(false);
            setForgotPasswordEmail('');
          }}
          title="Mot de passe oublié"
        >
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-600">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="email@exemple.com"
                autoComplete="email"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
