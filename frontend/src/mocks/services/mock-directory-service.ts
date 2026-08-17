import type { Department } from "@/features/directory/types/directory";
import { delay } from "@/lib/delay";
import { mockDepartments } from "@/mocks/data/departments";
import type { DirectoryService } from "@/services/contracts/directory-service";

const mockLatencyMilliseconds = 500;

export class MockDirectoryService implements DirectoryService {
  async listDepartments(): Promise<readonly Department[]> {
    await delay(mockLatencyMilliseconds);
    return mockDepartments;
  }
}
