import { describe, it, expect } from "vitest";
import { appRouter } from "../../src/server/trpc/router";
import { createContext } from "../../src/server/trpc/context";

describe("tRPC Health Check", () => {
  it("should return status ok", async () => {
    const caller = appRouter.createCaller(await createContext({ req: {} as any }));

    const result = await caller.health.check();

    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });

  it("should accept optional input", async () => {
    const caller = appRouter.createCaller(await createContext({ req: {} as any }));

    const result = await caller.health.check({ status: "test" });

    expect(result.status).toBe("ok");
    expect(result.input).toEqual({ status: "test" });
  });
});
