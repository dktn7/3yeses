'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Save,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import LanguageMultiSelect from '@/components/LanguageMultiSelect';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DashboardLoading } from '@/components/dashboard/DashboardPrimitives';
import SkillsManager from '@/components/SkillsManager';
import WorkHistoryManager, { WorkHistoryItem } from '@/components/WorkHistoryManager';
import {
  DashboardActionCard,
  DashboardButton,
  DashboardField,
  DashboardHeader,
  DashboardPanel,
  DashboardStatRow,
  DashboardSurface,
  DashboardWorkspace,
  PanelHeading,
  SegmentedControl,
  StatusPill,
  inputClass,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';

type BackgroundPattern = 'none' | 'dots' | 'hatch' | 'grid' | 'noise';

interface TalentProfile {
  id: string;
  userId?: string;
  name?: string | null;
  performerTitle?: string | null;
  bio: string | null;
  location: string | null;
  experienceLevel: number | null;
  dateOfBirth: string | null;
  gender: string | null;
  genderOther: string | null;
  ethnicity: string | null;
  ethnicityOther: string | null;
  age: number | null;
  height: number | null;
  bodyType: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  skills: string[];
  featuredSkills: string[];
  workHistory: WorkHistoryItem[];
  disabilities: string[];
  disabilityOther: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  videoUrl: string | null;
  portfolioImages: string[];
  videoUrls: string[];
  socialMedia: Record<string, string>;
  categoryId: string | null;
  subcategoryId: string | null;
  languages: Array<string | { name: string; proficiency?: string }>;
  contentBackground: string | null;
}

const DEFAULT_BANNER_COLOR = '#2563eb';
const DEFAULT_BACKGROUND_COLOR = '#f8fafc';
const patterns: BackgroundPattern[] = ['none', 'dots', 'hatch', 'grid', 'noise'];

function isHexColor(value?: string | null) {
  return Boolean(value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()));
}

function parseBackgroundSurface(value?: string | null): { color: string; pattern: BackgroundPattern } {
  if (!value) return { color: DEFAULT_BACKGROUND_COLOR, pattern: 'none' };
  if (value.startsWith('pattern:')) {
    const [patternRaw, colorRaw] = value.slice('pattern:'.length).split('|');
    return {
      pattern: patterns.includes(patternRaw as BackgroundPattern) ? (patternRaw as BackgroundPattern) : 'none',
      color: isHexColor(colorRaw) ? colorRaw : DEFAULT_BACKGROUND_COLOR,
    };
  }
  return { color: isHexColor(value) ? value : DEFAULT_BACKGROUND_COLOR, pattern: 'none' };
}

function serializeBackgroundSurface(color: string, pattern: BackgroundPattern) {
  return pattern === 'none' ? color : `pattern:${pattern}|${color}`;
}

function backgroundStyle(value?: string | null) {
  const surface = parseBackgroundSurface(value);
  const overlay = surface.color.toLowerCase() === '#1e293b' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)';
  const style: Record<string, string> = { backgroundColor: surface.color };
  if (surface.pattern === 'dots') {
    style.backgroundImage = `radial-gradient(circle at 1px 1px, ${overlay} 1px, transparent 0)`;
    style.backgroundSize = '16px 16px';
  }
  if (surface.pattern === 'hatch') {
    style.backgroundImage = `repeating-linear-gradient(45deg, ${overlay} 0 1px, transparent 1px 10px)`;
  }
  if (surface.pattern === 'grid') {
    style.backgroundImage = [
      `repeating-linear-gradient(0deg, ${overlay} 0 1px, transparent 1px 18px)`,
      `repeating-linear-gradient(90deg, ${overlay} 0 1px, transparent 1px 18px)`,
    ].join(', ');
  }
  if (surface.pattern === 'noise') {
    style.backgroundImage = `linear-gradient(0deg, ${overlay}, ${overlay})`;
  }
  return style;
}

function bannerStyle(value?: string | null) {
  if (!value) return { backgroundColor: DEFAULT_BANNER_COLOR };
  if (isHexColor(value)) return { backgroundColor: value };
  if (value.startsWith('linear-gradient(') || value.startsWith('radial-gradient(')) return { backgroundImage: value };
  return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
}

function asLanguageNames(languages: TalentProfile['languages']) {
  return (languages || [])
    .map((language) => (typeof language === 'string' ? language : language?.name))
    .filter(Boolean) as string[];
}

function getDefaultProfile(): TalentProfile {
  return {
    id: '',
    bio: '',
    location: '',
    experienceLevel: 0,
    dateOfBirth: '',
    gender: '',
    genderOther: '',
    ethnicity: '',
    ethnicityOther: '',
    age: null,
    height: null,
    bodyType: '',
    eyeColor: '',
    hairColor: '',
    skills: [],
    featuredSkills: [],
    workHistory: [],
    disabilities: [],
    disabilityOther: '',
    avatarUrl: '',
    bannerUrl: DEFAULT_BANNER_COLOR,
    videoUrl: '',
    portfolioImages: [],
    videoUrls: [],
    socialMedia: {},
    categoryId: null,
    subcategoryId: null,
    languages: [],
    contentBackground: DEFAULT_BACKGROUND_COLOR,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [section, setSection] = useState<'showcase' | 'details' | 'casting' | 'media'>('showcase');

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data.data?.subcategories || []);
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/talent/profile', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const profileData = { ...getDefaultProfile(), ...(data.profile || {}) };
        profileData.languages = asLanguageNames(profileData.languages);
        profileData.bannerUrl = profileData.bannerUrl || DEFAULT_BANNER_COLOR;
        profileData.contentBackground = profileData.contentBackground || DEFAULT_BACKGROUND_COLOR;
        setProfile(profileData);
        if (profileData.categoryId) await loadSubcategories(profileData.categoryId);
      } else if (response.status === 401) {
        router.push(buildLocalizedPath(locale, '/auth/signin'));
      } else {
        setErrors({ submit: 'We couldn’t load your profile. Please try again.' });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setErrors({ submit: 'We couldn’t load your profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, [fetchProfile]);

  const updateProfile = (field: keyof TalentProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const completionItems = useMemo(() => {
    if (!profile) return [];
    return [
      { label: 'Headshot', done: Boolean(profile.avatarUrl) },
      { label: 'Banner', done: Boolean(profile.bannerUrl) },
      { label: 'Bio', done: Boolean(profile.bio && profile.bio.length >= 50) },
      { label: 'Location', done: Boolean(profile.location) },
      { label: 'Category', done: Boolean(profile.categoryId && profile.subcategoryId) },
      { label: 'Skills', done: (profile.skills || []).length >= 3 },
      { label: 'Languages', done: asLanguageNames(profile.languages).length > 0 },
      { label: 'Work', done: (profile.workHistory || []).length > 0 },
    ];
  }, [profile]);

  const completion = completionItems.length
    ? Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100)
    : 0;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile?.bio || profile.bio.length < 50) nextErrors.bio = t('bioError');
    if (!profile?.location) nextErrors.location = t('locationError');
    if (profile?.experienceLevel === null || (profile && profile.experienceLevel < 0)) nextErrors.experienceLevel = t('experienceError');
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!profile || !validateForm()) return;

    setSaving(true);
    setSuccess(false);
    setErrors({});

    try {
      const body = {
        ...profile,
        languages: asLanguageNames(profile.languages),
        featuredSkills: (profile.featuredSkills || []).filter((skill) => (profile.skills || []).includes(skill)).slice(0, 4),
      };
      const response = await fetch('/api/talent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((current) => ({ ...(current || getDefaultProfile()), ...(data.profile || body), languages: body.languages }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3200);
      } else if (response.status === 401) {
        router.push(buildLocalizedPath(locale, '/auth/signin'));
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || t('failedToUpdate') });
      }
    } catch (error) {
      setErrors({ submit: t('errorOccurred') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLoading />;

  if (!profile) return <DashboardWorkspace><DashboardHeader title="Your profile" /><DashboardPanel><p role="alert">{errors.submit || 'Your profile could not be loaded.'}</p><DashboardButton onClick={fetchProfile} className="mt-4">Try again</DashboardButton></DashboardPanel></DashboardWorkspace>;

  const surface = parseBackgroundSurface(profile.contentBackground);
  const publicProfileHref = buildLocalizedPath(locale, `/talent/${profile.userId || profile.id}`);

  return (
    <DashboardWorkspace>
      <DashboardHeader
        icon={UserRound}
        title="Your profile"
        description="Introduce yourself, show your skills, and choose how your profile appears to others."
        actions={
          <>
            <DashboardButton variant="secondary" href={publicProfileHref}>
              <Eye className="h-4 w-4" />
              View public profile
            </DashboardButton>
            <DashboardButton onClick={() => handleSubmit()} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? t('saving') : t('saveChanges')}
            </DashboardButton>
          </>
        }
        meta={
          <SegmentedControl
            value={section}
            onChange={setSection}
            options={[
              { value: 'showcase', label: 'Showcase' },
              { value: 'details', label: 'Details' },
              { value: 'casting', label: 'Casting' },
              { value: 'media', label: 'Media links' },
            ]}
          />
        }
      />

      {success && (
        <DashboardPanel compact className="bg-emerald-500/10 ring-emerald-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{t('profileUpdated')}</p>
          </div>
        </DashboardPanel>
      )}

      {errors.submit && (
        <DashboardPanel compact className="bg-red-500/10 ring-red-500/20">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">{errors.submit}</p>
        </DashboardPanel>
      )}

      <form onSubmit={handleSubmit} className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-28 lg:self-start">
          <DashboardSurface innerClassName="overflow-hidden p-0">
            <div className="h-32" style={bannerStyle(profile.bannerUrl)} />
            <div className="p-5" style={backgroundStyle(profile.contentBackground)}>
              <div className="-mt-16 flex items-end gap-4">
                <div className="rounded-[2rem] bg-white/80 p-1 shadow-[0_22px_42px_-28px_rgba(15,23,42,0.75)] dark:bg-slate-950/70">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Profile preview" width={112} height={112} unoptimized className="h-28 w-28 rounded-[1.65rem] object-cover" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[1.65rem] bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                      <ImageIcon className="h-9 w-9" />
                    </div>
                  )}
                </div>
                <StatusPill tone={completion >= 80 ? 'success' : 'warning'}>{completion}% complete</StatusPill>
              </div>
              <div className="mt-5">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {profile.name || profile.performerTitle || 'Your talent profile'}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {profile.performerTitle || 'Add a performer title'} {profile.location ? `in ${profile.location}` : ''}
                </p>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {profile.bio || 'Write a concise, useful biography that tells casting teams what you do best.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(profile.featuredSkills?.length ? profile.featuredSkills : profile.skills || []).slice(0, 4).map((skill) => (
                    <span key={skill} className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-950/40 dark:text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DashboardSurface>

          <DashboardPanel>
            <PanelHeading title="Readiness" description="The profile card gets stronger as these pieces are completed." />
            <DashboardStatRow
              items={[
                { label: 'Score', value: `${completion}%`, detail: `${completionItems.filter((item) => item.done).length}/${completionItems.length} complete` },
                { label: 'Skills', value: profile.skills?.length || 0, detail: 'Search matching' },
                { label: 'Featured', value: profile.featuredSkills?.length || 0, detail: 'Shown on cards' },
                { label: 'Media', value: (profile.portfolioImages?.length || 0) + (profile.videoUrls?.length || 0), detail: 'Linked items' },
              ]}
            />
            <div className="mt-4 grid gap-2">
              {completionItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50/75 px-3 py-2 dark:bg-slate-950/35">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                  {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-2 w-2 rounded-full bg-amber-400" />}
                </div>
              ))}
            </div>
          </DashboardPanel>
        </aside>

        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          {section === 'showcase' && (
            <>
              <DashboardPanel>
                <PanelHeading title="Profile appearance" description="Control the exact visual frame used on the public profile." />
                <div className="grid gap-5 xl:grid-cols-2">
                  <DashboardField label="Avatar upload" hint="Square images work best for talent cards and profile headers.">
                    <FileUpload
                      accept="image"
                      maxFiles={1}
                      multiple={false}
                      folder="/profiles"
                      onUploadComplete={(urls) => updateProfile('avatarUrl', urls[0] || profile.avatarUrl)}
                    />
                  </DashboardField>
                  <DashboardField label="Avatar URL">
                    <input value={profile.avatarUrl || ''} onChange={(event) => updateProfile('avatarUrl', event.target.value)} className={inputClass()} placeholder="https://..." />
                  </DashboardField>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <DashboardField label="Banner color">
                    <input
                      type="color"
                      value={isHexColor(profile.bannerUrl) ? profile.bannerUrl || DEFAULT_BANNER_COLOR : DEFAULT_BANNER_COLOR}
                      onChange={(event) => updateProfile('bannerUrl', event.target.value)}
                      className="h-14 w-full cursor-pointer rounded-2xl border border-slate-200 bg-light-surface p-2 dark:border-slate-700 dark:bg-dark-surface"
                    />
                  </DashboardField>
                  <DashboardField label="Banner image URL" hint="Paste an image URL to use a photo banner instead of a solid color.">
                    <input value={!isHexColor(profile.bannerUrl) ? profile.bannerUrl || '' : ''} onChange={(event) => updateProfile('bannerUrl', event.target.value || DEFAULT_BANNER_COLOR)} className={inputClass()} placeholder="https://..." />
                  </DashboardField>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
                  <DashboardField label="Background color">
                    <input
                      type="color"
                      value={surface.color}
                      onChange={(event) => updateProfile('contentBackground', serializeBackgroundSurface(event.target.value, surface.pattern))}
                      className="h-14 w-full cursor-pointer rounded-2xl border border-slate-200 bg-light-surface p-2 dark:border-slate-700 dark:bg-dark-surface"
                    />
                  </DashboardField>
                  <DashboardField label="Background texture">
                    <SegmentedControl
                      value={surface.pattern}
                      onChange={(value) => updateProfile('contentBackground', serializeBackgroundSurface(surface.color, value))}
                      options={patterns.map((value) => ({ value, label: value === 'none' ? 'Solid' : value }))}
                    />
                  </DashboardField>
                </div>
              </DashboardPanel>

              <DashboardPanel>
                <PanelHeading title={t('basicInfo')} description="This is the information casting teams read first." />
                <div className="grid gap-5 xl:grid-cols-2">
                  <DashboardField label="Performer title">
                    <input value={profile.performerTitle || ''} onChange={(event) => updateProfile('performerTitle', event.target.value)} className={inputClass()} placeholder="Actor, dancer, voice artist" />
                  </DashboardField>
                  <DashboardField label={t('location')} error={errors.location}>
                    <input value={profile.location || ''} onChange={(event) => updateProfile('location', event.target.value)} className={inputClass(Boolean(errors.location))} placeholder={t('locationPlaceholder')} />
                  </DashboardField>
                </div>
                <div className="mt-5">
                  <DashboardField label={t('bio')} error={errors.bio} hint={`${profile.bio?.length || 0} characters. Aim for at least 50.`}>
                    <textarea value={profile.bio || ''} onChange={(event) => updateProfile('bio', event.target.value)} rows={6} className={inputClass(Boolean(errors.bio))} placeholder={t('bioPlaceholder')} />
                  </DashboardField>
                </div>
              </DashboardPanel>
            </>
          )}

          {section === 'details' && (
            <>
              <DashboardPanel>
                <PanelHeading title={t('categoryAndSpecialty')} description="Choose where your profile appears in browse and search." />
                <div className="grid gap-5 xl:grid-cols-2">
                  <DashboardField label={t('category')}>
                    <select
                      value={profile.categoryId || ''}
                      onChange={async (event) => {
                        updateProfile('categoryId', event.target.value);
                        updateProfile('subcategoryId', '');
                        if (event.target.value) await loadSubcategories(event.target.value);
                      }}
                      className={inputClass()}
                    >
                      <option value="">{t('selectCategory')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </DashboardField>
                  <DashboardField label={t('specialty')}>
                    <select value={profile.subcategoryId || ''} onChange={(event) => updateProfile('subcategoryId', event.target.value)} disabled={!profile.categoryId} className={inputClass()}>
                      <option value="">{profile.categoryId ? t('selectSpecialty') : t('selectCategoryFirst')}</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                      ))}
                    </select>
                  </DashboardField>
                </div>
              </DashboardPanel>

              <DashboardPanel>
                <PanelHeading title={t('skillsAndExpertise')} description="Skills power search matching. Featured skills are the four that show on talent cards." />
                <SkillsManager skills={profile.skills || []} onUpdate={(skills) => updateProfile('skills', skills)} />
                {profile.skills?.length > 0 && (
                  <div className="mt-6 border-t border-slate-200/70 pt-5 dark:border-slate-800/70">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{t('featuredSkills')}</h3>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{profile.featuredSkills?.length || 0}/4</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => {
                        const selected = profile.featuredSkills?.includes(skill);
                        const canSelect = selected || (profile.featuredSkills?.length || 0) < 4;
                        return (
                          <button
                            key={skill}
                            type="button"
                            disabled={!canSelect}
                            onClick={() => updateProfile('featuredSkills', selected ? profile.featuredSkills.filter((item) => item !== skill) : [...(profile.featuredSkills || []), skill])}
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${selected ? 'bg-[color:var(--brand-primary)] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </DashboardPanel>

              <DashboardPanel>
                <PanelHeading title="Languages and credits" description="Add spoken languages and recent work so the profile has casting context." />
                <DashboardField label="Languages">
                  <LanguageMultiSelect value={asLanguageNames(profile.languages)} onChange={(languages) => updateProfile('languages', languages)} placeholder="Search or add a language" />
                </DashboardField>
                <div className="mt-6 border-t border-slate-200/70 pt-5 dark:border-slate-800/70">
                  <WorkHistoryManager items={profile.workHistory || []} onUpdate={(items) => updateProfile('workHistory', items)} />
                </div>
              </DashboardPanel>
            </>
          )}

          {section === 'casting' && (
            <DashboardPanel>
              <PanelHeading title={t('physicalCharacteristics')} description="Optional details that help casting teams filter responsibly." />
              <div className="grid gap-5 md:grid-cols-2">
                <DashboardField label={t('gender')}>
                  <select value={profile.gender || ''} onChange={(event) => updateProfile('gender', event.target.value)} className={inputClass()}>
                    <option value="">{t('selectGender')}</option>
                    <option value="male">{t('genderMale')}</option>
                    <option value="female">{t('genderFemale')}</option>
                    <option value="non-binary">{t('genderNonBinary')}</option>
                    <option value="other">{t('genderOther')}</option>
                    <option value="prefer-not-to-say">{t('genderPreferNot')}</option>
                  </select>
                </DashboardField>
                <DashboardField label={t('heightCm')}>
                  <input type="number" value={profile.height ?? ''} onChange={(event) => updateProfile('height', event.target.value ? Number(event.target.value) : null)} className={inputClass()} placeholder={t('heightPlaceholder')} />
                </DashboardField>
                <DashboardField label={t('ethnicity')}>
                  <select value={profile.ethnicity || ''} onChange={(event) => updateProfile('ethnicity', event.target.value)} className={inputClass()}>
                    <option value="">{t('selectEthnicity')}</option>
                    <option value="white">{t('ethnicityWhite')}</option>
                    <option value="black">{t('ethnicityBlack')}</option>
                    <option value="asian">{t('ethnicityAsian')}</option>
                    <option value="hispanic">{t('ethnicityHispanic')}</option>
                    <option value="middle-eastern">{t('ethnicityMiddleEastern')}</option>
                    <option value="mixed">{t('ethnicityMixed')}</option>
                    <option value="other">{t('ethnicityOther')}</option>
                  </select>
                </DashboardField>
                <DashboardField label={t('bodyType')}>
                  <select value={profile.bodyType || ''} onChange={(event) => updateProfile('bodyType', event.target.value)} className={inputClass()}>
                    <option value="">{t('selectBodyType')}</option>
                    <option value="slim">{t('bodyTypeSlim')}</option>
                    <option value="athletic">{t('bodyTypeAthletic')}</option>
                    <option value="average">{t('bodyTypeAverage')}</option>
                    <option value="muscular">{t('bodyTypeMuscular')}</option>
                    <option value="curvy">{t('bodyTypeCurvy')}</option>
                    <option value="plus-size">{t('bodyTypePlusSize')}</option>
                  </select>
                </DashboardField>
                <DashboardField label={t('eyeColor')}>
                  <input value={profile.eyeColor || ''} onChange={(event) => updateProfile('eyeColor', event.target.value)} className={inputClass()} placeholder={t('eyeColorPlaceholder')} />
                </DashboardField>
                <DashboardField label={t('hairColor')}>
                  <input value={profile.hairColor || ''} onChange={(event) => updateProfile('hairColor', event.target.value)} className={inputClass()} placeholder={t('hairColorPlaceholder')} />
                </DashboardField>
                <DashboardField label={t('yearsOfExperience')} error={errors.experienceLevel}>
                  <input type="number" min="0" value={profile.experienceLevel ?? ''} onChange={(event) => updateProfile('experienceLevel', event.target.value ? Number(event.target.value) : 0)} className={inputClass(Boolean(errors.experienceLevel))} />
                </DashboardField>
                <DashboardField label={t('dateOfBirth')}>
                  <input type="date" value={profile.dateOfBirth?.split('T')[0] || ''} onChange={(event) => updateProfile('dateOfBirth', event.target.value)} className={inputClass()} />
                </DashboardField>
              </div>
            </DashboardPanel>
          )}

          {section === 'media' && (
            <>
              <DashboardPanel>
                <PanelHeading title={t('socialMedia')} description="Connect channels that support credibility and casting decisions." />
                <div className="grid gap-5 md:grid-cols-2">
                  {['instagram', 'tiktok', 'youtube', 'twitter', 'spotify', 'website'].map((key) => (
                    <DashboardField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                      <input
                        value={profile.socialMedia?.[key] || ''}
                        onChange={(event) => updateProfile('socialMedia', { ...(profile.socialMedia || {}), [key]: event.target.value })}
                        className={inputClass()}
                        placeholder={key === 'website' ? 'https://...' : '@username or URL'}
                      />
                    </DashboardField>
                  ))}
                </div>
              </DashboardPanel>

              <DashboardPanel>
                <PanelHeading title="Media links" description="Connect your existing showreel, audio, or portfolio. Upload new work in your gallery." />
                <div className="grid gap-4">
                  <DashboardField label="Featured video URL">
                    <input value={profile.videoUrl || ''} onChange={(event) => updateProfile('videoUrl', event.target.value)} className={inputClass()} placeholder="https://..." />
                  </DashboardField>
                  <DashboardActionCard
                    icon={Upload}
                    title="Use the media studio for uploads"
                    description="Upload, edit thumbnails, delete, and organise portfolio pieces in the gallery workspace."
                    tone="accent"
                    action={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary"><Layers className="h-4 w-4" />Open gallery</DashboardButton>}
                  />
                  <DashboardActionCard
                    icon={LinkIcon}
                    title="Public links stay available"
                    description="If you already use external reel, audio, or portfolio URLs, keep them connected here alongside your uploaded work."
                  />
                </div>
              </DashboardPanel>
            </>
          )}

          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-light-surface/90 p-3 shadow-[0_22px_54px_-32px_rgba(15,23,42,0.8)] ring-1 ring-slate-950/10 backdrop-blur-xl dark:bg-dark-surface/90 dark:ring-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-[color:var(--brand-primary)]" />
              {completion}% profile readiness
            </div>
            <div className="flex flex-wrap gap-3">
              <DashboardButton variant="secondary" onClick={() => router.push(buildLocalizedPath(locale, '/dashboard/overview'))}>
                {t('cancel')}
              </DashboardButton>
              <DashboardButton type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? t('saving') : t('saveChanges')}
              </DashboardButton>
            </div>
          </div>
        </div>
      </form>
    </DashboardWorkspace>
  );
}


