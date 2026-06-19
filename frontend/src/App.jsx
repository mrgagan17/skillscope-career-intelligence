import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages Imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import Salary from './pages/Salary';
import HiringTrends from './pages/HiringTrends';
import Locations from './pages/Locations';
import SkillGap from './pages/SkillGap';
import ResumeScanner from './pages/ResumeScanner';
import AICareerAdvisor from './pages/AICareerAdvisor';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { RefreshCw } from 'lucide-react';

// PrivateRoute wrapper for securing endpoints
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="text-brand-500 h-8 w-8 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Validating security handshake...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure dashboard routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/skills" element={<PrivateRoute><Skills /></PrivateRoute>} />
          <Route path="/salary" element={<PrivateRoute><Salary /></PrivateRoute>} />
          <Route path="/trends" element={<PrivateRoute><HiringTrends /></PrivateRoute>} />
          <Route path="/locations" element={<PrivateRoute><Locations /></PrivateRoute>} />
          <Route path="/gap" element={<PrivateRoute><SkillGap /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute><ResumeScanner /></PrivateRoute>} />
          <Route path="/advisor" element={<PrivateRoute><AICareerAdvisor /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
