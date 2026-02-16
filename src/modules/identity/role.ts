// Identity module - Role and permissions
// Placeholder for RBAC implementation

export type UserRole = 'admin' | 'owner' | 'member' | 'viewer';

export interface Role {
  id: string;
  name: UserRole;
  permissions: string[];
}

export const roleHierarchy: Record<UserRole, number> = {
  admin: 4,
  owner: 3,
  member: 2,
  viewer: 1,
};
