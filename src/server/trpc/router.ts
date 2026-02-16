import { z } from "zod";

import { router as createTRPCRouter } from "./index";
import { healthRouter } from "./routers/health";
import { issueRouter } from "~/modules/issue"; // New issue router
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { teamRouter } from "./routers/team";
import { projectRouter } from "./routers/project";
import { plmRouter } from "~/modules/plm";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  issue: issueRouter, // Updated to new implementation
  auth: authRouter,
  user: userRouter,
  team: teamRouter,
  project: projectRouter,
  plm: plmRouter,
});

export type AppRouter = typeof appRouter;
