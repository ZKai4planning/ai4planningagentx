"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type WorkspaceChatChannelId = "chat" | "customer-chat" | "agent-y-chat"

export interface AttachedFile {
  name: string
  size: string
  type: "pdf" | "image" | "file"
  url?: string
}

export interface WorkspaceChatMessage {
  id: string
  from: string
  text: string
  sentAt: string
  files?: AttachedFile[]
}

type WorkspaceChatStore = Record<WorkspaceChatChannelId, WorkspaceChatMessage[]>

type ChannelConfig = {
  id: WorkspaceChatChannelId
  title: string
  description: string
  href: (projectId: string) => string
  emptyState: string
  incomingSenders: string[]
  senderLabels: Record<string, string>
}

type SendWorkspaceChatMessageInput = {
  from: string
  text: string
  files?: AttachedFile[]
}

export type WorkspaceChatSummary = {
  id: WorkspaceChatChannelId
  title: string
  description: string
  href: string
  lastMessage: WorkspaceChatMessage | null
  preview: string
  messageCount: number
  hasIncomingReply: boolean
  senderLabel: string
}

export type WorkspaceRecentMessage = {
  id: string
  channelId: WorkspaceChatChannelId
  channelTitle: string
  href: string
  message: WorkspaceChatMessage
  preview: string
  senderLabel: string
  isIncoming: boolean
}

const WORKSPACE_CHAT_EVENT = "workspace-chat-updated"

const CHANNEL_CONFIG: Record<WorkspaceChatChannelId, ChannelConfig> = {
  chat: {
    id: "chat",
    title: "Client Communication",
    description: "Customer to Agent X only.",
    href: (projectId) => `/projects/${projectId}/workspace/chat`,
    emptyState: "No messages yet.",
    incomingSenders: ["client"],
    senderLabels: {
      client: "Client",
      agent: "You",
    },
  },
  "customer-chat": {
    id: "customer-chat",
    title: "Customer Chat",
    description: "Customer to Agent X communication.",
    href: (projectId) => `/projects/${projectId}/workspace/customer-chat`,
    emptyState: "No messages yet.",
    incomingSenders: ["client"],
    senderLabels: {
      client: "Customer",
      agent: "You",
    },
  },
  "agent-y-chat": {
    id: "agent-y-chat",
    title: "Agent Y Chat",
    description: "Agent X and Agent Y coordination.",
    href: (projectId) => `/projects/${projectId}/workspace/agent-y-chat`,
    emptyState: "No messages yet.",
    incomingSenders: ["agentY"],
    senderLabels: {
      agentX: "You",
      agentY: "Agent Y",
    },
  },
}

const CHAT_SEED: WorkspaceChatStore = {
  chat: [
    {
      id: "chat-1",
      from: "client",
      text: "Can we reduce the extension depth slightly?",
      sentAt: "2026-04-25T10:24:00.000Z",
    },
    {
      id: "chat-2",
      from: "agent",
      text: "Yes, that improves approval chances. I'll revise the drawings and resend.",
      sentAt: "2026-04-25T10:41:00.000Z",
    },
    {
      id: "chat-3",
      from: "client",
      text: "Great, also any concerns about the left boundary?",
      sentAt: "2026-04-25T11:05:00.000Z",
    },
    {
      id: "chat-4",
      from: "agent",
      text: "We'll keep 1m clearance. That satisfies the council's party wall rules.",
      sentAt: "2026-04-25T11:18:00.000Z",
    },
  ],
  "customer-chat": [
    {
      id: "customer-chat-1",
      from: "client",
      text: "I have uploaded the biodiversity report draft. Please check if this is acceptable.",
      sentAt: "2026-04-25T10:10:00.000Z",
    },
    {
      id: "customer-chat-2",
      from: "agent",
      text: "Received. I will validate the report and share feedback shortly.",
      sentAt: "2026-04-25T10:22:00.000Z",
    },
  ],
  "agent-y-chat": [
    {
      id: "agent-y-chat-1",
      from: "agentY",
      text: "Please share the updated site plan and ownership certificate.",
      sentAt: "2026-04-25T09:42:00.000Z",
    },
    {
      id: "agent-y-chat-2",
      from: "agentX",
      text: "Acknowledged. I will upload both after validating the customer files.",
      sentAt: "2026-04-25T09:55:00.000Z",
    },
  ],
}

function cloneSeedStore(): WorkspaceChatStore {
  return {
    chat: [...CHAT_SEED.chat],
    "customer-chat": [...CHAT_SEED["customer-chat"]],
    "agent-y-chat": [...CHAT_SEED["agent-y-chat"]],
  }
}

function getStorageKey(projectId: string): string {
  return `workspace-chat:${projectId}`
}

function sanitizeStore(raw: unknown): WorkspaceChatStore {
  const seed = cloneSeedStore()

  if (!raw || typeof raw !== "object") {
    return seed
  }

  for (const channelId of Object.keys(CHANNEL_CONFIG) as WorkspaceChatChannelId[]) {
    const maybeMessages = (raw as Record<string, unknown>)[channelId]
    if (!Array.isArray(maybeMessages)) continue

    seed[channelId] = maybeMessages
      .filter(
        (message): message is WorkspaceChatMessage =>
          Boolean(
            message &&
              typeof message === "object" &&
              typeof (message as WorkspaceChatMessage).id === "string" &&
              typeof (message as WorkspaceChatMessage).from === "string" &&
              typeof (message as WorkspaceChatMessage).text === "string" &&
              typeof (message as WorkspaceChatMessage).sentAt === "string"
          )
      )
      .map((message) => ({
        ...message,
        files: Array.isArray(message.files) ? message.files : undefined,
      }))
  }

  return seed
}

function readProjectChatStore(projectId: string): WorkspaceChatStore {
  if (typeof window === "undefined") {
    return cloneSeedStore()
  }

  const stored = window.localStorage.getItem(getStorageKey(projectId))
  if (!stored) {
    return cloneSeedStore()
  }

  try {
    return sanitizeStore(JSON.parse(stored))
  } catch {
    return cloneSeedStore()
  }
}

function writeProjectChatStore(projectId: string, store: WorkspaceChatStore) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(getStorageKey(projectId), JSON.stringify(store))
  window.dispatchEvent(
    new CustomEvent(WORKSPACE_CHAT_EVENT, {
      detail: { projectId },
    })
  )
}

function getMessagePreview(message: WorkspaceChatMessage | null, fallback: string): string {
  if (!message) return fallback
  if (message.text.trim().length > 0) return message.text.trim()
  if (message.files?.length) {
    return `${message.files.length} attachment${message.files.length > 1 ? "s" : ""}`
  }
  return fallback
}

function useProjectChatStore(projectId: string) {
  const [store, setStore] = useState<WorkspaceChatStore>(() => cloneSeedStore())

  useEffect(() => {
    setStore(readProjectChatStore(projectId))
  }, [projectId])

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncStore = () => {
      setStore(readProjectChatStore(projectId))
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== getStorageKey(projectId)) return
      syncStore()
    }

    const handleWorkspaceChatUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string }>).detail
      if (detail?.projectId && detail.projectId !== projectId) return
      syncStore()
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(WORKSPACE_CHAT_EVENT, handleWorkspaceChatUpdated)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(WORKSPACE_CHAT_EVENT, handleWorkspaceChatUpdated)
    }
  }, [projectId])

  const updateStore = useCallback(
    (updater: (current: WorkspaceChatStore) => WorkspaceChatStore) => {
      setStore((current) => {
        const next = updater(current)
        writeProjectChatStore(projectId, next)
        return next
      })
    },
    [projectId]
  )

  return { store, updateStore }
}

export function getWorkspaceChatChannelConfig(channelId: WorkspaceChatChannelId): ChannelConfig {
  return CHANNEL_CONFIG[channelId]
}

export function formatWorkspaceChatTime(sentAt: string): string {
  const date = new Date(sentAt)

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatWorkspaceChatListTime(sentAt: string): string {
  const date = new Date(sentAt)
  const now = new Date()
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  return new Intl.DateTimeFormat("en-US", isSameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric" }).format(date)
}

export function describeWorkspaceChatSender(
  channelId: WorkspaceChatChannelId,
  from: string
): string {
  return CHANNEL_CONFIG[channelId].senderLabels[from] ?? from
}

export function useWorkspaceChat(projectId: string, channelId: WorkspaceChatChannelId) {
  const { store, updateStore } = useProjectChatStore(projectId)

  const messages = store[channelId] ?? []

  const sendMessage = useCallback(
    ({ from, text, files }: SendWorkspaceChatMessageInput) => {
      updateStore((current) => ({
        ...current,
        [channelId]: [
          ...current[channelId],
          {
            id: `${channelId}-${Date.now()}`,
            from,
            text: text.trim(),
            sentAt: new Date().toISOString(),
            files: files?.length ? [...files] : undefined,
          },
        ],
      }))
    },
    [channelId, updateStore]
  )

  return {
    config: CHANNEL_CONFIG[channelId],
    messages,
    sendMessage,
  }
}

export function useWorkspaceRecentChats(projectId: string) {
  const { store } = useProjectChatStore(projectId)

  const chats = useMemo<WorkspaceChatSummary[]>(() => {
    return (Object.keys(CHANNEL_CONFIG) as WorkspaceChatChannelId[])
      .map((channelId) => {
        const config = CHANNEL_CONFIG[channelId]
        const messages = store[channelId] ?? []
        const lastMessage = messages[messages.length - 1] ?? null

        return {
          id: channelId,
          title: config.title,
          description: config.description,
          href: config.href(projectId),
          lastMessage,
          preview: getMessagePreview(lastMessage, config.emptyState),
          messageCount: messages.length,
          hasIncomingReply: lastMessage
            ? config.incomingSenders.includes(lastMessage.from)
            : false,
          senderLabel: lastMessage
            ? describeWorkspaceChatSender(channelId, lastMessage.from)
            : "",
        }
      })
      .sort((left, right) => {
        const leftTime = left.lastMessage ? new Date(left.lastMessage.sentAt).getTime() : 0
        const rightTime = right.lastMessage ? new Date(right.lastMessage.sentAt).getTime() : 0
        return rightTime - leftTime
      })
  }, [projectId, store])

  return chats
}

export function useWorkspaceRecentMessages(projectId: string, limit = 6) {
  const { store } = useProjectChatStore(projectId)

  const messages = useMemo<WorkspaceRecentMessage[]>(() => {
    return (Object.keys(CHANNEL_CONFIG) as WorkspaceChatChannelId[])
      .flatMap((channelId) => {
        const config = CHANNEL_CONFIG[channelId]

        return (store[channelId] ?? []).map((message) => ({
          id: `${channelId}-${message.id}`,
          channelId,
          channelTitle: config.title,
          href: config.href(projectId),
          message,
          preview: getMessagePreview(message, config.emptyState),
          senderLabel: describeWorkspaceChatSender(channelId, message.from),
          isIncoming: config.incomingSenders.includes(message.from),
        }))
      })
      .sort(
        (left, right) =>
          new Date(right.message.sentAt).getTime() - new Date(left.message.sentAt).getTime()
      )
      .slice(0, limit)
  }, [limit, projectId, store])

  return messages
}
