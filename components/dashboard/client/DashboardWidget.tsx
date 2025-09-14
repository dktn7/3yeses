import type { ReactNode } from 'react';

/**
 * @typedef {object} DashboardWidgetProps
 * @property {string} title - The title to be displayed at the top of the widget.
 * @property {ReactNode} children - The content to be rendered inside the widget.
 */
type DashboardWidgetProps = {
  readonly title: string;
  readonly children: ReactNode;
};

/**
 * A reusable wrapper component to provide a consistent frame for all dashboard widgets.
 * It handles the styling for the title, background, padding, and shadows.
 *
 * @param {DashboardWidgetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered dashboard widget.
 */
export default function DashboardWidget({ title, children }: DashboardWidgetProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flow-root">
        {children}
      </div>
    </div>
  );
}
