
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns/format";

interface FeaturedItem {
  id: string;
  title: string | null;
  description: string | null;
  slot: string;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  talentProfile?: {
    user: {
      name: string;
      email: string;
    };
  };
  portfolioItem?: {
    title: string;
    type: string;
  };
}

export function FeaturedItemsManager() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<FeaturedItem> & { talentProfileId?: string, portfolioItemId?: string } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/admin/growth/featured");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch featured items", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editingItem) return;

    const method = editingItem.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/growth/featured", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    });

    if (res.ok) {
      fetchItems();
      setEditingItem(null);
    } else {
      alert("Failed to save featured item");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/growth/featured?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchItems();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Featured Items</h2>
        <button
          onClick={() => setEditingItem({ active: true, slot: "HOMEPAGE_HERO", priority: 0 })}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Feature Item
        </button>
      </div>

      {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold">
              {editingItem.id ? "Edit Featured Item" : "New Featured Item"}
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Slot</label>
              <select
                value={editingItem.slot}
                onChange={(e) => setEditingItem({ ...editingItem, slot: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="HOMEPAGE_HERO">Homepage Hero</option>
                <option value="CATEGORY_TOP">Category Top</option>
                <option value="SIDEBAR_FEATURED">Sidebar Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Talent Profile ID (User ID)"
                  value={editingItem.talentProfileId || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, talentProfileId: e.target.value, portfolioItemId: undefined })}
                  className="w-full border p-2 rounded"
                  disabled={!!editingItem.portfolioItemId}
                />
                <span className="self-center">OR</span>
                <input
                  type="text"
                  placeholder="Portfolio Item ID"
                  value={editingItem.portfolioItemId || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, portfolioItemId: e.target.value, talentProfileId: undefined })}
                  className="w-full border p-2 rounded"
                  disabled={!!editingItem.talentProfileId}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Override Title (Optional)</label>
              <input
                type="text"
                value={editingItem.title || ""}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <input
                type="number"
                value={editingItem.priority || 0}
                onChange={(e) => setEditingItem({ ...editingItem, priority: parseInt(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingItem.active}
                onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
              />
              <label>Active</label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3">Slot</th>
              <th className="p-3">Content</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b dark:border-gray-700">
                <td className="p-3 font-medium">{item.slot}</td>
                <td className="p-3">
                  {item.talentProfile ? (
                    <div>
                      <span className="bg-[var(--marketing-pill-bg)] dark:bg-[var(--marketing-pill-bg)] text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)] text-xs px-2 py-0.5 rounded mr-2 border border-[var(--marketing-pill-border)]">Profile</span>
                      {item.title || item.talentProfile.user.name}
                    </div>
                  ) : item.portfolioItem ? (
                    <div>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded mr-2">Portfolio</span>
                      {item.title || item.portfolioItem.title}
                    </div>
                  ) : (
                    <span className="text-red-500">Invalid Reference</span>
                  )}
                </td>
                <td className="p-3">{item.priority}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
