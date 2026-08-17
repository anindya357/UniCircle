import Link from "next/link";

import { routes } from "@/config/routes";

import styles from "./login.module.css";

export default function LoginPlaceholderPage() {
  return (
    <main className={styles.page} id="main-content">
      <section className={styles.card} aria-labelledby="login-title">
        <span className={styles.mark} aria-hidden="true">
          U
        </span>
        <p className="eyebrow">Authentication preview</p>
        <h1 id="login-title">You signed out of the mock session</h1>
        <p>
          Registration, OTP verification, and real login behavior will be added in the
          Authentication frontend phase.
        </p>
        <Link href={routes.home}>Continue with mock user</Link>
      </section>
    </main>
  );
}
