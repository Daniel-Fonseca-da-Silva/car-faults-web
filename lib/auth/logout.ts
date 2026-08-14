"use server";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/api/constants";
import { serverApiFetch } from "@/lib/api/server-client";

export async function logout(): Promise<void> {
  await serverApiFetch("/v1/auth/logout", { method: "POST" }).catch(
    () => undefined
  );

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
