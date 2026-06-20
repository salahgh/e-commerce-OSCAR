'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Button, Field, Input } from '@/components/ui';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const tFields = useTranslations('auth.fields');
  const tProfile = useTranslations('auth.profile');
  const { customer, updateProfile, uploadAvatar, changePassword } = useAuth();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [avatarMsg, setAvatarMsg] = React.useState<{ intent: 'success' | 'danger'; text: string } | null>(null);
  const avatarPreview = customer?.customFields?.avatar?.preview ?? null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setAvatarMsg(null);
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
      setAvatarMsg({ intent: 'success', text: t('saved') });
    } catch (err) {
      setAvatarMsg({ intent: 'danger', text: err instanceof Error ? err.message : t('errorTitle') });
    } finally {
      setAvatarUploading(false);
    }
  }

  const [profile, setProfile] = React.useState({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    phoneNumber: customer?.phoneNumber ?? '',
  });
  const [profileSubmitting, setProfileSubmitting] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{ intent: 'success' | 'danger'; text: string } | null>(null);

  React.useEffect(() => {
    setProfile({
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      phoneNumber: customer?.phoneNumber ?? '',
    });
  }, [customer]);

  const [pwd, setPwd] = React.useState({ current: '', next: '', confirm: '' });
  const [pwdSubmitting, setPwdSubmitting] = React.useState(false);
  const [pwdMsg, setPwdMsg] = React.useState<{ intent: 'success' | 'danger'; text: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileMsg(null);
    try {
      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || undefined,
      });
      setProfileMsg({ intent: 'success', text: t('saved') });
    } catch (err) {
      setProfileMsg({ intent: 'danger', text: err instanceof Error ? err.message : t('errorTitle') });
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function submitPwd(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ intent: 'danger', text: t('errorTitle') });
      return;
    }
    setPwdSubmitting(true);
    try {
      const result = await changePassword(pwd.current, pwd.next);
      if (result.success) {
        setPwd({ current: '', next: '', confirm: '' });
        setPwdMsg({ intent: 'success', text: t('passwordChanged') });
      } else {
        setPwdMsg({ intent: 'danger', text: result.error?.message ?? t('errorTitle') });
      }
    } catch (err) {
      setPwdMsg({ intent: 'danger', text: err instanceof Error ? err.message : t('errorTitle') });
    } finally {
      setPwdSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('subtitle')}</p>
      </header>

      <section className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface-muted">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-content-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            intent="secondary"
            loading={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUploading ? t('saving') : tProfile('changeAvatar')}
          </Button>
          {avatarMsg && <Alert intent={avatarMsg.intent}>{avatarMsg.text}</Alert>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-18 font-bold text-content-strong">{tProfile('personalInfo')}</h2>
        {profileMsg && <Alert intent={profileMsg.intent} className="mb-4">{profileMsg.text}</Alert>}
        <form className="flex flex-col gap-4" onSubmit={saveProfile}>
          <Field label={tFields('email')}>
            <Input type="email" value={customer?.emailAddress ?? ''} disabled />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label={tFields('firstName')} required>
              <Input
                value={profile.firstName}
                required
                onChange={(e) => setProfile((f) => ({ ...f, firstName: e.target.value }))}
              />
            </Field>
            <Field label={tFields('lastName')} required>
              <Input
                value={profile.lastName}
                required
                onChange={(e) => setProfile((f) => ({ ...f, lastName: e.target.value }))}
              />
            </Field>
          </div>
          <Field label={tFields('phone')}>
            <Input
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => setProfile((f) => ({ ...f, phoneNumber: e.target.value }))}
            />
          </Field>
          <div>
            <Button type="submit" loading={profileSubmitting}>
              {profileSubmitting ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="mb-4 text-18 font-bold text-content-strong">{t('passwordCardTitle')}</h2>
        {pwdMsg && <Alert intent={pwdMsg.intent} className="mb-4">{pwdMsg.text}</Alert>}
        <form className="flex flex-col gap-4" onSubmit={submitPwd}>
          <Field label={tProfile('currentPassword')} required>
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={pwd.current}
              onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
            />
          </Field>
          <Field label={tProfile('newPassword')} required>
            <Input
              type="password"
              required
              autoComplete="new-password"
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
            />
          </Field>
          <Field label={tProfile('confirmNewPassword')} required>
            <Input
              type="password"
              required
              autoComplete="new-password"
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            />
          </Field>
          <div>
            <Button type="submit" loading={pwdSubmitting}>
              {pwdSubmitting ? t('changing') : t('changePassword')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
