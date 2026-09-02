"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState } from "react";

import {
  adminNavigation,
  generalNavigation,
  type NavigationItem,
} from "@/config/navigation";
import { routes } from "@/config/routes";
import type { SessionUser } from "@/features/auth/types/session-user";
import { NotificationMenu } from "@/features/notifications/components/notification-menu";
import { sessionService } from "@/services";

import styles from "./navbar.module.css";

type NavbarProps = Readonly<{
  user: SessionUser;
}>;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === routes.home) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(displayName: string): string {
  return displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function roleLabel(role: SessionUser["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const canAccessAdmin = user.role === "admin";

  function renderLinks(items: readonly NavigationItem[], isAdmin = false) {
    return items.map((item) => {
      const isActive = isActiveRoute(pathname, item.href);

      return (
        <Link
          className={`${styles.navLink} ${isActive ? styles.active : ""} ${isAdmin ? styles.adminLink : ""}`}
          href={item.href}
          key={item.href}
          aria-current={isActive ? "page" : undefined}
          onNavigate={() => setIsMobileOpen(false)}
        >
          {item.label}
        </Link>
      );
    });
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await sessionService.logout();
      router.push(routes.auth.login);
    } finally {
      setIsLoggingOut(false);
      setIsMobileOpen(false);
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link
          className={styles.brand}
          href={routes.home}
          aria-label="UniCircle home"
          onNavigate={() => setIsMobileOpen(false)}
        >
          <span className={styles.brandMark} aria-hidden="true">
            U
          </span>
          <span>
            <strong>UniCircle</strong>
            <small>CUET digital campus</small>
          </span>
        </Link>

        <div className={styles.accountArea}>
          <NotificationMenu />

          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">
              {getInitials(user.displayName)}
            </span>
            <span className={styles.profileText}>
              <strong>{user.displayName}</strong>
              <small>{roleLabel(user.role)}</small>
            </span>
          </div>

          <button
            className={styles.logout}
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out…" : "Logout"}
          </button>

          <button
            className={styles.mobileToggle}
            type="button"
            aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileOpen}
            aria-controls={menuId}
            onClick={() => setIsMobileOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        className={`${styles.navigation} ${isMobileOpen ? styles.mobileOpen : ""}`}
        id={menuId}
        aria-label="Primary navigation"
      >
        <div className={styles.generalLinks}>{renderLinks(generalNavigation)}</div>

        {canAccessAdmin ? (
          <div className={styles.adminLinks} aria-label="Administration">
            <span>Admin</span>
            {renderLinks(adminNavigation, true)}
          </div>
        ) : null}

        <div className={styles.mobileAccount}>
          <p>
            Signed in as <strong>{user.username}</strong>
          </p>
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Signing out…" : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}
