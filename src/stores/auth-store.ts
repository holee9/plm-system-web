/**
 * Auth Store Type Definitions
 *
 * These types define the shape of authentication state.
 * Backend API integration implemented.
 */

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "@/server/trpc/router";

// User type matching the backend API
export interface User {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  image?: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session type for session management
export interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

// Auth store state interface
export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // Session management
  getSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;

  // Internal actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: true,

        // Actions
        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const caller = trpc as unknown as AppRouter;
            const result = await (caller as any).auth.login.mutate({ email, password });
            set({
              user: result.user?.data?.user || result.data?.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            const caller = trpc as unknown as AppRouter;
            await (caller as any).auth.logout.mutate();
            set({ user: null, isAuthenticated: false, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        refreshAuth: async () => {
          try {
            const caller = trpc as unknown as AppRouter;
            await (caller as any).auth.refresh.mutate();
            // Token is refreshed automatically via cookies
            // No state change needed
          } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            throw error;
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const caller = trpc as unknown as AppRouter;
            const user = await (caller as any).user.me.query();
            set({
              user: user?.data || user,
              isAuthenticated: true,
              isLoading: false
            });
          } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },

        changePassword: async (currentPassword: string, newPassword: string) => {
          try {
            const caller = trpc as unknown as AppRouter;
            await (caller as any).user.changePassword.mutate({
              currentPassword,
              newPassword,
            });
          } catch (error) {
            throw error;
          }
        },

        getSessions: async () => {
          try {
            const caller = trpc as unknown as AppRouter;
            const result = await (caller as any).user.sessions.query();
            return result?.data?.sessions || result?.sessions || [];
          } catch (error) {
            throw error;
          }
        },

        revokeSession: async (sessionId: string) => {
          try {
            const caller = trpc as unknown as AppRouter;
            await (caller as any).user.revokeSession.mutate({ sessionId });
          } catch (error) {
            throw error;
          }
        },

        revokeAllSessions: async () => {
          try {
            const caller = trpc as unknown as AppRouter;
            await (caller as any).user.revokeAllSessions.mutate();
          } catch (error) {
            throw error;
          }
        },

        // Internal actions
        setUser: (user: User | null) => {
          set({ user, isAuthenticated: !!user });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
