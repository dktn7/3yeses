'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, BellOff, Eye, Settings, Volume2, VolumeX, X, MessageSquare, ChevronLeft, AlertTriangle, Info } from 'lucide-react';
import SwoopingTick from './SwoopingTick';
import { apiClient } from '@/lib/api-client';

interface Notification {
  id: string;
  type: 'profile_view' | 'profile_save' | 'comment' | 'like' | 'message' | string;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  userId?: string;
  userAvatar?: string;
  metadata?: any;
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface NotificationSettings {
  profileViews: boolean;
  profileSaves: boolean;
  comments: boolean;
  likes: boolean;
  messages: boolean;
  soundEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
  profileViews: true,
  profileSaves: true,
  comments: true,
  likes: true,
  messages: true,
  soundEnabled: true,
};

export default function NotificationDropdown() {
  const t = useTranslations('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = (router && (router as any).locale) || 'en';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/api/notifications');
        if (response.ok && response.data) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unreadCount || 0);
        } else {
          console.error('Failed to fetch notifications:', response.error);
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    const fetchSystemAlerts = async () => {
      try {
        const response = await apiClient.get('/api/communications/alerts');
        if (response.ok && Array.isArray(response.data)) {
          setSystemAlerts(response.data as SystemAlert[]);
        } else {
          setSystemAlerts([]);
        }
      } catch (error) {
        console.error('Error fetching system alerts:', error);
        setSystemAlerts([]);
      }
    };

    fetchNotifications();
    fetchSystemAlerts();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchSystemAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dismissNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await apiClient.delete(`/api/notifications/${notificationId}`);
      if (response.ok) {
        const updated = notifications.filter(n => n.id !== notificationId);
        setNotifications(updated);
        // Persist dismissal to localStorage
        const dismissedIds = updated.map(n => n.id);
        localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedIds));
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.read) return;
    try {
      const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markAsRead(notification.id);
    } catch (err) {
      console.error('Error marking as read before navigation', err);
    }

    // Navigate based on metadata if present
    try {
      const meta = notification.metadata;
      if (meta) {
        if (meta.path) {
          // ensure locale is present in the path
          const path: string = meta.path;
          const target = path.startsWith(`/${locale}`) ? path : `/${locale}${path}`;
          router.push(target);
          setIsOpen(false);
          return;
        }
        if (meta.kind === 'achievement') {
          // Achievements feature removed — route to notifications list instead
          router.push(`/${locale}/dashboard/notifications`);
          setIsOpen(false);
          return;
        }
        if (meta.kind === 'talent' && meta.talentId) {
          router.push(`/talent/${meta.talentId}`);
          setIsOpen(false);
          return;
        }
      }
      // Fallback: just close the dropdown
      setIsOpen(false);
    } catch (err) {
      console.error('Navigation error after notification click', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.patch('/api/notifications/read-all');
      if (response.ok) {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        // Persist read notifications to localStorage
        const readIds = updated.filter(n => n.read).map(n => n.id);
        localStorage.setItem('readNotifications', JSON.stringify(readIds));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Dismiss all notifications by calling dismiss for each one
      const promises = notifications.map(n => 
        apiClient.delete(`/api/notifications/${n.id}`).catch(err => {
          console.error(`Error dismissing notification ${n.id}:`, err);
        })
      );
      await Promise.all(promises);
      setNotifications([]);
      // Persist cleared notifications to localStorage
      localStorage.setItem('dismissedNotifications', JSON.stringify([]));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const toggleSetting = async (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      const response = await apiClient.put('/api/user/notification-settings', newSettings);
      if (!response.ok) {
        console.error('Error saving notification settings:', response.error);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_view': return <Eye size={16} className="text-blue-500" />;
      case 'profile_save': return <SwoopingTick size={16} />;
      case 'comment': return <MessageSquare size={16} className="text-green-500" />;
      case 'like': return <SwoopingTick size={16} />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return t('daysAgo', { count: days });
    if (hours > 0) return t('hoursAgo', { count: hours });
    if (minutes > 0) return t('minutesAgo', { count: minutes });
    return t('justNow');
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'WARNING':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'INFO':
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
        {settings.soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {!showSettings ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{t('title')}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettings(true)} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={t('settings')}>
                      <Settings size={16} />
                    </button>
                    {notifications.length > 0 && (
                      <>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 dark:text-red-400 hover:underline">{t('markAllRead')}</button>
                        )}
                        <button onClick={clearAllNotifications} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 hover:underline">{t('clearAll')}</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {systemAlerts.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {t('systemAlerts')}
                    </div>
                    {systemAlerts.map((alert) => (
                      <div key={alert.id} className="px-4 py-3 flex items-start gap-3">
                        <div className="mt-0.5">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              {alert.type}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {alert.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium mb-1">{t('noNotifications')}</p>
                    <p className="text-sm">{t('allCaughtUp')}</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`group relative p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => handleNotificationClick(notification)}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getTimeAgo(notification.timestamp)}</p>
                        </div>
                        <button onClick={(e) => dismissNotification(notification.id, e)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity" aria-label={t('dismiss')}>
                          <X size={16} />
                        </button>
                        {!notification.read && (<div className="absolute top-5 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t('settings')}</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  {[
                    { key: 'profileViews', label: t('profileViews'), desc: t('profileViewsDesc') },
                    { key: 'profileSaves', label: t('profileSaves'), desc: t('profileSavesDesc') },
                    { key: 'comments', label: t('comments'), desc: t('commentsDesc') },
                    { key: 'likes', label: t('likesLabel'), desc: t('likesDesc') },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(key as keyof NotificationSettings)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings[key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-light-surface transition-transform ${
                            settings[key as keyof NotificationSettings] ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t('sound')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('soundDesc')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('soundEnabled')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-light-surface transition-transform ${
                        settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
