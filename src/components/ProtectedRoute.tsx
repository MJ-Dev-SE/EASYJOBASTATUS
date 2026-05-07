import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/Spinner';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Save the location they were trying to access would be a nice-to-have, 
    // but for now just redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
