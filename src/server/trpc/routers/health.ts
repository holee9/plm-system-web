import { z } from "zod";

import { publicProcedure, router } from "../index";

export const healthRouter = router({
  check: publicProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(({ input }) => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        input,
      };
    }),
});
