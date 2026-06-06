import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  CreateCustomerDocument,
  CreateCustomerAddressDocument,
  UpdateCustomerAddressDocument,
} from '../../graphql/generated/graphql';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';

// ──────────────────────────────────────────────────────────────────────────
// Create customer dialog
// ──────────────────────────────────────────────────────────────────────────

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFirstName('');
      setLastName('');
      setEmailAddress('');
      setPhoneNumber('');
      setPassword('');
    }
  }, [isOpen]);

  const [createCustomer, { loading }] = useMutation(CreateCustomerDocument);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !emailAddress.trim()) {
      dispatch(addToast({ message: 'Nom, prénom et email sont requis', type: 'error' }));
      return;
    }
    try {
      const result = await createCustomer({
        variables: {
          input: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            emailAddress: emailAddress.trim(),
            phoneNumber: phoneNumber.trim() || undefined,
          },
          password: password || undefined,
        },
      });
      const data = result.data?.createCustomer;
      if (data && '__typename' in data && data.__typename === 'EmailAddressConflictError') {
        dispatch(addToast({ message: data.message, type: 'error' }));
        return;
      }
      dispatch(addToast({ message: 'Client créé', type: 'success' }));
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau client" size="md">
      <ModalContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Prénom *</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nom *</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Email *</label>
          <Input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="bg-background border-border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Téléphone</label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+213 ..."
            className="bg-background border-border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Mot de passe (optionnel)
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Laisser vide pour envoyer un email de réinitialisation"
            className="bg-background border-border"
          />
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <PermissionGate permission="CreateCustomer" disableMode>
          <Button onClick={handleSubmit} loading={loading}>
            Créer
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Address dialog (create or edit)
// ──────────────────────────────────────────────────────────────────────────

export interface AddressFormValues {
  id?: string;
  fullName?: string | null;
  streetLine1?: string | null;
  streetLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  countryCode?: string | null;
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
  defaultBillingAddress?: boolean | null;
}

interface AddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  initial?: AddressFormValues;
  onSuccess: () => void;
}

const ALGERIA_WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
  'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
  'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',"M'Sila",'Mascara',
  'Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf',
  'Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane',
];

export const AddressDialog: React.FC<AddressDialogProps> = ({
  isOpen,
  onClose,
  customerId,
  initial,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<AddressFormValues>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial || {
          fullName: '',
          streetLine1: '',
          city: '',
          postalCode: '',
          province: '',
          countryCode: 'DZ',
          phoneNumber: '',
          defaultShippingAddress: false,
          defaultBillingAddress: false,
        }
      );
    }
  }, [isOpen, initial]);

  const [createAddress, { loading: creating }] = useMutation(CreateCustomerAddressDocument);
  const [updateAddress, { loading: updating }] = useMutation(UpdateCustomerAddressDocument);
  const loading = creating || updating;

  const handleSubmit = async () => {
    if (!form.streetLine1?.trim()) {
      dispatch(addToast({ message: 'L’adresse est requise', type: 'error' }));
      return;
    }
    try {
      if (isEdit && form.id) {
        await updateAddress({
          variables: {
            input: {
              id: form.id,
              fullName: form.fullName || undefined,
              streetLine1: form.streetLine1,
              streetLine2: form.streetLine2 || undefined,
              city: form.city || undefined,
              postalCode: form.postalCode || undefined,
              province: form.province || undefined,
              countryCode: form.countryCode || 'DZ',
              phoneNumber: form.phoneNumber || undefined,
              defaultShippingAddress: !!form.defaultShippingAddress,
              defaultBillingAddress: !!form.defaultBillingAddress,
            },
          },
        });
        dispatch(addToast({ message: 'Adresse mise à jour', type: 'success' }));
      } else {
        await createAddress({
          variables: {
            customerId,
            input: {
              fullName: form.fullName || undefined,
              streetLine1: form.streetLine1,
              streetLine2: form.streetLine2 || undefined,
              city: form.city || undefined,
              postalCode: form.postalCode || undefined,
              province: form.province || undefined,
              countryCode: form.countryCode || 'DZ',
              phoneNumber: form.phoneNumber || undefined,
              defaultShippingAddress: !!form.defaultShippingAddress,
              defaultBillingAddress: !!form.defaultBillingAddress,
            },
          },
        });
        dispatch(addToast({ message: 'Adresse ajoutée', type: 'success' }));
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier l'adresse" : 'Nouvelle adresse'}
      size="md"
    >
      <ModalContent className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Nom complet
          </label>
          <Input
            value={form.fullName || ''}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="bg-background border-border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Adresse *</label>
          <Input
            value={form.streetLine1 || ''}
            onChange={(e) => setForm({ ...form, streetLine1: e.target.value })}
            placeholder="N°, rue"
            className="bg-background border-border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Complément d'adresse
          </label>
          <Input
            value={form.streetLine2 || ''}
            onChange={(e) => setForm({ ...form, streetLine2: e.target.value })}
            className="bg-background border-border"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Ville</label>
            <Input
              value={form.city || ''}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Code postal
            </label>
            <Input
              value={form.postalCode || ''}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="bg-background border-border"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Wilaya</label>
          <select
            value={form.province || ''}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
          >
            <option value="">Sélectionner...</option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Téléphone</label>
          <Input
            value={form.phoneNumber || ''}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className="bg-background border-border"
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={!!form.defaultShippingAddress}
              onChange={(e) => setForm({ ...form, defaultShippingAddress: e.target.checked })}
              className="rounded border-border"
            />
            Livraison par défaut
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={!!form.defaultBillingAddress}
              onChange={(e) => setForm({ ...form, defaultBillingAddress: e.target.checked })}
              className="rounded border-border"
            />
            Facturation par défaut
          </label>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <PermissionGate permission="UpdateCustomer" disableMode>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>
  );
};
