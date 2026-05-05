
import {
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
    <div className="h-full flex flex-col bg-[var(--admin-surface)]/85 text-[var(--admin-text)] border-r border-[var(--admin-border)]">
      <div className="h-[68px] flex items-center px-5 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/75 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--admin-surface)] p-2 rounded-lg border border-[var(--admin-border)]">
            <Shield size={17} className="text-[var(--admin-primary)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-[0.15em] text-[var(--admin-text)] leading-none">3YESES</span>
            <span className="text-[10px] text-[var(--admin-muted)] uppercase tracking-[0.2em] font-semibold">Admin Portal</span>
          </div>
        </div>
      </div>

      <nav aria-label="Admin sidebar navigation" className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-thin scrollbar-thumb-[var(--admin-border)] scrollbar-track-transparent">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[10px] font-bold text-[var(--admin-muted)] uppercase tracking-[0.18em] mb-2 opacity-80">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all duration-200 border
                      ${isActive
                        ? 'text-[var(--admin-text)] bg-[var(--admin-primary)]/10 border-[var(--admin-primary)]/35'
                        : 'text-[var(--admin-text)]/75 border-transparent hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]/75 hover:border-[var(--admin-border)]'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[var(--admin-primary)]' : 'bg-transparent'}`} />
                    <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-[var(--admin-primary)]' : 'text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)]'}`} />
                    <span className={`tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]/55">
        <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--admin-muted)] uppercase tracking-[0.1em]">
          <span className="opacity-70">System v2.5.0</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[var(--admin-text)]/75">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
