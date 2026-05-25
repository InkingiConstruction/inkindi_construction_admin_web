/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : App.tsx
 * WHAT THIS FILE DOES : Defines the admin-only route tree for InkingiPro web
 * HOW IT DOES IT      : Wraps routes in auth providers and protects dashboard paths
 * DATA SOURCE         : Browser URL and authenticated admin session context
 * DATA DESTINATION    : React Router route rendering
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  LoginPage,
} from './features/auth';
import { AuthProvider } from './contexts/AuthContext';
import { InboxProvider } from './contexts/InboxContext';
import { ProtectedRoute } from './shared/components';
import DashboardLayout from './features/dashboard/layouts/DashboardLayout';
import AdminOperationsPage from './features/dashboard/pages/AdminOperationsPage';

/**
 * ============================================================================
 * FUNCTION: App
 * ============================================================================
 * WHAT IT DOES: Renders the complete admin web application route structure
 * PARAMETERS: none
 * RETURNS: JSX.Element - Router with login and protected admin dashboard
 * WHO CALLS IT: main.tsx
 * PRINCIPLE: SOLID
 * ============================================================================
 */
function App() {
  return (
    <AuthProvider>
      <InboxProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/forgot-password" element={<LoginPage />} />
            <Route path="/auth/reset-password/:token" element={<LoginPage />} />
            <Route path="/oauth/callback" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOperationsPage page="overview" />} />
              <Route path="kyc" element={<AdminOperationsPage page="kyc" />} />
              <Route path="users" element={<AdminOperationsPage page="users" />} />
              <Route path="projects" element={<AdminOperationsPage page="projects" />} />
              <Route path="escrow" element={<AdminOperationsPage page="escrow" />} />
              <Route path="disputes" element={<AdminOperationsPage page="disputes" />} />
              <Route path="supply" element={<AdminOperationsPage page="supply" />} />
              <Route path="inspections" element={<AdminOperationsPage page="inspections" />} />
              <Route path="reports" element={<AdminOperationsPage page="reports" />} />
              <Route path="audit" element={<AdminOperationsPage page="audit" />} />
              <Route path="notifications" element={<AdminOperationsPage page="notifications" />} />
              <Route path="settings" element={<AdminOperationsPage page="settings" />} />
              <Route path="profile" element={<AdminOperationsPage page="profile" />} />
            </Route>
          </Routes>
        </Router>
      </InboxProvider>
    </AuthProvider>
  );
}

export default App;
