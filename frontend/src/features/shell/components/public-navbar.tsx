import Link from "next/link";

import { routes } from "@/config/routes";

import styles from "@/features/home/components/home-entry.module.css";

export function PublicNavbar({ loading = false }: Readonly<{ loading?: boolean }>) {
  return (
    <header className={styles.publicHeader} data-session-loading={loading}>
      <Link className={styles.brand} href={routes.home} aria-label="UniCircle home">
        <span aria-hidden="true">U</span>
        <span>
          <strong>UniCircle</strong>
          <small>CUET digital campus</small>
        </span>
      </Link>
      <nav aria-label="Public navigation">
        <Link href={routes.directory}>Directory</Link>
        <Link href={routes.campusExplorer}>Campus Explorer</Link>
        <Link href={routes.auth.login}>Login</Link>
        <Link href={routes.auth.register}>Sign up</Link>
      </nav>
    </header>
  );
}
