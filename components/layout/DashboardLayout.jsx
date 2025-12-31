'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import AppBar from './AppBar';

export default function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} userRole={user.role} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'} p-6`}>
          {children}
        </main>
      </div>
    </div>
  );
}