import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  buildVehiclePageMetadata,
  type VehiclePageParams,
  VehiclePageView,
} from "../../vehicle-page";

// Internal route: proxy.ts rewrites `<vehicle page>?doors=N` here, so the
// doors variant is a path of its own and can be cached like the vehicle
// page (reading the query string would render it on every request). Its
// canonical URL stays the vehicle page without doors.
export const revalidate = 10800;

export function generateStaticParams(): VehicleDoorsPageParams[] {
  return [];
}

interface VehicleDoorsPageParams extends VehiclePageParams {
  doors: string;
}

interface VehicleDoorsPageProps {
  params: Promise<VehicleDoorsPageParams>;
}

function parseDoors(value: string): number | null {
  return /^\d{1,2}$/.test(value) ? Number(value) : null;
}

export async function generateMetadata({
  params,
}: VehicleDoorsPageProps): Promise<Metadata> {
  const { doors, ...vehicleParams } = await params;
  const doorsCount = parseDoors(doors);
  if (doorsCount === null) return {};

  return buildVehiclePageMetadata(vehicleParams, doorsCount);
}

export default async function VehicleDoorsPage({
  params,
}: VehicleDoorsPageProps) {
  const { doors, ...vehicleParams } = await params;
  const doorsCount = parseDoors(doors);
  if (doorsCount === null) {
    notFound();
  }

  return <VehiclePageView params={vehicleParams} doors={doorsCount} />;
}
