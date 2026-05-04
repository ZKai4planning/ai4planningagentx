"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Bell } from "lucide-react"
import { useDocumentMediation } from "@/app/(internal)/projects/[id]/workspace/documents/store"
import axiosInstance from "@/lib/axiosinstance"
import {
  getEligibilityApplicantName,
} from "@/lib/eligibility"

type WorkspaceHeaderProps = {
  projectId: string
}

type EligibilityData = Record<string, unknown>

type EligibilityResponse = {
  success?: boolean
  message?: string
  data?: EligibilityData
}

export default function WorkspaceHeader({ projectId }: WorkspaceHeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null)
  const { logs } = useDocumentMediation(projectId ?? "unknown-project")
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
    let timeoutId: number | null = null

    if (currentCount > 0 && prevNotifCountRef.current === 0) {
      timeoutId = window.setTimeout(() => {
        setShowNotifications(true)
      }, 0)
    }

    prevNotifCountRef.current = currentCount

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [notificationItems.length])

  useEffect(() => {
    let active = true

    const loadEligibility = async () => {
      try {
        const response = await axiosInstance.get<EligibilityResponse>(
          `/eligibility/${encodeURIComponent(projectId)}`
        )
        if (!active) return
        setEligibilityData(response.data.data ?? null)
      } catch {
        if (!active) return
        setEligibilityData(null)
      }
    }

    void loadEligibility()

    return () => {
      active = false
    }
  }, [projectId])

  const handleNotificationAction = () => {
    router.push(`/projects/${projectId}/workspace/project?section=documents&step=checklist`)
    setShowNotifications(false)
  }

  const customerName = eligibilityData ? getEligibilityApplicantName(eligibilityData) ?? "-" : "-"
  const serviceName = "Mandatory HMO License"
  const subscriptionDetails = "Bronze"
  const summaryItems = [
    { label: "Project ID", value: projectId },
    { label: "Service Name", value: serviceName },
    { label: "Customer", value: customerName },
    { label: "Subscription Plan", value: subscriptionDetails },
  ]

  return (
    <div className="top-0 z-40 border-bbackdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-6 py-4 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              {"< All Projects"}
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Workspace Summary
              </p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
                Workspace overview
              </h1>
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
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                Workspace Snapshot
              </p>
              <p className="mt-3 text-base font-medium leading-7 text-slate-700">
                Welcome back. Here is a quick summary of this workspace before you continue.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Everything is set up and ready, so you can review the project details and continue
                the next steps smoothly.
              </p>
            </div>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
