import type {
  CampusAssistantMessage,
  CampusAssistantReply,
  CampusAssistantSuggestion,
} from "@/features/assistant/types/campus-assistant";

export const mockAssistantWelcomeMessage: CampusAssistantMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Welcome! I am the UniCircle Campus AI Assistant prototype. Ask me about CUET transport, departments, clubs, campus places, resources, or announcements.",
  createdAt: "2026-09-03T09:00:00+06:00",
  status: "welcome",
};

export const mockAssistantSuggestions = [
  {
    id: "transport",
    label: "Morning bus",
    question: "When does the morning CUET bus leave Bottoli Rail Station?",
  },
  {
    id: "directory",
    label: "CSE faculty",
    question: "Who can I find in the CSE faculty directory?",
  },
  {
    id: "clubs",
    label: "Campus clubs",
    question: "How can I explore CUET clubs and their upcoming events?",
  },
  {
    id: "news",
    label: "Latest updates",
    question: "Where can I read campus news and announcements?",
  },
] as const satisfies readonly CampusAssistantSuggestion[];

export const mockAssistantReplies = {
  transport: {
    answer:
      "The regular morning transport window runs from 7:00 AM to 8:20 AM from Bottoli Rail Station to CUET. The current prototype schedule lists 11 buses across the regular and Chawkbazar route variants. Open Transport to inspect the schedule and assigned buses.",
    status: "answered",
    sources: [
      {
        id: "transport-schedule",
        title: "CUET transport schedule",
        context: "Morning window and route assignments",
        href: "/transport",
      },
    ],
  },
  directory: {
    answer:
      "The UniCircle directory covers CUET departments and their faculty information. In CSE, the prototype includes Dr Kaushik Deb, Mir Md. Saki Kawsar, and Md. Refaj Hossan with their roles and academic interests. Open the directory and select CSE for full contact details.",
    status: "answered",
    sources: [
      {
        id: "faculty-directory",
        title: "Department and faculty directory",
        context: "CSE faculty listing",
        href: "/directory",
      },
    ],
  },
  clubs: {
    answer:
      "Open the Clubs page to browse CUET club cards. Selecting a club opens its profile with activities and upcoming events. You can also use the Events page to see ongoing, upcoming, and recently finished campus events together.",
    status: "answered",
    sources: [
      {
        id: "club-hub",
        title: "CUET club directory",
        context: "Club profiles and activities",
        href: "/clubs",
      },
      {
        id: "event-hub",
        title: "Campus events",
        context: "Upcoming and current events",
        href: "/events",
      },
    ],
  },
  news: {
    answer:
      "Campus News brings news, service updates, and official announcements into one newest-first feed. Each item shows its publication time, publisher, audience, and full details. The content is mocked now and will later be managed by authorized Admin publishing.",
    status: "answered",
    sources: [
      {
        id: "campus-news",
        title: "Campus news and announcements",
        context: "Latest campus information",
        href: "/news",
      },
    ],
  },
  campus: {
    answer:
      "The Campus Explorer helps you discover important CUET locations and view practical details for each place. Use it when you need information about campus buildings, services, or where a facility is located.",
    status: "answered",
    sources: [
      {
        id: "campus-explorer",
        title: "CUET Campus Explorer",
        context: "Campus locations and facilities",
        href: "/campus-explorer",
      },
    ],
  },
  resources: {
    answer:
      "Resource Sharing lets you find CUET community members, send a request for an academic item, and track received or sent requests. A private coordination chat becomes available after the recipient accepts a request.",
    status: "answered",
    sources: [
      {
        id: "resource-sharing",
        title: "Resource sharing platform",
        context: "Requests and accepted-request chat",
        href: "/resources",
      },
    ],
  },
  notFound: {
    answer:
      "I could not find reliable information for that question in the current CUET prototype knowledge set. Try asking about transport, departments, faculty, clubs, events, campus locations, resources, news, or announcements.",
    status: "not-found",
    sources: [],
  },
} as const satisfies Record<string, CampusAssistantReply>;

export const mockAssistantErrorQuestion =
  "Simulate the campus assistant service being unavailable";
