"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  NewResourceRequest,
  ResourceConversation,
  ResourceMessage,
  ResourcePerson,
  ResourceRequest,
  ResourceRequestStatus,
  ResourceSharingSnapshot,
} from "@/features/resources/types/resource-sharing";

type ResourceSharingContextValue = Readonly<{
  currentUserId: string;
  people: readonly ResourcePerson[];
  requests: readonly ResourceRequest[];
  conversations: readonly ResourceConversation[];
  messages: readonly ResourceMessage[];
  submitRequest: (request: NewResourceRequest) => void;
  updateRequestStatus: (
    requestId: string,
    status: Extract<ResourceRequestStatus, "accepted" | "rejected">,
  ) => void;
  sendMessage: (conversationId: string, body: string) => void;
}>;

type ResourceSharingProviderProps = Readonly<{
  initialSnapshot: ResourceSharingSnapshot;
  children: ReactNode;
}>;

const ResourceSharingContext = createContext<ResourceSharingContextValue | null>(null);

export function ResourceSharingProvider({
  initialSnapshot,
  children,
}: ResourceSharingProviderProps) {
  const [requests, setRequests] = useState<ResourceRequest[]>([
    ...initialSnapshot.requests,
  ]);
  const [conversations, setConversations] = useState<ResourceConversation[]>([
    ...initialSnapshot.conversations,
  ]);
  const [messages, setMessages] = useState<ResourceMessage[]>([
    ...initialSnapshot.messages,
  ]);

  const submitRequest = useCallback(
    (request: NewResourceRequest) => {
      const createdAt = new Date().toISOString();

      setRequests((current) => [
        {
          ...request,
          id: `request-${Date.now()}`,
          senderId: initialSnapshot.currentUserId,
          status: "pending",
          createdAt,
        },
        ...current,
      ]);
    },
    [initialSnapshot.currentUserId],
  );

  const updateRequestStatus = useCallback(
    (
      requestId: string,
      status: Extract<ResourceRequestStatus, "accepted" | "rejected">,
    ) => {
      const request = requests.find((item) => item.id === requestId);

      if (!request) return;

      setRequests((current) =>
        current.map((item) => (item.id === requestId ? { ...item, status } : item)),
      );

      if (status !== "accepted") return;

      const conversationId = `conversation-${request.id}`;
      const timestamp = new Date().toISOString();
      const otherUserId =
        request.senderId === initialSnapshot.currentUserId
          ? request.receiverId
          : request.senderId;

      setConversations((current) =>
        current.some((conversation) => conversation.requestId === request.id)
          ? current
          : [
              {
                id: conversationId,
                requestId: request.id,
                otherUserId,
                lastActivityAt: timestamp,
              },
              ...current,
            ],
      );
      setMessages((current) => [
        ...current,
        {
          id: `message-${Date.now()}`,
          conversationId,
          senderId: initialSnapshot.currentUserId,
          body: `Request accepted. We can now coordinate the ${request.resourceName.toLowerCase()} exchange here.`,
          sentAt: timestamp,
        },
      ]);
    },
    [initialSnapshot.currentUserId, requests],
  );

  const sendMessage = useCallback(
    (conversationId: string, body: string) => {
      const sentAt = new Date().toISOString();

      setMessages((current) => [
        ...current,
        {
          id: `message-${Date.now()}`,
          conversationId,
          senderId: initialSnapshot.currentUserId,
          body,
          sentAt,
        },
      ]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastActivityAt: sentAt }
            : conversation,
        ),
      );
    },
    [initialSnapshot.currentUserId],
  );

  const value = useMemo(
    () => ({
      currentUserId: initialSnapshot.currentUserId,
      people: initialSnapshot.people,
      requests,
      conversations,
      messages,
      submitRequest,
      updateRequestStatus,
      sendMessage,
    }),
    [
      conversations,
      initialSnapshot.currentUserId,
      initialSnapshot.people,
      messages,
      requests,
      sendMessage,
      submitRequest,
      updateRequestStatus,
    ],
  );

  return (
    <ResourceSharingContext.Provider value={value}>
      {children}
    </ResourceSharingContext.Provider>
  );
}

export function useResourceSharing() {
  const context = useContext(ResourceSharingContext);

  if (!context) {
    throw new Error("useResourceSharing must be used inside ResourceSharingProvider.");
  }

  return context;
}
