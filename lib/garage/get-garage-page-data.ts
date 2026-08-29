import {
  getCurrentUser,
  getCurrentUserVehicle,
  getCurrentUserVehicles,
} from "@/lib/api/users";
import { GARAGE_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { UserProfile } from "@/types/user";
import type { UserVehicle, UserVehicleDetail } from "@/types/user-vehicle";

export interface GaragePageData {
  user: UserProfile;
  vehicles: UserVehicle[];
  nextCursor: string | null;
  selectedVehicle: UserVehicleDetail | null;
}

export async function getGaragePageData(
  locale: string,
  vehicleId?: string
): Promise<GaragePageData | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const language = mapLookupLanguage(locale);

  if (vehicleId) {
    const [vehiclesPage, selectedVehicle] = await Promise.all([
      getCurrentUserVehicles({ language, limit: GARAGE_PAGE_SIZE }),
      getCurrentUserVehicle(vehicleId, language),
    ]);
    return {
      user,
      vehicles: vehiclesPage.items,
      nextCursor: vehiclesPage.nextCursor,
      selectedVehicle,
    };
  }

  const vehiclesPage = await getCurrentUserVehicles({
    language,
    limit: GARAGE_PAGE_SIZE,
  });
  const firstVehicleId = vehiclesPage.items[0]?.id;
  const selectedVehicle = firstVehicleId
    ? await getCurrentUserVehicle(firstVehicleId, language)
    : null;

  return {
    user,
    vehicles: vehiclesPage.items,
    nextCursor: vehiclesPage.nextCursor,
    selectedVehicle,
  };
}
