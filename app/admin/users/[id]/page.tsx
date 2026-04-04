'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatAdminDate, formatAdminCurrency } from '@/lib/admin/formatters';
import {
  ArrowLeft, User, Mail, Shield, Calendar, MapPin, Globe, CheckCircle, XCircle,
  CreditCard, AlertTriangle, MessageSquare, Heart, Flag, Ban, Bell, Edit, Loader2,
  Image as ImageIcon, Video, Music, FileText, Link2, Trash2, ExternalLink, Eye, X
} from 'lucide-react';
import { toast } from 'sonner';
import AdminModal from '@/components/admin/AdminModal';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: string | null;
  createdAt: string;
  settings: Record<string, unknown> | null;
  talentProfile?: {
    userId: string;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    videoUrl: string | null;
    portfolioImages: string[];
    videoUrls: string[];
    isAvailable: boolean;
    category: { id: string; name: string } | null;
    subcategory: { id: string; name: string } | null;
    portfolio: Array<{
      id: string;
      title: string;
      mediaUrl: string;
      type: string;
      thumbnail: string | null;
      description: string | null;
      likeCount: number;
      createdAt: string;
    }>;
  };
  mediaAssetsUploaded: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    mimeType: string | null;
    size: number | null;
    altText: string | null;
    folder: string | null;
    createdAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  _count: {
    comments: number;
    likes: number;
    reportsCreated: number;
    reportsReceived: number;
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ type: string; open: boolean }>({ type: '', open: false });
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: string; title: string } | null>(null);
  const [deleteMediaModal, setDeleteMediaModal] = useState<{ id: string; title: string; type: 'portfolio' | 'media' } | null>(null);
  const [mediaTab, setMediaTab] = useState<'portfolio' | 'images' | 'videos' | 'assets'>('portfolio');

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setEditForm({ name: data.user.name, email: data.user.email, role: data.user.role });
      } else {
        toast.error('User not found');
      }
    } catch {
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: actionReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setActionModal({ type: '', open: false });
        setActionReason('');
        fetchUser();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success('User updated');
        setEditModal(false);
        fetchUser();
      } else {
        toast.error('Update failed');
      }
    } catch {
      toast.error('Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteMediaModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/media/${deleteMediaModal.id}?type=${deleteMediaModal.type}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setDeleteMediaModal(null);
        fetchUser();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon size={14} />;
      case 'VIDEO': return <Video size={14} />;
      case 'AUDIO': return <Music size={14} />;
      case 'DOCUMENT': return <FileText size={14} />;
      case 'LINK': return <Link2 size={14} />;
      default: return <ImageIcon size={14} />;
    }
  };

  const isBanned = !!(user?.settings && typeof user.settings === 'object' && (user.settings as Record<string, unknown>).banned);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--admin-primary)] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--admin-muted)] text-lg">User not found</p>
        <Link href="/admin/users" className="mt-4 inline-flex items-center gap-2 text-[var(--admin-primary)] font-bold text-sm hover:opacity-80">
          <ArrowLeft size={16} /> Back to Users
        </Link>
      </div>
    );
  }

  const subscription = user.subscriptions[0] || null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/users" className="flex items-center gap-2 text-[var(--admin-muted)] hover:text-[var(--admin-text)] text-sm font-bold transition-colors">
          <ArrowLeft size={16} />
          Back to Users
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
          >
            <Edit size={14} /> Edit User
          </button>
          {!isBanned ? (
            <>
              <button
                onClick={() => setActionModal({ type: 'warn', open: true })}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm font-bold text-amber-500 hover:bg-amber-500/20 transition-all"
              >
                <AlertTriangle size={14} /> Warn
              </button>
              <button
                onClick={() => setActionModal({ type: 'ban', open: true })}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all"
              >
                <Ban size={14} /> Ban
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('unban')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all"
            >
              <CheckCircle size={14} /> Unban
            </button>
          )}
        </div>
      </div>

      {/* Banned banner */}
      {isBanned && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <Ban className="text-red-500" size={20} />
          <div>
            <p className="text-sm font-bold text-red-500">This user is banned</p>
            <p className="text-xs text-red-400">{(user.settings as Record<string, unknown>)?.banReason as string || 'No reason provided'}</p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.talentProfile?.avatarUrl ? (
              <Image
                src={user.talentProfile.avatarUrl}
                alt={user.name}
                width={96}
                height={96}
                className="rounded-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-[var(--admin-primary)]/10 flex items-center justify-center border border-[var(--admin-border)]">
                <span className="text-3xl font-black text-[var(--admin-primary)]">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-[var(--admin-text)] tracking-tight">{user.name}</h1>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                user.role === 'TALENT' ? 'bg-blue-500/10 text-blue-500' :
                'bg-[var(--admin-bg)] text-[var(--admin-muted)]'
              }`}>
                {user.role}
              </span>
              {user.emailVerified ? (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                  <XCircle size={12} /> Unverified
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <Mail size={14} />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <Calendar size={14} />
                <span>Joined {formatAdminDate(user.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              {user.talentProfile?.location && (
                <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                  <MapPin size={14} />
                  <span>{user.talentProfile.location}</span>
                </div>
              )}
              {user.talentProfile?.category && (
                <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                  <Globe size={14} />
                  <span>{user.talentProfile.category.name}</span>
                </div>
              )}
            </div>

            {user.talentProfile?.bio && (
              <p className="mt-3 text-sm text-[var(--admin-muted)] leading-relaxed line-clamp-2">{user.talentProfile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--admin-muted)] mb-1">
            <MessageSquare size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Comments</span>
          </div>
          <p className="text-2xl font-black text-[var(--admin-text)]">{user._count.comments}</p>
        </div>
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--admin-muted)] mb-1">
            <Heart size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Likes</span>
          </div>
          <p className="text-2xl font-black text-[var(--admin-text)]">{user._count.likes}</p>
        </div>
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--admin-muted)] mb-1">
            <Flag size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Reports Made</span>
          </div>
          <p className="text-2xl font-black text-[var(--admin-text)]">{user._count.reportsCreated}</p>
        </div>
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--admin-muted)] mb-1">
            <AlertTriangle size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Reports Received</span>
          </div>
          <p className="text-2xl font-black text-[var(--admin-text)]">{user._count.reportsReceived}</p>
        </div>
      </div>

      {/* Subscription & Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] flex items-center gap-2">
              <CreditCard size={14} /> Subscription
            </h2>
          </div>
          <div className="p-5">
            {subscription ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--admin-muted)]">Plan</span>
                  <span className="font-bold text-[var(--admin-text)]">{subscription.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--admin-muted)]">Status</span>
                  <span className={`font-bold ${subscription.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--admin-muted)]">Renews</span>
                    <span className="font-bold text-[var(--admin-text)]">
                      {formatAdminDate(subscription.currentPeriodEnd, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--admin-muted)] text-center py-4">No active subscription</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] flex items-center gap-2">
              <CreditCard size={14} /> Recent Payments
            </h2>
          </div>
          <div className="p-3">
            {user.payments.length > 0 ? (
              <div className="space-y-2">
                {user.payments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-[var(--admin-bg)] rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-[var(--admin-text)]">
                        {formatAdminCurrency(payment.amount / 100)}
                      </p>
                      <p className="text-xs text-[var(--admin-muted)]">
                        {formatAdminDate(payment.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                      payment.status === 'SUCCEEDED' ? 'bg-emerald-500/10 text-emerald-500' :
                      payment.status === 'FAILED' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--admin-muted)] text-center py-4">No payments</p>
            )}
          </div>
        </div>
      </div>

      {/* Media & Portfolio */}
      {user.talentProfile && (
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] flex items-center gap-2">
              <ImageIcon size={14} /> Media & Portfolio
            </h2>
          </div>

          {/* Media Tabs */}
          <div className="flex border-b border-[var(--admin-border)]">
            {(['portfolio', 'images', 'videos', 'assets'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMediaTab(tab)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  mediaTab === tab
                    ? 'text-[var(--admin-primary)] border-b-2 border-[var(--admin-primary)] bg-[var(--admin-primary)]/5'
                    : 'text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
                }`}
              >
                {tab === 'portfolio' ? `Portfolio (${user.talentProfile?.portfolio?.length || 0})` :
                 tab === 'images' ? `Legacy Images (${user.talentProfile?.portfolioImages?.length || 0})` :
                 tab === 'videos' ? `Legacy Videos (${user.talentProfile?.videoUrls?.length || 0})` :
                 `Assets (${user.mediaAssetsUploaded?.length || 0})`}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Portfolio Items Tab */}
            {mediaTab === 'portfolio' && (
              <>
                {user.talentProfile?.portfolio && user.talentProfile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {user.talentProfile.portfolio.map(item => (
                      <div key={item.id} className="group relative bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)] overflow-hidden">
                        {/* Thumbnail / Preview */}
                        <div
                          className="aspect-square relative cursor-pointer"
                          onClick={() => setMediaPreview({ url: item.mediaUrl, type: item.type, title: item.title })}
                        >
                          {(item.type === 'IMAGE' || item.thumbnail) ? (
                            <Image
                              src={item.thumbnail || item.mediaUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--admin-muted)]">
                              {getMediaIcon(item.type)}
                              <span className="text-[10px] font-bold uppercase">{item.type}</span>
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white">
                              <Eye size={16} />
                            </button>
                            <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white" onClick={e => e.stopPropagation()}>
                              <ExternalLink size={16} />
                            </a>
                            <button
                              className="p-2 bg-red-500/40 rounded-lg hover:bg-red-500/60 text-white"
                              onClick={e => { e.stopPropagation(); setDeleteMediaModal({ id: item.id, title: item.title, type: 'portfolio' }); }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-2">
                          <p className="text-xs font-bold text-[var(--admin-text)] truncate">{item.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-[var(--admin-muted)] flex items-center gap-1">
                              {getMediaIcon(item.type)} {item.type}
                            </span>
                            <span className="text-[10px] text-[var(--admin-muted)] flex items-center gap-1">
                              <Heart size={10} /> {item.likeCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--admin-muted)] text-center py-8">No portfolio items</p>
                )}
              </>
            )}

            {/* Portfolio Images Tab */}
            {mediaTab === 'images' && (
              <>
                {user.talentProfile?.portfolioImages && user.talentProfile.portfolioImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {user.talentProfile.portfolioImages.map((url, idx) => (
                      <div key={idx} className="group relative aspect-square bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)] overflow-hidden cursor-pointer"
                        onClick={() => setMediaPreview({ url, type: 'IMAGE', title: `Image ${idx + 1}` })}
                      >
                        <Image src={url} alt={`Portfolio image ${idx + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white">
                            <Eye size={16} />
                          </button>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white" onClick={e => e.stopPropagation()}>
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--admin-muted)] text-center py-8">No portfolio images</p>
                )}
              </>
            )}

            {/* Video URLs Tab */}
            {mediaTab === 'videos' && (
              <>
                {user.talentProfile?.videoUrls && user.talentProfile.videoUrls.length > 0 ? (
                  <div className="space-y-2">
                    {user.talentProfile.videoUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <Video size={16} className="text-[var(--admin-primary)] shrink-0" />
                          <span className="text-sm text-[var(--admin-text)] truncate">{url}</span>
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                    {user.talentProfile.videoUrl && (
                      <div className="flex items-center justify-between p-3 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-primary)]/20">
                        <div className="flex items-center gap-3 min-w-0">
                          <Video size={16} className="text-[var(--admin-primary)] shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[var(--admin-primary)]">Main Video</span>
                            <p className="text-sm text-[var(--admin-text)] truncate">{user.talentProfile.videoUrl}</p>
                          </div>
                        </div>
                        <a href={user.talentProfile.videoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                ) : user.talentProfile?.videoUrl ? (
                  <div className="flex items-center justify-between p-3 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-primary)]/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <Video size={16} className="text-[var(--admin-primary)] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[var(--admin-primary)]">Main Video</span>
                        <p className="text-sm text-[var(--admin-text)] truncate">{user.talentProfile.videoUrl}</p>
                      </div>
                    </div>
                    <a href={user.talentProfile.videoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--admin-muted)] text-center py-8">No videos</p>
                )}
              </>
            )}

            {/* Media Assets Tab */}
            {mediaTab === 'assets' && (
              <>
                {user.mediaAssetsUploaded && user.mediaAssetsUploaded.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {user.mediaAssetsUploaded.map(asset => (
                      <div key={asset.id} className="group relative bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)] overflow-hidden">
                        <div
                          className="aspect-square relative cursor-pointer"
                          onClick={() => setMediaPreview({ url: asset.url, type: asset.type, title: asset.filename })}
                        >
                          {asset.type === 'IMAGE' ? (
                            <Image src={asset.url} alt={asset.altText || asset.filename} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--admin-muted)]">
                              {getMediaIcon(asset.type)}
                              <span className="text-[10px] font-bold uppercase">{asset.type}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white">
                              <Eye size={16} />
                            </button>
                            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white" onClick={e => e.stopPropagation()}>
                              <ExternalLink size={16} />
                            </a>
                            <button
                              className="p-2 bg-red-500/40 rounded-lg hover:bg-red-500/60 text-white"
                              onClick={e => { e.stopPropagation(); setDeleteMediaModal({ id: asset.id, title: asset.filename, type: 'media' }); }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-bold text-[var(--admin-text)] truncate">{asset.filename}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-[var(--admin-muted)]">{asset.type}</span>
                            {asset.size && <span className="text-[10px] text-[var(--admin-muted)]">{(asset.size / 1024).toFixed(0)}KB</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--admin-muted)] text-center py-8">No media assets</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* User ID */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">User ID</span>
          <code className="text-xs font-mono text-[var(--admin-muted)] bg-[var(--admin-bg)] px-3 py-1 rounded-lg border border-[var(--admin-border)]">{user.id}</code>
        </div>
      </div>

      {/* Media Preview Modal */}
      {mediaPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setMediaPreview(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMediaPreview(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
            >
              <X size={24} />
            </button>
            <div className="bg-[var(--admin-surface)] rounded-xl overflow-hidden border border-[var(--admin-border)]">
              <div className="p-3 border-b border-[var(--admin-border)] flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--admin-text)]">{mediaPreview.title}</span>
                <a href={mediaPreview.url} target="_blank" rel="noopener noreferrer" className="text-[var(--admin-primary)] hover:opacity-80 flex items-center gap-1 text-xs font-bold">
                  <ExternalLink size={12} /> Open Original
                </a>
              </div>
              <div className="flex items-center justify-center bg-black min-h-[300px] max-h-[70vh]">
                {mediaPreview.type === 'IMAGE' ? (
                  <Image src={mediaPreview.url} alt={mediaPreview.title} width={800} height={600} className="object-contain max-h-[70vh] w-auto" />
                ) : mediaPreview.type === 'VIDEO' ? (
                  <video src={mediaPreview.url} controls className="max-h-[70vh] w-full" />
                ) : mediaPreview.type === 'AUDIO' ? (
                  <div className="p-8 flex flex-col items-center gap-4">
                    <Music size={48} className="text-[var(--admin-primary)]" />
                    <audio src={mediaPreview.url} controls className="w-full max-w-md" />
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center gap-4 text-[var(--admin-muted)]">
                    <FileText size={48} />
                    <p className="text-sm">Preview not available for this file type</p>
                    <a href={mediaPreview.url} target="_blank" rel="noopener noreferrer" className="text-[var(--admin-primary)] font-bold text-sm hover:opacity-80">Download File</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Media Confirmation */}
      <AdminModal
        isOpen={!!deleteMediaModal}
        onClose={() => setDeleteMediaModal(null)}
        title="Delete Media"
        description={`Permanently delete "${deleteMediaModal?.title || ''}"?`}
        type="danger"
        footer={
          <>
            <button onClick={() => setDeleteMediaModal(null)} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={handleDeleteMedia}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              {actionLoading && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <Trash2 className="text-red-500 shrink-0" size={20} />
          <p className="text-sm text-[var(--admin-text)]/80">
            This will permanently remove this {deleteMediaModal?.type === 'media' ? 'media asset' : 'portfolio item'} from the platform. This action cannot be undone.
          </p>
        </div>
      </AdminModal>

      {/* Action Modal (Warn/Ban) */}
      <AdminModal
        isOpen={actionModal.open}
        onClose={() => { setActionModal({ type: '', open: false }); setActionReason(''); }}
        title={actionModal.type === 'warn' ? 'Issue Warning' : actionModal.type === 'ban' ? 'Ban User' : 'User Action'}
        description={`${actionModal.type === 'warn' ? 'Send a formal warning to' : 'Permanently ban'} ${user.name}`}
        type={actionModal.type === 'ban' ? 'danger' : 'warning'}
        footer={
          <>
            <button onClick={() => { setActionModal({ type: '', open: false }); setActionReason(''); }} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={() => handleAction(actionModal.type)}
              disabled={actionLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${actionModal.type === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              {actionLoading && <Loader2 size={14} className="animate-spin" />}
              {actionModal.type === 'warn' ? 'Send Warning' : 'Ban User'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`flex items-start gap-3 p-4 rounded-lg ${actionModal.type === 'ban' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            {actionModal.type === 'ban' ? <Ban className="text-red-500 shrink-0" size={20} /> : <AlertTriangle className="text-amber-500 shrink-0" size={20} />}
            <p className="text-sm text-[var(--admin-text)]/80">
              {actionModal.type === 'ban'
                ? 'Banning this user will restrict their access to the platform. This action will be logged in the Audit Log.'
                : 'This warning will be recorded in the Audit Log. The user may be banned after repeated warnings.'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-2">Reason</label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Provide a reason for this action..."
              className="w-full h-24 px-4 py-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 resize-none"
            />
          </div>
        </div>
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit User"
        description={`Modifying profile for ${user.name}`}
        type="info"
        footer={
          <>
            <button onClick={() => setEditModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)]">Cancel</button>
            <button
              onClick={handleEditSave}
              disabled={actionLoading}
              className="px-4 py-2 bg-[var(--admin-primary)] hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              {actionLoading && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-1.5">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 appearance-none cursor-pointer"
            >
              <option value="USER">User</option>
              <option value="TALENT">Talent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
