'use client';

import { useState } from 'react';
import { Send, Users, User, Search, Loader2, CheckCircle, AlertTriangle, Eye, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function DirectEmailSender() {
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);

    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        targetRole: 'ALL',
    });

    const searchUsers = async (term: string) => {
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(term)}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
            }
        } catch {
            // ignore
        } finally {
            setSearching(false);
        }
    };

    const addUser = (user: { id: string; name: string; email: string }) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setUserSearch('');
        setSearchResults([]);
    };

    const removeUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const handleSend = async () => {
        if (!formData.subject || !formData.body) {
            toast.error('Subject and body are required');
            return;
        }
        if (mode === 'single' && selectedUsers.length === 0) {
            toast.error('Select at least one recipient');
            return;
        }

        setSending(true);
        try {
            const res = await fetch('/api/admin/communications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    recipients: mode === 'single' ? selectedUsers.map(u => u.email) : [],
                    targetRole: mode === 'bulk' ? formData.targetRole : undefined,
                    subject: formData.subject,
                    body: formData.body,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Email sent successfully');
                setSent(true);
                setTimeout(() => setSent(false), 3000);
                setFormData({ subject: '', body: '', targetRole: 'ALL' });
                setSelectedUsers([]);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to send email');
            }
        } catch {
            toast.error('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl">
            {/* Mode Toggle */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setMode('single')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                        mode === 'single'
                            ? 'bg-[var(--admin-primary)]/10 border-[var(--admin-primary)]/30 text-[var(--admin-primary)]'
                            : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
                    }`}
                >
                    <User size={16} />
                    Individual User
                </button>
                <button
                    onClick={() => setMode('bulk')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                        mode === 'bulk'
                            ? 'bg-[var(--admin-primary)]/10 border-[var(--admin-primary)]/30 text-[var(--admin-primary)]'
                            : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
                    }`}
                >
                    <Users size={16} />
                    Bulk Send
                </button>
            </div>

            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 space-y-5">
                {/* Recipients */}
                {mode === 'single' ? (
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-2">Recipients</label>
                        
                        {/* Selected users */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedUsers.map(user => (
                                    <span
                                        key={user.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-primary)]/10 border border-[var(--admin-primary)]/20 rounded-full text-xs font-bold text-[var(--admin-primary)]"
                                    >
                                        {user.name} ({user.email})
                                        <button onClick={() => removeUser(user.id)} className="hover:text-red-500 transition-colors">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* User search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-muted)]" />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => {
                                    setUserSearch(e.target.value);
                                    searchUsers(e.target.value);
                                }}
                                placeholder="Search users by name or email..."
                                className="w-full pl-9 pr-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
                            />
                            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-muted)] animate-spin" />}
                        </div>

                        {/* Search results dropdown */}
                        {searchResults.length > 0 && (
                            <div className="mt-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {searchResults.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => addUser(user)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--admin-bg)] transition-colors border-b border-[var(--admin-border)]/50 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[var(--admin-primary)]/10 flex items-center justify-center text-[var(--admin-primary)] font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--admin-text)]">{user.name}</p>
                                            <p className="text-xs text-[var(--admin-muted)]">{user.email}</p>
                                        </div>
                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">{user.role}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-2">Target Audience</label>
                        <select
                            value={formData.targetRole}
                            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Users</option>
                            <option value="TALENT">All Talent Users</option>
                            <option value="USER">All Regular Users</option>
                            <option value="ADMIN">All Admins</option>
                        </select>
                        <p className="mt-2 text-xs text-amber-500 flex items-center gap-1.5">
                            <AlertTriangle size={12} />
                            Bulk emails will be sent to all matching users. Use with caution.
                        </p>
                    </div>
                )}

                {/* Subject */}
                <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)] mb-2">Subject</label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Email subject line..."
                        className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
                    />
                </div>

                {/* Body */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-[var(--admin-muted)]">Email Body (HTML)</label>
                        <button
                            type="button"
                            onClick={() => setPreviewMode(!previewMode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--admin-border)] text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-colors"
                        >
                            {previewMode ? <><Code size={12} /> Edit HTML</> : <><Eye size={12} /> Preview Email</>}
                        </button>
                    </div>
                    {previewMode ? (
                        <div className="border border-[var(--admin-border)] rounded-lg bg-[var(--admin-bg)] overflow-hidden">
                            {/* Email client chrome */}
                            <div className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)] p-3 space-y-1.5">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[var(--admin-muted)] font-medium w-14">From:</span>
                                    <span className="text-[var(--admin-text)]">3YESES &lt;noreply@3yeses.online&gt;</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[var(--admin-muted)] font-medium w-14">To:</span>
                                    <span className="text-[var(--admin-text)]">
                                        {mode === 'single' && selectedUsers.length > 0
                                            ? selectedUsers.map(u => u.email).join(', ')
                                            : `All ${formData.targetRole.toLowerCase()} users`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[var(--admin-muted)] font-medium w-14">Subject:</span>
                                    <span className="text-[var(--admin-text)] font-semibold">{formData.subject || '(no subject)'}</span>
                                </div>
                            </div>
                            <iframe
                                srcDoc={(() => {
                                    const body = formData.body || '<p style="color:#94a3b8;">No content yet. Switch to Edit to compose your email.</p>';
                                    const year = new Date().getFullYear();
                                    const LOGO_INLINE = `<svg class="swooping-tick" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><circle class="swoop-outer" cx="24" cy="24" r="22" stroke="#2563eb" stroke-width="4" fill="transparent"/><path class="swoop-check" d="M14 24L20 30L34 16" stroke="#B91C1C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
                                    const LOGO = `data:image/svg+xml,${encodeURIComponent(LOGO_INLINE)}`;
                                    const ICON_X = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E`;
                                    const ICON_IG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'/%3E%3Cline x1='17.5' y1='6.5' x2='17.51' y2='6.5'/%3E%3C/svg%3E`;
                                    const ICON_TT = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.84 2.84 0 0 1 .84.13V9.01a6.27 6.27 0 0 0-1 .05 6.33 6.33 0 0 0-5.27 7.08 6.34 6.34 0 0 0 12.57-1.08V9.49a8.32 8.32 0 0 0 4.84 1.56V7.64a4.85 4.85 0 0 1-1.88-.95z'/%3E%3C/svg%3E`;
                                    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light dark">
<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f3f4f6;}a{color:#1d4ed8;}
@media(prefers-color-scheme:dark){.dark-bg{background-color:#020617!important;}.dark-card{background-color:#1e293b!important;}.dark-text{color:#e2e8f0!important;}.dark-heading{color:#fff!important;}.dark-subtle{color:#94a3b8!important;}.dark-blob{opacity:.08!important;}}</style></head>
<body class="dark-bg"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;" class="dark-bg"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
<tr><td style="background:#fff;padding:32px 40px 0 40px;position:relative;" class="dark-card">
<div style="position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,.12) 0%,transparent 70%);" class="dark-blob"></div>
<div style="position:absolute;top:30px;right:50px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,.10) 0%,transparent 70%);" class="dark-blob"></div>
<div style="position:absolute;bottom:0;left:-20px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,.06) 0%,transparent 70%);" class="dark-blob"></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:20px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;padding-right:14px;">${LOGO_INLINE}</td>
<td style="vertical-align:middle;"><span style="font-size:24px;font-weight:800;color:#020617;letter-spacing:-.5px;line-height:1;" class="dark-heading">3YESES</span></td>
</tr></table></td></tr></table>
<div style="height:3px;border-radius:2px;background:linear-gradient(90deg,#1d4ed8 0%,#B91C1C 100%);"></div>
</td></tr>
<tr><td style="background:#fff;padding:32px 40px 40px;color:#020617;font-size:16px;line-height:1.7;" class="dark-card dark-text">${body}</td></tr>
<tr><td style="background:#020617;padding:32px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px auto;"><tr>
<td style="padding:0 6px;"><a href="https://x.com/3yeses" style="text-decoration:none;" title="X"><img src="${ICON_X}" alt="X" width="18" height="18" style="display:inline;border:0;opacity:.7;" /></a></td>
<td style="padding:0 6px;"><a href="https://instagram.com/3yeses" style="text-decoration:none;" title="Instagram"><img src="${ICON_IG}" alt="Instagram" width="18" height="18" style="display:inline;border:0;opacity:.7;" /></a></td>
<td style="padding:0 6px;"><a href="https://tiktok.com/@3yeses" style="text-decoration:none;" title="TikTok"><img src="${ICON_TT}" alt="TikTok" width="18" height="18" style="display:inline;border:0;opacity:.7;" /></a></td>
</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr><td align="center" style="font-size:12px;">
<a href="https://3yeses.online/privacy" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Privacy</a><span style="color:#334155;">&middot;</span>
<a href="https://3yeses.online/terms" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Terms</a><span style="color:#334155;">&middot;</span>
<a href="https://3yeses.online/unsubscribe" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Unsubscribe</a><span style="color:#334155;">&middot;</span>
<a href="https://3yeses.online" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Visit 3YESES</a>
</td></tr></table>
<p style="color:#475569;margin:0;font-size:11px;text-align:center;line-height:1.6;">&copy; ${year} 3YESES. All rights reserved.</p>
</td></tr></table></td></tr></table></body></html>`;
                                })()}
                                title="Email Preview"
                                className="w-full border-0"
                                style={{ minHeight: '600px', background: '#f3f4f6' }}
                                sandbox="allow-same-origin"
                            />
                        </div>
                    ) : (
                        <textarea
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            placeholder="Write your email content here. HTML is supported..."
                            className="w-full h-64 px-4 py-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-mono text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 resize-none"
                        />
                    )}
                </div>

                {/* Send */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[var(--admin-primary)]/20"
                    >
                        {sending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : sent ? (
                            <CheckCircle size={16} />
                        ) : (
                            <Send size={16} />
                        )}
                        {sending ? 'Sending...' : sent ? 'Sent!' : mode === 'bulk' ? 'Send to All' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
}
