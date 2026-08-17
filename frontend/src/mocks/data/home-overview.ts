import type { HomeOverview } from "@/features/home/types/home-overview";

export const mockHomeOverview = {
  platformName: "UniCircle",
  tagline:
    "One campus space for trusted information, community connection, and everyday CUET life.",
  modules: [
    {
      id: "campus-information",
      sequence: 1,
      name: "Campus information",
      description: "Home, faculty directory, explorer, transport, and announcements.",
    },
    {
      id: "campus-community",
      sequence: 2,
      name: "Campus community",
      description: "Clubs, events, resource sharing, chat, and discussion forum.",
    },
    {
      id: "campus-assistant",
      sequence: 3,
      name: "Campus AI assistant",
      description: "Grounded answers from an approved CUET knowledge base.",
    },
  ],
} as const satisfies HomeOverview;
