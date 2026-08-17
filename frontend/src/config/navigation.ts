import { routes } from "@/config/routes";

export type NavigationItem = Readonly<{
  label: string;
  href: string;
}>;

export const generalNavigation = [
  { label: "Home", href: routes.home },
  { label: "Directory", href: routes.directory },
  { label: "Campus Explorer", href: routes.campusExplorer },
  { label: "Clubs", href: routes.clubs },
  { label: "Events", href: routes.events },
  { label: "Resources", href: routes.resources },
  { label: "Chat", href: routes.chat },
  { label: "Transport", href: routes.transport },
  { label: "Community", href: routes.forum },
  { label: "News", href: routes.news },
  { label: "AI Assistant", href: routes.assistant },
] as const satisfies readonly NavigationItem[];

export const adminNavigation = [
  { label: "Admin workspace", href: routes.admin },
] as const satisfies readonly NavigationItem[];
