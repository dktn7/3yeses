
"use client";

import { useState } from "react";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import AdManager from "@/components/admin/AdManager";
import { FeaturedItemsManager } from "@/components/admin/FeaturedItemsManager";

export default function AdminGrowthPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "ads" | "featured">("analytics");

  return (
    <div className="flex-1 overflow-auto">
      <h1 className="text-3xl font-bold mb-6">Growth & Marketing</h1>
        
      <div className="flex gap-4 mb-8 border-b border-[var(--admin-border)]">
        <TabButton 
          label="Analytics" 
          active={activeTab === "analytics"} 
          onClick={() => setActiveTab("analytics")} 
        />
        <TabButton 
          label="Ad Manager" 
          active={activeTab === "ads"} 
          onClick={() => setActiveTab("ads")} 
        />
        <TabButton 
          label="Featured Items" 
          active={activeTab === "featured"} 
          onClick={() => setActiveTab("featured")} 
        />
      </div>

      <div className="bg-[var(--admin-surface)] rounded-xl p-1">
        {activeTab === "analytics" && <AnalyticsDashboard />}
        {activeTab === "ads" && <AdManager />}
        {activeTab === "featured" && <FeaturedItemsManager />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
        active 
          ? "border-[var(--admin-primary)] text-[var(--admin-primary)]" 
          : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
      }`}
    >
      {label}
    </button>
  );
}
