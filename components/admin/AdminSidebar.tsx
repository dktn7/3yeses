
import {
  Bell,
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  FileText,
  BarChart2,
  MessageSquare,
  Mail,
  List,
  Activity,
  LogOut,
  BadgeCheck,
  CreditCard,
  TrendingUp,
  Key,
  ClipboardList,
  Headphones,
  ArrowLeftCircle,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      section: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'System Health', href: '/admin/system', icon: Activity },
      ]
    },
    {
      section: 'Management',
      items: [
        { name: 'Users & Talent', href: '/admin/users', icon: Users },
        { name: 'Verification', href: '/admin/verification', icon: BadgeCheck },
        { name: 'Categories', href: '/admin/categories', icon: List },
        { name: 'Content (CMS)', href: '/admin/cms', icon: FileText },
        { name: 'Communications', href: '/admin/communications', icon: Mail },
      ]
    },
    {
      section: 'Finance',
      items: [
        { name: 'Financials', href: '/admin/financials', icon: CreditCard },
      ]
    },
    {
      section: 'Moderation',
      items: [
        { name: 'Reports', href: '/admin/reports', icon: Shield },
        { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
      ]
    },
    {
      section: 'Growth',
      items: [
        { name: 'Marketing & Ads', href: '/admin/growth', icon: TrendingUp },
      ]
    },
    {
      section: 'Analytics',
      items: [
        { name: 'Platform Stats', href: '/admin/analytics', icon: BarChart2 },
        { name: 'Audit Log', href: '/admin/audit', icon: ClipboardList },
      ]
    },
    {
      section: 'System',
      items: [
        { name: 'Settings', href: '/admin/settings', icon: Settings },
        { name: 'API Keys', href: '/admin/api-keys', icon: Key },
        { name: 'Support', href: '/admin/support', icon: Headphones },
        { name: 'About & Help', href: '/admin/about', icon: Info },
      ]
    },
    {
      section: 'Main Site',
      items: [
        { name: 'Back to 3YESES', href: '/', icon: ArrowLeftCircle },
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col admin-glass text-[var(--admin-text)] border-r border-[var(--admin-border)]">
      {/* Brand Header */}
      <div className="h-[70px] flex items-center px-6 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--admin-primary)]/50 to-transparent opacity-50"></div>
        <div className="flex items-center gap-3.5 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--admin-primary)] to-[var(--admin-accent)] rounded-lg blur opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-[var(--admin-surface)] p-2 rounded-lg border border-[var(--admin-border)] shadow-sm group-hover:border-[var(--admin-primary)]/30 transition-colors">
                            <Shield size={18} className="text-[var(--admin-text)] group-hover:text-[var(--admin-primary)] transition-colors" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-lg tracking-[0.2em] text-[var(--admin-text)] leading-none group-hover:text-[var(--admin-primary)] transition-colors duration-500">3YESES</span>
                      <span className="text-[9px] text-[var(--admin-muted)] uppercase tracking-[0.3em] font-medium opacity-60 ml-0.5">Admin Portal</span>
                    </div>
                </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-9 scrollbar-thin scrollbar-thumb-[var(--admin-border)] scrollbar-track-transparent">
        {menuItems.map((section, idx) => (
          <div key={idx} className="relative">
            <h3 className="px-4 text-[9px] font-black text-[var(--admin-muted)] uppercase tracking-[0.25em] mb-4 opacity-50 sticky top-0 bg-[var(--admin-bg)]/95 backdrop-blur z-20 py-2 border-b border-[var(--admin-border)]/20">
              {section.section}
            </h3>
            <div className="space-y-1.5 px-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center gap-3.5 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden
                      ${isActive
                        ? 'text-[var(--admin-primary)] bg-[var(--admin-primary)]/5 border border-[var(--admin-primary)]/30 shadow-[0_0_20px_-5px_var(--admin-primary)]'
                        : 'text-[var(--admin-text)]/70 hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)] border border-transparent hover:border-[var(--admin-border)]'
                      }
                    `}
                  >
                     {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--admin-primary)] shadow-[0_0_10px_var(--admin-primary)]"></div>
                     )}
                    
                    <item.icon className={`h-4 w-4 relative z-10 transition-transform duration-300 ${isActive ? 'text-[var(--admin-primary)] scale-110' : 'text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] group-hover:scale-110'}`} />
                    <span className={`relative z-10 tracking-wide transition-colors ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                    
                    {/* Active Glow Effect */}
                     {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--admin-primary)]/10 via-transparent to-transparent opacity-30"></div>
                     )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Footer Info */}
      <div className="p-5 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]/50 backdrop-blur-md">
        <div className="flex items-center justify-between text-[10px] font-bold text-[var(--admin-muted)] uppercase tracking-wider">
            <span className="opacity-50">System v2.5.0</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[var(--admin-text)] opacity-70">Online</span>
            </div>
        </div>
      </div>
    </div>
  );
}
