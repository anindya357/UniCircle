import { notFound } from "next/navigation";

import { AppShell } from "@/components/shared/app-shell";
import { ErrorState } from "@/components/ui/feedback/error-state";
import { requireServerSessionUser } from "@/features/auth/lib/server-session";
import { FacultyProfilePage } from "@/features/directory/components/faculty-profile-page";
import { getFacultyProfile } from "@/services/api/server-faculty-profile";

export default async function FacultyProfileRoute({
  params,
}: Readonly<{ params: Promise<{ entryId: string }> }>) {
  await requireServerSessionUser();
  const { entryId } = await params;
  const result = await getFacultyProfile(entryId);

  if (result.kind === "not-found") notFound();
  if (result.kind === "unavailable") {
    return (
      <AppShell>
        <ErrorState
          title="Faculty profile unavailable"
          description="The directory service could not load this profile. Please try again shortly."
        />
      </AppShell>
    );
  }
  return <FacultyProfilePage profile={result.profile} />;
}
