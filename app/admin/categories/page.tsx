'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronRight, ChevronDown, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { getCategoryIconByName, getAvailableCategoryIconNames } from '@/lib/categoryIcons';
import AdminModal from '@/components/admin/AdminModal';
import { toast } from 'sonner';

function CategoryIcon({ iconName, size = 18, className = '' }: { iconName?: string | null; size?: number; className?: string }) {
  if (!iconName) return null;
  // Resolve by the stored DB icon key
  const Resolved = getCategoryIconByName(undefined, iconName);
  if (!Resolved) return null;
  return <Resolved width={size} height={size} className={className} />;
}

const AVAILABLE_ICONS = getAvailableCategoryIconNames();

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
  icon?: string | null;
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
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string, type: 'category' | 'subcategory' } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string, name: string, type: 'category' | 'subcategory' } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

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
        body: JSON.stringify({ name: newCategoryName.trim(), icon: newCategoryIcon || undefined }),
      });

      if (response.ok) {
        setNewCategoryName('');
        setNewCategoryIcon('');
        toast.success('Category created successfully');
        await fetchCategories();
      } else {
        toast.error('Failed to create category');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
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
        toast.success('Category updated');
        await fetchCategories();
      } else {
        toast.error('Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        toast.success('Category deleted');
        await fetchCategories();
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsActionLoading(false);
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
        toast.success('Subcategory created');
        await fetchCategories();
      } else {
        toast.error('Failed to create subcategory');
      }
    } catch (error) {
      console.error('Failed to create subcategory:', error);
      toast.error('Failed to create subcategory');
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
        toast.success('Subcategory updated');
        await fetchCategories();
      } else {
        toast.error('Failed to update subcategory');
      }
    } catch (error) {
      console.error('Failed to update subcategory:', error);
      toast.error('Failed to update subcategory');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        toast.success('Subcategory deleted');
        await fetchCategories();
      } else {
        toast.error('Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      toast.error('Failed to delete subcategory');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateCategoryIcon = async (categoryId: string, icon: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon }),
      });

      if (response.ok) {
        toast.success('Icon updated');
        await fetchCategories();
      } else {
        toast.error('Failed to update icon');
      }
    } catch (error) {
      console.error('Failed to update icon:', error);
      toast.error('Failed to update icon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">
            Categories Management
          </h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">
            Manage talent categories and subcategories
          </p>
        </div>
      </div>

      {/* Add New Category */}
      <div className="admin-glass rounded-xl p-6 border border-[var(--admin-border)] shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-primary)] mb-4">
          Add New Category
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => {
                setIconPickerTarget('new');
                setIsIconPickerOpen(true);
              }}
              className="h-full px-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-muted)] hover:border-[var(--admin-primary)]/50 hover:text-[var(--admin-primary)] transition-all flex items-center gap-2"
              title="Choose icon"
            >
              {newCategoryIcon ? (
                <CategoryIcon iconName={newCategoryIcon} size={18} className="text-[var(--admin-primary)]" />
              ) : (
                <ImageIcon size={18} />
              )}
            </button>
          </div>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name..."
            className="flex-1 px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] transition-all text-sm font-medium"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
          />
          <button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim()}
            className="px-6 py-2.5 bg-[var(--admin-primary)] hover:opacity-90 disabled:opacity-40 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-[var(--admin-primary)]/20"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--admin-primary)]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden shadow-sm"
            >
              {/* Category Header */}
              <div className="p-4 flex items-center gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="text-[var(--admin-muted)] hover:text-[var(--admin-text)] transition-colors"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {/* Category Icon */}
                <button
                  onClick={() => {
                    setIconPickerTarget(category.id);
                    setIsIconPickerOpen(true);
                  }}
                  className="w-9 h-9 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:border-[var(--admin-primary)]/50 transition-all"
                  title="Change icon"
                >
                  {category.icon ? (
                    <CategoryIcon iconName={category.icon} size={18} className="text-[var(--admin-primary)]" />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </button>

                {editingCategory === category.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                    />
                    <button
                      onClick={() => handleUpdateCategory(category.id)}
                      className="p-2 bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded hover:bg-emerald-600/30 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setEditName('');
                      }}
                      className="p-2 bg-[var(--admin-surface)] text-[var(--admin-muted)] border border-[var(--admin-border)] rounded hover:bg-[var(--admin-surface)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-[var(--admin-text)] tracking-tight">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--admin-muted)]">
                          {category.subcategories.length} Subcategories
                        </span>
                        {category._count && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--admin-primary)]/70">
                            {category._count.talents} Talents
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setEditName(category.name);
                        }}
                        className="p-2 text-[var(--admin-muted)] hover:text-blue-400 hover:bg-blue-400/10 rounded transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget({ id: category.id, name: category.name, type: 'category' });
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAddingSubcategoryTo(category.id)}
                        className="px-4 py-2 text-sm bg-[var(--admin-primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-2 font-bold shadow-lg shadow-[var(--admin-primary)]/20 transition-all"
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
                <div className="p-4 bg-[var(--admin-bg)]">
                  {/* Add Subcategory Form */}
                  {addingSubcategoryTo === category.id && (
                    <div className="mb-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Enter subcategory name..."
                        className="flex-1 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] placeholder-[var(--admin-muted)]"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateSubcategory(category.id)}
                      />
                      <button
                        onClick={() => handleCreateSubcategory(category.id)}
                        className="px-3 py-1.5 bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded hover:bg-emerald-600/30 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAddingSubcategoryTo(null);
                          setNewSubcategoryName('');
                        }}
                        className="px-3 py-1.5 bg-[var(--admin-surface)] text-[var(--admin-muted)] border border-[var(--admin-border)] rounded hover:bg-[var(--admin-surface)] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Subcategory List */}
                  <div className="space-y-1.5">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-4 p-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg group hover:border-[var(--admin-primary)]/30 transition-all"
                      >
                        {editingSubcategory === sub.id ? (
                          <>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && handleUpdateSubcategory(sub.id)}
                            />
                            <button
                              onClick={() => handleUpdateSubcategory(sub.id)}
                              className="p-1.5 bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded hover:bg-emerald-600/30 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSubcategory(null);
                                setEditName('');
                              }}
                              className="p-1.5 bg-[var(--admin-surface)] text-[var(--admin-muted)] border border-[var(--admin-border)] rounded hover:bg-[var(--admin-surface)] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-md bg-[var(--admin-bg)] border border-[var(--admin-border)] flex items-center justify-center flex-shrink-0">
                              {category.icon ? (
                                <CategoryIcon iconName={category.icon} size={14} className="text-[var(--admin-primary)]/70" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--admin-primary)]/40" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--admin-text)]">
                                {sub.name}
                              </p>
                              {sub._count && (
                                <p className="text-[10px] font-mono text-[var(--admin-muted)] mt-0.5 uppercase">
                                  {sub._count.talents} Talents
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setEditingSubcategory(sub.id);
                                setEditName(sub.name);
                              }}
                              className="p-1.5 text-[var(--admin-muted)] hover:text-blue-400 hover:bg-blue-400/10 rounded transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget({ id: sub.id, name: sub.name, type: 'subcategory' });
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {category.subcategories.length === 0 && (
                      <p className="text-center text-[var(--admin-muted)] py-4 text-sm">
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
      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description={`Permanently removing ${deleteTarget?.type}`}
        type="danger"
        footer={
          <>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (deleteTarget?.type === 'category') {
                  handleDeleteCategory(deleteTarget.id);
                } else if (deleteTarget?.type === 'subcategory') {
                  handleDeleteSubcategory(deleteTarget.id);
                }
              }}
              disabled={isActionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-[var(--admin-text)] text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isActionLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Delete Permanently
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <div>
            <p className="text-sm text-[var(--admin-muted)]">
              Are you sure you want to delete the {deleteTarget?.type} <span className="font-bold text-[var(--admin-text)]">"{deleteTarget?.name}"</span>?
              {deleteTarget?.type === 'category' ?
                " This will delete all associated subcategories and may affect multiple talents." :
                " This action may affect talents using this subcategory."}
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Icon Picker Modal */}
      <AdminModal
        isOpen={isIconPickerOpen}
        onClose={() => { setIsIconPickerOpen(false); setIconPickerTarget(null); }}
        title="Choose Category Icon"
        description="Select an icon to represent this category"
        type="info"
      >
        <div className="grid grid-cols-5 gap-2">
          {AVAILABLE_ICONS.map((iconName) => (
            <button
              key={iconName}
              onClick={() => {
                if (iconPickerTarget === 'new') {
                  setNewCategoryIcon(iconName);
                } else if (iconPickerTarget) {
                  handleUpdateCategoryIcon(iconPickerTarget, iconName);
                }
                setIsIconPickerOpen(false);
                setIconPickerTarget(null);
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] hover:border-[var(--admin-primary)]/50 hover:bg-[var(--admin-primary)]/5 transition-all"
            >
              <CategoryIcon iconName={iconName} size={22} className="text-[var(--admin-text)]" />
              <span className="text-[10px] text-[var(--admin-muted)] truncate w-full text-center">{iconName}</span>
            </button>
          ))}
          <button
            onClick={() => {
              if (iconPickerTarget === 'new') {
                setNewCategoryIcon('');
              } else if (iconPickerTarget) {
                handleUpdateCategoryIcon(iconPickerTarget, '');
              }
              setIsIconPickerOpen(false);
              setIconPickerTarget(null);
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all text-red-500"
          >
            <X size={22} />
            <span className="text-[10px] truncate w-full text-center">None</span>
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
