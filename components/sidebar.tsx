"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bot,
  X,
} from "lucide-react"
import { cn } from "@/app/lib/utils"
import { useAuthStore } from "@/lib/zustand"
import axiosInstance from "@/lib/axiosinstance"

type SidebarProps = {
  collapsed: boolean
  mobileOpen?: boolean
  onCloseMobile?: () => void
  onToggle: () => void
}

/* ================= COMPONENT ================= */

export default function Sidebar({
  collapsed,
  mobileOpen = false,
  onCloseMobile,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const name = useAuthStore((state) => state.name)
  const email = useAuthStore((state) => state.email)
  const userId = useAuthStore((state) => state.userId)

  const workspaceProjectMatch = pathname.match(/^\/projects\/([^/]+)\/workspace(?:\/.*)?$/)
  const workspaceProjectId = workspaceProjectMatch?.[1] ?? null

  /* ================= PROFILE STATUS ================= */

  const [profileStatus, setProfileStatus] = useState<{
    completionPercentage: number
    completedFields: number
    totalFields: number
  } | null>(null)

  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        if (!userId) return

        const res = await axiosInstance.get(
          `/employee/profile/${userId}/status`
        )

        setProfileStatus(res.data)
      } catch (error) {
        console.error("Profile status fetch failed", error)
      }
    }

    fetchProfileStatus()
  }, [userId])

  useEffect(() => {
    onCloseMobile?.()
  }, [pathname, onCloseMobile])

  /* ================= NAME ================= */

  const displayName =
    (name && name.trim().length > 0 ? name.trim() : null) ??
    (email ? email.split("@")[0] : "User")

  /* ================= UI ================= */

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,82vw)] flex-col border-r bg-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* ================= BRAND ================= */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                A
              </div>
              <span className="truncate font-semibold text-slate-900">
                AI4Planning
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="hidden rounded-lg p-2 hover:bg-slate-100 lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>
        </div>

        {/* ================= MENU ================= */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LayoutDashboard size={18} />
            {!collapsed && "Dashboard"}
          </Link>

          <Link
            href="/users"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Users size={18} />
            {!collapsed && "Users"}
          </Link>

          <Link
            href="/projects"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <FolderKanban size={18} />
            {!collapsed && "Projects"}
          </Link>

          {workspaceProjectId && (
            <>
              <Link
                href={`/projects/${workspaceProjectId}/workspace/customer-chat`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-slate-100",
                  pathname.includes("/workspace/customer-chat")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600"
                )}
              >
                <MessageSquare size={18} />
                {!collapsed && "Customer Chat"}
              </Link>

              <Link
                href={`/projects/${workspaceProjectId}/workspace/agent-y-chat`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-slate-100",
                  pathname.includes("/workspace/agent-y-chat")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600"
                )}
              >
                <Bot size={18} />
                {!collapsed && "Agent Y Chat"}
              </Link>
            </>
          )}

          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </Link>
        </nav>

        {/* ================= FOOTER ================= */}
        {!collapsed && (
          <div className="space-y-3 border-t px-4 py-4">
            {profileStatus && (
              <div
                onClick={() => router.push("/profile")}
                className="cursor-pointer rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="min-w-0 truncate font-medium">Profile Completion</span>
                  <span className="shrink-0 font-semibold text-slate-700">
                    {profileStatus.completionPercentage}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${profileStatus.completionPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-[11px] leading-4 text-slate-400">
                  {profileStatus.completedFields} of{" "}
                  {profileStatus.totalFields} fields completed
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                {displayName?.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  Welcome back,
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
