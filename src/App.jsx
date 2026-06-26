import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import ChatWidget from './Components/ChatWidget';

import Welcome from './Pages/Welcome';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import ConfirmPassword from './Pages/Auth/ConfirmPassword';
import VerifyEmail from './Pages/Auth/VerifyEmail';

import Dashboard from './Pages/Dashboard';
import ProfileEdit from './Pages/Profile/Edit';

import PatientIndex from './Pages/Patient/Index';
import PatientCreate from './Pages/Patient/Create';
import PatientShow from './Pages/Patient/Show';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-password" element={<ConfirmPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientIndex />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/create"
            element={
              <ProtectedRoute>
                <PatientCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientShow />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;
