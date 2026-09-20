import { HomeEntry } from "@/features/home/components/home-entry";
import { homeOverview } from "@/features/home/content/home-overview";
import { notificationService } from "@/services";

export default async function LandingPage() {
  const notifications = await notificationService.list();

  return <HomeEntry notifications={notifications} overview={homeOverview} />;
}
