export type BusType = "student" | "teacher" | "staff";
export type RouteDirection = "to-campus" | "from-campus" | "round-trip";

export type TransportBus = Readonly<{
  id: string;
  name: string;
  type: BusType;
  registration: string;
  driverId: string;
}>;

export type BusDriver = Readonly<{
  id: string;
  name: string;
  phone: string;
  emergencyContact: string;
}>;

export type TransportRoute = Readonly<{
  id: string;
  name: string;
  outboundStops: readonly string[];
  returnStops: readonly string[];
}>;

export type RouteAssignment = Readonly<{
  routeId: string;
  busIds: readonly string[];
}>;

export type TransportTrip = Readonly<{
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  direction: RouteDirection;
  origin: string;
  destination: string;
  assignments: readonly RouteAssignment[];
}>;

export type TransportSnapshot = Readonly<{
  referenceDate: string;
  availableDates: readonly string[];
  buses: readonly TransportBus[];
  drivers: readonly BusDriver[];
  routes: readonly TransportRoute[];
  trips: readonly TransportTrip[];
}>;
