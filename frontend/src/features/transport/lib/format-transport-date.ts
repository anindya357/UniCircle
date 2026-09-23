const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { day, month, weekday, year };
}

export function formatTransportDay(date: string) {
  return SHORT_WEEKDAYS[dateParts(date).weekday];
}

export function formatTransportDate(date: string) {
  const { day, month } = dateParts(date);
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}

export function formatTransportFullDate(date: string) {
  const { day, month, weekday, year } = dateParts(date);
  return `${FULL_WEEKDAYS[weekday]}, ${day} ${FULL_MONTHS[month - 1]} ${year}`;
}

export function formatTransportTime(_date: string, time: string) {
  const [hour, minute] = time.split(":");
  return `${Number(hour)}:${minute}`;
}
