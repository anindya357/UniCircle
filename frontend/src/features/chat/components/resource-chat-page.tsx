"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { routes } from "@/config/routes";
import { useResourceSharing } from "@/features/resources/context/resource-sharing-context";
import {
  formatMessageTime,
  formatResourceDate,
} from "@/features/resources/lib/format-resource-time";

import styles from "./resource-chat.module.css";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ResourceChatPage() {
  const { currentUserId, people, requests, conversations, messages, sendMessage } =
    useResourceSharing();
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const peopleById = useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people],
  );
  const requestsById = useMemo(
    () => new Map(requests.map((request) => [request.id, request])),
    [requests],
  );
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0];
  const selectedPerson = selectedConversation
    ? peopleById.get(selectedConversation.otherUserId)
    : undefined;
  const selectedRequest = selectedConversation
    ? requestsById.get(selectedConversation.requestId)
    : undefined;
  const selectedMessages = selectedConversation
    ? messages.filter((message) => message.conversationId === selectedConversation.id)
    : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();

    if (!selectedConversation || !message) return;

    sendMessage(selectedConversation.id, message);
    setDraft("");
  }

  return (
    <AppShell className={styles.pageShell}>
      <section className={styles.heading} aria-labelledby="chat-title">
        <div>
          <p>Accepted-request coordination</p>
          <h1 id="chat-title">Resource chat</h1>
          <span>
            Conversations appear here only after a resource request is accepted.
          </span>
        </div>
        <Link href={routes.resources}>
          <span aria-hidden="true">←</span> Resource sharing
        </Link>
      </section>

      {conversations.length === 0 ? (
        <EmptyState
          title="No open conversations"
          description="Browse students and send a resource request. Chat will unlock when the other student accepts it."
        />
      ) : (
        <div className={styles.chatLayout}>
          <aside className={styles.conversationPanel}>
            <header>
              <div>
                <p>Inbox</p>
                <h2>Conversations</h2>
              </div>
              <span>{conversations.length}</span>
            </header>

            <div className={styles.conversationList}>
              {conversations.map((conversation) => {
                const person = peopleById.get(conversation.otherUserId);
                const request = requestsById.get(conversation.requestId);
                const conversationMessages = messages.filter(
                  (message) => message.conversationId === conversation.id,
                );
                const latestMessage = conversationMessages.at(-1);

                return (
                  <button
                    aria-pressed={conversation.id === selectedConversation?.id}
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    type="button"
                  >
                    <span aria-hidden="true">
                      {getInitials(person?.name ?? "CUET student")}
                    </span>
                    <div>
                      <strong>{person?.name ?? "CUET student"}</strong>
                      <p>{request?.resourceName ?? "Resource coordination"}</p>
                      <small>{latestMessage?.body ?? "Conversation ready"}</small>
                    </div>
                    <time dateTime={conversation.lastActivityAt}>
                      {formatMessageTime(conversation.lastActivityAt)}
                    </time>
                  </button>
                );
              })}
            </div>
          </aside>

          {selectedConversation && selectedPerson && selectedRequest ? (
            <section className={styles.chatPanel} aria-label="Selected conversation">
              <header className={styles.chatHeader}>
                <span aria-hidden="true">{getInitials(selectedPerson.name)}</span>
                <div>
                  <h2>{selectedPerson.name}</h2>
                  <p>
                    @{selectedPerson.username} · {selectedPerson.department}
                  </p>
                </div>
                <div>
                  <span>Accepted request</span>
                  <strong>{selectedRequest.resourceName}</strong>
                </div>
              </header>

              <div className={styles.messageList} aria-live="polite">
                <div className={styles.requestContext}>
                  <span>Request accepted</span>
                  <strong>{selectedRequest.resourceName}</strong>
                  <p>{selectedRequest.message}</p>
                  <time dateTime={selectedRequest.createdAt}>
                    Requested {formatResourceDate(selectedRequest.createdAt)}
                  </time>
                </div>

                {selectedMessages.map((message) => {
                  const isCurrentUser = message.senderId === currentUserId;

                  return (
                    <article
                      className={styles.message}
                      data-current-user={isCurrentUser}
                      key={message.id}
                    >
                      <div>
                        <p>{message.body}</p>
                        <time dateTime={message.sentAt}>
                          {formatMessageTime(message.sentAt)}
                        </time>
                      </div>
                    </article>
                  );
                })}
              </div>

              <form className={styles.messageComposer} onSubmit={handleSubmit}>
                <label>
                  <span className="visually-hidden">Message {selectedPerson.name}</span>
                  <textarea
                    maxLength={500}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Message ${selectedPerson.name}`}
                    rows={2}
                    value={draft}
                  />
                </label>
                <button disabled={!draft.trim()} type="submit">
                  Send message
                </button>
              </form>
            </section>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
