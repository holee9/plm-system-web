/**
 * ProtectedRoute Component
 *
 * A wrapper component that requires authentication to access its children.
 * Supports role-based access control (RBAC) through the requiredRoles prop.
 */

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "./LoadingSpinner";
import { designTokens } from "@/lib/design-tokens";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    // Skip redirect logic while loading
    if (isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check role-based access control
    if (requiredRoles && requiredRoles.length > 0 && user) {
      const hasRole = requiredRoles.some((role) => user.roles.includes(role));
      if (!hasRole) {
        router.push("/unauthorized");
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRoles]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check role access before rendering
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      return null; // Will redirect to /unauthorized
    }
  }

  return <>{children}</>;
}

// Display name for debugging
ProtectedRoute.displayName = "ProtectedRoute";
