"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Bell, TrendingUp, Video } from "lucide-react"
import { useDocumentMediation } from "@/app/(internal)/projects/[id]/workspace/documents/store"
import {
  customer,
  formSubmission,
  project,
  workspaceRoadmapMockResponse,
} from "@/app/(internal)/projects/[id]/workspace/project/workspaceData"

type WorkspaceHeaderProps = {
  projectId: string
}

export default function WorkspaceHeader({ projectId }: WorkspaceHeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const { logs } = useDocumentMediation(projectId ?? "unknown-project")
  const prevNotifCountRef = useRef(0)

  const currentStep = workspaceRoadmapMockResponse.stages.findIndex(
    (stage) => stage.id === workspaceRoadmapMockResponse.currentStageId
  )
  const progressValue =
    workspaceRoadmapMockResponse.stages.length > 1
      ? Math.round(
          (Math.max(currentStep, 0) /
            (workspaceRoadmapMockResponse.stages.length - 1)) *
            100
        )
      : 0
  const missingDocsSentLog = logs.find((log) => log.action === "Missing documents sent to Agent X")
  const requiredDocsSentLog = logs.find((log) => log.action === "Required documents sent to Agent Y")
  const agentYSubmittedLogs = logs.filter((log) => log.action === "Agent Y submitted missing document")
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

  return (
    <div className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {"< All Projects"}
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {customer.name}
                </h1>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {customer.status}
                </span>
                {formSubmission.consultationBooked && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <Video size={12} />
                    Consultation Scheduled
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Customer ID · {project.clientId} · {project.service} · {project.timeline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-full border bg-white p-2 text-blue-600 shadow-sm hover:bg-slate-50 transition"
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
              >
                <Bell size={16} />
                {notificationItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[360px] max-w-[90vw] rounded-2xl border bg-white shadow-lg p-4 z-50">
                  {notificationItems.length === 0 ? (
                    <p className="text-xs text-slate-500">No notifications yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {notificationItems.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={handleNotificationAction}
                          className={`w-full text-left flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 transition-colors hover:shadow-sm ${
                            item.tone === "success"
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-blue-50 border-blue-100"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Open required documents</p>
                          </div>
                          <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2">
              <TrendingUp size={14} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-900">
                {progressValue}%
              </span>
              <span className="text-xs text-blue-600">Journey Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
