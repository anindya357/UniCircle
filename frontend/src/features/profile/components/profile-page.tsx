"use client";

import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { FormError } from "@/components/ui/forms/form-error";
import { useAuthenticatedUser } from "@/features/auth/context/authenticated-user-context";
import type { SessionUser } from "@/features/auth/types/session-user";
import type { UpdateProfileInput } from "@/features/profile/types/profile";
import { profileService } from "@/services";

import styles from "./profile-page.module.css";

type ProfileErrors = Partial<Record<keyof UpdateProfileInput, string>>;

const usernamePattern = /^[a-z0-9._]+$/;
const memberSinceFormatter = new Intl.DateTimeFormat("en-BD", {
  month: "long",
  year: "numeric",
});

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getRoleLabel(role: SessionUser["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getRoleIdLabel(role: SessionUser["role"]) {
  if (role === "student") return "Student ID";
  if (role === "teacher") return "Teacher ID";
  if (role === "staff") return "Staff ID";
  return "Admin ID";
}

function toEditableProfile(user: SessionUser): UpdateProfileInput {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    department: user.department,
    phone: user.phone,
    homeAddress: user.homeAddress,
    bio: user.bio,
  };
}

function validateProfile(values: UpdateProfileInput): ProfileErrors {
  const errors: ProfileErrors = {};

  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";

  if (values.username.trim().length < 3) {
    errors.username = "Username must contain at least 3 characters.";
  } else if (!usernamePattern.test(values.username.trim().toLowerCase())) {
    errors.username = "Use lowercase letters, numbers, dots, or underscores only.";
  }

  if (!values.department.trim()) errors.department = "Enter your department or unit.";
  if (!values.homeAddress.trim()) errors.homeAddress = "Enter your home address.";
  if (values.phone.trim() && values.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a valid phone number.";
  }
  if (values.bio.length > 240) errors.bio = "Bio must be 240 characters or fewer.";

  return errors;
}

export function ProfilePage() {
  const { user, replaceUser } = useAuthenticatedUser();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<UpdateProfileInput>(() =>
    toEditableProfile(user),
  );
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [serviceError, setServiceError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField<Key extends keyof UpdateProfileInput>(
    field: Key,
    value: UpdateProfileInput[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setSuccessMessage("");
  }

  function beginEditing() {
    setValues(toEditableProfile(user));
    setErrors({});
    setServiceError("");
    setSuccessMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setValues(toEditableProfile(user));
    setErrors({});
    setServiceError("");
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);
    setServiceError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const updatedUser = await profileService.updateProfile(values);
      replaceUser(updatedUser);
      setValues(toEditableProfile(updatedUser));
      setIsEditing(false);
      setSuccessMessage("Your profile information has been updated.");
    } catch (error) {
      setServiceError(
        error instanceof Error
          ? error.message
          : "Your profile could not be updated. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell className={styles.pageShell}>
      <section className={styles.profileHero} aria-labelledby="profile-title">
        <div className={styles.heroIdentity}>
          <span className={styles.heroAvatar} aria-hidden="true">
            {getInitials(user.firstName, user.lastName)}
          </span>
          <div>
            <p>Personal profile</p>
            <h1 id="profile-title">{user.displayName}</h1>
            <div className={styles.identityMeta}>
              <span>@{user.username}</span>
              <span>{getRoleLabel(user.role)}</span>
              <span>{user.department}</span>
            </div>
          </div>
        </div>
        <button onClick={beginEditing} type="button" disabled={isEditing}>
          {isEditing ? "Editing profile" : "Edit profile"}
        </button>
      </section>

      {successMessage ? (
        <div className={styles.successBanner} role="status">
          <strong>Saved</strong>
          <p>{successMessage}</p>
          <button
            aria-label="Dismiss update message"
            onClick={() => setSuccessMessage("")}
            type="button"
          >
            Close
          </button>
        </div>
      ) : null}

      <div className={styles.profileLayout}>
        <section
          className={styles.detailsCard}
          aria-labelledby="personal-details-title"
        >
          <header>
            <div>
              <p>Your information</p>
              <h2 id="personal-details-title">
                {isEditing ? "Edit personal details" : "Personal details"}
              </h2>
            </div>
            <span>{isEditing ? "Changes are not saved yet" : "Profile overview"}</span>
          </header>

          {isEditing ? (
            <form className={styles.profileForm} onSubmit={handleSubmit} noValidate>
              {serviceError ? (
                <div className={styles.formAlert} role="alert">
                  {serviceError}
                </div>
              ) : null}

              <div className={styles.twoColumnFields}>
                <ProfileInput
                  autoComplete="given-name"
                  error={errors.firstName}
                  id="profile-first-name"
                  label="First name"
                  maxLength={50}
                  onChange={(value) => updateField("firstName", value)}
                  value={values.firstName}
                />
                <ProfileInput
                  autoComplete="family-name"
                  error={errors.lastName}
                  id="profile-last-name"
                  label="Last name"
                  maxLength={50}
                  onChange={(value) => updateField("lastName", value)}
                  value={values.lastName}
                />
              </div>

              <div className={styles.twoColumnFields}>
                <ProfileInput
                  autoComplete="username"
                  error={errors.username}
                  id="profile-username"
                  label="Username"
                  maxLength={40}
                  onChange={(value) => updateField("username", value)}
                  prefix="@"
                  value={values.username}
                />
                <ProfileInput
                  autoComplete="tel"
                  error={errors.phone}
                  id="profile-phone"
                  label="Phone number"
                  maxLength={24}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="Optional"
                  type="tel"
                  value={values.phone}
                />
              </div>

              <ProfileInput
                error={errors.department}
                id="profile-department"
                label="Department or unit"
                maxLength={100}
                onChange={(value) => updateField("department", value)}
                value={values.department}
              />

              <ProfileTextarea
                autoComplete="street-address"
                error={errors.homeAddress}
                id="profile-home-address"
                label="Home address"
                maxLength={180}
                onChange={(value) => updateField("homeAddress", value)}
                rows={3}
                value={values.homeAddress}
              />

              <ProfileTextarea
                error={errors.bio}
                id="profile-bio"
                label="About you"
                maxLength={240}
                onChange={(value) => updateField("bio", value)}
                placeholder="Share a short campus introduction"
                rows={4}
                showCount
                value={values.bio}
              />

              <div className={styles.formActions}>
                <button disabled={isSaving} onClick={cancelEditing} type="button">
                  Cancel
                </button>
                <button disabled={isSaving} type="submit">
                  {isSaving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.profileDetails}>
              <dl>
                <ProfileDetail label="Full name" value={user.displayName} />
                <ProfileDetail label="Username" value={`@${user.username}`} />
                <ProfileDetail label="Department or unit" value={user.department} />
                <ProfileDetail
                  label="Phone number"
                  value={user.phone || "Not provided"}
                />
                <ProfileDetail label="Home address" value={user.homeAddress} wide />
              </dl>
              <div className={styles.bioBlock}>
                <span>About</span>
                <p>{user.bio || "No profile introduction has been added yet."}</p>
              </div>
            </div>
          )}
        </section>

        <aside className={styles.identityCard} aria-labelledby="cuet-identity-title">
          <div className={styles.identityCardHeading}>
            <span aria-hidden="true">CU</span>
            <div>
              <p>Verified account</p>
              <h2 id="cuet-identity-title">CUET identity</h2>
            </div>
          </div>

          <dl>
            <ProfileDetail label="CUET email" value={user.email} />
            <ProfileDetail
              label={getRoleIdLabel(user.role)}
              value={user.universityId}
            />
            <ProfileDetail label="Campus role" value={getRoleLabel(user.role)} />
            <ProfileDetail
              label="Member since"
              value={memberSinceFormatter.format(new Date(user.memberSince))}
            />
          </dl>

          <div className={styles.identityNotice}>
            <span aria-hidden="true">i</span>
            <p>
              Email, university ID, and campus role are identity fields. Contact an
              administrator if they need correction.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

type ProfileInputProps = Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength: number;
  autoComplete?: string;
  placeholder?: string;
  prefix?: string;
  type?: "text" | "tel";
}>;

function ProfileInput({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  autoComplete,
  placeholder,
  prefix,
  type = "text",
}: ProfileInputProps) {
  const input = (
    <input
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={Boolean(error)}
      autoComplete={autoComplete}
      id={id}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {prefix ? (
        <div className={styles.prefixedInput}>
          <span aria-hidden="true">{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
      <FormError id={`${id}-error`} message={error} />
    </div>
  );
}

type ProfileTextareaProps = Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength: number;
  rows: number;
  autoComplete?: string;
  placeholder?: string;
  showCount?: boolean;
}>;

function ProfileTextarea({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  rows,
  autoComplete,
  placeholder,
  showCount = false,
}: ProfileTextareaProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id}>{label}</label>
        {showCount ? (
          <span>
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        id={id}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
      <FormError id={`${id}-error`} message={error} />
    </div>
  );
}

function ProfileDetail({
  label,
  value,
  wide = false,
}: Readonly<{ label: string; value: string; wide?: boolean }>) {
  return (
    <div data-wide={wide}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
