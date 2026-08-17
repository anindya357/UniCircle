export type DepartmentCode =
  | "cse"
  | "eee"
  | "me"
  | "ce"
  | "ete"
  | "bme"
  | "mme"
  | "mie"
  | "pme"
  | "architecture"
  | "urp";

export type FacultyMember = Readonly<{
  id: string;
  name: string;
  initials: string;
  designation: string;
  email: string;
  phone: string;
  office: string;
  expertise: readonly string[];
}>;

export type Department = Readonly<{
  id: DepartmentCode;
  shortName: string;
  name: string;
  academicArea: string;
  description: string;
  location: string;
  officeEmail: string;
  focusAreas: readonly string[];
  faculty: readonly FacultyMember[];
}>;
