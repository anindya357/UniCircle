import type {
  CampusExplorerSnapshot,
  CampusLocation,
  CampusMapData,
} from "@/features/campus-explorer/types/campus-location";
import type { CampusExplorerService } from "@/services/contracts/campus-explorer-service";
import { ServiceError } from "@/services/errors/service-error";

type CampusMapRecord = {
  name: string;
  source_url: string;
  tile_url: string;
  attribution: string;
  center: CampusMapData["center"];
  bounds: CampusMapData["bounds"];
  boundary: CampusMapData["boundary"];
};

type CampusLocationRecord = {
  id: string;
  name: string;
  short_name: string;
  category: CampusLocation["category"];
  address: string;
  description: string;
  details: string;
  latitude: number;
  longitude: number;
  source_url: string;
  image_url: string | null;
};

export class ApiCampusExplorerService implements CampusExplorerService {
  async getSnapshot(): Promise<CampusExplorerSnapshot> {
    let response: Response;
    try {
      response = await fetch("/api/campus-explorer", {
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch (error) {
      throw new ServiceError("Cannot reach the campus map service.", "network", {
        cause: error,
      });
    }
    const result = await response.json().catch(() => null);
    const map = result?.data?.map as CampusMapRecord | undefined;
    const locations = result?.data?.locations as CampusLocationRecord[] | undefined;
    if (!response.ok || !map || !Array.isArray(locations)) {
      throw new ServiceError(
        result?.error?.message ?? "The CUET campus map could not be loaded.",
        response.status === 401 ? "unauthorized" : "unknown",
      );
    }
    return {
      map: {
        name: map.name,
        sourceUrl: map.source_url,
        tileUrl: map.tile_url,
        attribution: map.attribution,
        center: map.center,
        bounds: map.bounds,
        boundary: map.boundary,
      },
      locations: locations.map((item) => ({
        id: item.id,
        name: item.name,
        shortName: item.short_name,
        category: item.category,
        address: item.address,
        description: item.description,
        details: item.details,
        latitude: item.latitude,
        longitude: item.longitude,
        sourceUrl: item.source_url,
        imageUrl: item.image_url,
      })),
    };
  }
}
