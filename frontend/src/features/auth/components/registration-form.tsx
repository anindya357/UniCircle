"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { FormError } from "@/components/ui/forms/form-error";
import { routes } from "@/config/routes";
import { authPolicy } from "@/features/auth/config/auth-policy";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import {
  isPasswordValid,
  validateCuetEmail,
  validateRequired,
  validateUsername,
} from "@/features/auth/lib/auth-validation";
import type { GeneralUserRole } from "@/features/auth/types/auth";
import { authService } from "@/services";

import { PasswordRequirements } from "./password-requirements";
import styles from "./auth.module.css";

type RegistrationFields = Readonly<{
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  universityId?: string;
}>;

const roles: ReadonlyArray<{ value: GeneralUserRole; label: string }> = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
];

const roleIdLabels: Record<GeneralUserRole, string> = {
  student: "Student ID",
  teacher: "Teacher ID",
  staff: "Staff ID",
};

export function RegistrationForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<GeneralUserRole>("student");
  const [universityId, setUniversityId] = useState("");
  const [errors, setErrors] = useState<RegistrationFields>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: RegistrationFields = {
      username: validateUsername(username),
      email: validateCuetEmail(email),
      password: isPasswordValid(password)
        ? undefined
        : "Password does not meet all requirements.",
      confirmPassword:
        password === confirmPassword ? undefined : "Passwords do not match.",
      universityId: validateRequired(universityId, roleIdLabels[role]),
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const result = await authService.register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        universityId: universityId.trim(),
      });
      router.push(`${routes.auth.verifyOtp}?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError ? <div className={styles.formAlert}>{formError}</div> : null}

        <div className={styles.field}>
          <label htmlFor="username">
            Username <span aria-hidden="true">*</span>
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          <FormError id="username-error" message={errors.username} />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">
            CUET email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={`name@${authPolicy.cuetEmailDomain}`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : "email-hint"}
          />
          <span className={styles.fieldHint} id="email-hint">
            Only @{authPolicy.cuetEmailDomain} addresses are accepted.
          </span>
          <FormError id="email-error" message={errors.email} />
        </div>

        <fieldset className={styles.fieldset}>
          <legend>
            Campus role <span aria-hidden="true">*</span>
          </legend>
          <div className={styles.roleGrid}>
            {roles.map((item) => (
              <div className={styles.roleOption} key={item.value}>
                <input
                  id={`role-${item.value}`}
                  type="radio"
                  name="role"
                  value={item.value}
                  checked={role === item.value}
                  onChange={() => {
                    setRole(item.value);
                    setUniversityId("");
                  }}
                />
                <label htmlFor={`role-${item.value}`}>{item.label}</label>
              </div>
            ))}
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="university-id">
            {roleIdLabels[role]} <span aria-hidden="true">*</span>
          </label>
          <input
            id="university-id"
            name="universityId"
            autoComplete="off"
            value={universityId}
            onChange={(event) => setUniversityId(event.target.value)}
            aria-invalid={Boolean(errors.universityId)}
            aria-describedby={errors.universityId ? "university-id-error" : undefined}
          />
          <FormError id="university-id-error" message={errors.universityId} />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">
            Password <span aria-hidden="true">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-requirements password-error"
          />
          <div id="password-requirements">
            <PasswordRequirements password={password} />
          </div>
          <FormError id="password-error" message={errors.password} />
        </div>

        <div className={styles.field}>
          <label htmlFor="confirm-password">
            Confirm password <span aria-hidden="true">*</span>
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
          />
          <FormError id="confirm-password-error" message={errors.confirmPassword} />
        </div>

        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className={styles.formFooter}>
        Already registered? <Link href={routes.auth.login}>Sign in</Link>
      </p>
    </>
  );
}
