import type { Metadata } from "next";

import { ResourceChatPage } from "@/features/chat/components/resource-chat-page";

export const metadata: Metadata = {
  title: "Resource chat",
  description: "Coordinate accepted resource exchanges with other CUET students.",
};

export default function ChatPage() {
  return <ResourceChatPage />;
}
