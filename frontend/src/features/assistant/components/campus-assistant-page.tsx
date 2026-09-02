"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { AssistantMessage } from "@/features/assistant/components/assistant-message";
import type { CampusAssistantMessage } from "@/features/assistant/types/campus-assistant";
import {
  mockAssistantErrorQuestion,
  mockAssistantSuggestions,
  mockAssistantWelcomeMessage,
} from "@/mocks/data/campus-assistant";
import { campusAssistantService } from "@/services";

import styles from "./campus-assistant-page.module.css";

const maximumQuestionLength = 500;

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CampusAssistantPage() {
  const [messages, setMessages] = useState<CampusAssistantMessage[]>([
    mockAssistantWelcomeMessage,
  ]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    if (shouldScrollRef.current) {
      conversationEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      shouldScrollRef.current = false;
    }
  }, [error, isThinking, messages]);

  async function requestAnswer(question: string, addUserMessage: boolean) {
    if (isThinking) return;

    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    if (addUserMessage) {
      shouldScrollRef.current = true;
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId("user"),
          role: "user",
          content: cleanQuestion,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    setDraft("");
    setError("");
    setLastQuestion(cleanQuestion);
    setIsThinking(true);

    try {
      const reply = await campusAssistantService.ask(cleanQuestion);

      shouldScrollRef.current = true;
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content: reply.answer,
          createdAt: new Date().toISOString(),
          status: reply.status,
          sources: reply.sources,
        },
      ]);
    } catch (caughtError) {
      shouldScrollRef.current = true;
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The campus assistant could not complete this request.",
      );
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void requestAnswer(draft, true);
  }

  function handleQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function resetConversation() {
    setMessages([mockAssistantWelcomeMessage]);
    setDraft("");
    setError("");
    setLastQuestion("");
  }

  return (
    <AppShell className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="assistant-title">
        <div className={styles.heroCopy}>
          <p>CUET knowledge companion</p>
          <h1 id="assistant-title">
            Ask about campus. <span>Find the next step.</span>
          </h1>
          <p>
            Explore CUET information through a focused assistant designed for grounded,
            source-aware campus answers.
          </p>
          <div className={styles.prototypeNote}>
            <span aria-hidden="true">i</span>
            Prototype responses only - the FastAPI RAG knowledge service will be
            connected later
          </div>
        </div>

        <aside className={styles.heroStatus} aria-label="Assistant prototype status">
          <div className={styles.orbitMark} aria-hidden="true">
            <span />
          </div>
          <div>
            <span>Assistant status</span>
            <strong>Ready to help</strong>
            <p>Mock campus knowledge with source-ready answers.</p>
          </div>
          <dl>
            <div>
              <dt>Topics</dt>
              <dd>06</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>Mock RAG</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={styles.assistantLayout} aria-label="Campus AI Assistant chat">
        <aside className={styles.guidePanel}>
          <div>
            <p>Conversation guide</p>
            <h2>Start with a campus topic</h2>
            <span>Choose a prompt or write your own CUET-related question.</span>
          </div>

          <div className={styles.suggestions}>
            {mockAssistantSuggestions.map((suggestion, index) => (
              <button
                disabled={isThinking}
                key={suggestion.id}
                onClick={() => void requestAnswer(suggestion.question, true)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{suggestion.label}</strong>
                <small>{suggestion.question}</small>
              </button>
            ))}
          </div>

          <div className={styles.prototypeChecks}>
            <p>Prototype state checks</p>
            <button
              disabled={isThinking}
              onClick={() =>
                void requestAnswer("What is the CUET lunar ferry timetable?", true)
              }
              type="button"
            >
              Show not-found answer
            </button>
            <button
              disabled={isThinking}
              onClick={() => void requestAnswer(mockAssistantErrorQuestion, true)}
              type="button"
            >
              Simulate service error
            </button>
          </div>
        </aside>

        <div className={styles.chatPanel}>
          <header className={styles.chatHeader}>
            <div>
              <span className={styles.onlineDot} aria-hidden="true" />
              <div>
                <strong>Campus AI Assistant</strong>
                <p>Grounded CUET answers - mock service</p>
              </div>
            </div>
            <button
              disabled={messages.length === 1 && !error}
              onClick={resetConversation}
              type="button"
            >
              Reset chat
            </button>
          </header>

          <ol className={styles.messageList} aria-live="polite" aria-busy={isThinking}>
            {messages.map((message) => (
              <AssistantMessage key={message.id} message={message} />
            ))}

            {isThinking ? (
              <li className={styles.thinkingRow} role="status">
                <span className={styles.avatar} aria-hidden="true">
                  AI
                </span>
                <div>
                  <strong>Checking campus information</strong>
                  <span className={styles.thinkingDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              </li>
            ) : null}
          </ol>

          {error ? (
            <div className={styles.errorState} role="alert">
              <span aria-hidden="true">!</span>
              <div>
                <strong>Assistant service unavailable</strong>
                <p>{error} Your conversation is safe; retry when you are ready.</p>
              </div>
              <button
                onClick={() => void requestAnswer(lastQuestion, false)}
                type="button"
              >
                Retry
              </button>
              <button
                aria-label="Dismiss error"
                onClick={() => setError("")}
                type="button"
              >
                Close
              </button>
            </div>
          ) : null}

          <form className={styles.composer} onSubmit={handleSubmit}>
            <label htmlFor="campus-question">Ask a campus question</label>
            <div>
              <textarea
                id="campus-question"
                maxLength={maximumQuestionLength}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleQuestionKeyDown}
                placeholder="For example: When is the evening bus from CUET?"
                rows={3}
                value={draft}
              />
              <button disabled={!draft.trim() || isThinking} type="submit">
                <span>{isThinking ? "Thinking" : "Ask assistant"}</span>
                <b aria-hidden="true">&#8593;</b>
              </button>
            </div>
            <p>
              <span>
                {draft.length}/{maximumQuestionLength}
              </span>
              Press Enter to send - Shift + Enter for a new line
            </p>
          </form>
          <div ref={conversationEndRef} />
        </div>
      </section>
    </AppShell>
  );
}
