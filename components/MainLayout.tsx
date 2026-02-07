'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AdSidebar from './AdSidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  // Check for homepage - handle root and locale routes
  const isHomePage = !pathname || pathname === '/' || pathname === '/en' || pathname === '/en-gb' || pathname.match(/^\/[a-z]{2}(-[A-Z]{2})?$/);

  return (
    <div className="flex min-w-0">
      {/* Fixed Sidebar component */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Spacer to account for fixed sidebar width so main content doesn't sit underneath it */}
      <div
        className={`transition-all duration-300 shrink-0 ${isCollapsed ? 'w-20' : 'w-60'}`}
        aria-hidden="true"
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-w-0">
          {children}
        </main>
        <Footer />
      </div>

      {/* Advertisement sidebar: only show on homepage and large screens */}
      {isHomePage && (
        <div className="block shrink-0">
          <AdSidebar />
        </div>
      )}
    </div>
  );
}