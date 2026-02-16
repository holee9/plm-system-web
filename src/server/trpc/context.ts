import { type NextRequest } from "next/server";

import { db } from "../db";

export async function createContext({
  req,
}: {
  req: NextRequest;
}) {
  return {
    req,
    db,
  };
}
