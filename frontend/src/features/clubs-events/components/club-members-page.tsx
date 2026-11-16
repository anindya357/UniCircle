"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { LoadingState } from "@/components/ui/feedback/loading-state";
import { useAuthenticatedUser } from "@/features/auth/context/authenticated-user-context";
import { useClubEvents } from "@/features/clubs-events/context/club-event-context";
import type { ClubMembership } from "@/features/clubs-events/types/club-event";

import styles from "./club-event-hub.module.css";

export function ClubMembersPage({ clubId }: Readonly<{ clubId: string }>) {
  const router = useRouter();
  const { user } = useAuthenticatedUser();
  const { snapshot, isClubAdmin, listClubMembers, removeClubMember } = useClubEvents();
  const club = snapshot.clubs.find((item) => item.id === clubId);
  const canManage = Boolean(club && isClubAdmin(club));
  const [members, setMembers] = useState<readonly ClubMembership[]>([]);
  const [loadedClubId, setLoadedClubId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ClubMembership | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const feedbackInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!canManage) return;
    let cancelled = false;
    listClubMembers(clubId)
      .then((result) => {
        if (!cancelled) {
          setMembers(result);
          setLoadedClubId(clubId);
          setLoadError("");
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setLoadError(
            caught instanceof Error ? caught.message : "Members could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canManage, clubId, listClubMembers, reload]);

  useEffect(() => {
    if (selected) feedbackInput.current?.focus();
  }, [selected]);

  if (!club || !canManage) {
    return (
      <AppShell className={styles.pageShell}>
        <Link className={styles.backLink} href={`/clubs/${clubId}`}>
          Back to club
        </Link>
        <EmptyState
          title="Club Admin access required"
          description="A mapped club administrator can manage this club’s members."
        />
      </AppShell>
    );
  }

  const visibleMembers = members.filter((member) =>
    `${member.name} ${member.studentId} ${member.department}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const ready = !loading && loadedClubId === clubId && !loadError;
  const memberCount = ready ? members.length : club.memberCount;
  const adminCount = members.filter((member) => member.isAdmin).length;

  async function submitRemoval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || busy) return;
    const message = feedback.trim();
    if (!message) {
      setError("Enter feedback to send to this member.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await removeClubMember(clubId, selected.userId, message);
      setMembers((current) =>
        current.filter((member) => member.userId !== selected.userId),
      );
      setSuccess(`${selected.name} was removed and sent your feedback notification.`);
      setSelected(null);
      setFeedback("");
      if (selected.userId === user.id) router.replace(`/clubs/${clubId}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Membership could not be removed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell className={styles.pageShell}>
      <Link className={styles.backLink} href={`/clubs/${club.id}`}>
        Back to {club.shortName}
      </Link>
      <section className={styles.membershipRequestHero}>
        <p>{club.name}</p>
        <h1>Club members</h1>
        <span>
          {memberCount} {memberCount === 1 ? "member" : "members"}. Removal feedback is
          delivered to the member’s notification inbox.
        </span>
      </section>
      {success ? (
        <p className={styles.memberSuccess} role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}
      {loadError ? (
        <div className={styles.memberLoadError}>
          <p role="alert">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setLoadError("");
              setReload((value) => value + 1);
            }}
          >
            Retry loading members
          </button>
        </div>
      ) : null}
      {!loadError && !ready ? <LoadingState label="Loading club members" /> : null}
      {ready ? (
        <>
          <label className={styles.memberSearch}>
            <span>Search members</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, student ID or department"
            />
          </label>
          {visibleMembers.length === 0 ? (
            <EmptyState
              title={members.length ? "No matching members" : "No club members"}
              description={
                members.length
                  ? "Try another name, student ID or department."
                  : "Approved members will appear here."
              }
            />
          ) : null}
          <div className={`${styles.membershipRequestList} ${styles.memberList}`}>
            {visibleMembers.map((member) => {
              const lastAdmin = member.isAdmin && adminCount <= 1;
              return (
                <article key={member.userId}>
                  <header>
                    <div>
                      <span>{member.isAdmin ? "Club admin" : "Member"}</span>
                      <h2>{member.name}</h2>
                      <p>
                        {member.studentId || "Student ID unavailable"} ·{" "}
                        {member.department || "Department unavailable"}
                      </p>
                    </div>
                    <button
                      className={styles.memberRemoveButton}
                      type="button"
                      disabled={busy || lastAdmin}
                      aria-label={`Remove ${member.name}`}
                      onClick={() => {
                        setSelected(member);
                        setFeedback("");
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Remove member
                    </button>
                  </header>
                  {lastAdmin ? (
                    <p className={styles.memberHelp}>
                      Appoint another admin before removing the final club admin.
                    </p>
                  ) : null}
                  {selected?.userId === member.userId ? (
                    <form
                      className={styles.memberRemovalForm}
                      aria-label={`Remove ${member.name} from club`}
                      onSubmit={submitRemoval}
                    >
                      <p>
                        Confirm removal of {member.name} from {club.shortName}.
                        {member.isAdmin
                          ? " Their admin access to this club will also be removed."
                          : ""}
                      </p>
                      <label>
                        <span>Feedback for {member.name}</span>
                        <textarea
                          ref={feedbackInput}
                          required
                          maxLength={1000}
                          rows={4}
                          value={feedback}
                          onChange={(event) => setFeedback(event.target.value)}
                          disabled={busy}
                        />
                      </label>
                      <small>{feedback.length}/1000 characters</small>
                      <div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setSelected(null);
                            setFeedback("");
                            setError("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.memberRemoveButton}
                          type="submit"
                          disabled={busy || !feedback.trim()}
                        >
                          {busy ? "Removing…" : "Confirm removal and notify"}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
