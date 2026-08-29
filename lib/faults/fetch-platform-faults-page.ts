import { apiFetch } from "@/lib/api/client";
import type { TopFaultDto } from "@/lib/api/platform-map";
import {
  buildPlatformFaultsSearch,
  mapPlatformFaultsPage,
  type PlatformFaultsPage,
  type PlatformFaultsQuery,
} from "@/lib/api/platform-query";

export async function fetchPlatformFaultsPage(
  query: PlatformFaultsQuery
): Promise<PlatformFaultsPage> {
  const response = await apiFetch(
    `/v1/platform/faults${buildPlatformFaultsSearch(query)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load platform faults: ${response.status}`);
  }

  return mapPlatformFaultsPage(
    (await response.json()) as {
      items: TopFaultDto[];
      nextCursor: string | null;
    }
  );
}
