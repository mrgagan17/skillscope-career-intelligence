import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Top Header Navigation */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar Panel Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Pane */}
      <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
