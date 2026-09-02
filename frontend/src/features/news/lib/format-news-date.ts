const newsDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeZone: "Asia/Dhaka",
});

const newsTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
});

const newsFullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeZone: "Asia/Dhaka",
});

export function formatNewsDate(timestamp: string) {
  return newsDateFormatter.format(new Date(timestamp));
}

export function formatNewsTime(timestamp: string) {
  return newsTimeFormatter.format(new Date(timestamp));
}

export function formatNewsFullDate(timestamp: string) {
  return newsFullDateFormatter.format(new Date(timestamp));
}
