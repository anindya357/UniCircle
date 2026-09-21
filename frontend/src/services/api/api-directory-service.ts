import type { Department, FacultyMember } from "@/features/directory/types/directory";
import type { DirectoryService } from "@/services/contracts/directory-service";
import { ServiceError } from "@/services/errors/service-error";

type FacultyRecord = {
  id: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  office: string | null;
  profile_url: string | null;
};

type DepartmentRecord = {
  code: Department["id"];
  name: string;
  description: string | null;
  office_email: string | null;
  phone: string | null;
  address: string | null;
  source_url: string;
  faculty: FacultyRecord[];
};

function initials(name: string): string {
  return name
    .replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function mapFaculty(record: FacultyRecord): FacultyMember {
  return {
    id: record.id,
    name: record.name,
    initials: initials(record.name),
    designation: record.designation ?? "Faculty member",
    email: record.email,
    phone: record.phone,
    office: record.office,
    profileUrl: record.profile_url,
    expertise: [],
  };
}

function mapDepartment(record: DepartmentRecord): Department {
  return {
    id: record.code,
    shortName: record.code.toUpperCase(),
    name: record.name,
    academicArea: "CUET academic department",
    description: record.description ?? "Department information is not listed yet.",
    location: record.address,
    officeEmail: record.office_email,
    phone: record.phone,
    sourceUrl: record.source_url,
    faculty: record.faculty.map(mapFaculty),
  };
}

export class ApiDirectoryService implements DirectoryService {
  async listDepartments(): Promise<readonly Department[]> {
    let response: Response;
    try {
      response = await fetch("/api/directory", {
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch (error) {
      throw new ServiceError("Cannot reach the directory service.", "network", {
        cause: error,
      });
    }
    const result = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(result?.data)) {
      throw new ServiceError(
        result?.error?.message ?? "The directory could not be loaded.",
        response.status === 401 ? "unauthorized" : "unknown",
      );
    }
    return (result.data as DepartmentRecord[]).map(mapDepartment);
  }
}
