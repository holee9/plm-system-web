// Password utilities - Re-export from lib/password
// This file provides backward compatibility for existing imports

export {
  hashPassword,
  verifyPassword,
  validatePasswordComplexity as validatePasswordStrength,
  generateSecurePassword,
  type PasswordValidationResult,
} from "../lib/password";
