import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Spinner } from '../ui/Spinner';

export const Layout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
