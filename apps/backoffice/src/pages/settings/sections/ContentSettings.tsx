import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { AssetPickerModal } from '../../../components/ui/AssetPickerModal';
import { SettingsSection } from './SettingsSection';
import {
  useChannelContentForm,
  LANGS,
  LOCALE_FIELDS,
  STORE_FIELDS,
  SOCIAL_FIELDS,
  type PickedAsset,
  type LangCode,
} from './useChannelContentForm';

export const ContentSettings: React.FC = () => {
  const {
    loading,
    form,
    setField,
    media,
    setHeroes,
    setBanners,
    setReviews,
    dirtyFor,
    saveSection,
    savingSection,
  } = useChannelContentForm();

  const [activeLang, setActiveLang] = useState<LangCode>('Fr');
  const [picker, setPicker] = useState<null | 'hero' | 'banners' | 'reviews'>(null);
  const localizedDir = activeLang === 'Ar' ? 'rtl' : 'ltr';

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Localized text */}
      <SettingsSection
        title="Textes localisés"
        description="Textes de la boutique affichés par langue (français, arabe, anglais)."
        dirty={dirtyFor('localized')}
        saving={savingSection === 'localized'}
        onSave={() => saveSection('localized')}
      >
        <div className="flex gap-2 border-b border-border">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-2 text-sm ${
                activeLang === l.code
                  ? 'border-b-2 border-primary font-semibold text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {LOCALE_FIELDS.map(({ base, label, textarea }) => {
          const key = `${base}${activeLang}`;
          return (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-foreground">{label}</label>
              {textarea ? (
                <TextArea
                  rows={2}
                  dir={localizedDir}
                  value={form[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                />
              ) : (
                <Input
                  dir={localizedDir}
                  value={form[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </SettingsSection>

      {/* Store & contact */}
      <SettingsSection
        title="Boutique et contact"
        description="Seuil de livraison gratuite et coordonnées de contact."
        dirty={dirtyFor('store')}
        saving={savingSection === 'store'}
        onSave={() => saveSection('store')}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STORE_FIELDS.map(({ name, label, type }) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium text-foreground">{label}</label>
              <Input
                type={type ?? 'text'}
                value={form[name] ?? ''}
                onChange={(e) => setField(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Social & app links */}
      <SettingsSection
        title="Réseaux sociaux et applications"
        description="Profils de réseaux sociaux et liens des applications mobiles."
        dirty={dirtyFor('social')}
        saving={savingSection === 'social'}
        onSave={() => saveSection('social')}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SOCIAL_FIELDS.map(({ name, label, type }) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium text-foreground">{label}</label>
              <Input
                type={type ?? 'text'}
                value={form[name] ?? ''}
                onChange={(e) => setField(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Media */}
      <SettingsSection
        title="Médias"
        description="Image principale, bannières marketing et images du carrousel d'avis."
        dirty={dirtyFor('media')}
        saving={savingSection === 'media'}
        onSave={() => saveSection('media')}
      >
        <ImageField
          label="Images principales"
          assets={media.heroes}
          onPick={() => setPicker('hero')}
          onClear={() => setHeroes([])}
        />
        <ImageField
          label="Bannières marketing"
          assets={media.banners}
          onPick={() => setPicker('banners')}
          onClear={() => setBanners([])}
        />
        <ImageField
          label="Images du carrousel d'avis"
          assets={media.reviews}
          onPick={() => setPicker('reviews')}
          onClear={() => setReviews([])}
        />
      </SettingsSection>

      <AssetPickerModal
        key={picker ?? 'none'}
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        multiple
        selectedIds={
          picker === 'hero'
            ? media.heroes.map((a) => a.id)
            : picker === 'banners'
              ? media.banners.map((a) => a.id)
              : media.reviews.map((a) => a.id)
        }
        onSelect={(assets) => {
          const picked = assets.map((a) => ({ id: a.id, preview: a.preview }));
          if (picker === 'hero') setHeroes(picked);
          else if (picker === 'banners') setBanners(picked);
          else if (picker === 'reviews') setReviews(picked);
          setPicker(null);
        }}
      />
    </div>
  );
};

function ImageField({
  label,
  assets,
  onPick,
  onClear,
}: {
  label: string;
  assets: PickedAsset[];
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onPick}>
            Choisir
          </Button>
          {assets.length > 0 && (
            <Button type="button" variant="secondary" onClick={onClear}>
              Effacer
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {assets.length === 0 ? (
          <span className="text-sm text-muted-foreground">Aucune image sélectionnée</span>
        ) : (
          assets.map((a) => (
            <img key={a.id} src={a.preview} alt="" className="h-20 w-20 rounded border object-cover" />
          ))
        )}
      </div>
    </div>
  );
}
