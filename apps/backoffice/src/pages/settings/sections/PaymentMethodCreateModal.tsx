import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../store/slices/uiSlice';
import {
  CreatePaymentMethodDocument,
  PaymentMethodHandlersDocument,
  PaymentMethodCheckersDocument,
  LanguageCode,
} from '../../../graphql/generated/graphql';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal, ModalContent, ModalFooter } from '../../../components/ui/Modal';

interface ConfigArgDef {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any | null;
  label?: string | null;
}

interface ConfigOpDef {
  code: string;
  description: string;
  args: ConfigArgDef[];
}

interface PaymentMethodCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// MINIMAL create form (per Phase 1 Batch 1 spec): the operator picks a handler
// (required) and an optional eligibility checker, and edits each config arg as a
// plain text field. Arg values are prefilled with the JSON-stringified
// `defaultValue` (the wire format Vendure expects) and sent through unchanged, so
// accepting the defaults yields valid input. Typed / list / UI-component arg
// editing is deliberately deferred — see the Phase 1 Batch 1 runtime checklist (T8).
const defaultArgs = (def: ConfigOpDef | undefined): Record<string, string> =>
  Object.fromEntries(
    (def?.args ?? []).map((a) => [
      a.name,
      a.defaultValue != null ? JSON.stringify(a.defaultValue) : '',
    ])
  );

export const PaymentMethodCreateModal: React.FC<PaymentMethodCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const dispatch = useDispatch();

  const { data: handlersData, loading: handlersLoading } = useQuery(
    PaymentMethodHandlersDocument
  );
  const { data: checkersData, loading: checkersLoading } = useQuery(
    PaymentMethodCheckersDocument
  );
  const [createPaymentMethod, { loading: creating }] = useMutation(
    CreatePaymentMethodDocument
  );

  const handlers = useMemo(
    () => (handlersData?.paymentMethodHandlers ?? []) as ConfigOpDef[],
    [handlersData]
  );
  const checkers = useMemo(
    () => (checkersData?.paymentMethodEligibilityCheckers ?? []) as ConfigOpDef[],
    [checkersData]
  );
  const metaLoading = handlersLoading || checkersLoading;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [handlerCode, setHandlerCode] = useState('');
  const [handlerArgs, setHandlerArgs] = useState<Record<string, string>>({});
  const [checkerCode, setCheckerCode] = useState('');
  const [checkerArgs, setCheckerArgs] = useState<Record<string, string>>({});

  const selectedHandler = useMemo(
    () => handlers.find((h) => h.code === handlerCode),
    [handlers, handlerCode]
  );
  const selectedChecker = useMemo(
    () => checkers.find((c) => c.code === checkerCode),
    [checkers, checkerCode]
  );

  // Seed the first handler once metadata arrives. The checker stays optional
  // (defaults to "none") so the operator opts in explicitly.
  useEffect(() => {
    if (!handlerCode && handlers.length > 0) {
      setHandlerCode(handlers[0].code);
      setHandlerArgs(defaultArgs(handlers[0]));
    }
  }, [handlers, handlerCode]);

  const resetForm = () => {
    setCode('');
    setName('');
    setEnabled(true);
    setHandlerCode('');
    setHandlerArgs({});
    setCheckerCode('');
    setCheckerArgs({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSelectHandler = (nextCode: string) => {
    setHandlerCode(nextCode);
    setHandlerArgs(defaultArgs(handlers.find((h) => h.code === nextCode)));
  };

  const onSelectChecker = (nextCode: string) => {
    setCheckerCode(nextCode);
    setCheckerArgs(nextCode ? defaultArgs(checkers.find((c) => c.code === nextCode)) : {});
  };

  const buildArguments = (def: ConfigOpDef | undefined, values: Record<string, string>) =>
    (def?.args ?? []).map((a) => ({ name: a.name, value: values[a.name] ?? '' }));

  const hasMissingRequired = (def: ConfigOpDef | undefined, values: Record<string, string>) =>
    (def?.args ?? []).some((a) => a.required && !(values[a.name] ?? '').trim());

  const handleSubmit = async () => {
    if (!code.trim()) {
      dispatch(addToast({ message: 'Le code est requis', type: 'warning' }));
      return;
    }
    if (!name.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'warning' }));
      return;
    }
    if (!handlerCode) {
      dispatch(addToast({ message: 'Le gestionnaire est requis', type: 'warning' }));
      return;
    }
    if (
      hasMissingRequired(selectedHandler, handlerArgs) ||
      (checkerCode && hasMissingRequired(selectedChecker, checkerArgs))
    ) {
      dispatch(
        addToast({ message: 'Veuillez remplir tous les paramètres requis', type: 'warning' })
      );
      return;
    }
    try {
      await createPaymentMethod({
        variables: {
          input: {
            code: code.trim(),
            enabled,
            translations: [
              { languageCode: LanguageCode.Fr, name: name.trim(), description: '' },
            ],
            handler: {
              code: handlerCode,
              arguments: buildArguments(selectedHandler, handlerArgs),
            },
            ...(checkerCode
              ? {
                  checker: {
                    code: checkerCode,
                    arguments: buildArguments(selectedChecker, checkerArgs),
                  },
                }
              : {}),
          },
        },
      });
      dispatch(addToast({ message: 'Méthode de paiement créée', type: 'success' }));
      onCreated();
      handleClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const renderArgInputs = (
    def: ConfigOpDef | undefined,
    values: Record<string, string>,
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (!def || def.args.length === 0) {
      return <p className="text-sm text-muted-foreground">Aucun paramètre</p>;
    }
    return (
      <div className="space-y-3">
        {def.args.map((arg) => (
          <Input
            key={arg.name}
            label={`${arg.label || arg.name}${arg.required ? ' *' : ''}`}
            value={values[arg.name] ?? ''}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [arg.name]: e.target.value }))
            }
            placeholder={arg.type}
          />
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nouvelle méthode de paiement"
      size="lg"
    >
      <ModalContent>
        {metaLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-5">
            <Input
              label="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex. cib-paiement"
            />
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Carte CIB"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Activé</span>
            </label>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <Select
                label="Gestionnaire de paiement"
                value={handlerCode}
                onChange={(e) => onSelectHandler(e.target.value)}
                options={handlers.map((h) => ({ value: h.code, label: h.code }))}
              />
              {renderArgInputs(selectedHandler, handlerArgs, setHandlerArgs)}
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <Select
                label="Vérificateur d'éligibilité (optionnel)"
                value={checkerCode}
                onChange={(e) => onSelectChecker(e.target.value)}
                options={[
                  { value: '', label: 'Aucun (toujours éligible)' },
                  ...checkers.map((c) => ({ value: c.code, label: c.code })),
                ]}
              />
              {checkerCode
                ? renderArgInputs(selectedChecker, checkerArgs, setCheckerArgs)
                : null}
            </div>

            <p className="text-xs text-muted-foreground">
              Les paramètres sont édités en texte (format JSON). L'édition typée
              avancée sera ajoutée ultérieurement.
            </p>
          </div>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={creating}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={creating}
          disabled={creating || metaLoading}
        >
          Créer
        </Button>
      </ModalFooter>
    </Modal>
  );
};
