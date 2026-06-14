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
    setHero,
    setBanners,
    setReviews,
    dirtyFor,
    saveSection,
    savingSection,
  } = useChannelContentForm();

  const [activeLang, setActiveLang] = useState<LangCode>('Fr');
  const [picker, setPicker] = useState<null | 'hero' | 'banners' | 'reviews'>(null);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Localized text */}
      <SettingsSection
        title="Localized text"
        description="Storefront copy shown per language (French, Arabic, English)."
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
                <TextArea rows={2} value={form[key] ?? ''} onChange={(e) => setField(key, e.target.value)} />
              ) : (
                <Input value={form[key] ?? ''} onChange={(e) => setField(key, e.target.value)} />
              )}
            </div>
          );
        })}
      </SettingsSection>

      {/* Store & contact */}
      <SettingsSection
        title="Store & contact"
        description="Free-shipping threshold and customer contact details."
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
        title="Social & app links"
        description="Social media profiles and mobile app store links."
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
        title="Media"
        description="Hero image, marketing banners, and review carousel images."
        dirty={dirtyFor('media')}
        saving={savingSection === 'media'}
        onSave={() => saveSection('media')}
      >
        <ImageField
          label="Hero image"
          assets={media.hero ? [media.hero] : []}
          onPick={() => setPicker('hero')}
          onClear={() => setHero(null)}
        />
        <ImageField
          label="Marketing banners"
          assets={media.banners}
          onPick={() => setPicker('banners')}
          onClear={() => setBanners([])}
        />
        <ImageField
          label="Review carousel images"
          assets={media.reviews}
          onPick={() => setPicker('reviews')}
          onClear={() => setReviews([])}
        />
      </SettingsSection>

      <AssetPickerModal
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        multiple={picker !== 'hero'}
        selectedIds={
          picker === 'hero'
            ? media.hero
              ? [media.hero.id]
              : []
            : picker === 'banners'
              ? media.banners.map((a) => a.id)
              : media.reviews.map((a) => a.id)
        }
        onSelect={(assets) => {
          const picked = assets.map((a) => ({ id: a.id, preview: a.preview }));
          if (picker === 'hero') setHero(picked[0] ?? null);
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
            Choose
          </Button>
          {assets.length > 0 && (
            <Button type="button" variant="secondary" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {assets.length === 0 ? (
          <span className="text-sm text-muted-foreground">No image selected</span>
        ) : (
          assets.map((a) => (
            <img key={a.id} src={a.preview} alt="" className="h-20 w-20 rounded border object-cover" />
          ))
        )}
      </div>
    </div>
  );
}
