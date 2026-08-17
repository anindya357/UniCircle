import type { CampusLocation } from "@/features/campus-explorer/types/campus-location";

export const campusLocations = [
  {
    id: "gol-chottor",
    name: "Gol Chottor",
    shortName: "GC",
    category: "Landmark",
    address: "Central campus junction",
    description: "A familiar circular gathering point at the heart of campus movement.",
    details:
      "Gol Chottor connects several of CUET's main roads and is a useful meeting point for students moving between academic and residential areas.",
    mapPosition: { x: 49, y: 48 },
  },
  {
    id: "tsc",
    name: "TSC",
    shortName: "TSC",
    category: "Student life",
    address: "Student activity zone, central campus",
    description:
      "The student centre for community activities, conversation, and events.",
    details:
      "The Teacher-Student Centre is a social hub used for student activities, informal gatherings, club coordination, and campus events.",
    mapPosition: { x: 37, y: 37 },
  },
  {
    id: "basketball-ground",
    name: "Basketball Ground",
    shortName: "BB",
    category: "Recreation",
    address: "Sports area, near the central field",
    description: "An outdoor court for practice, recreation, and campus matches.",
    details:
      "The basketball ground supports daily recreation and organized games. Students commonly use the court outside scheduled academic hours.",
    mapPosition: { x: 28, y: 58 },
  },
  {
    id: "central-field",
    name: "Central Field",
    shortName: "CF",
    category: "Recreation",
    address: "Central open grounds",
    description: "The campus's large open field for sports and major gatherings.",
    details:
      "Central Field hosts football, athletics, university programs, and large student gatherings while also serving as a broad green space.",
    mapPosition: { x: 40, y: 67 },
  },
  {
    id: "gymnasium",
    name: "Gymnasium",
    shortName: "GYM",
    category: "Recreation",
    address: "Campus sports complex",
    description: "An indoor facility supporting fitness and sporting activities.",
    details:
      "The gymnasium provides space for indoor exercise and sports. Access and activity schedules may vary during university events.",
    mapPosition: { x: 20, y: 73 },
  },
  {
    id: "stores",
    name: "Stores",
    shortName: "ST",
    category: "Student life",
    address: "Campus service and shopping area",
    description: "Convenient everyday supplies and services within the campus.",
    details:
      "Campus stores serve routine student needs, from stationery and snacks to other small essentials, without requiring a trip outside campus.",
    mapPosition: { x: 62, y: 57 },
  },
  {
    id: "halls",
    name: "Halls",
    shortName: "HL",
    category: "Student life",
    address: "Residential zones across campus",
    description: "Student residences that form the centre of campus community life.",
    details:
      "CUET's halls provide residential accommodation and shared spaces. Multiple hall buildings are distributed through the residential side of campus.",
    mapPosition: { x: 78, y: 70 },
  },
  {
    id: "academic-buildings",
    name: "Academic Buildings",
    shortName: "AB",
    category: "Academic",
    address: "Academic core, CUET campus",
    description:
      "Teaching, laboratory, and departmental spaces across the academic core.",
    details:
      "The academic buildings contain classrooms, laboratories, faculty offices, and departmental facilities used throughout the teaching day.",
    mapPosition: { x: 68, y: 32 },
  },
  {
    id: "research-centres",
    name: "Research Centres",
    shortName: "RC",
    category: "Academic",
    address: "Research and innovation area",
    description:
      "Specialized spaces supporting research, collaboration, and innovation.",
    details:
      "Research centres bring together facilities for advanced study, interdisciplinary projects, and collaboration with academic and industry partners.",
    mapPosition: { x: 83, y: 39 },
  },
] as const satisfies readonly CampusLocation[];
