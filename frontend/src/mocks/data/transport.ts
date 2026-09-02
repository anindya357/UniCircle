import type {
  BusDriver,
  BusType,
  RouteAssignment,
  TransportBus,
  TransportRoute,
  TransportSnapshot,
  TransportTrip,
} from "@/features/transport/types/transport";

const busSeeds: readonly { name: string; type: BusType }[] = [
  { name: "Tista", type: "student" },
  { name: "Gomoti", type: "student" },
  { name: "Podma", type: "student" },
  { name: "Surma", type: "student" },
  { name: "Jamuna", type: "student" },
  { name: "Sangu", type: "student" },
  { name: "Ichamoti", type: "student" },
  { name: "Buriganga", type: "student" },
  { name: "Halda", type: "student" },
  { name: "Meghna", type: "student" },
  { name: "BRTC-1", type: "teacher" },
  { name: "BRTC-2", type: "teacher" },
  { name: "BRTC-3", type: "staff" },
  { name: "BRTC-4", type: "staff" },
  { name: "Kortoa", type: "teacher" },
  { name: "Chitra", type: "staff" },
  { name: "Brahmaputra", type: "student" },
  { name: "Kopotakkho", type: "student" },
  { name: "Dhanshiri", type: "staff" },
  { name: "Dhaleshwari", type: "teacher" },
];

const driverSeeds = [
  ["Abdul Karim", "+880 1711-240101"],
  ["Mohammad Selim", "+880 1711-240102"],
  ["Nurul Amin", "+880 1711-240103"],
  ["Jahangir Alam", "+880 1711-240104"],
  ["Shafiqul Islam", "+880 1711-240105"],
  ["Mizanur Rahman", "+880 1711-240106"],
  ["Abu Taher", "+880 1711-240107"],
  ["Kamal Hossain", "+880 1711-240108"],
  ["Saiful Islam", "+880 1711-240109"],
  ["Anwar Hossain", "+880 1711-240110"],
  ["Harun Or Rashid", "+880 1711-240111"],
  ["Shahidul Alam", "+880 1711-240112"],
  ["Monir Hossain", "+880 1711-240113"],
  ["Rafiqul Islam", "+880 1711-240114"],
  ["Zakir Hossain", "+880 1711-240115"],
  ["Mostafa Kamal", "+880 1711-240116"],
  ["Abdul Mannan", "+880 1711-240117"],
  ["Belal Uddin", "+880 1711-240118"],
  ["Nasir Ahmed", "+880 1711-240119"],
  ["Habibur Rahman", "+880 1711-240120"],
] as const;

const drivers: readonly BusDriver[] = driverSeeds.map(([name, phone], index) => ({
  id: `driver-${index + 1}`,
  name,
  phone,
  emergencyContact: "+880 2333-350101",
}));

const buses: readonly TransportBus[] = busSeeds.map((bus, index) => ({
  id: `bus-${index + 1}`,
  name: bus.name,
  type: bus.type,
  registration: `CUET-${String(index + 1).padStart(2, "0")}`,
  driverId: drivers[index].id,
}));

const routes = [
  {
    id: "regular-route",
    name: "Regular route",
    outboundStops: [
      "Bottoli Rail Station",
      "GEC",
      "Muradpur",
      "Bahaddarhat",
      "Rastar Matha",
      "CUET",
    ],
    returnStops: [
      "CUET",
      "Rastar Matha",
      "Bahaddarhat",
      "Muradpur",
      "GEC",
      "Bottoli Rail Station",
    ],
  },
  {
    id: "chawkbazar-route",
    name: "Chawkbazar route",
    outboundStops: [
      "Bottoli Rail Station",
      "Kotowali",
      "Chawkbazar",
      "Bahaddarhat",
      "Rastar Matha",
      "CUET",
    ],
    returnStops: [
      "CUET",
      "Rastar Matha",
      "Bahaddarhat",
      "Chawkbazar",
      "Kotowali",
      "Bottoli Rail Station",
    ],
  },
  {
    id: "rastar-matha-loop",
    name: "Rastar Matha return loop",
    outboundStops: ["CUET", "Rastar Matha", "CUET"],
    returnStops: ["CUET", "Rastar Matha", "CUET"],
  },
] as const satisfies readonly TransportRoute[];

const busIds = buses.map((bus) => bus.id);

function rotateBusIds(offset: number) {
  return [...busIds.slice(offset), ...busIds.slice(0, offset)];
}

function stationAssignments(offset: number): readonly RouteAssignment[] {
  const assignedBuses = rotateBusIds(offset).slice(0, 11);

  return [
    { routeId: "regular-route", busIds: assignedBuses.slice(0, 9) },
    { routeId: "chawkbazar-route", busIds: assignedBuses.slice(9, 11) },
  ];
}

function createServiceDay(date: string, offset: number): readonly TransportTrip[] {
  return [
    {
      id: `${date}-morning-campus`,
      date,
      startTime: "07:00",
      endTime: "08:20",
      title: "Morning campus arrival",
      direction: "to-campus",
      origin: "Bottoli Rail Station",
      destination: "CUET",
      assignments: stationAssignments(offset),
    },
    {
      id: `${date}-midday-loop`,
      date,
      startTime: "13:30",
      endTime: "15:00",
      title: "Midday city return",
      direction: "round-trip",
      origin: "CUET",
      destination: "Rastar Matha and return",
      assignments: [
        {
          routeId: "rastar-matha-loop",
          busIds: rotateBusIds((offset + 11) % busIds.length).slice(0, 4),
        },
      ],
    },
    {
      id: `${date}-afternoon-city`,
      date,
      startTime: "16:15",
      endTime: "17:45",
      title: "Afternoon city departure",
      direction: "from-campus",
      origin: "CUET",
      destination: "Bottoli Rail Station",
      assignments: stationAssignments((offset + 3) % busIds.length),
    },
    {
      id: `${date}-night-campus`,
      date,
      startTime: "20:30",
      endTime: "22:00",
      title: "Night campus return",
      direction: "to-campus",
      origin: "Bottoli Rail Station",
      destination: "CUET",
      assignments: stationAssignments((offset + 6) % busIds.length),
    },
  ];
}

const trips = [
  ...createServiceDay("2026-09-01", 0),
  ...createServiceDay("2026-09-02", 1),
  ...createServiceDay("2026-09-03", 2),
  ...createServiceDay("2026-09-06", 3),
  ...createServiceDay("2026-09-07", 4),
  ...createServiceDay("2026-09-08", 5),
];

export const mockTransportSnapshot: TransportSnapshot = {
  referenceDate: "2026-09-02",
  availableDates: [
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
    "2026-09-07",
    "2026-09-08",
  ],
  buses,
  drivers,
  routes,
  trips,
};
