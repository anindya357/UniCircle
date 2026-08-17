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
      "Department tabs, details, and faculty contacts will be implemented in the directory frontend phase.",
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
      "Club profiles, members, activities, and related events will be implemented in the club frontend phase.",
  },
  {
    slug: "events",
    eyebrow: "Club and Event Hub",
    title: "Browse campus events",
    description:
      "Upcoming and ongoing events with Interested and Going controls will be implemented in the event frontend phase.",
  },
  {
    slug: "resources",
    eyebrow: "Resource sharing",
    title: "Request resources from the CUET community",
    description:
      "User discovery and resource-request workflows will be implemented in the resource sharing frontend phase.",
  },
  {
    slug: "chat",
    eyebrow: "Resource coordination",
    title: "Coordinate accepted resource requests",
    description:
      "Conversation and message interfaces will be implemented in the chat frontend phase.",
  },
  {
    slug: "transport",
    eyebrow: "Campus transport",
    title: "View bus schedules and drivers",
    description:
      "Date-based schedules, route information, and driver contacts will be implemented in the transport frontend phase.",
  },
  {
    slug: "forum",
    eyebrow: "Community discussion",
    title: "Join CUET community conversations",
    description:
      "Text posts, comments, and reporting controls will be implemented in the forum frontend phase.",
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
