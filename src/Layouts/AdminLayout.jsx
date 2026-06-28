import {
  LayoutDashboard,
  UserCog,
  Calendar,
  Receipt,
  BarChart3,
  Settings,
} from 'lucide-react';
import RoleShell from '@/Layouts/RoleShell';
import { ROLES } from '@/lib/permissions';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/staff', label: 'Staff Management', icon: UserCog },
  { to: '/admin/scheduling', label: 'Scheduling', icon: Calendar },
  { to: '/admin/billing', label: 'Billing & Invoices', icon: Receipt },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminLayout({ title, children }) {
  return (
    <RoleShell roleTheme="admin" roleLabel={ROLES.ADMIN} navItems={NAV} title={title}>
      {children}
    </RoleShell>
  );
}
