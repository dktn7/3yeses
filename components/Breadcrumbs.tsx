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
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="text-blue-600 dark:text-red-400 hover:underline hover:text-blue-700 dark:hover:text-red-300">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-700 dark:text-gray-200">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight size={16} className="mx-1 text-blue-600 dark:text-red-400" />
          )}
        </div>
      ))}
    </nav>
  );
}
