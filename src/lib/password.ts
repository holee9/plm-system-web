import { hash, compare } from "bcrypt-ts";

// Password complexity requirements
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

const MIN_PASSWORD_LENGTH = 8;
const REQUIRED_CHARACTER_TYPES = 3; // Must have 3 of 4 types

export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  // Check character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const characterTypeCount = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  if (characterTypeCount < REQUIRED_CHARACTER_TYPES) {
    errors.push(
      `Password must contain at least ${REQUIRED_CHARACTER_TYPES} of: uppercase, lowercase, number, special character`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Hash password with bcrypt (cost factor 12)
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

// Verify password against hash
export async function verifyPassword(password: string, hashString: string): Promise<boolean> {
  return await compare(password, hashString);
}

// Generate a secure random password
export function generateSecurePassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + special;
  let password = "";

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
