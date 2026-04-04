
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns/format";
import { AdPosition } from "@prisma/client";

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: AdPosition;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  impressions: number;
  clicks: number;
}

export function AdManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    try {
      const res = await fetch("/api/admin/growth/ads");
      const data = await res.json();
      setAds(data);
    } catch (error) {
      console.error("Failed to fetch ads", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editingAd) return;

    const method = editingAd.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/growth/ads", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingAd),
    });

    if (res.ok) {
      fetchAds();
      setEditingAd(null);
    } else {
      alert("Failed to save ad");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/growth/ads?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchAds();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ad Banners</h2>
        <button
          onClick={() => setEditingAd({ active: true, position: "SIDEBAR" })}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Ad
        </button>
      </div>

      {editingAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold">
              {editingAd.id ? "Edit Ad" : "New Ad"}
            </h3>
            
            <input
              type="text"
              placeholder="Title"
              value={editingAd.title || ""}
              onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
              className="w-full border p-2 rounded"
            />
            
            <input
              type="text"
              placeholder="Image URL"
              value={editingAd.imageUrl || ""}
              onChange={(e) => setEditingAd({ ...editingAd, imageUrl: e.target.value })}
              className="w-full border p-2 rounded"
            />
            
            <input
              type="text"
              placeholder="Link URL (Optional)"
              value={editingAd.linkUrl || ""}
              onChange={(e) => setEditingAd({ ...editingAd, linkUrl: e.target.value })}
              className="w-full border p-2 rounded"
            />

            <select
              value={editingAd.position}
              onChange={(e) => setEditingAd({ ...editingAd, position: e.target.value as AdPosition })}
              className="w-full border p-2 rounded"
            >
              {Object.keys(AdPosition).map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingAd.active}
                onChange={(e) => setEditingAd({ ...editingAd, active: e.target.checked })}
              />
              <label>Active</label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingAd(null)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded mb-2" />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{ad.title}</h3>
                <p className="text-sm text-gray-500">{ad.position}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${ad.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {ad.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>👀 {ad.impressions}</span>
              <span>🖱️ {ad.clicks}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingAd(ad)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(ad.id)}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
