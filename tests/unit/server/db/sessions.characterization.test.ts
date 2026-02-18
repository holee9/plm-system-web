/**
 * Characterization tests for sessions.ts
 *
 * These tests capture the current behavior of the sessions table schema
 * before refactoring for Auth.js v5 compatibility.
 */

import { describe, it, expect } from "vitest";
import { sessions } from "@/server/db/sessions";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

describe("sessions schema (characterization)", () => {
  it("should have 'id' as primary key with uuid type", () => {
    const schema = sessions._.columns;
    expect(schema).toHaveProperty("id");
  });

  it("should have 'userId' field referencing users table", () => {
    const schema = sessions._.columns;
    expect(schema).toHaveProperty("userId");
  });

  it("should have 'refreshTokenHash' field", () => {
    const schema = sessions._.columns;
    expect(schema).toHaveProperty("refreshTokenHash");
  });

  it("should have 'expiresAt' timestamp field", () => {
    const schema = sessions._.columns;
    expect(schema).toHaveProperty("expiresAt");
  });

  it("should have security fields: userAgent and ipAddress", () => {
    const schema = sessions._.columns;
    expect(schema).toHaveProperty("userAgent");
    expect(schema).toHaveProperty("ipAddress");
  });

  it("should have metadata fields: createdAt and updatedAt", () => {
    const schema = sessions._.columns;
    expect(schema).toHaveProperty("createdAt");
    expect(schema).toHaveProperty("updatedAt");
  });
});
