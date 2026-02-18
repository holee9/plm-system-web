/**
 * OAuth Providers Configuration
 *
 * Configures GitHub and Google OAuth providers for Auth.js v5.
 *
 * Features:
 * - GitHub OAuth integration
 * - Google OAuth integration
 * - Automatic account creation
 * - Email verification (OAuth users have emailVerified=true)
 * - OAuth users have password=null
 * - Account linking support (same email across providers)
 *
 * FR-009: 가능하면 GitHub/Google OAuth 로그인을 제공한다
 *
 * Environment Variables Required:
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 *
 * @task TASK-013
 */

import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Get OAuth providers configuration
 *
 * Returns array of configured OAuth providers based on environment variables.
 * Providers are only included if their credentials are properly configured.
 */
export function getOAuthProviders() {
  const providers: NextAuthConfig["providers"] = [];

  // GitHub OAuth Provider
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // Allow user to see their public profile
        profile(profile) {
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            email: profile.email,
            image: profile.avatar_url,
            // OAuth users are considered email verified
            emailVerified: new Date(),
          };
        },
      })
    );
  }

  // Google OAuth Provider
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Allow user to see their email and profile
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            // OAuth users are considered email verified
            emailVerified: new Date(),
          };
        },
      })
    );
  }

  return providers;
}

/**
 * OAuth Provider Types
 *
 * Supported OAuth providers for type checking and validation.
 */
export type OAuthProvider = "github" | "google";

/**
 * Check if OAuth is configured
 *
 * Returns true if at least one OAuth provider is properly configured.
 */
export function isOAuthConfigured(): boolean {
  const hasGitHub = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return hasGitHub || hasGoogle;
}

/**
 * Get configured OAuth provider names
 *
 * Returns array of provider IDs that are properly configured.
 */
export function getConfiguredProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push("github");
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push("google");
  }

  return providers;
}

/**
 * Validate OAuth configuration
 *
 * Validates that all required environment variables are set for configured providers.
 * Returns validation result with any missing credentials.
 */
export function validateOAuthConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check GitHub configuration
  const hasGitHubId = !!process.env.GITHUB_CLIENT_ID;
  const hasGitHubSecret = !!process.env.GITHUB_CLIENT_SECRET;

  if (hasGitHubId && !hasGitHubSecret) {
    errors.push("GitHub: GITHUB_CLIENT_SECRET is missing");
  }

  if (!hasGitHubId && hasGitHubSecret) {
    errors.push("GitHub: GITHUB_CLIENT_ID is missing");
  }

  // Check Google configuration
  const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID;
  const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET;

  if (hasGoogleId && !hasGoogleSecret) {
    errors.push("Google: GOOGLE_CLIENT_SECRET is missing");
  }

  if (!hasGoogleId && hasGoogleSecret) {
    errors.push("Google: GOOGLE_CLIENT_ID is missing");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
