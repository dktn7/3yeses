'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Category, Subcategory } from '@prisma/client';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoriesManager() {
  const { data: categories, error, isLoading, mutate } = useSWR<CategoryWithSubcategories[]>('/api/admin/categories', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', categoryId: '' });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load categories. Please try again later." />;

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        setNewCategory({ name: '', icon: '', description: '' });
        setShowNewCategoryForm(false);
        mutate();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (categoryId: string, data: Partial<Category>) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setEditingCategory(null);
        mutate();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          mutate();
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleCreateSubcategory = async (categoryId: string) => {
    try {
      const response = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubcategory.name, categoryId }),
      });
      if (response.ok) {
        setNewSubcategory({ name: '', categoryId: '' });
        setShowNewSubcategoryForm(null);
        mutate();
      }
    } catch (error) {
      console.error('Failed to create subcategory:', error);
    }
  };

  const handleUpdateSubcategory = async (subcategoryId: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        setEditingSubcategory(null);
        mutate();
      }
    } catch (error) {
      console.error('Failed to update subcategory:', error);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const response = await fetch(`/api/admin/subcategories/${subcategoryId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          mutate();
        }
      } catch (error) {
        console.error('Failed to delete subcategory:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Category Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Categories</h2>
        <button
          onClick={() => setShowNewCategoryForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* New Category Form */}
      {showNewCategoryForm && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-white">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowNewCategoryForm(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories?.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4 dark:border-gray-600">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                {editingCategory === category.id ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      defaultValue={category.name}
                      onBlur={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="ml-8">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategories</h4>
                <button
                  onClick={() => setShowNewSubcategoryForm(showNewSubcategoryForm === category.id ? null : category.id)}
                  className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add Subcategory Form */}
              {showNewSubcategoryForm === category.id && (
                <div className="mb-3 p-3 bg-gray-100 rounded dark:bg-gray-600">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Subcategory name"
                      value={newSubcategory.name}
                      onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => handleCreateSubcategory(category.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setShowNewSubcategoryForm(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Subcategories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center justify-between p-2 bg-gray-100 rounded dark:bg-gray-600">
                    {editingSubcategory === subcategory.id ? (
                      <input
                        type="text"
                        defaultValue={subcategory.name}
                        onBlur={(e) => handleUpdateSubcategory(subcategory.id, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{subcategory.name}</span>
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingSubcategory(editingSubcategory === subcategory.id ? null : subcategory.id)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(subcategory.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!categories || categories.length === 0) && (
        <p className="text-center text-gray-500 dark:text-gray-400">No categories found. Create your first category!</p>
      )}
    </div>
  );
}
