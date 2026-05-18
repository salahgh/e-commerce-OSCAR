import React from 'react';
import { ColorPickerField } from './ColorPickerField';

/**
 * Renderer for FacetValue custom fields.
 *
 * Vendure lets each project extend FacetValueCustomFields with arbitrary
 * fields; OSCAR currently only declares `colorHex`. This component is the
 * one place that maps a known custom-field name to an editor, so adding a
 * new custom field (e.g. colorFamily, sortOrder) means:
 *   1. extending the OSCAR plugin config (apps/backend),
 *   2. regenerating the schema,
 *   3. adding a case to KNOWN_FIELDS below,
 *   4. routing the value through whatever calls this component.
 *
 * Unknown fields are silently ignored rather than rendered as raw JSON so a
 * partially-deployed admin doesn't surface half-supported controls.
 */

interface FacetCustomFieldsRendererProps {
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
}

type FieldDescriptor =
  | { name: 'colorHex'; type: 'color'; label: string };

const KNOWN_FIELDS: FieldDescriptor[] = [
  { name: 'colorHex', type: 'color', label: 'Couleur' },
];

export const FacetCustomFieldsRenderer: React.FC<FacetCustomFieldsRendererProps> = ({
  values,
  onChange,
  disabled,
}) => {
  if (KNOWN_FIELDS.length === 0) return null;
  return (
    <div className="space-y-3">
      {KNOWN_FIELDS.map((field) => {
        const current = values[field.name];
        if (field.type === 'color') {
          return (
            <ColorPickerField
              key={field.name}
              label={field.label}
              value={typeof current === 'string' ? current : ''}
              onChange={(v) => onChange({ ...values, [field.name]: v })}
              disabled={disabled}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
