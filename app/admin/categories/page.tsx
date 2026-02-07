'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronRight, ChevronDown } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  _count?: {
    talents: number;
  };
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  _count?: {
    talents: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName('');
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        setEditingCategory(null);
        setEditName('');
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure? This will delete all subcategories and may affect talents.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCreateSubcategory = async (categoryId: string) => {
    if (!newSubcategoryName.trim()) return;

    try {
      const response = await fetch('/api/admin/categories/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
          categoryId,
        }),
      });

      if (response.ok) {
        setNewSubcategoryName('');
        setAddingSubcategoryTo(null);
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to create subcategory:', error);
    }
  };

  const handleUpdateSubcategory = async (subcategoryId: string) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/admin/categories/subcategories/${subcategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        setEditingSubcategory(null);
        setEditName('');
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to update subcategory:', error);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure? This may affect talents using this subcategory.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Categories Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage talent categories and subcategories
        </p>
      </div>

      {/* Add New Category */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add New Category
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
          />
          <button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-4 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {editingCategory === category.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                    />
                    <button
                      onClick={() => handleUpdateCategory(category.id)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setEditName('');
                      }}
                      className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.subcategories.length} subcategories
                        {category._count && ` • ${category._count.talents} talents`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setEditName(category.name);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setAddingSubcategoryTo(category.id)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Subcategory
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category.id) && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                  {/* Add Subcategory Form */}
                  {addingSubcategoryTo === category.id && (
                    <div className="mb-4 flex gap-3">
                      <input
                        type="text"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Subcategory name..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateSubcategory(category.id)}
                      />
                      <button
                        onClick={() => handleCreateSubcategory(category.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setAddingSubcategoryTo(null);
                          setNewSubcategoryName('');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Subcategory List */}
                  <div className="space-y-2">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded"
                      >
                        {editingSubcategory === sub.id ? (
                          <>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && handleUpdateSubcategory(sub.id)}
                            />
                            <button
                              onClick={() => handleUpdateSubcategory(sub.id)}
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSubcategory(null);
                                setEditName('');
                              }}
                              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {sub.name}
                              </p>
                              {sub._count && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {sub._count.talents} talents
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setEditingSubcategory(sub.id);
                                setEditName(sub.name);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {category.subcategories.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No subcategories yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
