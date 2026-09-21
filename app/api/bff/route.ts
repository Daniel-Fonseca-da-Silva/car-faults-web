import { NextResponse, type NextRequest } from "next/server";

import { serverApiFetch } from "@/lib/api/server-client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.searchParams.get("path");

  if (!path || !path.startsWith("/v1/")) {
    return NextResponse.json({ error: "INVALID_PATH" }, { status: 400 });
  }

  const response = await serverApiFetch(path);
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
