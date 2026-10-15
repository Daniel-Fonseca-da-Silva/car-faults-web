import type { Metadata } from "next";

import {
  buildVehiclePageMetadata,
  type VehiclePageParams,
  VehiclePageView,
} from "./vehicle-page";

// Rendered on the first visit, then served from the cache and refreshed in
// the background at most this often (seconds; matches the catalog fetch
// cache). Admin edits refresh it sooner through the public catalog tag.
export const revalidate = 10800;

// No vehicle is built ahead of time: each page is generated on its first
// visit and cached from then on.
export function generateStaticParams(): VehiclePageParams[] {
  return [];
}

interface VehiclePageProps {
  params: Promise<VehiclePageParams>;
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  return buildVehiclePageMetadata(await params);
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  return <VehiclePageView params={await params} />;
}
