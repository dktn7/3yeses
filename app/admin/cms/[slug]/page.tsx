'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Globe, History, Check, ArrowLeft, Loader2, Eye, EyeOff, ExternalLink, PanelRightClose, PanelRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatAdminDate } from '@/lib/admin/formatters';

type ContentVersion = {
    id: string;
    locale: string;
    title: string;
    content: string;
    changeNote: string | null;
    createdAt: string;
    author: { name: string; email: string };
};

type PublishedInfo = {
    id: string;
    locale: string;
    versionId: string;
    version: ContentVersion;
};

type PageDetail = {
    slug: string;
    internalNote: string;
    published: PublishedInfo[];
};

const AVAILABLE_LOCALES = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];

const LOCALE_LABELS: Record<string, string> = {
    'en-gb': 'EN',
    'fr-FR': 'FR',
    'de-DE': 'DE',
    'es-ES': 'ES',
    'it-IT': 'IT',
    'pt-PT': 'PT',
    'ru-RU': 'RU',
    'ja-JP': 'JA',
    'zh-CN': 'ZH',
    'ar': 'AR',
};

export default function CMSEditorPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [page, setPage] = useState<PageDetail | null>(null);
    const [versions, setVersions] = useState<ContentVersion[]>([]);
    const [activeLocale, setActiveLocale] = useState('en-gb');

    // Form State
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [changeNote, setChangeNote] = useState('');

    // UI State
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showHistory, setShowHistory] = useState(true);

    const router = useRouter();

    // 1. Fetch Page Details
    useEffect(() => {
        if (!slug) return;
        setLoadingPage(true);
        fetch(`/api/admin/cms/pages/${slug}`)
            .then(res => res.json())
            .then(data => {
                setPage(data);
                setLoadingPage(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingPage(false);
            });
    }, [slug]);

    // 2. Fetch Versions when locale changes
    useEffect(() => {
        if (!slug) return;
        setLoadingVersions(true);
        fetch(`/api/admin/cms/pages/${slug}/versions?locale=${activeLocale}`)
            .then(res => res.json())
            .then(data => {
                setVersions(data);
                setLoadingVersions(false);

                if (data && data.length > 0) {
                    const latest = data[0];
                    setTitle(latest.title);
                    setContent(latest.content);
                } else {
                    setTitle('');
                    setContent('');
                }
            })
            .catch(err => {
                console.error(err);
                setLoadingVersions(false);
            });
    }, [slug, activeLocale]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Title and Content are required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/cms/pages/${slug}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale: activeLocale, title, content, changeNote })
            });

            if (!res.ok) throw new Error('Failed to save');

            const newVersion = await res.json();
            setVersions([newVersion, ...versions]);
            setChangeNote('');
            toast.success("Draft saved!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save draft");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (versions.length === 0) {
            toast.error("Save a version first");
            return;
        }

        const latestVersion = versions[0];
        if (latestVersion.title !== title || latestVersion.content !== content) {
            if (!confirm("You have unsaved changes. The latest SAVED version will be published. Continue?")) {
                return;
            }
        }

        if (!confirm(`Publish version from ${formatAdminDate(latestVersion.createdAt)}?`)) return;

        setPublishing(true);
        try {
            const res = await fetch(`/api/admin/cms/pages/${slug}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale: activeLocale, versionId: latestVersion.id })
            });

            if (!res.ok) throw new Error('Failed to publish');

            const pageRes = await fetch(`/api/admin/cms/pages/${slug}`);
            const pageData = await pageRes.json();
            setPage(pageData);
            toast.success("Published successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to publish");
        } finally {
            setPublishing(false);
        }
    };

    const handlePreviewInNewTab = useCallback(() => {
        try {
            sessionStorage.setItem(`cms-preview-${slug}`, JSON.stringify({ title, content }));
        } catch {
            // fallback if sessionStorage is unavailable
        }
        const pagePath = slug === 'home' ? '' : slug;
        window.open(`/${activeLocale}/${pagePath}?preview=true`, '_blank');
    }, [slug, title, content, activeLocale]);

    const loadVersion = (v: ContentVersion) => {
        if (confirm('Load this old version? Current unsaved changes will be lost.')) {
            setTitle(v.title);
            setContent(v.content);
        }
    };

    if (loadingPage || !page) {
        return (
            <div className="flex items-center justify-center h-screen text-[var(--admin-muted)]">
                <Loader2 className="animate-spin mr-2" /> Loading Editor...
            </div>
        );
    }

    const publishedVersionInfo = page.published?.find(p => p.locale === activeLocale);

    return (
        <div className="h-screen flex flex-col bg-[var(--admin-bg)] text-[var(--admin-text)] overflow-hidden">
            {/* Header */}
            <div className="flex-none p-4 pb-0 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-[var(--admin-surface)] rounded-full transition-colors text-[var(--admin-muted)] hover:text-[var(--admin-text)]">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                {page.slug}
                                <span className="text-sm font-normal text-[var(--admin-muted)] px-2 py-0.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-full uppercase">
                                    {activeLocale}
                                </span>
                                {publishedVersionInfo && (
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Live</span>
                                )}
                            </h1>
                            <p className="text-sm text-[var(--admin-muted)]">{page.internalNote}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Preview Toggle */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                                showPreview
                                    ? 'bg-[var(--admin-primary)]/10 border-[var(--admin-primary)]/30 text-[var(--admin-primary)]'
                                    : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
                            }`}
                        >
                            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showPreview ? 'Hide Preview' : 'Preview'}
                        </button>

                        {/* Preview in New Tab */}
                        <button
                            onClick={handlePreviewInNewTab}
                            className="flex items-center gap-2 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-muted)] rounded-lg text-sm font-bold hover:text-[var(--admin-text)] transition-all"
                            title="Preview in new tab"
                        >
                            <ExternalLink size={16} />
                        </button>

                        {/* History Toggle */}
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                                showHistory
                                    ? 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text)]'
                                    : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)]'
                            }`}
                            title={showHistory ? 'Hide history' : 'Show history'}
                        >
                            {showHistory ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
                        </button>

                        <div className="w-px h-8 bg-[var(--admin-border)]" />

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] rounded-lg hover:bg-[var(--admin-bg)] transition-colors disabled:opacity-50 text-sm font-bold"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg hover:opacity-90 transition-colors shadow-sm disabled:opacity-50 text-sm font-bold"
                        >
                            {publishing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                            Publish Live
                        </button>
                    </div>
                </div>

                {/* Locale Tabs */}
                <div className="flex items-center gap-0.5 border-b border-[var(--admin-border)] overflow-x-auto">
                    {AVAILABLE_LOCALES.map(l => (
                        <button
                            key={l}
                            onClick={() => setActiveLocale(l)}
                            className={`
                                px-3 py-2 text-xs font-bold transition-colors uppercase border-b-2 whitespace-nowrap
                                ${activeLocale === l
                                    ? 'border-[var(--admin-primary)] text-[var(--admin-primary)] bg-[var(--admin-surface)]/50 rounded-t-lg'
                                    : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]/30 rounded-t-lg'}
                            `}
                        >
                            {LOCALE_LABELS[l] || l}
                            {page.published?.some(p => p.locale === l) && (
                                <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex gap-4 px-4 pb-4 overflow-hidden">
                {/* Main Editor */}
                <div className={`flex flex-col admin-glass rounded-xl shadow-sm overflow-hidden border border-[var(--admin-border)] ${showPreview ? 'w-1/2' : 'flex-1'}`}>
                    <div className="p-4 space-y-3 flex-1 flex flex-col overflow-y-auto">
                        <div>
                            <label className="block text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider mb-1.5">Page Title ({LOCALE_LABELS[activeLocale] || activeLocale})</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-3 text-lg font-semibold focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent outline-none text-[var(--admin-text)]"
                                placeholder="Enter localized title..."
                            />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="block text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider mb-1.5">Content (HTML)</label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="flex-1 w-full bg-[var(--admin-bg)]/50 border border-[var(--admin-border)] rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent outline-none resize-none text-[var(--admin-text)] backdrop-blur-sm"
                                placeholder="<h1>Start typing...</h1>"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider mb-1.5">Change Note</label>
                            <input
                                type="text"
                                value={changeNote}
                                onChange={e => setChangeNote(e.target.value)}
                                className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 text-sm text-[var(--admin-text)]"
                                placeholder="What changed in this version? (Optional)"
                            />
                        </div>
                    </div>
                </div>

                {/* Live Preview Pane */}
                {showPreview && (
                    <div className="w-1/2 flex flex-col admin-glass rounded-xl shadow-sm overflow-hidden border border-[var(--admin-border)]">
                        <div className="p-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-sm flex items-center justify-between">
                            <h3 className="font-bold text-xs flex items-center gap-2 text-[var(--admin-text)] uppercase tracking-wider">
                                <Eye size={14} /> Live Preview
                            </h3>
                            <button
                                onClick={handlePreviewInNewTab}
                                className="text-[10px] font-bold text-[var(--admin-primary)] hover:opacity-80 flex items-center gap-1"
                            >
                                <ExternalLink size={12} /> Open in Tab
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                            <div className="p-6">
                                <article
                                    className="prose prose-lg dark:prose-invert max-w-none
                                        prose-headings:text-gray-900 dark:prose-headings:text-white
                                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                                        prose-strong:text-gray-900 dark:prose-strong:text-white
                                        prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                                        prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                                        prose-li:text-gray-700 dark:prose-li:text-gray-300
                                        prose-blockquote:border-blue-500
                                        prose-img:rounded-xl prose-img:shadow-lg"
                                    dangerouslySetInnerHTML={{ __html: content || '<p style="color: #999; text-align: center; padding: 2rem;">Start typing to see a preview...</p>' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar: History */}
                {showHistory && (
                    <div className="w-72 flex flex-col admin-glass rounded-xl shadow-sm overflow-hidden flex-none border border-[var(--admin-border)]">
                        <div className="p-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-sm">
                            <h3 className="font-bold text-xs flex items-center gap-2 text-[var(--admin-text)] uppercase tracking-wider">
                                <History size={14} /> Version History
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {loadingVersions ? (
                                <div className="text-center py-4 text-[var(--admin-muted)]">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={20} /> Loading...
                                </div>
                            ) : (
                                <>
                                    {publishedVersionInfo && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-wider mb-1">
                                                <Globe size={12} /> Live Version
                                            </div>
                                            <p className="text-xs text-emerald-400 mt-1">
                                                ID: {publishedVersionInfo.versionId.slice(0, 8)}...
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {versions.map(v => (
                                            <div key={v.id} className="border border-[var(--admin-border)] rounded-lg p-3 hover:bg-[var(--admin-bg)] transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] text-[var(--admin-muted)]">
                                                        {formatAdminDate(v.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}{' '}
                                                        {formatAdminDate(v.createdAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </span>
                                                    {publishedVersionInfo?.versionId === v.id && <Check size={14} className="text-emerald-500" />}
                                                </div>
                                                <p className="text-sm font-bold mt-1 truncate text-[var(--admin-text)]">{v.title}</p>
                                                {v.changeNote && <p className="text-[10px] text-[var(--admin-muted)] mt-1 italic truncate">&ldquo;{v.changeNote}&rdquo;</p>}
                                                <div className="mt-1.5 text-[10px] text-[var(--admin-muted)]">By {v.author?.name || 'Admin'}</div>

                                                <button
                                                    onClick={() => loadVersion(v)}
                                                    className="mt-2 w-full py-1 text-xs bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded opacity-0 group-hover:opacity-100 transition-opacity text-[var(--admin-text)] hover:bg-[var(--admin-surface)] font-bold"
                                                >
                                                    Load this version
                                                </button>
                                            </div>
                                        ))}
                                        {versions.length === 0 && (
                                            <div className="text-center text-sm text-[var(--admin-muted)] py-4">
                                                No versions yet.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
