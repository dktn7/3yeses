'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Eye, Heart, Settings, Volume2, VolumeX, X, MessageSquare, ChevronLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Notification {
  id: string;
  type: 'profile_view' | 'profile_save' | 'comment' | 'like' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
  userAvatar?: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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
      case 'profile_save': return <Heart size={16} className="text-red-500" />;
      case 'comment': return <MessageSquare size={16} className="text-green-500" />;
      case 'like': return <Heart size={16} className="text-pink-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {!showSettings ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettings(true)} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label="Notification settings">
                      <Settings size={16} />
                    </button>
                    {notifications.length > 0 && (
                      <>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">Mark all read</button>
                        )}
                        <button onClick={clearAllNotifications} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 hover:underline">Clear all</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium mb-1">No notifications</p>
                    <p className="text-sm">You are all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`group relative p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => markAsRead(notification.id)}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getTimeAgo(notification.timestamp)}</p>
                        </div>
                        <button onClick={(e) => dismissNotification(notification.id, e)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity" aria-label="Dismiss">
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
                  <h3 className="font-medium text-gray-900 dark:text-white">Notification Settings</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  {[
                    { key: 'profileViews', label: 'Profile Views', desc: 'When someone views your profile' },
                    { key: 'profileSaves', label: 'Profile Saves', desc: 'When someone saves your profile' },
                    { key: 'comments', label: 'Comments', desc: 'New comments on your videos' },
                    { key: 'likes', label: 'Likes', desc: 'When someone likes your content' },
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
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Sound</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Play sound for notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('soundEnabled')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
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
