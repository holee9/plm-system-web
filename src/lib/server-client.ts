import { createTRPCProxyClient, loggerLink } from "@trpc/client";
import { callTRPCProcedure } from "@trpc/server";
import { cache } from "react";
import { AppRouter } from "@/server/trpc/router";
import { createContext } from "@/server/trpc";
import { headers } from "next/headers";

export const serverClient = cache(() => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: () => false,
      }),
      () =>
        async ({ op }) => {
          const headersList = await headers();
          const req = new Request(
            new URL(
              op.path,
              headersList.get("host")
                ? `https://${headersList.get("host")}`
                : "http://localhost:3000"
            ),
            {
              headers: headersList,
            }
          );

          const context = await createContext({ req });

          return callTRPCProcedure({
            procedures: context._def._procedures,
            path: op.path,
            rawInput: op.input,
            ctx: context,
            type: op.type,
          });
        },
    ],
  });
});
