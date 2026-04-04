'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert, Trash2, Send, Users } from 'lucide-react';
import { toast } from 'sonner';

type GlobalNotification = {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'CRITICAL';
    targetRole: string | null;
    active: boolean;
    expiresAt: string | null;
    createdAt: string;
};

export default function GlobalNotificationManager() {
    const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'INFO' as 'INFO' | 'WARNING' | 'CRITICAL',
        targetRole: 'ALL',
        expiresAt: '', // Date string YYYY-MM-DD
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/communications/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate and remove this notification?")) return;

        try {
            const res = await fetch(`/api/admin/communications/notifications/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setNotifications(notifications.filter(n => n.id !== id));
                toast.success("Notification removed");
            } else {
                toast.error("Failed to remove notification");
            }
        } catch (error) {
            console.error("Error removing notification", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch('/api/admin/communications/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Notification broadcasted successfully");
                setFormData({
                    title: '',
                    message: '',
                    type: 'INFO',
                    targetRole: 'ALL',
                    expiresAt: ''
                });
                fetchNotifications();
            } else {
                toast.error("Failed to create notification");
            }
        } catch (error) {
            console.error("Error creating notification", error);
            toast.error("Error creating notification");
        }
    };

    if (loading) return <div>Loading notifications...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Creator Panel */}
            <div className="lg:col-span-1">
                <div className="admin-glass rounded-xl shadow-sm border border-[var(--admin-border)] p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--admin-text)]">
                        <Send size={20} /> Broadcast New Alert
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                placeholder="e.g., System Maintenance"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Message</label>
                            <textarea
                                required
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg h-24 bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                placeholder="Details about the alert..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                                    className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                >
                                    <option value="INFO">Info (Blue)</option>
                                    <option value="WARNING">Warning (Yellow)</option>
                                    <option value="CRITICAL">Critical (Red)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Target Role</label>
                                <select
                                    value={formData.targetRole}
                                    onChange={e => setFormData({...formData, targetRole: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none"
                                >
                                    <option value="ALL">All Users</option>
                                    <option value="TALENT">Talent Only</option>
                                    <option value="ADMIN">Admins Only</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--admin-muted)]">Expires At (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.expiresAt}
                                onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text)]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-[var(--admin-primary)] text-white rounded-lg hover:opacity-90 font-medium"
                        >
                            Broadcast Alert
                        </button>
                    </form>
                </div>
            </div>

            {/* List Panel */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-[var(--admin-text)]">Active Notifications</h2>
                {notifications.length === 0 ? (
                    <div className="text-center py-12 admin-glass rounded-xl border border-dashed border-[var(--admin-border)]">
                        <p className="text-[var(--admin-muted)]">No active system notifications.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(notification => {
                            const isExpired = notification.expiresAt && new Date(notification.expiresAt) < new Date();
                            const typeColors = {
                                INFO: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
                                WARNING: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
                                CRITICAL: 'bg-red-500/10 border-red-500/20 text-red-500'
                            };
                            const TypeIcon = notification.type === 'CRITICAL' ? ShieldAlert : notification.type === 'WARNING' ? AlertTriangle : Info;

                            return (
                                <div key={notification.id} className={`relative p-4 rounded-xl border flex gap-4 ${typeColors[notification.type]} ${isExpired ? 'opacity-60' : ''}`}>
                                    <div className="pt-1">
                                        <TypeIcon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold">{notification.title}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-[var(--admin-surface)] border border-[var(--admin-border)] flex items-center gap-1 text-[var(--admin-text)]">
                                                <Users size={12} />
                                                {notification.targetRole || 'All Users'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm opacity-90">{notification.message}</p>
                                        <div className="mt-3 text-xs opacity-70 flex gap-4">
                                            <span>Posted: {new Date(notification.createdAt).toLocaleDateString()}</span>
                                            {notification.expiresAt && (
                                                <span>Expires: {new Date(notification.expiresAt).toLocaleString()}</span>
                                            )}
                                            {isExpired && <span className="font-bold text-red-500">EXPIRED</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="absolute top-2 right-2 p-2 hover:bg-black/10 rounded-full text-[var(--admin-text)] hover:text-red-500 transition-colors"
                                        title="Remove Notification"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
