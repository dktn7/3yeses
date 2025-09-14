import DashboardWidget from './DashboardWidget';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ReactElement } from 'react';

/**
 * @typedef {('Confirmed' | 'Pending' | 'Completed' | 'Cancelled')} BookingStatus
 */
type BookingStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

/**
 * @typedef {object} MockBooking
 * @property {string} id - The unique identifier for the booking.
 * @property {string} talentName - The name of the booked talent.
 * @property {string} projectName - The name of the project or job.
 * @property {BookingStatus} status - The current status of the booking.
 */
type MockBooking = {
  readonly id: string;
  readonly talentName: string;
  readonly projectName: string;
  readonly status: BookingStatus;
};

// Mock data for active bookings.
const activeBookings: readonly MockBooking[] = [
  { id: 'book1', talentName: 'Sarah Johnson', projectName: 'Summer Ad Campaign', status: 'Confirmed' },
  { id: 'book2', talentName: 'Michael Chen', projectName: 'Music Video Shoot', status: 'Pending' },
  { id: 'book3', talentName: 'James Smith', projectName: 'Tech Conference Setup', status: 'Completed' },
  { id: 'book4', talentName: 'Emma Wilson', projectName: 'Jazz Festival', status: 'Cancelled' },
];

// A map to associate each status with a specific icon and color for visual distinction.
const statusStyles: Record<BookingStatus, { icon: ReactElement; color: string }> = {
  Confirmed: { icon: <CheckCircle />, color: 'text-green-500' },
  Pending: { icon: <Clock />, color: 'text-yellow-500' },
  Completed: { icon: <CheckCircle />, color: 'text-blue-500' },
  Cancelled: { icon: <XCircle />, color: 'text-red-500' },
};

/**
 * A widget to display the client's active and recent bookings.
 * It provides a clear overview of job statuses.
 *
 * @returns {JSX.Element} The rendered ActiveBookings widget.
 */
export default function ActiveBookings() {
  return (
    <DashboardWidget title="Active Bookings">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {activeBookings.map((booking) => (
          <li key={booking.id} className="py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  {booking.talentName}
                </p>
                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                  {booking.projectName}
                </p>
              </div>
              <div className={`inline-flex items-center text-sm font-semibold ${statusStyles[booking.status].color}`}>
                <div className="w-5 h-5 mr-1">
                  {statusStyles[booking.status].icon}
                </div>
                {booking.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  );
}
