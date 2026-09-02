const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "Asia/Dhaka",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Dhaka",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeZone: "Asia/Dhaka",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
});

function toBangladeshDate(date: string) {
  return new Date(`${date}T00:00:00+06:00`);
}

export function formatTransportDay(date: string) {
  return dayFormatter.format(toBangladeshDate(date));
}

export function formatTransportDate(date: string) {
  return dateFormatter.format(toBangladeshDate(date));
}

export function formatTransportFullDate(date: string) {
  return fullDateFormatter.format(toBangladeshDate(date));
}

export function formatTransportTime(date: string, time: string) {
  return timeFormatter.format(new Date(`${date}T${time}:00+06:00`));
}
