export type CampusLocationCategory =
  "Landmark" | "Recreation" | "Student life" | "Academic" | "Service" | "Residence";

export type MapCoordinate = readonly [latitude: number, longitude: number];

export type CampusMapData = Readonly<{
  name: string;
  sourceUrl: string;
  tileUrl: string;
  attribution: string;
  center: MapCoordinate;
  bounds: readonly [MapCoordinate, MapCoordinate];
  boundary: readonly MapCoordinate[];
}>;

export type CampusLocation = Readonly<{
  id: string;
  name: string;
  shortName: string;
  category: CampusLocationCategory;
  address: string;
  description: string;
  details: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  imageUrl: string | null;
}>;

export type CampusExplorerSnapshot = Readonly<{
  map: CampusMapData;
  locations: readonly CampusLocation[];
}>;
