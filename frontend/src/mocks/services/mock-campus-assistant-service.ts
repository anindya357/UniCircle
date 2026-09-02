import { delay } from "@/lib/delay";
import {
  mockAssistantErrorQuestion,
  mockAssistantReplies,
} from "@/mocks/data/campus-assistant";
import type { CampusAssistantService } from "@/services/contracts/campus-assistant-service";

const mockLatencyMilliseconds = 850;

export class MockCampusAssistantService implements CampusAssistantService {
  async ask(question: string) {
    await delay(mockLatencyMilliseconds);

    const normalizedQuestion = question.trim().toLowerCase();

    if (normalizedQuestion === mockAssistantErrorQuestion.toLowerCase()) {
      throw new Error("The mock campus knowledge service is temporarily unavailable.");
    }

    if (/bus|transport|bottoli|station|route/.test(normalizedQuestion)) {
      return mockAssistantReplies.transport;
    }

    if (/department|faculty|teacher|professor|lecturer|cse/.test(normalizedQuestion)) {
      return mockAssistantReplies.directory;
    }

    if (/club|event|ieee|robot|debating|mun/.test(normalizedQuestion)) {
      return mockAssistantReplies.clubs;
    }

    if (/news|announcement|notice|update/.test(normalizedQuestion)) {
      return mockAssistantReplies.news;
    }

    if (/campus|location|building|place|map|facility/.test(normalizedQuestion)) {
      return mockAssistantReplies.campus;
    }

    if (/resource|borrow|book|calculator|request/.test(normalizedQuestion)) {
      return mockAssistantReplies.resources;
    }

    return mockAssistantReplies.notFound;
  }
}
