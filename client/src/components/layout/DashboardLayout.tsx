import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  showSearch
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* SINGLE Sidebar (desktop + mobile) */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onMenuToggle={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
