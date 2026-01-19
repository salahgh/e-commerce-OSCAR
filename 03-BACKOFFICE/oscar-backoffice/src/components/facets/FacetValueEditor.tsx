import React, { useState } from 'react';
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ColorPickerField } from './ColorPickerField';
import { LanguageCode } from '../../graphql/generated/graphql';

export interface FacetValueData {
  id?: string;
  name: string;
  code: string;
  nameEn?: string;
  nameAr?: string;
  colorHex?: string;
  isNew?: boolean;
}

export interface FacetValueEditorProps {
  value: FacetValueData;
  onChange: (value: FacetValueData) => void;
  onDelete: () => void;
  isColorFacet?: boolean;
  disabled?: boolean;
  className?: string;
}

const generateCode = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const FacetValueEditor: React.FC<FacetValueEditorProps> = ({
  value,
  onChange,
  onDelete,
  isColorFacet = false,
  disabled = false,
  className,
}) => {
  const [showTranslations, setShowTranslations] = useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  const handleNameChange = (name: string) => {
    const updates: Partial<FacetValueData> = { name };

    // Auto-generate code only if not manually edited
    if (!codeManuallyEdited && value.isNew) {
      updates.code = generateCode(name);
    }

    onChange({ ...value, ...updates });
  };

  const handleCodeChange = (code: string) => {
    setCodeManuallyEdited(true);
    onChange({ ...value, code: generateCode(code) || code });
  };

  return (
    <div
      className={cn(
        'border border-border rounded-lg p-4 bg-card',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle (for future drag-and-drop) */}
        <div className="pt-2 text-muted-foreground cursor-move hidden">
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-3">
          {/* Primary row: Name and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nom (FR) *"
              value={value.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Rouge"
              disabled={disabled}
            />
            <Input
              label="Code *"
              value={value.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Ex: rouge"
              helperText={value.isNew ? 'Auto-généré depuis le nom' : undefined}
              disabled={disabled || !value.isNew}
              className="font-mono"
            />
          </div>

          {/* Color picker for color facets */}
          {isColorFacet && (
            <ColorPickerField
              label="Couleur"
              value={value.colorHex || ''}
              onChange={(colorHex) => onChange({ ...value, colorHex })}
              disabled={disabled}
            />
          )}

          {/* Translations toggle */}
          <button
            type="button"
            onClick={() => setShowTranslations(!showTranslations)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={disabled}
          >
            {showTranslations ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Traductions
          </button>

          {/* Translations */}
          {showTranslations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
              <Input
                label="Nom (EN)"
                value={value.nameEn || ''}
                onChange={(e) => onChange({ ...value, nameEn: e.target.value })}
                placeholder="Ex: Red"
                disabled={disabled}
              />
              <Input
                label="Nom (AR)"
                value={value.nameAr || ''}
                onChange={(e) => onChange({ ...value, nameAr: e.target.value })}
                placeholder="مثال: أحمر"
                disabled={disabled}
                dir="rtl"
              />
            </div>
          )}
        </div>

        {/* Delete button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={disabled}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FacetValueEditor;
