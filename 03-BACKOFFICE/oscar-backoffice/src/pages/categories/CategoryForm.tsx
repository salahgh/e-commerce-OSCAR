import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, FolderTree } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';

const CategorySchema = Yup.object().shape({
  slug: Yup.string()
    .matches(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
    .required('Slug requis'),
  nameFr: Yup.string().required('Nom français requis'),
  nameAr: Yup.string().required('Nom arabe requis'),
  nameEn: Yup.string(),
  descriptionFr: Yup.string(),
  descriptionAr: Yup.string(),
  descriptionEn: Yup.string(),
  parentId: Yup.string().nullable(),
  displayOrder: Yup.number().min(0, 'Ordre invalide').required('Ordre requis'),
  imageUrl: Yup.string().url('URL invalide'),
  isActive: Yup.boolean(),
});

// Mock parent categories
const mockParentCategories = [
  { value: '', label: 'Aucune (Catégorie racine)' },
  { value: '1', label: 'Hommes' },
  { value: '2', label: 'Femmes' },
  { value: '3', label: 'Enfants' },
  { value: '4', label: 'Accessoires' },
];

export const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const isEditMode = Boolean(id);

  const formik = useFormik({
    initialValues: {
      slug: '',
      nameFr: '',
      nameAr: '',
      nameEn: '',
      descriptionFr: '',
      descriptionAr: '',
      descriptionEn: '',
      parentId: '',
      displayOrder: 1,
      imageUrl: '',
      isActive: true,
    },
    validationSchema: CategorySchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // TODO: Replace with GraphQL mutation
        console.log('Category data:', values);

        dispatch(
          addToast({
            message: isEditMode ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès',
            type: 'success',
          })
        );

        navigate('/categories');
      } catch (error: any) {
        dispatch(
          addToast({
            message: error.message || 'Une erreur est survenue',
            type: 'error',
          })
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/categories')} icon={<ArrowLeft className="h-5 w-5" />}>
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Modifiez les informations de la catégorie' : 'Ajoutez une nouvelle catégorie'}
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-blue-600" />
              <CardTitle>Informations de base</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Slug *"
                {...formik.getFieldProps('slug')}
                error={formik.touched.slug ? formik.errors.slug : undefined}
                placeholder="hommes-tshirts"
                helperText="URL-friendly identifier (ex: hommes-chemises)"
              />
              <Select
                label="Catégorie parente"
                {...formik.getFieldProps('parentId')}
                options={mockParentCategories}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ordre d'affichage *"
                type="number"
                {...formik.getFieldProps('displayOrder')}
                error={formik.touched.displayOrder ? formik.errors.displayOrder : undefined}
                placeholder="1"
                helperText="Ordre d'affichage dans la navigation"
              />
              <Input
                label="URL de l'image"
                {...formik.getFieldProps('imageUrl')}
                error={formik.touched.imageUrl ? formik.errors.imageUrl : undefined}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...formik.getFieldProps('isActive')}
                checked={formik.values.isActive}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Catégorie active</span>
            </label>
          </CardContent>
        </Card>

        {/* Multilingual Names & Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Noms et Descriptions (Multilingue)</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              tabs={[
                {
                  id: 'fr',
                  label: 'Français',
                  content: (
                    <div className="space-y-4">
                      <Input
                        label="Nom (Français) *"
                        {...formik.getFieldProps('nameFr')}
                        error={formik.touched.nameFr ? formik.errors.nameFr : undefined}
                        placeholder="T-Shirts"
                      />
                      <TextArea
                        label="Description (Français)"
                        {...formik.getFieldProps('descriptionFr')}
                        rows={4}
                        placeholder="Description de la catégorie en français..."
                      />
                    </div>
                  ),
                },
                {
                  id: 'ar',
                  label: 'العربية',
                  content: (
                    <div className="space-y-4">
                      <Input
                        label="Nom (Arabe) *"
                        {...formik.getFieldProps('nameAr')}
                        error={formik.touched.nameAr ? formik.errors.nameAr : undefined}
                        placeholder="تي شيرت"
                        className="text-right"
                      />
                      <TextArea
                        label="Description (Arabe)"
                        {...formik.getFieldProps('descriptionAr')}
                        rows={4}
                        placeholder="وصف الفئة بالعربية..."
                        className="text-right"
                      />
                    </div>
                  ),
                },
                {
                  id: 'en',
                  label: 'English',
                  content: (
                    <div className="space-y-4">
                      <Input
                        label="Name (English)"
                        {...formik.getFieldProps('nameEn')}
                        placeholder="T-Shirts"
                      />
                      <TextArea
                        label="Description (English)"
                        {...formik.getFieldProps('descriptionEn')}
                        rows={4}
                        placeholder="Category description in English..."
                      />
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/categories')}>
            Annuler
          </Button>
          <Button type="submit" loading={formik.isSubmitting}>
            {isEditMode ? 'Enregistrer les modifications' : 'Créer la catégorie'}
          </Button>
        </div>
      </form>
    </div>
  );
};
