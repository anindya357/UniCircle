import { MockHomeService } from "@/mocks/services/mock-home-service";
import type { HomeService } from "@/services/contracts/home-service";

export const homeService: HomeService = new MockHomeService();
