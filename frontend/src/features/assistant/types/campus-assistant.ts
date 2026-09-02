export type CampusAssistantMessageRole = "user" | "assistant";

export type CampusAssistantAnswerStatus = "answered" | "not-found";

export type CampusAssistantSource = Readonly<{
  id: string;
  title: string;
  context: string;
  href: string;
}>;

export type CampusAssistantReply = Readonly<{
  answer: string;
  status: CampusAssistantAnswerStatus;
  sources: readonly CampusAssistantSource[];
}>;

export type CampusAssistantMessage = Readonly<{
  id: string;
  role: CampusAssistantMessageRole;
  content: string;
  createdAt: string;
  status?: CampusAssistantAnswerStatus | "welcome";
  sources?: readonly CampusAssistantSource[];
}>;

export type CampusAssistantSuggestion = Readonly<{
  id: string;
  label: string;
  question: string;
}>;
