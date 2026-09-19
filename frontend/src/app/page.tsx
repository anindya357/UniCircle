import { HomeEntry } from "@/features/home/components/home-entry";
import { homeService, notificationService } from "@/services";

export default async function LandingPage() {
  const [overview, notifications] = await Promise.all([
    homeService.getOverview(),
    notificationService.list(),
  ]);

  return <HomeEntry notifications={notifications} overview={overview} />;
}
