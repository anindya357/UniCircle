import type { CampusAssistantMessage } from "@/features/assistant/types/campus-assistant";

import styles from "./campus-assistant-page.module.css";

type AssistantMessageProps = Readonly<{
  message: CampusAssistantMessage;
}>;

const messageTimeFormatter = new Intl.DateTimeFormat("en-BD", {
  hour: "numeric",
  minute: "2-digit",
});

function formatMessageTime(value: string) {
  return messageTimeFormatter.format(new Date(value));
}

function ResponseText({ children }: Readonly<{ children: string }>) {
  return children.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <li className={styles.messageRow} data-role={message.role}>
      <span className={styles.avatar} aria-hidden="true">
        {isAssistant ? "AI" : "You"}
      </span>
      <article
        className={styles.messageBubble}
        data-status={message.status}
        aria-label={`${isAssistant ? "Campus assistant" : "Your"} message`}
      >
        <div className={styles.messageMeta}>
          <strong>{isAssistant ? "Campus Assistant" : "You"}</strong>
          {message.status === "not-found" ? <span>Not found</span> : null}
          <time dateTime={message.createdAt}>
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
        <div className={styles.responseText}>
          <ResponseText>{message.content}</ResponseText>
        </div>

        {message.sources && message.sources.length > 0 ? (
          <aside className={styles.sources} aria-label="Sources used for this answer">
            <p>Sources in this prototype</p>
            <div>
              {message.sources.map((source, index) => (
                <a href={source.href} key={source.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{source.title}</strong>
                    <small>{source.context}</small>
                  </div>
                  <b aria-hidden="true">&#8599;</b>
                </a>
              ))}
            </div>
          </aside>
        ) : null}
      </article>
    </li>
  );
}
