import "server-only";

import { cookies } from "next/headers";

import type {
  FacultyProfile,
  ProfileEntry,
} from "@/features/directory/types/faculty-profile";

type ApiProfile = {
  id: string;
  department_code: string;
  department_name: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  office: string | null;
  avatar_url: string | null;
  biography: string | null;
  research_interests: string | null;
  education_overview: string | null;
  additional_information: string | null;
  personal_website: string | null;
  source_status: "current" | "unavailable";
  education: ProfileEntry[];
  experience: ProfileEntry[];
  supervisions: ProfileEntry[];
  publications: ProfileEntry[];
  research: ProfileEntry[];
  courses: ProfileEntry[];
  awards: ProfileEntry[];
  social_links: ProfileEntry[];
};

export type FacultyProfileResult =
  | { kind: "ok"; profile: FacultyProfile }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export async function getFacultyProfile(
  entryId: string,
): Promise<FacultyProfileResult> {
  if (!/^[a-z]+-[0-9]+$/.test(entryId)) return { kind: "not-found" };
  const token = (await cookies()).get("unicircle_session")?.value;
  if (!token) return { kind: "unavailable" };

  try {
    const backendBase = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(
      new URL(`/api/v1/faculty/${entryId}/profile`, backendBase),
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    );
    if (response.status === 404) return { kind: "not-found" };
    if (!response.ok) return { kind: "unavailable" };
    const result: { data?: ApiProfile } = await response.json();
    const data = result.data;
    if (!data || data.id !== entryId) return { kind: "unavailable" };
    return {
      kind: "ok",
      profile: {
        id: data.id,
        departmentCode: data.department_code,
        departmentName: data.department_name,
        name: data.name,
        designation: data.designation ?? "Faculty member",
        email: data.email,
        phone: data.phone,
        office: data.office,
        avatarUrl: data.avatar_url,
        biography: data.biography,
        researchInterests: data.research_interests,
        educationOverview: data.education_overview,
        additionalInformation: data.additional_information,
        personalWebsite: data.personal_website,
        sourceStatus: data.source_status,
        education: data.education ?? [],
        experience: data.experience ?? [],
        supervisions: data.supervisions ?? [],
        publications: data.publications ?? [],
        research: data.research ?? [],
        courses: data.courses ?? [],
        awards: data.awards ?? [],
        socialLinks: data.social_links ?? [],
      },
    };
  } catch {
    return { kind: "unavailable" };
  }
}
