import React from 'react';
import { Card, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface SettingsSectionProps {
  title: string;
  description?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  dirty,
  saving,
  onSave,
  children,
}) => {
  return (
    <Card>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <CardContent className="space-y-4">{children}</CardContent>
      <CardFooter className="flex items-center justify-end gap-3">
        {dirty && (
          <span className="text-sm text-muted-foreground">Modifications non enregistrées</span>
        )}
        <Button onClick={onSave} loading={saving} disabled={!dirty || saving}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
};
