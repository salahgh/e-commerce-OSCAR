import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../store/slices/uiSlice';
import {
  ActiveChannelContentDocument,
  UpdateChannelContentDocument,
} from '../../../graphql/generated/graphql';

export type PickedAsset = { id: string; preview: string };
export type SectionId = 'localized' | 'store' | 'social' | 'media';

export const LANGS = [
  { code: 'Fr', label: 'Français' },
  { code: 'Ar', label: 'العربية' },
  { code: 'En', label: 'English' },
] as const;
export type LangCode = (typeof LANGS)[number]['code'];

export type LocaleField = { base: string; label: string; textarea?: boolean };
export const LOCALE_FIELDS: LocaleField[] = [
  { base: 'promoText', label: 'Texte de la bannière promo' },
  { base: 'footerAddress', label: 'Adresse (pied de page)' },
  { base: 'reviewsTitle', label: 'Titre de la section avis' },
  { base: 'reviewsSubtitle', label: 'Sous-titre de la section avis', textarea: true },
  { base: 'copyrightText', label: 'Ligne de copyright (pied de page)' },
];

export type ScalarField = { name: string; label: string; type?: string };
export const STORE_FIELDS: ScalarField[] = [
  { name: 'freeShippingThreshold', label: 'Seuil de livraison gratuite (DZD)', type: 'number' },
  { name: 'contactEmail', label: 'E-mail de contact' },
  { name: 'contactPhone', label: 'Téléphone de contact' },
];
export const SOCIAL_FIELDS: ScalarField[] = [
  { name: 'socialFacebook', label: 'URL Facebook' },
  { name: 'socialInstagram', label: 'URL Instagram' },
  { name: 'socialTwitter', label: 'URL Twitter' },
  { name: 'socialLinkedin', label: 'URL LinkedIn' },
  { name: 'socialYoutube', label: 'URL YouTube' },
  { name: 'appAppStore', label: 'URL App Store' },
  { name: 'appGooglePlay', label: 'URL Google Play' },
];

const SECTION_LABEL: Record<SectionId, string> = {
  localized: 'Textes localisés',
  store: 'Boutique et contact',
  social: 'Réseaux sociaux et applications',
  media: 'Médias',
};

function localizedKeys(): string[] {
  const keys: string[] = [];
  for (const { base } of LOCALE_FIELDS) for (const { code } of LANGS) keys.push(`${base}${code}`);
  return keys;
}

const SECTION_KEYS: Record<'localized' | 'store' | 'social', string[]> = {
  localized: localizedKeys(),
  store: STORE_FIELDS.map((f) => f.name),
  social: SOCIAL_FIELDS.map((f) => f.name),
};

type MediaState = { hero: PickedAsset | null; banners: PickedAsset[]; reviews: PickedAsset[] };
const EMPTY_MEDIA: MediaState = { hero: null, banners: [], reviews: [] };

const idsEqual = (a: PickedAsset[], b: PickedAsset[]) =>
  a.length === b.length && a.every((x, i) => x.id === b[i].id);

export function useChannelContentForm() {
  const dispatch = useDispatch();
  const { data, loading } = useQuery(ActiveChannelContentDocument, { fetchPolicy: 'network-only' });
  const [updateChannel] = useMutation(UpdateChannelContentDocument);

  const [form, setForm] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<MediaState>(EMPTY_MEDIA);
  const [mediaBaseline, setMediaBaseline] = useState<MediaState>(EMPTY_MEDIA);
  const [savingSection, setSavingSection] = useState<SectionId | null>(null);
  const hydratedRef = useRef(false);

  const channelId = data?.activeChannel?.id ?? '';
  const cf = useMemo(
    () => (data?.activeChannel?.customFields ?? {}) as Record<string, unknown>,
    [data]
  );

  // Hydrate form + baseline once from the server response. Guarded so later
  // edits in any section are never overwritten by a re-render.
  useEffect(() => {
    if (hydratedRef.current || !data?.activeChannel) return;
    const next: Record<string, string> = {};
    for (const { base } of LOCALE_FIELDS)
      for (const { code } of LANGS) next[`${base}${code}`] = (cf[`${base}${code}`] as string) ?? '';
    for (const { name } of [...STORE_FIELDS, ...SOCIAL_FIELDS])
      next[name] = cf[name] == null ? '' : String(cf[name]);
    const m: MediaState = {
      hero: (cf.heroImage as PickedAsset) ?? null,
      banners: ((cf.bannerImages as PickedAsset[]) ?? []).map((a) => ({ id: a.id, preview: a.preview })),
      reviews: ((cf.reviewImages as PickedAsset[]) ?? []).map((a) => ({ id: a.id, preview: a.preview })),
    };
    setForm(next);
    setBaseline(next);
    setMedia(m);
    setMediaBaseline(m);
    hydratedRef.current = true;
  }, [data, cf]);

  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setHero = (hero: PickedAsset | null) => setMedia((m) => ({ ...m, hero }));
  const setBanners = (banners: PickedAsset[]) => setMedia((m) => ({ ...m, banners }));
  const setReviews = (reviews: PickedAsset[]) => setMedia((m) => ({ ...m, reviews }));

  const dirtyFor = (section: SectionId): boolean => {
    if (section === 'media') {
      return (
        (media.hero?.id ?? null) !== (mediaBaseline.hero?.id ?? null) ||
        !idsEqual(media.banners, mediaBaseline.banners) ||
        !idsEqual(media.reviews, mediaBaseline.reviews)
      );
    }
    return SECTION_KEYS[section].some((k) => (form[k] ?? '') !== (baseline[k] ?? ''));
  };

  const saveSection = async (section: SectionId) => {
    if (!channelId) return;
    setSavingSection(section);
    try {
      const customFields: Record<string, unknown> = {};
      if (section === 'localized') {
        for (const k of SECTION_KEYS.localized) customFields[k] = form[k] || null;
      } else if (section === 'store') {
        for (const { name, type } of STORE_FIELDS)
          customFields[name] =
            type === 'number' ? (form[name] ? parseInt(form[name], 10) : null) : form[name] || null;
      } else if (section === 'social') {
        for (const { name } of SOCIAL_FIELDS) customFields[name] = form[name] || null;
      } else {
        customFields.heroImageId = media.hero?.id ?? null;
        customFields.bannerImagesIds = media.banners.map((a) => a.id);
        customFields.reviewImagesIds = media.reviews.map((a) => a.id);
      }

      const res = await updateChannel({ variables: { input: { id: channelId, customFields } as any } });
      const r = res.data?.updateChannel as { errorCode?: string; message?: string } | undefined;
      if (r && 'errorCode' in r && r.errorCode) throw new Error(r.message);

      // Mark only this section clean; leave other sections' edits/baseline intact.
      if (section === 'media') {
        setMediaBaseline(media);
      } else {
        setBaseline((prev) => {
          const nextB = { ...prev };
          for (const k of SECTION_KEYS[section]) nextB[k] = form[k] ?? '';
          return nextB;
        });
      }
      dispatch(addToast({ type: 'success', message: `Section « ${SECTION_LABEL[section]} » enregistrée` }));
    } catch (e) {
      dispatch(addToast({ type: 'error', message: (e as Error).message || "Échec de l'enregistrement" }));
    } finally {
      setSavingSection(null);
    }
  };

  return {
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
  };
}
