import Image from 'next/image';
import Link from 'next/link';
import DashboardWidget from './DashboardWidget.tsx';
import { mockTalents } from '@/lib/data.ts';
import type { Talent } from '@/types/index.ts';

/**
 * A widget to display a list of talents the client has saved or bookmarked.
 * This provides clients with a quick way to access profiles they are interested in.
 *
 * @returns {JSX.Element} The rendered SavedTalents widget.
 */
export default function SavedTalents() {
  // For demonstration, we'll use the first 4 talents from our mock data as "saved" talents.
  // In a real application, this data would be specific to the logged-in client.
  const savedTalents: readonly Talent[] = mockTalents.slice(0, 4);

  return (
    <DashboardWidget title="Saved Talents">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {savedTalents.map((talent) => (
          <li key={talent.id} className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Image
                  className="w-8 h-8 rounded-full"
                  src={talent.avatarUrl || '/default-avatar.png'}
                  alt={talent.name}
                  width={32}
                  height={32}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  {talent.name}
                </p>
                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                  {talent.role}
                </p>
              </div>
              <Link
                href={`/talent/${talent.id}`}
                className="inline-flex items-center px-3 py-1 text-sm font-semibold text-primary-blue bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  );
}
