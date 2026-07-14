export const ADMIN_ROLES = ['super_admin', 'admin'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
