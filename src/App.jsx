import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Global Styles & Components
import ChatWidget from './Components/ChatWidget';

// Layouts
import GuestLayout from './Layouts/GuestLayout';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';

// Pages: Public & Auth
import Welcome from './Pages/Welcome';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import ConfirmPassword from './Pages/Auth/ConfirmPassword';
import VerifyEmail from './Pages/Auth/VerifyEmail';

// Pages: Protected Dashboard & Profile
import Dashboard from './Pages/Dashboard';
import ProfileEdit from './Pages/Profile/Edit';

// Pages: Patients Management
import PatientIndex from './Pages/Patient/Index';
import PatientCreate from './Pages/Patient/Create';
import PatientShow from './Pages/Patient/Show';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Welcome />} />

        {/* --- Guest / Auth Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-password" element={<ConfirmPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* --- Protected Routes --- */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileEdit />} />

        {/* --- Patient Management Routes --- */}
        <Route path="/patients" element={<PatientIndex />} />
        <Route path="/patients/create" element={<PatientCreate />} />
        <Route path="/patients/:id" element={<PatientShow />} />

        {/* --- Catch-All Fallback --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Persistent global widgets */}
      <ChatWidget />
    </Router>
  );
}

export default App;