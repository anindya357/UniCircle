"use client";

import { useId, useState, type FormEvent } from "react";

import { FormError } from "@/components/ui/forms/form-error";
import { formatForumTimestamp } from "@/features/forum/lib/format-forum-date";
import type { ForumPost } from "@/features/forum/types/forum";
import { delay } from "@/lib/delay";

import styles from "./forum-page.module.css";

type ForumPostCardProps = Readonly<{
  post: ForumPost;
  isReported: boolean;
  onCreateComment: (postId: string, body: string) => void;
  onReportPost: (postId: string) => void;
}>;

const maximumCommentLength = 600;

const roleLabels = {
  student: "Student",
  teacher: "Teacher",
  staff: "Staff",
} as const;

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ForumPostCard({
  post,
  isReported,
  onCreateComment,
  onReportPost,
}: ForumPostCardProps) {
  const commentId = useId();
  const commentErrorId = useId();
  const commentsHeadingId = useId();
  const reportHeadingId = useId();
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedComment = comment.trim();

    if (!normalizedComment) {
      setCommentError("Write a comment before posting it.");
      return;
    }

    setCommentError(null);
    setIsCommentSubmitting(true);
    await delay(350);
    onCreateComment(post.id, normalizedComment);
    setComment("");
    setIsCommentSubmitting(false);
  }

  async function handleReport() {
    setIsReporting(true);
    await delay(400);
    onReportPost(post.id);
    setIsReporting(false);
    setShowReportConfirmation(false);
  }

  return (
    <article className={styles.postCard} aria-labelledby={`post-author-${post.id}`}>
      <header className={styles.postHeader}>
        <span className={styles.avatar} data-role={post.author.role} aria-hidden="true">
          {getInitials(post.author.displayName)}
        </span>
        <div className={styles.authorDetails}>
          <h3 id={`post-author-${post.id}`}>{post.author.displayName}</h3>
          <p>
            @{post.author.username} · {roleLabels[post.author.role]}
          </p>
          <span>{post.author.academicUnit}</span>
        </div>
        <time dateTime={post.createdAt}>{formatForumTimestamp(post.createdAt)}</time>
      </header>

      <p className={styles.postBody}>{post.body}</p>

      <div className={styles.postMeta}>
        <span>
          {post.comments.length} comment{post.comments.length === 1 ? "" : "s"}
        </span>
        <button
          className={styles.reportTrigger}
          disabled={isReported}
          onClick={() => setShowReportConfirmation(true)}
          type="button"
        >
          {isReported ? "Reported to Admin" : "Report to Admin"}
        </button>
      </div>

      {showReportConfirmation && !isReported ? (
        <section
          className={styles.reportConfirmation}
          aria-labelledby={reportHeadingId}
          aria-live="polite"
        >
          <div>
            <span aria-hidden="true">!</span>
            <div>
              <h4 id={reportHeadingId}>Report this post?</h4>
              <p>
                The post will be sent to an App Admin for review. Reporting does not
                remove it immediately.
              </p>
            </div>
          </div>
          <div className={styles.reportActions}>
            <button
              disabled={isReporting}
              onClick={() => setShowReportConfirmation(false)}
              type="button"
            >
              Cancel
            </button>
            <button disabled={isReporting} onClick={handleReport} type="button">
              {isReporting ? "Sending…" : "Confirm report"}
            </button>
          </div>
        </section>
      ) : null}

      {isReported ? (
        <p className={styles.reportSuccess} role="status">
          This post has been reported once and is awaiting Admin review.
        </p>
      ) : null}

      <section className={styles.commentsSection} aria-labelledby={commentsHeadingId}>
        <header>
          <h4 id={commentsHeadingId}>Community comments</h4>
          <span>{String(post.comments.length).padStart(2, "0")}</span>
        </header>

        {post.comments.length === 0 ? (
          <p className={styles.noComments}>No comments yet. Start the conversation.</p>
        ) : (
          <ol className={styles.commentList}>
            {post.comments.map((item) => (
              <li key={item.id}>
                <span
                  className={styles.commentAvatar}
                  data-role={item.author.role}
                  aria-hidden="true"
                >
                  {getInitials(item.author.displayName)}
                </span>
                <div>
                  <header>
                    <strong>{item.author.displayName}</strong>
                    <time dateTime={item.createdAt}>
                      {formatForumTimestamp(item.createdAt)}
                    </time>
                  </header>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        <form
          className={styles.commentComposer}
          onSubmit={handleCommentSubmit}
          noValidate
        >
          <label htmlFor={commentId}>Add a text comment</label>
          <div>
            <textarea
              aria-describedby={commentError ? commentErrorId : undefined}
              aria-invalid={Boolean(commentError)}
              disabled={isCommentSubmitting}
              id={commentId}
              maxLength={maximumCommentLength}
              onChange={(event) => {
                setComment(event.target.value);
                if (commentError && event.target.value.trim()) setCommentError(null);
              }}
              placeholder="Write a helpful comment…"
              rows={2}
              value={comment}
            />
            <button disabled={isCommentSubmitting} type="submit">
              {isCommentSubmitting ? "Posting…" : "Post comment"}
            </button>
          </div>
          <FormError id={commentErrorId} message={commentError} />
        </form>
      </section>
    </article>
  );
}
