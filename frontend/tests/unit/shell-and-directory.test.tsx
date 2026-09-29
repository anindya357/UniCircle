import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { AuthenticatedShell } from "@/features/auth/components/authenticated-shell";
import { AuthenticatedUserProvider } from "@/features/auth/context/authenticated-user-context";
import type { SessionUser } from "@/features/auth/types/session-user";
import { DepartmentNavigation } from "@/features/directory/components/department-navigation";
import type { Department } from "@/features/directory/types/directory";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { NotificationProvider } from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification";
import { Navbar } from "@/features/shell/components/navbar";

const mocks = vi.hoisted(() => ({
  pathname: "/directory",
  replace: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onNavigate,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
    onNavigate?: () => void;
  }) => {
    void onNavigate;
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/services", () => ({
  sessionService: {
    logout: mocks.logout,
    getCurrentUser: mocks.getCurrentUser,
  },
  notificationService: {
    markAsRead: mocks.markAsRead,
    markAllAsRead: mocks.markAllAsRead,
  },
  clubEventService: {},
}));

const student: SessionUser = {
  id: "student-1",
  firstName: "Anika",
  lastName: "Rahman",
  displayName: "Anika Rahman",
  username: "anika",
  email: "anika@student.cuet.ac.bd",
  role: "student",
  universityId: "2204001",
  department: "CSE",
  phone: "01700000000",
  homeAddress: "CUET",
  bio: "",
  memberSince: "2026-01-01T00:00:00Z",
};

const admin: SessionUser = {
  id: "admin-1",
  adminId: "app-admin",
  displayName: "App Admin",
  role: "admin",
  memberSince: "2026-01-01T00:00:00Z",
};

const notification: AppNotification = {
  id: "notification-1",
  type: "campus-announcement",
  title: "Campus notice",
  message: "A useful announcement.",
  createdAt: "2026-09-29T09:00:00Z",
  isRead: false,
};

const departments: readonly Department[] = [
  {
    id: "cse",
    shortName: "CSE",
    name: "Computer Science & Engineering",
    academicArea: "Engineering",
    description: "Computing",
    location: null,
    officeEmail: null,
    faculty: [],
  },
  {
    id: "eee",
    shortName: "EEE",
    name: "Electrical & Electronic Engineering",
    academicArea: "Engineering",
    description: "Electrical engineering",
    location: null,
    officeEmail: null,
    faculty: [],
  },
];

function renderNavbar(user: SessionUser) {
  return render(
    <AuthenticatedUserProvider initialUser={user}>
      <NotificationProvider initialNotifications={[notification]}>
        <Navbar />
      </NotificationProvider>
    </AuthenticatedUserProvider>,
  );
}

describe("navigation and notification permissions", () => {
  beforeEach(() => {
    mocks.pathname = "/directory";
    mocks.getCurrentUser.mockResolvedValue(student);
    mocks.markAsRead.mockResolvedValue(undefined);
  });

  test("normal users do not see Admin navigation and active route is indicated", () => {
    renderNavbar(student);
    expect(screen.getByRole("link", { name: "Directory" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByLabelText("Administration")).not.toBeInTheDocument();
  });

  test("App Admin receives visually separate Admin navigation", () => {
    renderNavbar(admin);
    expect(screen.getByLabelText("Administration")).toBeVisible();
    expect(screen.getByRole("link", { name: "Admin workspace" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  test("unread notification can be marked read", async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn();
    const { rerender } = render(
      <NotificationItem notification={notification} onMarkAsRead={onMarkAsRead} />,
    );
    await user.click(screen.getByRole("button", { name: "Mark as read" }));
    expect(onMarkAsRead).toHaveBeenCalledWith("notification-1");

    rerender(
      <NotificationItem
        notification={{ ...notification, isRead: true }}
        onMarkAsRead={onMarkAsRead}
      />,
    );
    expect(screen.queryByRole("button", { name: "Mark as read" })).toBeNull();
  });

  test("student visiting the Admin route sees the route-guard UI", async () => {
    mocks.pathname = "/admin";
    mocks.getCurrentUser.mockResolvedValue(student);
    render(
      <AuthenticatedShell
        initialClubEventSnapshot={{
          clubs: [],
          events: [],
          students: [],
          clubRequests: [],
          registrations: [],
        }}
        initialNotifications={[]}
        initialUser={student}
      >
        <p>Secret admin controls</p>
      </AuthenticatedShell>,
    );
    expect(
      await screen.findByText("You do not have access to this workspace."),
    ).toBeVisible();
    expect(screen.queryByText("Secret admin controls")).not.toBeInTheDocument();
  });
});

test("department tabs expose selection and switch departments", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <DepartmentNavigation
      departments={departments}
      onSelect={onSelect}
      selectedId="cse"
    />,
  );
  expect(screen.getByRole("tab", { name: /CSE/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await user.click(screen.getByRole("tab", { name: /EEE/ }));
  expect(onSelect).toHaveBeenCalledWith("eee");
});
