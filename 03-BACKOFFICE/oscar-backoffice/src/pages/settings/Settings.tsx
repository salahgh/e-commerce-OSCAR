import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  ActiveChannelDocument,
  PaymentMethodsDocument,
  ShippingMethodsDocument,
  UpdatePaymentMethodDocument,
} from '../../graphql/generated/graphql';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';

export const Settings: React.FC = () => {
  const dispatch = useDispatch();

  // Queries
  const { data: channelData, loading: channelLoading } = useQuery(ActiveChannelDocument);
  const {
    data: paymentData,
    loading: paymentLoading,
    refetch: refetchPayment,
  } = useQuery(PaymentMethodsDocument);
  const { data: shippingData, loading: shippingLoading } = useQuery(ShippingMethodsDocument);

  // Mutations
  const [updatePaymentMethod] = useMutation(UpdatePaymentMethodDocument);

  const channel = channelData?.activeChannel;
  const paymentMethods = paymentData?.paymentMethods?.items || [];
  const shippingMethods = shippingData?.shippingMethods?.items || [];

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

  const getPaymentMethodLabel = (code: string) => {
    const labels: Record<string, string> = {
      'cash-on-delivery': 'Paiement à la livraison',
      'cib-payment': 'CIB (Carte Interbancaire)',
      'baridimob-payment': 'BaridiMob',
      'dummy-payment-handler': 'Mode Test',
    };
    return labels[code] || code;
  };

  const getShippingMethodLabel = (code: string) => {
    const labels: Record<string, string> = {
      'standard-shipping': 'Livraison Standard',
      'express-shipping': 'Livraison Express',
      'yalidine-shipping': 'Yalidine',
      'zr-express-shipping': 'ZR Express',
    };
    return labels[code] || code;
  };

  const tabs = [
    {
      id: 'general',
      label: 'Général',
      icon: <Store className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {channelLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : channel ? (
            <>
              {/* Channel Info */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Configuration de la Boutique
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Code du Canal</p>
                    <p className="font-medium text-foreground">{channel.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Langue par défaut</p>
                    <p className="font-medium text-foreground">{channel.defaultLanguageCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Devise</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {channel.currencyCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix TTC</p>
                    <Badge variant={channel.pricesIncludeTax ? 'success' : 'warning'}>
                      {channel.pricesIncludeTax ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Zone d'expédition</p>
                    <p className="font-medium text-foreground">
                      {channel.defaultShippingZone?.name || 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Zone fiscale</p>
                    <p className="font-medium text-foreground">
                      {channel.defaultTaxZone?.name || 'Non définie'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shop Info */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-blue-500" />
                  Informations OSCAR Fashion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom de la boutique</p>
                    <p className="font-medium text-foreground">OSCAR Fashion</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pays</p>
                    <p className="font-medium text-foreground">Algérie</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email de support</p>
                    <p className="font-medium text-foreground">support@oscarfashion.dz</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium text-foreground">+213 XX XX XX XX</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  Les paramètres avancés de la boutique peuvent être modifiés dans l'interface
                  d'administration Vendure à{' '}
                  <a
                    href="http://localhost:8086/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    localhost:8086/admin
                  </a>
                </p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Impossible de charger les paramètres</p>
          )}
        </div>
      ),
    },
    {
      id: 'payment',
      label: 'Paiement',
      icon: <CreditCard className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Méthodes de Paiement</h3>
              <p className="text-sm text-muted-foreground">
                Configurez les méthodes de paiement disponibles pour vos clients
              </p>
            </div>
          </div>

          {paymentLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune méthode de paiement configurée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-muted-foreground transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${method.enabled ? 'bg-green-900/50' : 'bg-muted'}`}
                    >
                      <CreditCard
                        className={`h-6 w-6 ${method.enabled ? 'text-green-400' : 'text-muted-foreground'}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(method.handler?.code || method.code)}
                      </p>
                      {method.description && (
                        <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={method.enabled ? 'success' : 'default'}>
                      {method.enabled ? (
                        <>
                          <Check className="h-3 w-3 mr-1" /> Activé
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" /> Désactivé
                        </>
                      )}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePaymentMethod(method.id, method.enabled)}
                    >
                      {method.enabled ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mt-6">
            <p className="text-sm text-amber-300">
              Pour ajouter de nouvelles méthodes de paiement ou modifier les configurations
              avancées, utilisez l'interface d'administration Vendure.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'shipping',
      label: 'Livraison',
      icon: <Truck className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Méthodes de Livraison</h3>
              <p className="text-sm text-muted-foreground">
                Gérez les options de livraison disponibles en Algérie
              </p>
            </div>
          </div>

          {shippingLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : shippingMethods.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune méthode de livraison configurée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shippingMethods.map((method) => {
                // Parse calculator args to get price if available
                const priceArg = method.calculator?.args?.find((arg) => arg.name === 'rate');
                const price = priceArg ? parseInt(priceArg.value, 10) : null;

                return (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-muted-foreground transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-900/50">
                        <Truck className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getShippingMethodLabel(method.code)}
                        </p>
                        {method.description && (
                          <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {price !== null && (
                        <span className="text-lg font-semibold text-foreground">
                          {formatPrice(price)}
                        </span>
                      )}
                      <Badge variant="info">{method.fulfillmentHandlerCode || 'Standard'}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Zones Info */}
          <div className="bg-muted/50 rounded-lg p-6 mt-6">
            <h4 className="font-medium text-foreground mb-4">Zones de Livraison - Algérie</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-card rounded border border-border">
                <p className="font-medium text-foreground">Zone 1 - Centre</p>
                <p className="text-muted-foreground">Alger, Blida, Tipaza, Boumerdès</p>
                <p className="text-green-400 font-medium mt-1">Livraison: 300-500 DZD</p>
              </div>
              <div className="p-3 bg-card rounded border border-border">
                <p className="font-medium text-foreground">Zone 2 - Côte</p>
                <p className="text-muted-foreground">Oran, Annaba, Jijel, Béjaïa</p>
                <p className="text-green-400 font-medium mt-1">Livraison: 400-600 DZD</p>
              </div>
              <div className="p-3 bg-card rounded border border-border">
                <p className="font-medium text-foreground">Zone 3 - Sud</p>
                <p className="text-muted-foreground">Ghardaïa, Ouargla, Tamanrasset</p>
                <p className="text-green-400 font-medium mt-1">Livraison: 600-1000 DZD</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              Les tarifs de livraison sont configurés par zone. Pour modifier les zones ou les
              tarifs, accédez à l'interface Vendure Admin.
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Configuration Email</h3>
              <p className="text-sm text-muted-foreground">
                Paramètres SMTP et modèles d'emails transactionnels
              </p>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Configuration SMTP
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Serveur SMTP</p>
                <p className="font-medium text-foreground">smtp.oscarfashion.dz</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Port</p>
                <p className="font-medium text-foreground">587 (TLS)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email d'envoi</p>
                <p className="font-medium text-foreground">noreply@oscarfashion.dz</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom d'expéditeur</p>
                <p className="font-medium text-foreground">OSCAR Fashion</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="success">
                <Check className="h-3 w-3 mr-1" />
                Connecté
              </Badge>
              <span className="text-sm text-muted-foreground">
                Dernière vérification: Aujourd'hui
              </span>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Modèles d'Email
            </h4>
            <div className="space-y-3">
              {[
                {
                  name: 'Confirmation de commande',
                  trigger: 'order-confirmation',
                  description: "Envoyé après la création d'une commande",
                },
                {
                  name: 'Commande expédiée',
                  trigger: 'order-shipped',
                  description: 'Envoyé lorsque la commande est expédiée',
                },
                {
                  name: 'Commande livrée',
                  trigger: 'order-delivered',
                  description: 'Envoyé à la livraison de la commande',
                },
                {
                  name: "Vérification d'email",
                  trigger: 'email-verification',
                  description: "Envoyé pour vérifier l'adresse email du client",
                },
                {
                  name: 'Réinitialisation du mot de passe',
                  trigger: 'password-reset',
                  description: 'Envoyé pour réinitialiser le mot de passe',
                },
                {
                  name: "Changement d'adresse email",
                  trigger: 'email-address-change',
                  description: "Envoyé lors d'un changement d'adresse email",
                },
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

          {/* Email Preview Note */}
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Configuration avancée des emails</p>
              <p className="text-sm text-amber-400 mt-1">
                Les modèles d'email sont configurés via le plugin EmailPlugin de Vendure. Pour
                modifier le contenu HTML des templates, éditez les fichiers dans le dossier{' '}
                <code className="bg-amber-800/50 px-1 rounded">static/email/templates/</code> du
                backend.
              </p>
            </div>
          </div>

          {/* Test Email Section */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-4">Tester la Configuration</h4>
            <div className="flex items-center gap-4">
              <input
                type="email"
                placeholder="Adresse email de test"
                className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button variant="primary" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Envoie un email de test pour vérifier la configuration SMTP
            </p>
          </div>
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
        <Tabs tabs={tabs} defaultTab="general" />
      </div>
    </div>
  );
};
