import { z } from "zod";

import { router as createTRPCRouter } from "./index";
import { healthRouter } from "./routers/health";
import { issueRouter } from "./routers/issue";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { teamRouter } from "./routers/team";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  issue: issueRouter,
  auth: authRouter,
  user: userRouter,
  team: teamRouter,
});

export type AppRouter = typeof appRouter;
