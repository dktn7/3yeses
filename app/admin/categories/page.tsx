import React from 'react';
import CategoriesManager from './CategoriesManager';

export default function AdminCategoriesPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Category Management</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Manage categories and subcategories for the platform.</p>
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <CategoriesManager />
      </div>
    </section>
  );
}
