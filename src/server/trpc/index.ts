import { initTRPC } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";

import { db } from "../db";

interface CreateContextOptions {
  req: NextRequest;
}

export async function createContext({ req }: CreateContextOptions) {
  return {
    req,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Re-export procedures
export {
  protectedProcedure,
  adminProcedure,
  ownerProcedure,
  memberProcedure,
  viewerProcedure,
} from "./procedures";
