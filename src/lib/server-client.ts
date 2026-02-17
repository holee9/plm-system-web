import { cache } from "react";
import { appRouter } from "@/server/trpc/router";
import { createContext } from "@/server/trpc";
import { headers } from "next/headers";
import { type NextRequest } from "next/server";

/**
 * Server-side tRPC caller
 * This creates a cached tRPC client for use in Server Components
 *
 * @example
 * ```ts
 * import { serverClient } from "@/lib/server-client";
 *
 * export default async function Page() {
 *   const users = await serverClient.user.list();
 *   return <div>{users.length} users</div>;
 * }
 * ```
 */
const createCaller = cache(async () => {
  const headersList = await headers();

  // Create a NextRequest-like object for context creation
  const req = {
    headers: headersList,
    // Add other NextRequest properties as needed
  } as unknown as NextRequest;

  const context = await createContext({ req });

  return appRouter.createCaller(context);
});

/**
 * Server-side tRPC caller
 * This creates a cached tRPC client for use in Server Components
 *
 * @example
 * ```ts
 * import { serverClient } from "@/lib/server-client";
 *
 * export default async function Page() {
 *   const caller = await serverClient;
 *   const users = await caller.user.list();
 *   return <div>{users.length} users</div>;
 * }
 * ```
 */
export const serverClient = createCaller;
