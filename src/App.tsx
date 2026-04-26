/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { ApplicationDetail } from './pages/ApplicationDetail';
import { AIFitAnalyzer } from './pages/AIFitAnalyzer';
import { CompanyResearch } from './pages/CompanyResearch';
import { ContactFinder } from './pages/ContactFinder';
import { FollowUpAssistant } from './pages/FollowUpAssistant';
import { Reminders } from './pages/Reminders';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/ai-fit-analyzer" element={<AIFitAnalyzer />} />
            <Route path="/company-research" element={<CompanyResearch />} />
            <Route path="/contact-finder" element={<ContactFinder />} />
            <Route path="/follow-up" element={<FollowUpAssistant />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
