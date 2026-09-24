import { cookies } from "next/headers";

import { HomeEntry } from "@/features/home/components/home-entry";
import { homeOverview } from "@/features/home/content/home-overview";
import { notificationService } from "@/services";

export default async function LandingPage() {
  const token = (await cookies()).get("unicircle_session")?.value;
  const notifications = await notificationService.list(token).catch(() => []);

  return <HomeEntry notifications={notifications} overview={homeOverview} />;
}
