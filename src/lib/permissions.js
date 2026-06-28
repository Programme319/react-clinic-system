export const ROLES = {
  DOCTOR: 'Doctor',
  PHARMACIST: 'Pharmacist',
  NURSE: 'Nurse',
  ADMIN: 'Administrator',
};

export const PERMISSION_LEVELS = {
  [ROLES.NURSE]: 2,
  [ROLES.PHARMACIST]: 2,
  [ROLES.DOCTOR]: 3,
  [ROLES.ADMIN]: 4,
};

export const ROLE_DASHBOARD_PATH = {
  [ROLES.DOCTOR]: '/doctor',
  [ROLES.PHARMACIST]: '/pharmacist',
  [ROLES.NURSE]: '/nurse',
  [ROLES.ADMIN]: '/admin',
};

export function getPermissionLevel(role) {
  return PERMISSION_LEVELS[role] ?? 0;
}

export function hasMinLevel(role, minLevel) {
  return getPermissionLevel(role) >= minLevel;
}

export function getDashboardPath(role) {
  return ROLE_DASHBOARD_PATH[role] || '/login';
}

export function normalizeRole(role) {
  if (!role) return ROLES.NURSE;
  const map = {
    doctor: ROLES.DOCTOR,
    pharmacist: ROLES.PHARMACIST,
    nurse: ROLES.NURSE,
    administrator: ROLES.ADMIN,
    admin: ROLES.ADMIN,
  };
  return map[role.toLowerCase()] || role;
}
