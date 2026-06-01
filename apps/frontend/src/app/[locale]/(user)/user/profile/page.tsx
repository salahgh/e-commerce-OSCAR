'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
  CreateAddressInput,
  UpdateAddressInput,
} from '@/graphql/generated/graphql';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Shield,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  ShoppingBag,
  Calendar,
  Package,
  ChevronRight,
} from 'lucide-react';

// Algerian Wilayas list
const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra',
  'Bechar', 'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda',
  'Sidi Bel Abbes', 'Annaba', 'Guelma', 'Constantine', 'Medea', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
  'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent',
  'Ghardaia', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Beni Abbes', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
];

// Format phone for display
function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '-';
  // Remove +213 prefix if present and format
  const cleaned = phone.replace(/^\+213/, '').replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+213 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  return phone;
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Address form type
type AddressFormData = {
  fullName: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  phoneNumber: string;
  defaultShippingAddress: boolean;
  defaultBillingAddress: boolean;
};

const emptyAddressForm: AddressFormData = {
  fullName: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  province: '',
  postalCode: '',
  phoneNumber: '',
  defaultShippingAddress: false,
  defaultBillingAddress: false,
};

export default function ProfilePage() {
  const t = useTranslations('accountProfile');
  const params = useParams();
  const locale = params?.locale as string;
  const isRtl = locale === 'ar';

  const { customer, loading, updateProfile, changePassword, refetchCustomer } = useAuth();

  // Address mutations
  const [createAddress] = useCreateCustomerAddressMutation();
  const [updateAddress] = useUpdateCustomerAddressMutation();
  const [deleteAddress] = useDeleteCustomerAddressMutation();

  // Personal info state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Address management state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddressForm);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  // Initialize profile data when customer loads
  useEffect(() => {
    if (customer) {
      setProfileData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phoneNumber: customer.phoneNumber?.replace(/^\+213/, '') || '',
      });
    }
  }, [customer]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setIsUpdatingProfile(true);

    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber ? `+213${profileData.phoneNumber.replace(/\D/g, '')}` : undefined,
      });
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || t('errorUpdate'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.currentPassword) {
      setPasswordError(t('errorCurrentPasswordRequired'));
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError(t('errorNewPasswordRequired'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('errorPasswordMinLength'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError(t('errorPasswordsMismatch'));
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (result.success) {
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(result.error?.message || t('errorPasswordChange'));
      }
    } catch (err: any) {
      setPasswordError(err.message || t('errorPasswordChange'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openAddressModal = (address?: any) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({
        fullName: address.fullName || '',
        streetLine1: address.streetLine1 || '',
        streetLine2: address.streetLine2 || '',
        city: address.city || '',
        province: address.province || '',
        postalCode: address.postalCode || '',
        phoneNumber: address.phoneNumber?.replace(/^\+213/, '') || '',
        defaultShippingAddress: address.defaultShippingAddress || false,
        defaultBillingAddress: address.defaultBillingAddress || false,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        ...emptyAddressForm,
        fullName: customer ? `${customer.firstName} ${customer.lastName}` : '',
        phoneNumber: customer?.phoneNumber?.replace(/^\+213/, '') || '',
      });
    }
    setAddressError(null);
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    if (!addressForm.fullName || !addressForm.streetLine1 || !addressForm.city || !addressForm.province) {
      setAddressError(t('errorRequiredFields'));
      return;
    }

    setIsSavingAddress(true);

    try {
      const addressData = {
        fullName: addressForm.fullName,
        streetLine1: addressForm.streetLine1,
        streetLine2: addressForm.streetLine2 || undefined,
        city: addressForm.city,
        province: addressForm.province,
        postalCode: addressForm.postalCode || undefined,
        countryCode: 'DZ',
        phoneNumber: addressForm.phoneNumber ? `+213${addressForm.phoneNumber.replace(/\D/g, '')}` : undefined,
        defaultShippingAddress: addressForm.defaultShippingAddress,
        defaultBillingAddress: addressForm.defaultBillingAddress,
      };

      if (editingAddressId) {
        await updateAddress({
          variables: {
            input: {
              id: editingAddressId,
              ...addressData,
            } as UpdateAddressInput,
          },
        });
      } else {
        await createAddress({
          variables: {
            input: addressData as CreateAddressInput,
          },
        });
      }

      await refetchCustomer();
      setIsAddressModalOpen(false);
    } catch (err: any) {
      setAddressError(err.message || t('errorSaveAddress'));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(t('confirmDeleteAddress'))) {
      return;
    }

    setDeletingAddressId(addressId);

    try {
      await deleteAddress({
        variables: { id: addressId },
      });
      await refetchCustomer();
    } catch (err: any) {
      alert(err.message || t('errorDelete'));
    } finally {
      setDeletingAddressId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('notConnectedTitle')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('notConnectedDescription')}
              </p>
              <Button asChild>
                <Link href={`/${locale}/login`}>{t('loginButton')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Account Overview Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {formatPhoneDisplay(customer.phoneNumber)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('memberSince', { date: formatDate(customer.createdAt) })}
                </span>
              </div>
            </div>
            <Link href={`/${locale}/user/orders`}>
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                {t('myOrders')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" dir={isRtl ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabInformation')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabSecurity')}</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabAddresses')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('personalInfoTitle')}</CardTitle>
                  <CardDescription>
                    {t('personalInfoDescription')}
                  </CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('editButton')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profileError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              {profileSuccess && (
                <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>{t('profileUpdateSuccess')}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('firstNameLabel')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t('firstNamePlaceholder')}
                        className="pl-10"
                        value={isEditingProfile ? profileData.firstName : customer.firstName || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('lastNameLabel')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t('lastNamePlaceholder')}
                        className="pl-10"
                        value={isEditingProfile ? profileData.lastName : customer.lastName || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneLabel')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {isEditingProfile ? (
                      <>
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground font-medium border-r pr-2">
                          +213
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="5XX XX XX XX"
                          className="pl-[5.5rem]"
                          value={profileData.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                            setProfileData({ ...profileData, phoneNumber: value });
                          }}
                          maxLength={9}
                        />
                      </>
                    ) : (
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        value={formatPhoneDisplay(customer.phoneNumber)}
                        disabled
                      />
                    )}
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileData({
                          firstName: customer.firstName || '',
                          lastName: customer.lastName || '',
                          phoneNumber: customer.phoneNumber?.replace(/^\+213/, '') || '',
                        });
                      }}
                      className="flex-1"
                    >
                      {t('cancelButton')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="flex-1"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('savingButton')}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t('saveButton')}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('changePasswordTitle')}</CardTitle>
              <CardDescription>
                {t('changePasswordDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>{t('passwordChangeSuccess')}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('currentPasswordLabel')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder={t('currentPasswordPlaceholder')}
                      className="pl-10 pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('newPasswordLabel')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder={t('newPasswordPlaceholder')}
                      className="pl-10 pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('passwordMinLengthHint')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">{t('confirmNewPasswordLabel')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('confirmNewPasswordPlaceholder')}
                      className="pl-10 pr-10"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('changingPasswordButton')}
                    </>
                  ) : (
                    t('changePasswordButton')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('addressesTitle')}</CardTitle>
                  <CardDescription>
                    {t('addressesDescription')}
                  </CardDescription>
                </div>
                <Button onClick={() => openAddressModal()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addButton')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid gap-4">
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{address.fullName}</p>
                            <div className="flex gap-1">
                              {address.defaultShippingAddress && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('shippingBadge')}
                                </Badge>
                              )}
                              {address.defaultBillingAddress && (
                                <Badge variant="outline" className="text-xs">
                                  {t('billingBadge')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.streetLine1}
                            {address.streetLine2 && `, ${address.streetLine2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.province} {address.postalCode}
                          </p>
                          {address.phoneNumber && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <Phone className="inline h-3 w-3 mr-1" />
                              {formatPhoneDisplay(address.phoneNumber)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAddressModal(address)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={deletingAddressId === address.id}
                          >
                            {deletingAddressId === address.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="font-medium mb-1">{t('noAddressTitle')}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('noAddressDescription')}
                  </p>
                  <Button onClick={() => openAddressModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addAddressButton')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div className="relative bg-card border rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingAddressId ? t('editAddressTitle') : t('newAddressTitle')}
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              {addressError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{addressError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullNameLabel')}</Label>
                <Input
                  id="fullName"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetLine1">{t('streetLine1Label')}</Label>
                <Input
                  id="streetLine1"
                  value={addressForm.streetLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, streetLine1: e.target.value })}
                  placeholder={t('streetLine1Placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetLine2">{t('streetLine2Label')}</Label>
                <Input
                  id="streetLine2"
                  value={addressForm.streetLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, streetLine2: e.target.value })}
                  placeholder={t('streetLine2Placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('cityLabel')}</Label>
                  <Input
                    id="city"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder={t('cityPlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('postalCodeLabel')}</Label>
                  <Input
                    id="postalCode"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="16000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">{t('provinceLabel')}</Label>
                <select
                  id="province"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="">{t('provincePlaceholder')}</option>
                  {WILAYAS.map((wilaya, index) => (
                    <option key={wilaya} value={wilaya}>
                      {String(index + 1).padStart(2, '0')} - {wilaya}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressPhone">{t('addressPhoneLabel')}</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium border-r pr-2">
                    +213
                  </div>
                  <Input
                    id="addressPhone"
                    type="tel"
                    value={addressForm.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setAddressForm({ ...addressForm, phoneNumber: value });
                    }}
                    placeholder="5XX XX XX XX"
                    className="pl-[4.5rem]"
                    maxLength={9}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.defaultShippingAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, defaultShippingAddress: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{t('setDefaultShipping')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.defaultBillingAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, defaultBillingAddress: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{t('setDefaultBilling')}</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1"
                >
                  {t('cancelButton')}
                </Button>
                <Button type="submit" disabled={isSavingAddress} className="flex-1">
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('savingButton')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveButton')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
