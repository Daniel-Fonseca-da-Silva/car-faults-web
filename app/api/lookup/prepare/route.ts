import { NextResponse, type NextRequest } from "next/server";

import { serverApiFetch } from "@/lib/api/server-client";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";

interface PrepareLookupBody {
  brand?: string;
  model?: string;
  year?: number;
  engine?: string;
  fuelType?: string;
  doors?: number | null;
  language?: LookupLanguage;
  turnstileToken?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as PrepareLookupBody;
  const { brand, model, year, engine, fuelType, doors, language, turnstileToken } =
    body;

  if (!brand || !model || !year || !engine || !fuelType) {
    return NextResponse.json({ error: "INVALID_CRITERIA" }, { status: 400 });
  }

  if (!turnstileToken) {
    return NextResponse.json(
      { error: "TURNSTILE_REQUIRED" },
      { status: 400 }
    );
  }

  const query = new URLSearchParams({
    brand,
    model,
    year: String(year),
    engine,
    fuelType,
  });
  if (doors != null) query.set("doors", String(doors));
  if (language) query.set("language", language);

  const response = await serverApiFetch(`/v1/lookups?${query.toString()}`, {
    headers: { "x-turnstile-token": turnstileToken },
  });

  if (response.status === 403) {
    return NextResponse.json({ error: "TURNSTILE_REQUIRED" }, { status: 403 });
  }

  if (response.status === 400) {
    return NextResponse.json({ error: "INVALID_CRITERIA" }, { status: 400 });
  }

  if (!response.ok) {
    return NextResponse.json({ error: "LOOKUP_FAILED" }, { status: 502 });
  }

  const href = buildLookupHref({ brand, model, year, engine, fuelType, doors });

  return NextResponse.json({ href });
}
