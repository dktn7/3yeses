'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatAdminDate } from '@/lib/admin/formatters';
import {
  Image as ImageIcon,
  Search,
  Trash2,
  Upload,
  Globe,
  Save,
  FileText,
  Video,
  File,
  ExternalLink,
  Edit,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

/* ───────────────── Types ───────────────── */

interface ContentPage {
  slug: string;
  internalNote: string | null;
  published: {
    locale: string;
    version: { title: string; createdAt: string };
  }[];
  _count: { versions: number };
}

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  size: number;
  uploadedBy?: { name: string; email: string };
  createdAt: string;
}

interface SeoMetadata {
  id: string;
  route: string;
  title: string;
  description: string;
  keywords: string[];
}

/* ───────────────── Component ───────────────── */

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<'pages' | 'media' | 'seo'>('pages');
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [seoList, setSeoList] = useState<SeoMetadata[]>([]);
  const [editingSeo, setEditingSeo] = useState<Partial<SeoMetadata>>({});
  const [isEditingSeo, setIsEditingSeo] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'pages') {
        const res = await fetch('/api/admin/cms/pages');
        const data = await res.json();
        setPages(Array.isArray(data) ? data : []);
      } else if (activeTab === 'media') {
        const res = await fetch('/api/admin/cms/media');
        const data = await res.json();
        setAssets(data.assets || []);
      } else {
        const res = await fetch('/api/admin/cms/seo');
        const data = await res.json();
        setSeoList(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Media handlers ── */
  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await fetch(`/api/admin/cms/media/${id}`, { method: 'DELETE' });
      toast.success('Asset deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const mockAsset = {
        filename: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
        size: file.size,
        mimeType: file.type,
        folder: '/uploads',
      };
      await fetch('/api/admin/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockAsset),
      });
      toast.success('Asset uploaded');
      fetchData();
    } catch {
      toast.error('Upload failed');
    }
    e.target.value = '';
  };

  /* ── SEO handlers ── */
  const handleSaveSeo = async () => {
    if (!editingSeo.route || !editingSeo.title) {
      toast.error('Route and title are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/cms/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSeo),
      });
      if (res.ok) {
        setIsEditingSeo(false);
        setEditingSeo({});
        toast.success('SEO metadata saved');
        fetchData();
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Save failed');
    }
  };

  /* ── Helpers ── */
  const getIconForType = (type: string) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'VIDEO': return <Video className="w-8 h-8 text-red-500" />;
      case 'DOCUMENT': return <FileText className="w-8 h-8 text-red-500" />;
      default: return <File className="w-8 h-8 text-[var(--admin-muted)]" />;
    }
  };

  const filteredAssets = mediaSearch
    ? assets.filter(a => a.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
    : assets;

  const getPageStatus = (page: ContentPage) => {
    if (page.published.length > 0) return 'published';
    if (page._count.versions > 0) return 'draft';
    return 'empty';
  };

  const tabs = [
    { key: 'pages' as const, label: 'Pages', icon: FileText },
    { key: 'media' as const, label: 'Media Library', icon: ImageIcon },
    { key: 'seo' as const, label: 'SEO Manager', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">CMS Management</h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Manage site pages, media assets, and SEO metadata</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--admin-border)] pb-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]'
                  : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:border-[var(--admin-border)]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════ PAGES TAB ═══════════════ */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-[var(--admin-primary)]" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pages.map(page => {
                const status = getPageStatus(page);
                const publishedLocales = page.published.map(p => p.locale);
                const lastUpdated = page.published[0]?.version?.createdAt;

                return (
                  <div
                    key={page.slug}
                    className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 hover:shadow-lg hover:border-[var(--admin-primary)]/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                          status === 'draft' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-[var(--admin-bg)] text-[var(--admin-muted)]'
                        }`}>
                          {status === 'published' ? <CheckCircle size={18} /> :
                           status === 'draft' ? <Clock size={18} /> :
                           <AlertCircle size={18} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--admin-text)] capitalize">
                            {page.slug.replace(/-/g, ' ')}
                          </h3>
                          <p className="text-xs text-[var(--admin-muted)]">{page.internalNote || 'No description'}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                        status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                        status === 'draft' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-[var(--admin-bg)] text-[var(--admin-muted)]'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--admin-muted)] space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span>Versions:</span>
                        <span className="font-bold text-[var(--admin-text)]">{page._count.versions}</span>
                      </div>
                      {publishedLocales.length > 0 && (
                        <div className="flex justify-between">
                          <span>Published in:</span>
                          <span className="font-bold text-[var(--admin-text)]">{publishedLocales.join(', ')}</span>
                        </div>
                      )}
                      {lastUpdated && (
                        <div className="flex justify-between">
                          <span>Last updated:</span>
                          <span className="font-bold text-[var(--admin-text)]">
                            {formatAdminDate(lastUpdated, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/admin/cms/${page.slug}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                      >
                        <Edit size={14} />
                        Edit Content
                      </Link>
                      <button
                        onClick={() => window.open(`/en-gb/${page.slug === 'home' ? '' : page.slug}`, '_blank')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-xs font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
                      >
                        <ExternalLink size={14} />
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ MEDIA TAB ═══════════════ */}
      {activeTab === 'media' && (
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-muted)]" />
              <input
                type="text"
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
              />
            </div>
            <label className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-bold hover:opacity-90 cursor-pointer flex items-center gap-2 transition-all shadow-lg shadow-[var(--admin-primary)]/20">
              <Upload className="w-4 h-4" />
              Upload New
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf" />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-[var(--admin-primary)]" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="group relative bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-3 hover:shadow-md hover:border-[var(--admin-primary)]/30 transition-all">
                  <div className="aspect-square bg-[var(--admin-surface)] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {asset.type === 'IMAGE' ? (
                      <div className="w-full h-full relative">
                        <Image src={asset.url} alt={asset.filename} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
                      </div>
                    ) : (
                      getIconForType(asset.type)
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-[var(--admin-text)] truncate" title={asset.filename}>
                    {asset.filename}
                  </h3>
                  <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{(asset.size / 1024).toFixed(1)} KB</p>

                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="absolute top-2 right-2 p-1.5 bg-[var(--admin-surface)] text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {filteredAssets.length === 0 && (
                <div className="col-span-full text-center py-16 text-[var(--admin-muted)] border-2 border-dashed border-[var(--admin-border)] rounded-xl">
                  <ImageIcon className="mx-auto mb-2 opacity-30" size={40} />
                  <p className="font-medium">No media assets found</p>
                  <p className="text-xs mt-1">Upload images, videos, or documents</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ SEO TAB ═══════════════ */}
      {activeTab === 'seo' && (
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--admin-border)] flex justify-between items-center">
            <h2 className="font-bold text-lg text-[var(--admin-text)]">Page Metadata</h2>
            <button
              onClick={() => { setEditingSeo({}); setIsEditingSeo(true); }}
              className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-2 transition-all shadow-lg shadow-[var(--admin-primary)]/20"
            >
              <Plus size={16} />
              Add Page
            </button>
          </div>

          {isEditingSeo ? (
            <div className="p-6 space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Route Path</label>
                <input
                  type="text"
                  placeholder="/pricing"
                  value={editingSeo.route || ''}
                  onChange={(e) => setEditingSeo({ ...editingSeo, route: e.target.value })}
                  className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={editingSeo.title || ''}
                  onChange={(e) => setEditingSeo({ ...editingSeo, title: e.target.value })}
                  className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Meta Description</label>
                <textarea
                  value={editingSeo.description || ''}
                  onChange={(e) => setEditingSeo({ ...editingSeo, description: e.target.value })}
                  className="w-full h-24 p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={editingSeo.keywords?.join(', ') || ''}
                  onChange={(e) => setEditingSeo({ ...editingSeo, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setIsEditingSeo(false); setEditingSeo({}); }}
                  className="px-4 py-2 text-sm font-bold text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSeo}
                  className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-2 transition-all"
                >
                  <Save size={16} />
                  Save Metadata
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-[var(--admin-primary)]" size={24} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
                  <tr>
                    <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Route</th>
                    <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Title</th>
                    <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Description</th>
                    <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {seoList.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--admin-bg)]/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[var(--admin-muted)]">{item.route}</td>
                      <td className="px-6 py-4 font-bold text-[var(--admin-text)] max-w-xs truncate">{item.title}</td>
                      <td className="px-6 py-4 text-[var(--admin-muted)] max-w-xs truncate">{item.description}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditingSeo(item); setIsEditingSeo(true); }}
                          className="text-[var(--admin-primary)] hover:opacity-80 font-bold text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {seoList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-[var(--admin-muted)]">
                        <Globe className="mx-auto mb-2 opacity-30" size={40} />
                        <p className="font-medium">No SEO metadata configured</p>
                        <p className="text-xs mt-1">Add metadata for your site pages</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
