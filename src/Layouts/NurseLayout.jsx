import {
  LayoutDashboard,
  Users,
  HeartPulse,
  ListTodo,
  ClipboardCheck,
} from 'lucide-react';
import RoleShell from '@/Layouts/RoleShell';
import { ROLES } from '@/lib/permissions';

const NAV = [
  { to: '/nurse', label: 'Overview', icon: LayoutDashboard },
  { to: '/nurse/patients', label: 'Assigned Patients', icon: Users },
  { to: '/nurse/vitals', label: 'Vitals Entry', icon: HeartPulse },
  { to: '/nurse/tasks', label: 'Task List', icon: ListTodo },
  { to: '/nurse/mar', label: 'MAR', icon: ClipboardCheck },
];

export default function NurseLayout({ title, children }) {
  return (
    <RoleShell roleTheme="nurse" roleLabel={ROLES.NURSE} navItems={NAV} title={title}>
      {children}
    </RoleShell>
  );
}
