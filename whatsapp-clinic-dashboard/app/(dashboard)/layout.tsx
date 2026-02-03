'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Solo visible en desktop */}
      <Sidebar />
      
      {/* Contenido principal */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header />
        
        {/* Área de contenido */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
