import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RoleGuard from './guards/RoleGuard';
import GuestOnlyRoute from './guards/GuestOnlyRoute';
import ChatWidget from './Components/ChatWidget';
import { ROLES, getDashboardPath, isAllowedRole } from './lib/permissions';

import Welcome from './Pages/Welcome';
import Login from './Pages/Auth/Login';

import DoctorDashboard from './Pages/doctor/Dashboard';
import DoctorPatients from './Pages/doctor/Patients';
import DoctorHistory from './Pages/doctor/History';
import DoctorLabs from './Pages/doctor/Labs';
import DoctorPrescriptions from './Pages/doctor/Prescriptions';
import DoctorAppointments from './Pages/doctor/Appointments';

import PharmacistDashboard from './Pages/pharmacist/Dashboard';
import PrescriptionQueue from './Pages/pharmacist/Queue';
import DrugInventory from './Pages/pharmacist/Inventory';
import DispensingLog from './Pages/pharmacist/Dispensing';
import DrugInteractions from './Pages/pharmacist/Interactions';

import NurseDashboard from './Pages/nurse/Dashboard';
import NursePatients from './Pages/nurse/Patients';
import VitalsEntry from './Pages/nurse/Vitals';
import NurseTasks from './Pages/nurse/Tasks';
import MAR from './Pages/nurse/MAR';

import AdminDashboard from './Pages/admin/Dashboard';
import StaffManagement from './Pages/admin/Staff';
import AdminScheduling from './Pages/admin/Scheduling';
import AdminBilling from './Pages/admin/Billing';
import AdminReports from './Pages/admin/Reports';
import AdminSettings from './Pages/admin/Settings';

function RoleRedirect() {
  const { authUser, loading } = useAuth();
  if (loading) return null;
  if (!authUser || !isAllowedRole(authUser.role)) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(authUser.role)} replace />;
}

function AuthenticatedChat() {
  const { authUser, loading } = useAuth();
  if (loading || !authUser || !isAllowedRole(authUser.role)) return null;
  return <ChatWidget />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Doctor — Level 3 */}
      <Route path="/doctor" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorDashboard /></RoleGuard>} />
      <Route path="/doctor/patients" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorPatients /></RoleGuard>} />
      <Route path="/doctor/history" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorHistory /></RoleGuard>} />
      <Route path="/doctor/history/:id" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorHistory /></RoleGuard>} />
      <Route path="/doctor/labs" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorLabs /></RoleGuard>} />
      <Route path="/doctor/prescriptions" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorPrescriptions /></RoleGuard>} />
      <Route path="/doctor/appointments" element={<RoleGuard allowedRoles={[ROLES.DOCTOR]}><DoctorAppointments /></RoleGuard>} />

      {/* Pharmacist — Level 2 */}
      <Route path="/pharmacist" element={<RoleGuard allowedRoles={[ROLES.PHARMACIST]}><PharmacistDashboard /></RoleGuard>} />
      <Route path="/pharmacist/queue" element={<RoleGuard allowedRoles={[ROLES.PHARMACIST]}><PrescriptionQueue /></RoleGuard>} />
      <Route path="/pharmacist/inventory" element={<RoleGuard allowedRoles={[ROLES.PHARMACIST]}><DrugInventory /></RoleGuard>} />
      <Route path="/pharmacist/dispensing" element={<RoleGuard allowedRoles={[ROLES.PHARMACIST]}><DispensingLog /></RoleGuard>} />
      <Route path="/pharmacist/interactions" element={<RoleGuard allowedRoles={[ROLES.PHARMACIST]}><DrugInteractions /></RoleGuard>} />

      {/* Nurse — Level 2 */}
      <Route path="/nurse" element={<RoleGuard allowedRoles={[ROLES.NURSE]}><NurseDashboard /></RoleGuard>} />
      <Route path="/nurse/patients" element={<RoleGuard allowedRoles={[ROLES.NURSE]}><NursePatients /></RoleGuard>} />
      <Route path="/nurse/vitals" element={<RoleGuard allowedRoles={[ROLES.NURSE]}><VitalsEntry /></RoleGuard>} />
      <Route path="/nurse/tasks" element={<RoleGuard allowedRoles={[ROLES.NURSE]}><NurseTasks /></RoleGuard>} />
      <Route path="/nurse/mar" element={<RoleGuard allowedRoles={[ROLES.NURSE]}><MAR /></RoleGuard>} />

      {/* Administrator — Level 4 */}
      <Route path="/admin" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></RoleGuard>} />
      <Route path="/admin/staff" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><StaffManagement /></RoleGuard>} />
      <Route path="/admin/scheduling" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><AdminScheduling /></RoleGuard>} />
      <Route path="/admin/billing" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><AdminBilling /></RoleGuard>} />
      <Route path="/admin/reports" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><AdminReports /></RoleGuard>} />
      <Route path="/admin/settings" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><AdminSettings /></RoleGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <AuthenticatedChat />
      </Router>
    </AuthProvider>
  );
}

export default App;
