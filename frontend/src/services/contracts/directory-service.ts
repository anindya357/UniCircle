import type { Department } from "@/features/directory/types/directory";

export interface DirectoryService {
  listDepartments(): Promise<readonly Department[]>;
}
