import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <MobileNav />
      <main className="transition-all duration-300 lg:pl-64">
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" toastOptions={{
        className: 'glass-card text-sm font-medium',
        duration: 4000,
      }} />
    </div>
  );
};
