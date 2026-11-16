import { DirectoryPage } from "@/features/directory/components/directory-page";
import {
  departmentCodes,
  type DepartmentCode,
} from "@/features/directory/types/directory";

export default async function DirectoryRoute({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ department?: string | string[] }>;
}>) {
  const { department } = await searchParams;
  const initialDepartment: DepartmentCode =
    typeof department === "string" &&
    departmentCodes.includes(department as DepartmentCode)
      ? (department as DepartmentCode)
      : "cse";
  return <DirectoryPage initialDepartment={initialDepartment} />;
}
