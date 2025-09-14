'use client';

import React from 'react';
import useSWR from 'swr';
import { User } from '@prisma/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersList() {
  const { data: users, error, isLoading } = useSWR<User[]>('/api/admin/users', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load users. Please try again later." />;
  }

  if (!users || users.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Role</th>
            <th scope="col" className="px-6 py-3">Verified</th>
            <th scope="col" className="px-6 py-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-600">
              <td className="px-6 py-4 font-medium">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">{user.emailVerified ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
