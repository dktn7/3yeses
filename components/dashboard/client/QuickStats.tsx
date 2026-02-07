import { BarChart, Bookmark } from 'lucide-react';
import DashboardWidget from './DashboardWidget.tsx';

/**
 * @typedef {object} StatItem
 * @property {string} name - The label for the statistic (e.g., "Profiles Viewed").
 * @property {string} value - The value of the statistic.
 * @property {React.ElementType} icon - The icon component from lucide-react to display.
 */
type StatItem = {
  readonly name: string;
  readonly value: string;
  readonly icon: React.ElementType;
};

// Mock data for the quick stats. In a real application, this would be fetched from an API.
const stats: readonly StatItem[] = [
  { name: 'Profiles Viewed', value: '76', icon: BarChart },
  { name: 'Talents Saved', value: '12', icon: Bookmark },
];

/**
 * A widget to display key statistics on the client dashboard.
 * It provides a quick, at-a-glance summary of the client's activity.
 *
 * @returns {JSX.Element} The rendered QuickStats widget.
 */
export default function QuickStats() {
  return (
    <DashboardWidget title="Quick Stats">
      <ul className="space-y-4">
        {stats.map((item) => (
          <li key={item.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-4">
                <item.icon className="w-6 h-6 text-primary-blue" />
              </div>
              <span className="text-base font-medium text-gray-900 dark:text-white">
                {item.name}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  );
}
