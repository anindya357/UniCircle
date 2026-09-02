export type FeaturePageContent = Readonly<{
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
}>;

export const featurePages = [
  {
    slug: "directory",
    eyebrow: "Department and faculty directory",
    title: "Find CUET departments and faculty",
    description:
      "Browse CUET departments, explore their academic focus, and find faculty contact information.",
  },
  {
    slug: "campus-explorer",
    eyebrow: "Campus Explorer",
    title: "Discover important campus locations",
    description:
      "The campus map and detailed location cards will be implemented in the Campus Explorer phase.",
  },
  {
    slug: "clubs",
    eyebrow: "Club and Event Hub",
    title: "Explore CUET clubs",
    description:
      "Explore CUET club profiles, leadership, regular activities, and club-specific events.",
  },
  {
    slug: "events",
    eyebrow: "Club and Event Hub",
    title: "Browse campus events",
    description:
      "Browse ongoing, upcoming, and recently finished events with Interested and Going controls.",
  },
  {
    slug: "resources",
    eyebrow: "Resource sharing",
    title: "Request resources from the CUET community",
    description:
      "Discover students, compose resource requests, and manage sent or received request states.",
  },
  {
    slug: "chat",
    eyebrow: "Resource coordination",
    title: "Coordinate accepted resource requests",
    description:
      "Use private mock conversations to coordinate resource exchanges after a request is accepted.",
  },
  {
    slug: "transport",
    eyebrow: "Campus transport",
    title: "View bus schedules and drivers",
    description:
      "Choose a current or future day, inspect assigned buses and routes, and find driver contact information.",
  },
  {
    slug: "forum",
    eyebrow: "Community discussion",
    title: "Join CUET community conversations",
    description:
      "Create text discussions, exchange helpful comments, and report inappropriate posts for Admin review.",
  },
  {
    slug: "news",
    eyebrow: "Campus news and announcements",
    title: "Stay current with campus updates",
    description:
      "News, updates, and announcements will be implemented in the news frontend phase.",
  },
  {
    slug: "assistant",
    eyebrow: "Campus AI assistant",
    title: "Ask questions about CUET",
    description:
      "The RAG assistant conversation and source interface will be implemented in the assistant frontend phase.",
  },
  {
    slug: "admin",
    eyebrow: "Administration",
    title: "Manage centrally controlled campus information",
    description:
      "Admin transport, announcement, and community-moderation interfaces will be implemented in the Admin frontend phase.",
  },
] as const satisfies readonly FeaturePageContent[];

export function getFeaturePage(slug: string): FeaturePageContent | undefined {
  return featurePages.find((page) => page.slug === slug);
}
