import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Settings as SettingsIcon,
  CreditCard,
  Truck,
  Store,
  Globe,
  DollarSign,
  Check,
  X,
  Edit2,
  Mail,
  Server,
  FileText,
  AlertCircle,
  Users,
  Upload,
  Save,
  MapPin,
  Phone,
  Building,
  Shield,
  ChevronRight,
  Banknote,
  Smartphone,
  Wallet,
  Image,
  ExternalLink,
  TestTube,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  ActiveChannelDocument,
  PaymentMethodsDocument,
  ShippingMethodsDocument,
  UpdatePaymentMethodDocument,
  GlobalSettingsDocument,
  ShippingZonesDocument,
  AdminUsersDocument,
  UpdateShippingMethodDocument,
} from '../../graphql/generated/graphql';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';

// Store settings form schema
const StoreSettingsSchema = Yup.object().shape({
  storeName: Yup.string().required('Nom requis'),
  storeEmail: Yup.string().email('Email invalide').required('Email requis'),
  storePhone: Yup.string().required('Téléphone requis'),
  storeAddress: Yup.string(),
});

// SMTP settings form schema
const SmtpSettingsSchema = Yup.object().shape({
  smtpHost: Yup.string().required('Serveur SMTP requis'),
  smtpPort: Yup.number().required('Port requis'),
  smtpUser: Yup.string().required('Utilisateur requis'),
  smtpPassword: Yup.string(),
  fromEmail: Yup.string().email('Email invalide').required('Email requis'),
  fromName: Yup.string().required('Nom requis'),
});

export const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editingShipping, setEditingShipping] = useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // Queries
  const { data: channelData, loading: channelLoading } = useQuery(ActiveChannelDocument);
  const { data: globalData, loading: globalLoading } = useQuery(GlobalSettingsDocument);
  const {
    data: paymentData,
    loading: paymentLoading,
    refetch: refetchPayment,
  } = useQuery(PaymentMethodsDocument);
  const {
    data: shippingData,
    loading: shippingLoading,
    refetch: refetchShipping,
  } = useQuery(ShippingMethodsDocument);
  const { data: zonesData, loading: zonesLoading } = useQuery(ShippingZonesDocument);
  const { data: adminsData, loading: adminsLoading } = useQuery(AdminUsersDocument, {
    variables: { options: { take: 10 } },
  });

  // Mutations
  const [updatePaymentMethod] = useMutation(UpdatePaymentMethodDocument);
  const [updateShippingMethod] = useMutation(UpdateShippingMethodDocument);

  const channel = channelData?.activeChannel;
  const globalSettings = globalData?.globalSettings;
  const paymentMethods = paymentData?.paymentMethods?.items || [];
  const shippingMethods = shippingData?.shippingMethods?.items || [];
  const zones = zonesData?.zones?.items || [];
  const admins = adminsData?.administrators?.items || [];

  const handleTogglePaymentMethod = async (id: string, currentEnabled: boolean) => {
    try {
      await updatePaymentMethod({
        variables: {
          input: {
            id,
            enabled: !currentEnabled,
          },
        },
      });
      dispatch(
        addToast({
          message: `Méthode de paiement ${!currentEnabled ? 'activée' : 'désactivée'}`,
          type: 'success',
        })
      );
      refetchPayment();
    } catch (err) {
      dispatch(
        addToast({
          message: 'Erreur lors de la mise à jour',
          type: 'error',
        })
      );
    }
  };

  const handleUpdateShippingRate = async (id: string, newRate: number) => {
    try {
      // Find the current method to get existing name for translations
      const method = shippingMethods.find((m) => m.id === id);
      await updateShippingMethod({
        variables: {
          input: {
            id,
            translations: [
              {
                languageCode: 'fr' as any,
                name: method?.name || 'Livraison',
              },
            ],
            calculator: {
              code: 'default-shipping-calculator',
              arguments: [{ name: 'rate', value: String(newRate) }],
            },
          },
        },
      });
      dispatch(
        addToast({
          message: 'Tarif de livraison mis à jour',
          type: 'success',
        })
      );
      refetchShipping();
      setEditingShipping(null);
    } catch (err) {
      dispatch(
        addToast({
          message: 'Erreur lors de la mise à jour',
          type: 'error',
        })
      );
    }
  };

  const getPaymentMethodIcon = (code: string) => {
    const icons: Record<string, React.ReactNode> = {
      'cash-on-delivery': <Banknote className="h-6 w-6" />,
      'cib-payment': <CreditCard className="h-6 w-6" />,
      'baridimob-payment': <Smartphone className="h-6 w-6" />,
      'dummy-payment-handler': <TestTube className="h-6 w-6" />,
    };
    return icons[code] || <Wallet className="h-6 w-6" />;
  };

  const getPaymentMethodLabel = (code: string) => {
    const labels: Record<string, string> = {
      'cash-on-delivery': 'Paiement à la livraison (COD)',
      'cib-payment': 'CIB (Carte Interbancaire)',
      'baridimob-payment': 'BaridiMob',
      'dummy-payment-handler': 'Mode Test',
    };
    return labels[code] || code;
  };

  const getPaymentMethodDescription = (code: string) => {
    const descriptions: Record<string, string> = {
      'cash-on-delivery': 'Le client paie en espèces à la réception de sa commande',
      'cib-payment': 'Paiement par carte bancaire CIB/EDAHABIA via la plateforme SATIM',
      'baridimob-payment': 'Paiement mobile via l\'application BaridiMob d\'Algérie Poste',
      'dummy-payment-handler': 'Méthode de test pour le développement',
    };
    return descriptions[code] || '';
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress) {
      dispatch(addToast({ message: 'Veuillez entrer une adresse email', type: 'warning' }));
      return;
    }
    // Simulate sending test email
    dispatch(addToast({ message: `Email de test envoyé à ${testEmailAddress}`, type: 'success' }));
    setTestEmailAddress('');
  };

  const tabs = [
    {
      id: 'store',
      label: 'Boutique',
      icon: <Store className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {channelLoading || globalLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Store Information Form */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Informations de la Boutique
                </h3>
                <Formik
                  initialValues={{
                    storeName: 'OSCAR Fashion',
                    storeEmail: 'contact@oscarfashion.dz',
                    storePhone: '+213 XX XX XX XX',
                    storeAddress: 'Alger, Algérie',
                  }}
                  validationSchema={StoreSettingsSchema}
                  onSubmit={(values) => {
                    dispatch(addToast({ message: 'Paramètres sauvegardés', type: 'success' }));
                  }}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Nom de la boutique
                          </label>
                          <Field
                            name="storeName"
                            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                          {errors.storeName && touched.storeName && (
                            <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Email de contact
                          </label>
                          <Field
                            name="storeEmail"
                            type="email"
                            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                          {errors.storeEmail && touched.storeEmail && (
                            <p className="text-red-500 text-sm mt-1">{errors.storeEmail}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Téléphone
                          </label>
                          <Field
                            name="storePhone"
                            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                          {errors.storePhone && touched.storePhone && (
                            <p className="text-red-500 text-sm mt-1">{errors.storePhone}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Adresse
                          </label>
                          <Field
                            name="storeAddress"
                            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="primary" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </Form>
                  )}
                </Formik>
              </div>

              {/* Logo Upload */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Image className="h-5 w-5 text-purple-500" />
                  Logo de la Boutique
                </h3>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-card border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-3xl mx-auto">
                        O
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Téléchargez le logo de votre boutique. Formats acceptés: PNG, JPG, SVG. Taille
                      recommandée: 200x200 pixels.
                    </p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Changer le logo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Channel Settings */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  Configuration du Canal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Devise par défaut</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {channel?.currencyCode || 'DZD'} - Dinar Algérien
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Langue par défaut</p>
                    <p className="font-medium text-foreground">
                      {channel?.defaultLanguageCode === 'fr' ? 'Français' : channel?.defaultLanguageCode || 'Français'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix TTC</p>
                    <Badge variant={channel?.pricesIncludeTax ? 'success' : 'warning'}>
                      {channel?.pricesIncludeTax ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Suivi des stocks</p>
                    <Badge variant={globalSettings?.trackInventory ? 'success' : 'warning'}>
                      {globalSettings?.trackInventory ? 'Activé' : 'Désactivé'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seuil rupture de stock</p>
                    <p className="font-medium text-foreground">
                      {globalSettings?.outOfStockThreshold || 0} unités
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Langues disponibles</p>
                    <p className="font-medium text-foreground">
                      {globalSettings?.availableLanguages?.join(', ') || 'fr, ar'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'shipping',
      label: 'Livraison',
      icon: <Truck className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Shipping Zones */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Zones de Livraison
            </h3>
            {zonesLoading ? (
              <Spinner size="md" />
            ) : zones.length === 0 ? (
              <p className="text-muted-foreground">Aucune zone configurée</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone) => (
                  <div key={zone.id} className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">{zone.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {zone.members?.slice(0, 5).map((member) => (
                        <Badge key={member.id} variant="info" className="text-xs">
                          {member.name}
                        </Badge>
                      ))}
                      {(zone.members?.length || 0) > 5 && (
                        <Badge variant="default" className="text-xs">
                          +{(zone.members?.length || 0) - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Methods */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              Méthodes de Livraison
            </h3>
            {shippingLoading ? (
              <Spinner size="md" />
            ) : shippingMethods.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune méthode de livraison configurée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const priceArg = method.calculator?.args?.find((arg) => arg.name === 'rate');
                  const price = priceArg ? parseInt(priceArg.value, 10) : 0;

                  return (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-900/50">
                          <Truck className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.description || method.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {editingShipping === method.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={price / 100}
                              className="w-24 px-3 py-1 bg-card border border-border rounded text-foreground"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateShippingRate(
                                    method.id,
                                    parseFloat((e.target as HTMLInputElement).value) * 100
                                  );
                                }
                              }}
                            />
                            <span className="text-muted-foreground">DA</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingShipping(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-lg font-semibold text-foreground">
                              {formatPrice(price)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingShipping(method.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shipping Rates Info */}
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Configuration avancée</p>
              <p className="text-sm text-amber-400 mt-1">
                Pour configurer des tarifs par zone ou par poids, utilisez l'interface Vendure Admin.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'payment',
      label: 'Paiement',
      icon: <CreditCard className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Méthodes de Paiement</h3>
              <p className="text-sm text-muted-foreground">
                Activez ou désactivez les méthodes de paiement disponibles
              </p>
            </div>
          </div>

          {paymentLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const handlerCode = method.handler?.code || method.code;
                return (
                  <div
                    key={method.id}
                    className={`p-6 rounded-lg border-2 transition-colors ${
                      method.enabled
                        ? 'bg-card border-green-600/50'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            method.enabled ? 'bg-green-900/50 text-green-400' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {getPaymentMethodIcon(handlerCode)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{method.name}</h4>
                            <Badge variant={method.enabled ? 'success' : 'default'}>
                              {method.enabled ? 'Activé' : 'Désactivé'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getPaymentMethodLabel(handlerCode)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {getPaymentMethodDescription(handlerCode)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={method.enabled ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleTogglePaymentMethod(method.id, method.enabled)}
                        >
                          {method.enabled ? (
                            <>
                              <X className="h-4 w-4 mr-1" /> Désactiver
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Activer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Payment method specific settings */}
                    {method.enabled && handlerCode === 'cib-payment' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-medium text-foreground mb-3">Configuration CIB</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Terminal ID</p>
                            <p className="font-medium text-foreground">••••••1234</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Merchant ID</p>
                            <p className="font-medium text-foreground">OSCAR_MER_001</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {method.enabled && handlerCode === 'baridimob-payment' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-medium text-foreground mb-3">
                          Configuration BaridiMob
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Compte marchand</p>
                            <p className="font-medium text-foreground">oscar_merchant@poste.dz</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Statut</p>
                            <Badge variant="success">Vérifié</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {method.enabled && handlerCode === 'cash-on-delivery' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-medium text-foreground mb-3">
                          Paramètres COD
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Montant max</p>
                            <p className="font-medium text-foreground">50,000 DA</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Frais supplémentaires</p>
                            <p className="font-medium text-foreground">0 DA</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              Pour configurer les clés API et les paramètres avancés de paiement, utilisez
              l'interface Vendure Admin.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* SMTP Configuration */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Configuration SMTP
            </h3>
            <Formik
              initialValues={{
                smtpHost: 'smtp.oscarfashion.dz',
                smtpPort: 587,
                smtpUser: 'noreply@oscarfashion.dz',
                smtpPassword: '',
                fromEmail: 'noreply@oscarfashion.dz',
                fromName: 'OSCAR Fashion',
              }}
              validationSchema={SmtpSettingsSchema}
              onSubmit={(values) => {
                dispatch(addToast({ message: 'Configuration SMTP sauvegardée', type: 'success' }));
              }}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Serveur SMTP
                      </label>
                      <Field
                        name="smtpHost"
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Port
                      </label>
                      <Field
                        name="smtpPort"
                        type="number"
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Utilisateur SMTP
                      </label>
                      <Field
                        name="smtpUser"
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Mot de passe
                      </label>
                      <Field
                        name="smtpPassword"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Email d'envoi
                      </label>
                      <Field
                        name="fromEmail"
                        type="email"
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Nom d'expéditeur
                      </label>
                      <Field
                        name="fromName"
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button type="submit" variant="primary" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Badge variant="success">
                      <Check className="h-3 w-3 mr-1" />
                      Connecté
                    </Badge>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Email Templates */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Modèles d'Email
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Confirmation de commande', trigger: 'order-confirmation', description: 'Envoyé après la création d\'une commande' },
                { name: 'Commande expédiée', trigger: 'order-shipped', description: 'Envoyé lorsque la commande est expédiée' },
                { name: 'Commande livrée', trigger: 'order-delivered', description: 'Envoyé à la livraison' },
                { name: 'Vérification email', trigger: 'email-verification', description: 'Vérification de l\'adresse email' },
                { name: 'Réinitialisation mot de passe', trigger: 'password-reset', description: 'Réinitialisation du mot de passe' },
              ].map((template) => (
                <div
                  key={template.trigger}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-purple-900/50">
                      <Mail className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <Badge variant="info">{template.trigger}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Test Email */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-4">Tester la Configuration</h4>
            <div className="flex items-center gap-4">
              <input
                type="email"
                placeholder="Adresse email de test"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button variant="primary" size="sm" onClick={handleSendTestEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un test
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'users',
      label: 'Administrateurs',
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Administrateurs</h3>
              <p className="text-sm text-muted-foreground">
                Gérez les comptes administrateurs et leurs permissions
              </p>
            </div>
            <Link to="/users">
              <Button variant="primary" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Gestion complète
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {adminsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-3">
              {admins.slice(0, 5).map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {admin.firstName?.[0]}{admin.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {admin.firstName} {admin.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{admin.emailAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-1">
                      {admin.user?.roles?.slice(0, 2).map((role) => (
                        <Badge key={role.id} variant="info" className="text-xs">
                          {role.code}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={admin.user?.verified ? 'success' : 'warning'}>
                      {admin.user?.verified ? 'Actif' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/users"
            className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            <Shield className="h-5 w-5" />
            <span>Voir tous les administrateurs et gérer les rôles</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configuration de la boutique OSCAR Fashion</p>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow">
        <Tabs tabs={tabs} defaultTab="store" />
      </div>
    </div>
  );
};
