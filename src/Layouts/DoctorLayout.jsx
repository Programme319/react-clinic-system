import {
  LayoutDashboard,
  Users,
  FileText,
  FlaskConical,
  Pill,
  Calendar,
} from 'lucide-react';
import RoleShell from '@/Layouts/RoleShell';
import { ROLES } from '@/lib/permissions';

const NAV = [
  { to: '/doctor', label: 'Overview', icon: LayoutDashboard },
  { to: '/doctor/patients', label: 'Patient List', icon: Users },
  { to: '/doctor/history', label: 'Medical History', icon: FileText },
  { to: '/doctor/labs', label: 'Lab Results', icon: FlaskConical },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
];

export default function DoctorLayout({ title, children }) {
  return (
    <RoleShell roleTheme="doctor" roleLabel={ROLES.DOCTOR} navItems={NAV} title={title}>
      {children}
    </RoleShell>
  );
}

export { NAV as doctorNav };
