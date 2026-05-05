
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AdPosition } from "@prisma/client";

type Ad = {
  id: string;
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: AdPosition;
  active?: boolean;
  impressions?: number;
  clicks?: number;
};

export default function AdManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/growth/ads");
      if (res.ok) {
        const json = await res.json();
        setAds(json || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editingAd) return;
    const method = editingAd.id ? "PUT" : "POST";
    const url = editingAd.id ? `/api/admin/growth/ads?id=${editingAd.id}` : "/api/admin/growth/ads";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingAd),
    });
    if (res.ok) {
      await fetchAds();
      setEditingAd(null);
    } else {
      alert("Failed to save ad");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    const res = await fetch(`/api/admin/growth/ads?id=${id}`, { method: "DELETE" });
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
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold">{editingAd.id ? "Edit Ad" : "New Ad"}</h3>

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
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!editingAd.active}
                onChange={(e) => setEditingAd({ ...editingAd, active: e.target.checked })}
              />
              <label>Active</label>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingAd(null)} className="px-4 py-2 text-gray-600">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="border rounded-lg p-4 bg-light-surface dark:bg-dark-surface shadow">
            <div className="w-full h-32 relative rounded mb-2 overflow-hidden">
              {ad.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <Image src={ad.imageUrl} alt={ad.title || "ad"} fill className="object-cover" />
              ) : (
                <div className="w-full h-32 bg-gray-100" />
              )}
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{ad.title}</h3>
                <p className="text-sm text-gray-500">{ad.position}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${ad.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {ad.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>👀 {ad.impressions ?? 0}</span>
              <span>🖱️ {ad.clicks ?? 0}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditingAd(ad)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-1 rounded text-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(ad.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-1 rounded text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
