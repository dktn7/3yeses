'use client';

import { useState } from 'react';
import EmailTemplateManager from '@/components/admin/communications/EmailTemplateManager';
import GlobalNotificationManager from '@/components/admin/communications/GlobalNotificationManager';
import DirectEmailSender from '@/components/admin/communications/DirectEmailSender';
import { Mail, Bell, Send } from 'lucide-react';

export default function CommunicationsPage() {
    const [activeTab, setActiveTab] = useState<'templates' | 'notifications' | 'direct'>('templates');

    const tabs = [
        { key: 'templates' as const, label: 'Email Templates', icon: Mail },
        { key: 'notifications' as const, label: 'Global Notifications', icon: Bell },
        { key: 'direct' as const, label: 'Send Email', icon: Send },
    ];

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">Communications</h1>
                <p className="text-[var(--admin-muted)] mt-1 font-medium">Manage email templates and system notifications</p>
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

            {/* Content */}
            <div className="min-h-[600px]">
                {activeTab === 'templates' ? (
                    <EmailTemplateManager />
                ) : activeTab === 'notifications' ? (
                    <GlobalNotificationManager />
                ) : (
                    <DirectEmailSender />
                )}
            </div>
        </div>
    );
}
