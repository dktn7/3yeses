import React from 'react';
import UsersList from './UsersList';

export default function AdminUsersPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">User Management</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">View and manage all users in the system.</p>
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <UsersList />
      </div>
    </section>
  );
}
