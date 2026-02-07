import Image from 'next/image';
import Link from 'next/link';
import DashboardWidget from './DashboardWidget.tsx';
import { mockTalents } from '@/lib/data.ts';

/**
 * @typedef {object} MockMessage
 * @property {string} id - The unique identifier for the message.
 * @property {string} senderName - The name of the message sender.
 * @property {string} senderAvatarUrl - The URL for the sender's avatar image.
 * @property {string} snippet - A short preview of the message content.
 * @property {string} timestamp - A human-readable timestamp (e.g., "1h ago").
 */
type MockMessage = {
  readonly id: string;
  readonly senderName: string;
  readonly senderAvatarUrl: string;
  readonly snippet: string;
  readonly timestamp: string;
};

// Mock data for recent messages. In a real application, this would be fetched from an API.
const recentMessages: readonly MockMessage[] = [
  {
    id: 'msg1',
    senderName: mockTalents[1].name,
    senderAvatarUrl: mockTalents[1].avatarUrl || '',
    snippet: "Yes, I'm available for the dates we discussed...",
    timestamp: '1h ago',
  },
  {
    id: 'msg2',
    senderName: mockTalents[2].name,
    senderAvatarUrl: mockTalents[2].avatarUrl || '',
    snippet: 'Thank you for the opportunity! Looking forward to it.',
    timestamp: '3h ago',
  },
  {
    id: 'msg3',
    senderName: mockTalents[0].name,
    senderAvatarUrl: mockTalents[0].avatarUrl || '',
    snippet: 'Just sent over my updated headshots.',
    timestamp: '1d ago',
  },
];

/**
 * A widget to display a preview of the most recent messages for the client.
 * It encourages engagement by showing active conversations.
 *
 * @returns {JSX.Element} The rendered RecentMessages widget.
 */
export default function RecentMessages() {
  return (
    <DashboardWidget title="Recent Messages">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {recentMessages.map((message) => (
          <li key={message.id} className="py-3 sm:py-4">
            <Link href="/dashboard/messages" className="flex items-center space-x-4 group">
              <div className="flex-shrink-0">
                <Image
                  className="w-8 h-8 rounded-full"
                  src={message.senderAvatarUrl}
                  alt={message.senderName}
                  width={32}
                  height={32}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white group-hover:text-primary-blue">
                  {message.senderName}
                </p>
                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                  {message.snippet}
                </p>
              </div>
              <div className="inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400">
                {message.timestamp}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  );
}
