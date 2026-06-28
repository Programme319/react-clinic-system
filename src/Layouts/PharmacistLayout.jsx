import {
  LayoutDashboard,
  ClipboardList,
  Package,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import RoleShell from '@/Layouts/RoleShell';
import { ROLES } from '@/lib/permissions';

const NAV = [
  { to: '/pharmacist', label: 'Overview', icon: LayoutDashboard },
  { to: '/pharmacist/queue', label: 'Prescription Queue', icon: ClipboardList },
  { to: '/pharmacist/inventory', label: 'Drug Inventory', icon: Package },
  { to: '/pharmacist/dispensing', label: 'Dispensing Log', icon: BookOpen },
  { to: '/pharmacist/interactions', label: 'Drug Interactions', icon: AlertTriangle },
];

export default function PharmacistLayout({ title, children }) {
  return (
    <RoleShell roleTheme="pharmacist" roleLabel={ROLES.PHARMACIST} navItems={NAV} title={title}>
      {children}
    </RoleShell>
  );
}
