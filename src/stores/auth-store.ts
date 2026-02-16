/**
 * Auth Store Type Definitions
 *
 * These types define the shape of authentication state.
 * Backend API integration implemented.
 */

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { trpc } from "@/lib/trpc";

// User type matching the backend API
export interface User {
  id: number;
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
  id: number;
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
  revokeSession: (sessionId: number) => Promise<void>;
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
            const result = await trpc.auth.login.mutate({ email, password });
            set({
              user: result.user as User,
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
            await trpc.auth.logout.mutate();
            set({ user: null, isAuthenticated: false, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        refreshAuth: async () => {
          try {
            const result = await trpc.auth.refresh.mutate();
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
            const user = await trpc.user.me.query();
            set({ user: user as User, isAuthenticated: true, isLoading: false });
          } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },

        changePassword: async (currentPassword: string, newPassword: string) => {
          try {
            await trpc.user.changePassword.mutate({
              currentPassword,
              newPassword,
            });
          } catch (error) {
            throw error;
          }
        },

        getSessions: async () => {
          try {
            const result = await trpc.user.sessions.query();
            return result.sessions as Session[];
          } catch (error) {
            throw error;
          }
        },

        revokeSession: async (sessionId: number) => {
          try {
            await trpc.user.revokeSession.mutate({ sessionId });
          } catch (error) {
            throw error;
          }
        },

        revokeAllSessions: async () => {
          try {
            await trpc.user.revokeAllSessions.mutate();
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
