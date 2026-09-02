import type { ReactNode } from "react";

type AppShellProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function AppShell({ children, className }: AppShellProps) {
  return (
    <main
      className={["app-shell", className].filter(Boolean).join(" ")}
      id="main-content"
    >
      {children}
    </main>
  );
}
