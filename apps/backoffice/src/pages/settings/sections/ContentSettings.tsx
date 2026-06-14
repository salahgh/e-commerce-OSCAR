import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../store/slices/uiSlice';
import {
  ActiveChannelContentDocument,
  UpdateChannelContentDocument,
} from '../../../graphql/generated/graphql';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { AssetPickerModal } from '../../../components/ui/AssetPickerModal';

type PickedAsset = { id: string; preview: string };

const LANGS = [
  { code: 'Fr', label: 'Français' },
  { code: 'Ar', label: 'العربية' },
  { code: 'En', label: 'English' },
] as const;

// base name -> input label; rendered once per active language as `${base}${lang}`
const LOCALE_FIELDS: { base: string; label: string; textarea?: boolean }[] = [
  { base: 'promoText', label: 'Promo banner text' },
  { base: 'footerAddress', label: 'Footer address' },
  { base: 'reviewsTitle', label: 'Reviews section title' },
  { base: 'reviewsSubtitle', label: 'Reviews section subtitle', textarea: true },
  { base: 'copyrightText', label: 'Footer copyright line' },
];

const SCALAR_FIELDS: { name: string; label: string; type?: string }[] = [
  { name: 'freeShippingThreshold', label: 'Free shipping threshold (DZD)', type: 'number' },
  { name: 'contactEmail', label: 'Contact email' },
  { name: 'contactPhone', label: 'Contact phone' },
  { name: 'socialFacebook', label: 'Facebook URL' },
  { name: 'socialInstagram', label: 'Instagram URL' },
  { name: 'socialTwitter', label: 'Twitter URL' },
  { name: 'socialLinkedin', label: 'LinkedIn URL' },
  { name: 'socialYoutube', label: 'YouTube URL' },
  { name: 'appAppStore', label: 'App Store URL' },
  { name: 'appGooglePlay', label: 'Google Play URL' },
];

export const ContentSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading } = useQuery(ActiveChannelContentDocument, { fetchPolicy: 'network-only' });
  const [updateChannel, { loading: saving }] = useMutation(UpdateChannelContentDocument);

  const [form, setForm] = useState<Record<string, string>>({});
  const [hero, setHero] = useState<PickedAsset | null>(null);
  const [banners, setBanners] = useState<PickedAsset[]>([]);
  const [reviews, setReviews] = useState<PickedAsset[]>([]);
  const [activeLang, setActiveLang] = useState<(typeof LANGS)[number]['code']>('Fr');
  const [picker, setPicker] = useState<null | 'hero' | 'banners' | 'reviews'>(null);

  const channelId = data?.activeChannel?.id ?? '';
  const cf = useMemo(() => (data?.activeChannel?.customFields ?? {}) as Record<string, unknown>, [data]);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const { base } of LOCALE_FIELDS) {
      for (const { code } of LANGS) next[`${base}${code}`] = (cf[`${base}${code}`] as string) ?? '';
    }
    for (const { name } of SCALAR_FIELDS) next[name] = cf[name] == null ? '' : String(cf[name]);
    setForm(next);
    setHero((cf.heroImage as PickedAsset) ?? null);
    setBanners(((cf.bannerImages as PickedAsset[]) ?? []).map((a) => ({ id: a.id, preview: a.preview })));
    setReviews(((cf.reviewImages as PickedAsset[]) ?? []).map((a) => ({ id: a.id, preview: a.preview })));
  }, [cf]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      const customFields: Record<string, unknown> = {};
      for (const { base } of LOCALE_FIELDS)
        for (const { code } of LANGS) customFields[`${base}${code}`] = form[`${base}${code}`] || null;
      for (const { name, type } of SCALAR_FIELDS) {
        customFields[name] =
          type === 'number' ? (form[name] ? parseInt(form[name], 10) : null) : form[name] || null;
      }
      customFields.heroImageId = hero?.id ?? null;
      customFields.bannerImagesIds = banners.map((a) => a.id);
      customFields.reviewImagesIds = reviews.map((a) => a.id);

      const res = await updateChannel({ variables: { input: { id: channelId, customFields } as any } });
      const r = res.data?.updateChannel as { errorCode?: string; message?: string } | undefined;
      if (r && 'errorCode' in r && r.errorCode) throw new Error(r.message);
      dispatch(addToast({ type: 'success', message: 'Site content saved' }));
    } catch (e) {
      dispatch(addToast({ type: 'error', message: (e as Error).message || 'Save failed' }));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Localized text */}
      <section className="space-y-4">
        <div className="flex gap-2 border-b border-gray-200">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-2 text-sm ${activeLang === l.code ? 'border-b-2 border-gray-900 font-semibold' : 'text-gray-500'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {LOCALE_FIELDS.map(({ base, label, textarea }) => {
          const key = `${base}${activeLang}`;
          return (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              {textarea ? (
                <textarea
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  rows={2}
                  value={form[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                />
              ) : (
                <Input value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} />
              )}
            </div>
          );
        })}
      </section>

      {/* Scalars / URLs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SCALAR_FIELDS.map(({ name, label, type }) => (
          <div key={name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <Input type={type ?? 'text'} value={form[name] ?? ''} onChange={(e) => set(name, e.target.value)} />
          </div>
        ))}
      </section>

      {/* Images */}
      <section className="space-y-4">
        <ImageField label="Hero image" assets={hero ? [hero] : []} onPick={() => setPicker('hero')} onClear={() => setHero(null)} />
        <ImageField label="Marketing banners" assets={banners} onPick={() => setPicker('banners')} onClear={() => setBanners([])} />
        <ImageField label="Review carousel images" assets={reviews} onPick={() => setPicker('reviews')} onClear={() => setReviews([])} />
      </section>

      <Button onClick={save} loading={saving}>Save</Button>

      <AssetPickerModal
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        multiple={picker !== 'hero'}
        selectedIds={
          picker === 'hero' ? (hero ? [hero.id] : []) : picker === 'banners' ? banners.map((a) => a.id) : reviews.map((a) => a.id)
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
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onPick}>Choose</Button>
          {assets.length > 0 && (
            <Button type="button" variant="secondary" onClick={onClear}>Clear</Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {assets.length === 0 ? (
          <span className="text-sm text-gray-400">No image selected</span>
        ) : (
          assets.map((a) => (
            <img key={a.id} src={a.preview} alt="" className="h-20 w-20 rounded border object-cover" />
          ))
        )}
      </div>
    </div>
  );
}
