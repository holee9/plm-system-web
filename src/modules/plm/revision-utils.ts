/**
 * Revision code utilities for PLM system
 * Handles progression: A -> B -> ... -> Z -> AA -> AB -> ... -> ZZ -> AAA -> ...
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Get the next revision code in sequence
 * @param current - Current revision code (null for first revision)
 * @returns Next revision code
 */
export function getNextRevisionCode(current: string | null): string {
  if (current === null) {
    return "A";
  }

  if (!isValidCode(current)) {
    throw new Error(`Invalid revision code: ${current}`);
  }

  // Increment like base-26 number (A=0, B=1, ..., Z=25)
  const chars = current.split("");
  let position = chars.length - 1;

  while (position >= 0) {
    const currentIndex = ALPHABET.indexOf(chars[position]);

    if (currentIndex < ALPHABET.length - 1) {
      // Simple increment: A -> B, B -> C, etc.
      chars[position] = ALPHABET[currentIndex + 1];
      return chars.join("");
    } else {
      // Overflow: Z -> A with carry
      chars[position] = "A";
      position--;
    }
  }

  // All characters were Z, need to add new character: ZZ -> AAA
  return "A" + chars.join("");
}

/**
 * Get the previous revision code in sequence
 * @param current - Current revision code
 * @returns Previous revision code, or null if current is "A" (first revision)
 */
export function getPreviousRevisionCode(current: string): string | null {
  if (!isValidCode(current)) {
    throw new Error(`Invalid revision code: ${current}`);
  }

  if (current === "A") {
    return null;
  }

  // Decrement like base-26 number
  const chars = current.split("");
  let position = chars.length - 1;

  while (position >= 0) {
    const currentIndex = ALPHABET.indexOf(chars[position]);

    if (currentIndex > 0) {
      // Simple decrement: B -> A, C -> B, etc.
      chars[position] = ALPHABET[currentIndex - 1];
      return chars.join("");
    } else {
      // Underflow: A -> Z with borrow
      chars[position] = "Z";
      position--;
    }
  }

  // First character underflow, remove it: AA -> Z, AAA -> ZZ
  // After loop, all characters became Z, so remove first Z
  return chars.slice(1).join("");
}

/**
 * Validate revision code format
 * @param code - Revision code to validate
 * @returns true if valid, false otherwise
 */
export function validateRevisionCode(code: string | null | undefined): boolean {
  if (code === null || code === undefined) {
    return false;
  }

  if (code.length === 0) {
    return false;
  }

  // Must be all uppercase letters
  return /^[A-Z]+$/.test(code);
}

/**
 * Check if a code is a valid revision code format
 */
function isValidCode(code: string): boolean {
  return /^[A-Z]+$/.test(code);
}

/**
 * Compare two revision codes
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareRevisionCodes(a: string, b: string): number {
  // First compare by length (shorter is earlier: A < AA)
  if (a.length !== b.length) {
    return a.length - b.length;
  }

  // Same length, compare lexicographically
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Sort revision codes in ascending order
 */
export function sortRevisionCodes(codes: string[]): string[] {
  return [...codes].sort(compareRevisionCodes);
}
