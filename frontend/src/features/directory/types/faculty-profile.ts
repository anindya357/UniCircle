export type ProfileEntry = Readonly<{
  title: string;
  subtitle: string | null;
  period: string | null;
  description: string | null;
  url: string | null;
}>;

export type FacultyProfile = Readonly<{
  id: string;
  departmentCode: string;
  departmentName: string;
  name: string;
  designation: string;
  email: string | null;
  phone: string | null;
  office: string | null;
  avatarUrl: string | null;
  biography: string | null;
  researchInterests: string | null;
  educationOverview: string | null;
  additionalInformation: string | null;
  personalWebsite: string | null;
  sourceStatus: "current" | "unavailable";
  education: readonly ProfileEntry[];
  experience: readonly ProfileEntry[];
  supervisions: readonly ProfileEntry[];
  publications: readonly ProfileEntry[];
  research: readonly ProfileEntry[];
  courses: readonly ProfileEntry[];
  awards: readonly ProfileEntry[];
  socialLinks: readonly ProfileEntry[];
}>;
