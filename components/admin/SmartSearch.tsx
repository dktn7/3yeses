'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, User, ChevronRight, Shield, Mail,
  FileText, Settings, BarChart3, Users, CreditCard,
  Globe, Megaphone, MessageSquare, Key, Activity,
  Layers, CheckCircle, Flag, HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserSuggestion {
  type: 'user';
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  matchField: string;
}

interface PageSuggestion {
  type: 'page';
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

type Suggestion = UserSuggestion | PageSuggestion;

// All admin pages for quick navigation
const ADMIN_PAGES: PageSuggestion[] = [
  { type: 'page', label: 'Dashboard', href: '/admin', icon: <BarChart3 size={14} />, description: 'Overview and stats' },
  { type: 'page', label: 'Users', href: '/admin/users', icon: <Users size={14} />, description: 'Manage all users' },
  { type: 'page', label: 'Categories', href: '/admin/categories', icon: <Layers size={14} />, description: 'Talent categories' },
  { type: 'page', label: 'Verification', href: '/admin/verification', icon: <CheckCircle size={14} />, description: 'Identity verification' },
  { type: 'page', label: 'Financials', href: '/admin/financials', icon: <CreditCard size={14} />, description: 'Payments & revenue' },
  { type: 'page', label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={14} />, description: 'Traffic and engagement' },
  { type: 'page', label: 'CMS', href: '/admin/cms', icon: <FileText size={14} />, description: 'Pages, media & SEO' },
  { type: 'page', label: 'System Health', href: '/admin/system', icon: <Activity size={14} />, description: 'Server monitoring' },
  { type: 'page', label: 'Growth & Ads', href: '/admin/growth', icon: <Megaphone size={14} />, description: 'Featured talent & ads' },
  { type: 'page', label: 'Reports', href: '/admin/reports', icon: <Flag size={14} />, description: 'User reports & flags' },
  { type: 'page', label: 'Comments', href: '/admin/comments', icon: <MessageSquare size={14} />, description: 'Comment moderation' },
  { type: 'page', label: 'Support', href: '/admin/support', icon: <HelpCircle size={14} />, description: 'Tickets & knowledge base' },
  { type: 'page', label: 'API Keys', href: '/admin/api-keys', icon: <Key size={14} />, description: 'Manage API keys' },
  { type: 'page', label: 'Settings', href: '/admin/settings', icon: <Settings size={14} />, description: 'Site configuration' },
  { type: 'page', label: 'Notifications', href: '/admin/notifications', icon: <Globe size={14} />, description: 'System notifications' },
  { type: 'page', label: 'Audit Log', href: '/admin/audit', icon: <Shield size={14} />, description: 'Activity audit trail' },
];

interface SmartSearchProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SmartSearch({ onSearch, placeholder = "Search users, pages, settings...", initialValue = "" }: SmartSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter admin pages based on query
  const matchedPages = useMemo(() => {
    if (!query || query.trim().length < 1) return [];
    const lowerQ = query.toLowerCase();
    return ADMIN_PAGES.filter(p =>
      p.label.toLowerCase().includes(lowerQ) ||
      p.description.toLowerCase().includes(lowerQ)
    ).slice(0, 5);
  }, [query]);

  // All suggestions combined
  const allSuggestions: Suggestion[] = useMemo(() => {
    return [...matchedPages, ...userSuggestions];
  }, [matchedPages, userSuggestions]);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.users) {
            setUserSuggestions(data.users.map((u: Omit<UserSuggestion, 'type'>) => ({ ...u, type: 'user' as const })));
            setShowDropdown(true);
          }
        } catch (error) {
          console.error('Failed to fetch suggestions', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Show dropdown when pages match even with 1 char
  useEffect(() => {
    if (matchedPages.length > 0 || userSuggestions.length > 0) {
      setShowDropdown(true);
    } else if (query.trim().length < 2) {
      setShowDropdown(false);
    }
  }, [matchedPages, userSuggestions, query]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    if (suggestion.type === 'page') {
      router.push(suggestion.href);
    } else {
      router.push(`/admin/users/${suggestion.id}`);
    }
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (focusedIndex >= 0 && allSuggestions[focusedIndex]) {
        handleSelect(allSuggestions[focusedIndex]);
      } else {
        onSearch(query);
        setShowDropdown(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setUserSuggestions([]);
    setShowDropdown(false);
    onSearch('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      case 'TALENT':
        return 'bg-blue-100 text-blue-700 dark:bg-red-500/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
    }
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${showDropdown ? 'text-[var(--admin-primary)]' : 'text-[var(--admin-muted)]'}`}>
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFocusedIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (allSuggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/50 focus:border-[var(--admin-primary)] transition-all shadow-sm text-base"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--admin-muted)] hover:text-[var(--admin-text)] p-1 rounded-full hover:bg-[var(--admin-surface)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (allSuggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto">
            {/* Page Results */}
            {matchedPages.length > 0 && (
              <>
                <div className="px-4 py-2 text-[10px] font-black text-[var(--admin-muted)] uppercase tracking-wider bg-[var(--admin-bg)]/50 border-b border-[var(--admin-border)]">
                  Pages
                </div>
                {matchedPages.map((page, idx) => {
                  const globalIdx = idx;
                  return (
                    <button
                      key={page.href}
                      onClick={() => handleSelect(page)}
                      className={`flex items-center w-full px-4 py-2.5 text-left transition-colors border-l-2 ${
                        globalIdx === focusedIndex
                          ? 'bg-[var(--admin-primary)]/5 border-[var(--admin-primary)]'
                          : 'hover:bg-[var(--admin-bg)] border-transparent'
                      }`}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-primary)] mr-3">
                        {page.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--admin-text)]">{page.label}</p>
                        <p className="text-[10px] text-[var(--admin-muted)]">{page.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--admin-muted)] ml-2" />
                    </button>
                  );
                })}
              </>
            )}

            {/* User Results */}
            {userSuggestions.length > 0 && (
              <>
                <div className="px-4 py-2 text-[10px] font-black text-[var(--admin-muted)] uppercase tracking-wider bg-[var(--admin-bg)]/50 border-b border-[var(--admin-border)] flex justify-between">
                  <span>Users</span>
                  <span className="font-normal normal-case text-[var(--admin-muted)]">
                    <kbd className="font-sans px-1 py-0.5 bg-[var(--admin-border)] rounded text-[10px]">Enter</kbd> to search all
                  </span>
                </div>
                {userSuggestions.map((user, idx) => {
                  const globalIdx = matchedPages.length + idx;
                  return (
                    <Link
                      key={user.id}
                      href={`/admin/users/${user.id}`}
                      className={`flex items-center px-4 py-3 cursor-pointer transition-colors border-l-2 ${
                        globalIdx === focusedIndex
                          ? 'bg-[var(--admin-primary)]/5 border-[var(--admin-primary)]'
                          : 'hover:bg-[var(--admin-bg)] border-transparent'
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 h-10 w-10 relative mr-3">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full rounded-full bg-[var(--admin-bg)] flex items-center justify-center border border-[var(--admin-border)] text-[var(--admin-muted)]">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold text-[var(--admin-text)] truncate flex items-center gap-2">
                            {user.name}
                            {user.role === 'ADMIN' && <Shield className="h-3 w-3 text-red-500" />}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--admin-muted)] truncate flex items-center gap-1.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          {user.matchField !== 'Name' && (
                            <span className="text-[10px] text-[var(--admin-primary)] bg-[var(--admin-primary)]/10 px-1.5 py-0.5 rounded font-bold">
                              {user.matchField}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--admin-muted)] ml-2" />
                    </Link>
                  );
                })}
              </>
            )}

            {/* Loading indicator */}
            {isLoading && userSuggestions.length === 0 && matchedPages.length === 0 && (
              <div className="px-4 py-8 text-center text-[var(--admin-muted)]">
                <Search className="mx-auto mb-2 animate-pulse" size={20} />
                <p className="text-xs font-medium">Searching...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
