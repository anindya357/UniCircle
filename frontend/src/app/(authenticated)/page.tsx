import { AppShell } from "@/components/shared/app-shell";
import { HomePageContent } from "@/features/home/components/home-page";
import { homeService } from "@/services";

export default async function HomePage() {
  const overview = await homeService.getOverview();

  return (
    <AppShell>
      <HomePageContent overview={overview} />
    </AppShell>
  );
}
