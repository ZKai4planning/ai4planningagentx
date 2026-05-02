"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Bell, Bot, MessageSquareText, User } from "lucide-react"
import { useDocumentMediation } from "@/app/(internal)/projects/[id]/workspace/documents/store"
import {
  formatWorkspaceChatListTime,
  useWorkspaceRecentMessages,
  type WorkspaceChatChannelId,
} from "@/lib/workspace-chat"

type WorkspaceHeaderProps = {
  projectId: string
}

export default function WorkspaceHeader({ projectId }: WorkspaceHeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const { logs } = useDocumentMediation(projectId ?? "unknown-project")
  const recentMessages = useWorkspaceRecentMessages(projectId, 7)
  const prevNotifCountRef = useRef(0)

  const missingDocsSentLog = logs.find(
    (log) => log.action === "Missing documents sent to Agent X"
  )
  const requiredDocsSentLog = logs.find(
    (log) => log.action === "Required documents sent to Agent Y"
  )
  const agentYSubmittedLogs = logs.filter(
    (log) => log.action === "Agent Y submitted missing document"
  )
  const agentYSubmittedLog = agentYSubmittedLogs[0]
  const agentYSubmittedCount = agentYSubmittedLogs.length

  type NotificationItem = {
    id: string
    title: string
    timestamp: string
    tone: "info" | "success"
  }

  const notificationItems = [
    requiredDocsSentLog && {
      id: "required-docs-sent",
      title: "Required documents sent to Agent Y",
      timestamp: new Date(requiredDocsSentLog.timestamp).toLocaleString(),
      tone: "info" as const,
    },
    missingDocsSentLog && {
      id: "missing-docs-sent",
      title: "Missing documents sent to Agent X",
      timestamp: new Date(missingDocsSentLog.timestamp).toLocaleString(),
      tone: "info" as const,
    },
    agentYSubmittedLog && {
      id: "agenty-submitted",
      title:
        agentYSubmittedCount > 1
          ? `Agent Y submitted ${agentYSubmittedCount} missing documents`
          : "Agent Y submitted the missing document",
      timestamp: new Date(agentYSubmittedLog.timestamp).toLocaleString(),
      tone: "success" as const,
    },
  ].filter(Boolean) as NotificationItem[]

  useEffect(() => {
    const currentCount = notificationItems.length
    if (currentCount > 0 && prevNotifCountRef.current === 0) {
      setShowNotifications(true)
    }
    prevNotifCountRef.current = currentCount
  }, [notificationItems.length])

  const handleNotificationAction = () => {
    router.push(`/projects/${projectId}/workspace/project?section=documents&step=checklist`)
    setShowNotifications(false)
  }

  const getChatIcon = (channelId: WorkspaceChatChannelId) => {
    if (channelId === "agent-y-chat") return Bot
    if (channelId === "customer-chat") return User
    return MessageSquareText
  }

  return (
    <div className="top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              {"< All Projects"}
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Project {projectId}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Recent chats and workspace notifications stay visible here for quick follow-up.
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full border bg-white p-2 text-blue-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Toggle notifications"
              aria-expanded={showNotifications}
            >
              <Bell size={16} />
              {notificationItems.length > 0 && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[90vw] rounded-2xl border bg-white p-4 shadow-lg">
                {notificationItems.length === 0 ? (
                  <p className="text-xs text-slate-500">No notifications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notificationItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={handleNotificationAction}
                        className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors hover:shadow-sm ${
                          item.tone === "success"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-blue-100 bg-blue-50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Open required documents
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {item.timestamp}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Recent Chats
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Each recent question or reply stays visible here like a real chat inbox.
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/workspace/customer-chat`}
              className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Open chats
            </Link>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {recentMessages.length === 0 ? (
              <div className="px-4 py-5 text-sm text-slate-500">
                No recent chat activity yet.
              </div>
            ) : (
              recentMessages.map((entry, index) => {
                const Icon = getChatIcon(entry.channelId)

                return (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                      index !== recentMessages.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {entry.senderLabel}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {entry.channelTitle}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                          {formatWorkspaceChatListTime(entry.message.sentAt)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="line-clamp-1 text-sm text-slate-600">
                          {entry.preview}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            entry.isIncoming
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {entry.isIncoming ? "Question" : "Reply"}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
