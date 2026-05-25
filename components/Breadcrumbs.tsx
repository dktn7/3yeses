// components/Breadcrumbs.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

type BreadcrumbsProps = {
  readonly items: readonly BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="marketing-breadcrumb flex items-center text-sm mb-4">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="marketing-breadcrumb-link rounded-sm transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="marketing-breadcrumb-current font-semibold">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight size={16} className="marketing-breadcrumb-sep mx-1" />
          )}
        </div>
      ))}
    </nav>
  );
}
