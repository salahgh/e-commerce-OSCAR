import React from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { loginStart as loginAction } from '../../store/slices/authSlice';
import { RegisterDocument } from '../../graphql/generated/graphql';
import { UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [registerMutation, { loading }] = useMutation(RegisterDocument, {
    onCompleted: (data) => {
      if (data.register) {
        dispatch(
          loginAction({
            accessToken: data.register.accessToken || '',
            refreshToken: data.register.refreshToken || '',
            user: {
              id: data.register.userId || 0,
              email: data.register.email || '',
              firstName: data.register.firstName || '',
              lastName: data.register.lastName || '',
              role: data.register.role || 'CUSTOMER',
            },
          })
        );
        dispatch(addToast({ message: 'Inscription réussie !', type: 'success' }));
        navigate('/');
      }
    },
    onError: (error) => {
      dispatch(addToast({ message: error.message || 'Erreur lors de l\'inscription', type: 'error' }));
    },
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Prénom requis'),
      lastName: Yup.string().required('Nom requis'),
      email: Yup.string().email('Email invalide').required('Email requis'),
      password: Yup.string()
        .min(8, 'Minimum 8 caractères')
        .matches(/[A-Z]/, 'Au moins une majuscule')
        .matches(/[a-z]/, 'Au moins une minuscule')
        .matches(/[0-9]/, 'Au moins un chiffre')
        .required('Mot de passe requis'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
        .required('Confirmation requise'),
    }),
    onSubmit: async (values) => {
      try {
        await registerMutation({
          variables: {
            input: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              password: values.password,
            },
          },
        });
      } catch (error) {
        console.error('Registration error:', error);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <UserPlus size={24} />
            Créer un compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Prénom"
                  autoComplete="given-name"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nom"
                  autoComplete="family-name"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="email@exemple.com"
                autoComplete="email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
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
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Vous avez déjà un compte ? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Se connecter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
