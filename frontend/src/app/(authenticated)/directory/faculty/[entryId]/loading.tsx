import { AppShell } from "@/components/shared/app-shell";
import { LoadingState } from "@/components/ui/feedback/loading-state";

export default function FacultyProfileLoading() {
  return (
    <AppShell>
      <LoadingState label="Loading faculty profile" />
    </AppShell>
  );
}
