'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Eye, Save, X, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

type EmailTemplate = {
    id: string;
    name: string;
    subject: string;
    preheaderText?: string | null;
    body: string;
    variables: string[];
    lastUpdated: string;
};

export default function EmailTemplateManager() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState<Partial<EmailTemplate>>({
        id: '',
        name: '',
        subject: '',
        preheaderText: '',
        body: '',
        variables: []
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/communications/templates');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("Failed to load templates", error);
            toast.error("Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setFormData({ ...template });
        setPreviewMode(false);
    };

    const handleCreate = () => {
        setEditingTemplate({ id: '', name: '', subject: '', preheaderText: '', body: '', variables: [], lastUpdated: '' });
        setFormData({ id: '', name: '', subject: '', preheaderText: '', body: '', variables: [] });
        setPreviewMode(false);
    };

    const handleView = (template: EmailTemplate) => {
        setViewingTemplate(template);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            const res = await fetch(`/api/admin/communications/templates/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setTemplates(templates.filter(t => t.id !== id));
                toast.success("Template deleted");
            } else {
                toast.error("Failed to delete template");
            }
        } catch (error) {
            console.error("Error deleting template", error);
        }
    };

    const handleSave = async () => {
        if (!formData.id || !formData.name || !formData.subject || !formData.body) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const isNew = !templates.find(t => t.id === formData.id);
            const url = isNew 
                ? '/api/admin/communications/templates' 
                : `/api/admin/communications/templates/${formData.id}`;
            
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Template ${isNew ? 'created' : 'updated'}`);
                fetchTemplates();
                setEditingTemplate(null);
            } else {
                toast.error("Failed to save template");
            }
        } catch (error) {
            console.error("Error saving template", error);
            toast.error("Error saving template");
        }
    };

    const getPreviewContent = () => {
        return getMockContent(formData.body || '', formData.variables || []);
    };

    const getTemplatePreheader = (template: EmailTemplate | null) => {
        if (!template) return '';
        const raw = template.preheaderText || '';
        return getMockContent(raw, template.variables || []);
    };

    // Shared mock-data substitution for any template
    const getMockContent = (body: string, variables: string[]) => {
        let content = body;
        const mockData: Record<string, string> = {
            '{{verificationUrl}}': 'https://3yeses.online/verify?token=abc123',
            '{{resetUrl}}': 'https://3yeses.online/reset?token=abc123',
            '{{name}}': 'Jane Doe',
            '{{email}}': 'jane@example.com',
            '{{dashboardUrl}}': 'https://3yeses.online/dashboard',
            '{{childName}}': 'Alex Smith',
            '{{parentEmail}}': 'parent@example.com',
            '{{consentUrl}}': 'https://3yeses.online/consent?token=abc123',
            '{{renewalDate}}': new Date(Date.now() + 180 * 86400000).toLocaleDateString(),
            '{{expiryDate}}': new Date(Date.now() + 14 * 86400000).toLocaleDateString(),
            '{{billingUrl}}': 'https://3yeses.online/billing',
            '{{actorName}}': 'Casting Team',
            '{{activitySummary}}': 'Your profile received new views and a portfolio comment today.',
            '{{activityUrl}}': 'https://3yeses.online/dashboard',
            '{{profileUrl}}': 'https://3yeses.online/profile/jane-doe',
            '{{reason}}': 'Violation of community guidelines',
            '{{termsUrl}}': 'https://3yeses.online/terms',
            '{{contactUrl}}': 'https://3yeses.online/contact',
            '{{amount}}': '£10.00',
            '{{currency}}': 'GBP',
            '{{invoiceDate}}': new Date().toLocaleDateString(),
            '{{invoiceUrl}}': 'https://3yeses.online/billing/invoices/inv_123',
            '{{viewCount}}': '47',
            '{{period}}': 'week',
            '{{itemTitle}}': 'My Acting Showreel 2025',
            '{{likeCount}}': '12',
            '{{lastActiveDate}}': new Date(Date.now() - 30 * 86400000).toLocaleDateString(),
            '{{resubscribeUrl}}': 'https://3yeses.online/pricing',
            '{{endDate}}': new Date(Date.now() + 14 * 86400000).toLocaleDateString(),
            '{{nextRenewalDate}}': new Date(Date.now() + 180 * 86400000).toLocaleDateString(),
        };
        variables.forEach(variable => {
            const key = variable.startsWith('{{') ? variable : `{{${variable}}}`;
            const mockValue = mockData[key] || `[${variable.replace(/\{\{|\}\}/g, '')}]`;
            content = content.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), mockValue);
        });
        return content;
    };

    // 3YESES logo: prefer classed inline SVG so preview picks up global CSS; keep data-URI fallback
    const LOGO_INLINE = `<svg class="swooping-tick" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 48 48" fill="none"><circle class="swoop-outer" cx="24" cy="24" r="22" stroke="#2563eb" stroke-width="4" fill="transparent"/><path class="swoop-check" d="M14 24L20 30L34 16" stroke="#B91C1C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
    const LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(LOGO_INLINE)}`;

    // Social icon SVG data URIs
    const ICON_X = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E`;
    const ICON_IG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'/%3E%3Cline x1='17.5' y1='6.5' x2='17.51' y2='6.5'/%3E%3C/svg%3E`;
    const ICON_TT = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.84 2.84 0 0 1 .84.13V9.01a6.27 6.27 0 0 0-1 .05 6.33 6.33 0 0 0-5.27 7.08 6.34 6.34 0 0 0 12.57-1.08V9.49a8.32 8.32 0 0 0 4.84 1.56V7.64a4.85 4.85 0 0 1-1.88-.95z'/%3E%3C/svg%3E`;

    // Build the branded email HTML wrapper (matches emailWrapper.ts design)
    const buildWrappedHtml = (innerContent: string, subject: string) => {
        const year = new Date().getFullYear();
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${subject}</title>
    <style>
        body { margin:0; padding:0; font-family:'Avenir Next','Segoe UI','Helvetica Neue',Arial,sans-serif; background-color:#eef2ff; background-image:radial-gradient(circle at 15% 15%,rgba(29,78,216,0.12),transparent 35%),radial-gradient(circle at 85% 85%,rgba(239,68,68,0.08),transparent 35%); }
    a { color:#1d4ed8; }
    @media (prefers-color-scheme: dark) {
      .dark-bg   { background-color: #020617 !important; }
      .dark-card  { background-color: #1e293b !important; }
            .dark-shell { background-color: #0b1224 !important; }
      .dark-text  { color: #e2e8f0 !important; }
      .dark-heading { color: #ffffff !important; }
      .dark-subtle { color: #94a3b8 !important; }
      .dark-border { border-color: #1e293b !important; }
      .dark-blob  { opacity: 0.08 !important; }
    }
  </style>
</head>
<body class="dark-bg">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2ff;background-image:radial-gradient(circle at 15% 15%,rgba(29,78,216,0.12),transparent 35%),radial-gradient(circle at 85% 85%,rgba(239,68,68,0.08),transparent 35%);" class="dark-bg">
    <tr>
      <td align="center" style="padding:40px 16px;">
                                    <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:rgba(255,255,255,0.55);border:1px solid rgba(15,23,42,0.10);border-radius:22px;padding:8px;box-shadow:0 24px 70px rgba(15,23,42,0.16);" class="dark-shell dark-border">
                    <tr>
                        <td>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;border:1px solid rgba(15,23,42,0.08);background:#ffffff;" class="dark-card dark-border">
          <!-- Brand Bar -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 0 40px;position:relative;" class="dark-card">
              <div style="position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,0.12) 0%,transparent 70%);" class="dark-blob"></div>
              <div style="position:absolute;top:30px;right:50px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,0.10) 0%,transparent 70%);" class="dark-blob"></div>
              <div style="position:absolute;bottom:0;left:-20px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,0.06) 0%,transparent 70%);" class="dark-blob"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                                                <td style="vertical-align:middle;padding-right:14px;">
                                                    ${LOGO_INLINE}
                                                </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:24px;font-weight:800;color:#020617;letter-spacing:-0.5px;line-height:1;" class="dark-heading">3YESES</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                                    <td align="right" style="padding-bottom:20px;">
                                        <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Member Communication</span>
                                    </td>
                </tr>
              </table>
              <div style="height:3px;border-radius:2px;background:linear-gradient(90deg,#1d4ed8 0%,#B91C1C 100%);"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 40px 40px;color:#020617;font-size:16px;line-height:1.7;" class="dark-card dark-text">
              ${innerContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#020617;padding:32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px auto;">
                <tr>
                  <td style="padding:0 6px;"><a href="https://x.com/3yeses" style="text-decoration:none;" title="X"><img src="${ICON_X}" alt="X" width="18" height="18" style="display:inline;border:0;opacity:0.7;" /></a></td>
                  <td style="padding:0 6px;"><a href="https://instagram.com/3yeses" style="text-decoration:none;" title="Instagram"><img src="${ICON_IG}" alt="Instagram" width="18" height="18" style="display:inline;border:0;opacity:0.7;" /></a></td>
                  <td style="padding:0 6px;"><a href="https://tiktok.com/@3yeses" style="text-decoration:none;" title="TikTok"><img src="${ICON_TT}" alt="TikTok" width="18" height="18" style="display:inline;border:0;opacity:0.7;" /></a></td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center" style="font-size:12px;">
                    <a href="https://3yeses.online/privacy" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Privacy</a>
                    <span style="color:#334155;">&middot;</span>
                    <a href="https://3yeses.online/terms" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Terms</a>
                    <span style="color:#334155;">&middot;</span>
                    <a href="https://3yeses.online/unsubscribe" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Unsubscribe</a>
                    <span style="color:#334155;">&middot;</span>
                    <a href="https://3yeses.online" style="color:#94a3b8;text-decoration:none;padding:0 10px;">Visit 3YESES</a>
                  </td>
                </tr>
              </table>
              <p style="color:#475569;margin:0;font-size:11px;text-align:center;line-height:1.6;">
                &copy; ${year} 3YESES. All rights reserved.<br>
                Sent to <a href="mailto:jane@example.com" style="color:#60a5fa;text-decoration:none;">jane@example.com</a>
              </p>
            </td>
          </tr>
                            </table>
                        </td>
                    </tr>
                </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    };

    const getWrappedPreviewHtml = () => {
        return buildWrappedHtml(getPreviewContent(), formData.subject || '');
    };

    // Generate preview HTML for any template (used by grid cards)
    const getTemplatePreviewHtml = (template: EmailTemplate) => {
        const content = getMockContent(template.body, template.variables);
        return buildWrappedHtml(content, template.subject);
    };

    if (loading) return <div>Loading templates...</div>;

    if (editingTemplate) {
        return (
            <div className="admin-glass rounded-xl shadow-sm border border-[var(--admin-border)] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--admin-text)]">
                        {formData.id && templates.find(t => t.id === formData.id) ? 'Edit Template' : 'New Template'}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="px-4 py-2 text-sm border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface)] text-[var(--admin-text)] flex items-center gap-2"
                        >
                            <Eye size={16} />
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>
                        <button
                            onClick={() => setEditingTemplate(null)}
                            className="px-4 py-2 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm bg-[var(--admin-primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save Template
                        </button>
                    </div>
                </div>

                {previewMode ? (
                    <div className="border border-[var(--admin-border)] rounded-lg bg-[var(--admin-bg)] min-h-[400px]">
                        {/* Email client chrome */}
                        <div className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)] rounded-t-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[var(--admin-muted)] font-medium w-16">From:</span>
                                <span className="text-[var(--admin-text)]">3YESES &lt;noreply@3yeses.online&gt;</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[var(--admin-muted)] font-medium w-16">To:</span>
                                <span className="text-[var(--admin-text)]">jane@example.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[var(--admin-muted)] font-medium w-16">Subject:</span>
                                <span className="text-[var(--admin-text)] font-semibold">{formData.subject}</span>
                            </div>
                        </div>
                        {/* Rendered email in iframe */}
                        <iframe
                            srcDoc={getWrappedPreviewHtml()}
                            title="Email Preview"
                            className="w-full border-0 rounded-b-lg"
                            style={{ minHeight: '700px', background: '#f7f7f7' }}
                            sandbox="allow-same-origin"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Template ID (Unique)</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={e => setFormData({...formData, id: e.target.value})}
                                    disabled={!!templates.find(t => t.id === formData.id && editingTemplate.id !== '')}
                                    className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] disabled:opacity-50 focus:border-[var(--admin-primary)] focus:outline-none"
                                    placeholder="e.g., welcome-email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Internal Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                    placeholder="e.g., Welcome Email for New Users"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Subject Line</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                    placeholder="Welcome to 3Yeses!"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Preheader Text</label>
                                <input
                                    type="text"
                                    value={formData.preheaderText || ''}
                                    onChange={e => setFormData({...formData, preheaderText: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                    placeholder="Short inbox preview text shown after subject"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">HTML Body</label>
                                <textarea
                                    value={formData.body}
                                    onChange={e => setFormData({...formData, body: e.target.value})}
                                    className="w-full h-96 px-3 py-2 border rounded-lg font-mono text-sm bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                    placeholder="<html>...</html>"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[var(--admin-surface)] p-4 rounded-lg border border-[var(--admin-border)]">
                                <h3 className="font-medium mb-2 text-[var(--admin-text)]">Available Variables</h3>
                                <p className="text-sm text-[var(--admin-muted)] mb-4">
                                    Define variables that can be used in this template. Format: <code>{'{{variableName}}'}</code>
                                </p>
                                <div className="space-y-2">
                                    {(formData.variables || []).map((v, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={v}
                                                onChange={e => {
                                                    const newVars = [...(formData.variables || [])];
                                                    newVars[i] = e.target.value;
                                                    setFormData({...formData, variables: newVars});
                                                }}
                                                className="flex-1 px-2 py-1 text-sm border rounded bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)]"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newVars = [...(formData.variables || [])];
                                                    newVars.splice(i, 1);
                                                    setFormData({...formData, variables: newVars});
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setFormData({...formData, variables: [...(formData.variables || []), '{{}}']})}
                                        className="text-sm text-[var(--admin-primary)] hover:opacity-80 font-medium flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Variable
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-[var(--admin-text)]">Email Templates</h2>
                    <div className="flex bg-[var(--admin-surface)] rounded-lg p-1 border border-[var(--admin-border)]">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--admin-bg)] shadow-sm' : 'text-[var(--admin-muted)]'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--admin-bg)] shadow-sm' : 'text-[var(--admin-muted)]'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Template
                </button>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="admin-glass rounded-xl border border-[var(--admin-border)] shadow-sm hover:border-[var(--admin-primary)]/50 transition-all group overflow-hidden cursor-pointer" onClick={() => handleView(template)}>
                            {/* Mini email preview */}
                            <div className="h-48 bg-[#f0f2f5] border-b border-[var(--admin-border)] relative overflow-hidden">
                                <iframe
                                    srcDoc={getTemplatePreviewHtml(template)}
                                    title={`Preview: ${template.name}`}
                                    className="w-[600px] h-[800px] border-0 origin-top-left"
                                    style={{ transform: 'scale(0.38)', pointerEvents: 'none' }}
                                    sandbox="allow-same-origin"
                                    tabIndex={-1}
                                />
                                {/* Overlay for click-through */}
                                <div className="absolute inset-0 bg-transparent group-hover:bg-[var(--admin-primary)]/5 transition-colors" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-[var(--admin-text)] mb-0.5 truncate">{template.name}</h3>
                                <p className="text-xs text-[var(--admin-muted)] truncate mb-3">{template.subject}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-[var(--admin-muted)] font-mono">{template.id}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleView(template); }}
                                            className="p-1.5 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/10 rounded-lg"
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                                            className="p-1.5 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/10 rounded-lg"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                                            className="p-1.5 text-[var(--admin-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="admin-glass rounded-xl border border-[var(--admin-border)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--admin-surface)]/50 border-b border-[var(--admin-border)]">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-[var(--admin-muted)] uppercase">Name</th>
                                <th className="px-6 py-3 text-xs font-bold text-[var(--admin-muted)] uppercase">Subject</th>
                                <th className="px-6 py-3 text-xs font-bold text-[var(--admin-muted)] uppercase">ID</th>
                                <th className="px-6 py-3 text-xs font-bold text-[var(--admin-muted)] uppercase">Updated</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--admin-border)]/50">
                            {templates.map(template => (
                                <tr key={template.id} className="hover:bg-[var(--admin-primary)]/5">
                                    <td className="px-6 py-4 text-[var(--admin-text)] font-medium">{template.name}</td>
                                    <td className="px-6 py-4 text-[var(--admin-muted)]">{template.subject}</td>
                                    <td className="px-6 py-4 text-[var(--admin-muted)] font-mono text-sm">{template.id}</td>
                                    <td className="px-6 py-4 text-[var(--admin-muted)] text-sm">
                                        {new Date(template.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleView(template)}
                                                className="text-[var(--admin-primary)] hover:opacity-80"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="text-[var(--admin-primary)] hover:opacity-80"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="text-red-600 hover:opacity-80"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewingTemplate && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm p-4 md:p-8">
                    <div className="max-w-6xl mx-auto h-full bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-[var(--admin-border)] flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--admin-text)]">{viewingTemplate.name}</h3>
                                <p className="text-sm text-[var(--admin-muted)] mt-1">{viewingTemplate.subject}</p>
                                {viewingTemplate.preheaderText && (
                                    <p className="text-xs text-[var(--admin-muted)] mt-1">Preheader: {getTemplatePreheader(viewingTemplate)}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        handleEdit(viewingTemplate);
                                        setViewingTemplate(null);
                                    }}
                                    className="px-3 py-2 text-sm bg-[var(--admin-primary)] text-white rounded-lg hover:opacity-90"
                                >
                                    Edit Template
                                </button>
                                <button
                                    onClick={() => setViewingTemplate(null)}
                                    className="px-3 py-2 text-sm border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#e5e7eb]">
                            <iframe
                                srcDoc={getTemplatePreviewHtml(viewingTemplate)}
                                title={`Full preview: ${viewingTemplate.name}`}
                                className="w-full h-full border-0"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
