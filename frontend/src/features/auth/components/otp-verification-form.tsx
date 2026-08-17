"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { FormError } from "@/components/ui/forms/form-error";
import { routes } from "@/config/routes";
import { authPolicy } from "@/features/auth/config/auth-policy";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import { validateOtp } from "@/features/auth/lib/auth-validation";
import { authService } from "@/services";

import styles from "./auth.module.css";

type OtpVerificationFormProps = Readonly<{ email?: string }>;

export function OtpVerificationForm({ email }: OtpVerificationFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState<number>(authPolicy.otpResendCooldownSeconds);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);
    const nextError = validateOtp(otp);
    setOtpError(nextError ?? null);
    if (nextError || !email) return;

    setIsSubmitting(true);
    try {
      await authService.verifyOtp({ email, otp });
      router.push(`${routes.auth.login}?verified=1&email=${encodeURIComponent(email)}`);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0 || isResending) return;
    setFormError(null);
    setStatusMessage(null);
    setIsResending(true);
    try {
      await authService.resendOtp(email);
      setOtp("");
      setOtpError(null);
      setCooldown(authPolicy.otpResendCooldownSeconds);
      setStatusMessage("A new verification code has been sent.");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      {email ? (
        <div className={styles.emailTarget}>
          <span>Code sent to</span>
          <strong>{email}</strong>
        </div>
      ) : (
        <div className={styles.formAlert} role="alert">
          No registration email was provided. Please register again.
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError ? <div className={styles.formAlert}>{formError}</div> : null}
        {statusMessage ? (
          <div className={styles.formSuccess}>{statusMessage}</div>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="otp">
            Verification code <span aria-hidden="true">*</span>
          </label>
          <input
            className={styles.otpInput}
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={authPolicy.otpLength}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            aria-invalid={Boolean(otpError)}
            aria-describedby="otp-error otp-hint"
            disabled={!email}
          />
          <FormError id="otp-error" message={otpError} />
        </div>

        <div className={styles.mockHint} id="otp-hint">
          Mock preview: any six digits succeed except 000000 (invalid) and 999999
          (expired).
        </div>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isSubmitting || !email}
        >
          {isSubmitting ? "Verifying..." : "Verify account"}
        </button>

        <div className={styles.resendRow}>
          <span>Did not receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!email || cooldown > 0 || isResending}
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </form>

      <p className={styles.formFooter}>
        <Link href={routes.auth.register}>Use a different email</Link>
      </p>
    </>
  );
}
