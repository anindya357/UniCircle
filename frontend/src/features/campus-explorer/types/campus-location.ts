export type CampusLocationCategory =
  "Landmark" | "Recreation" | "Student life" | "Academic";

export type CampusLocation = Readonly<{
  id: string;
  name: string;
  shortName: string;
  category: CampusLocationCategory;
  address: string;
  description: string;
  details: string;
  mapPosition: Readonly<{ x: number; y: number }>;
}>;
