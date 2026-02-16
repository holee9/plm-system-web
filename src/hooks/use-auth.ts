/**
 * useAuth Hook
 *
 * A wrapper hook around the auth store that provides convenience methods
 * and consistent loading states for authentication operations.
 */

import { useAuthStore } from "@/stores/auth-store";
import type { User, Session } from "@/stores/auth-store";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    checkAuth,
    changePassword,
    getSessions,
    revokeSession,
    revokeAllSessions,
  } = useAuthStore();

  return {
    // State
    user: user as User | null,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    refreshAuth,
    checkAuth,
    changePassword,

    // Session management
    getSessions,
    revokeSession,
    revokeAllSessions,

    // Convenience getters
    isAdmin: user?.roles.includes("admin") ?? false,
    isOwner: user?.roles.includes("owner") ?? false,
    isMember: user?.roles.includes("member") ?? false,
    isViewer: user?.roles.includes("viewer") ?? false,

    // Role check helper
    hasRole: (role: string): boolean => {
      return user?.roles.includes(role) ?? false;
    },

    // Multiple roles check helper
    hasAnyRole: (roles: string[]): boolean => {
      if (!user) return false;
      return roles.some((role) => user.roles.includes(role));
    },

    // All roles check helper
    hasAllRoles: (roles: string[]): boolean => {
      if (!user) return false;
      return roles.every((role) => user.roles.includes(role));
    },
  };
}
