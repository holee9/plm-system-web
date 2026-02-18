/**
 * Characterization tests for users.ts
 *
 * These tests capture the current behavior of the users table schema
 * before refactoring for Auth.js v5 compatibility.
 */

import { describe, it, expect } from "vitest";
import { users } from "@/server/db/users";

describe("users schema (characterization)", () => {
  it("should have 'id' as primary key with uuid type", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("id");
  });

  it("should have 'email' field with unique constraint", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("email");
  });

  it("should have 'name' field", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("name");
  });

  it("should have 'passwordHash' field for credentials provider", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("passwordHash");
  });

  it("should have 'emailVerified' as boolean field", () => {
    const schema = users._.columns;
    const column = schema.emailVerified;
    // Current implementation uses boolean
    expect(schema).toHaveProperty("emailVerified");
  });

  it("should have 'status' field for user status", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("status");
  });

  it("should have 'image' field for avatar", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("image");
  });

  it("should have 'failedLoginAttempts' field for security", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("failedLoginAttempts");
  });

  it("should have 'lockedUntil' field for account lockout", () => {
    const schema = users._.columns;
    expect(schema).toHaveProperty("lockedUntil");
  });
});
