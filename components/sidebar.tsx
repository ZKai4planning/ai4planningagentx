"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
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
} from "lucide-react"
import { cn } from "@/app/lib/utils"
import { useAuthStore } from "@/lib/zustand"
import axiosInstance from "@/lib/axiosinstance"

/* ================= TYPES ================= */

type MenuChild = {
  label: string
  href: string
}

type MenuItem = {
  label: string
  icon: React.ElementType
  href?: string
  workspaceSection?: string
  children?: MenuChild[]
}

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

/* ================= COMPONENT ================= */

export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const name = useAuthStore((state) => state.name)
  const email = useAuthStore((state) => state.email)
  const userId = useAuthStore((state) => state.userId)

  const [openGroup, setOpenGroup] = useState<string | null>(null)
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

  /* ================= NAME ================= */

  const displayName =
    (name && name.trim().length > 0 ? name.trim() : null) ??
    (email ? email.split("@")[0] : "User")

  /* ================= UI ================= */

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* ================= BRAND ================= */}
      <div className="flex items-center justify-between border-b px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              A
            </div>
            <span className="font-semibold text-slate-900">
              AI4Planning
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* ================= MENU (unchanged) ================= */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
        >
          <LayoutDashboard size={18} />
          {!collapsed && "Dashboard"}
        </Link>

        <Link
          href="/users"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
        >
          <Users size={18} />
          {!collapsed && "Users"}
        </Link>

        <Link
          href="/projects"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
        >
          <FolderKanban size={18} />
          {!collapsed && "Projects"}
        </Link>

        {workspaceProjectId && (
          <>
            <Link
              href={`/projects/${workspaceProjectId}/workspace/customer-chat`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-slate-100",
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
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-slate-100",
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </Link>
      </nav>

      {/* ================= FOOTER ================= */}
      {!collapsed && (
        <div className="border-t px-4 py-4 space-y-3">

          {/* 🔹 PROFILE COMPLETION */}
          {profileStatus && (
            <div
              onClick={() => router.push("/profile")}
              className="cursor-pointer rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
            >
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">Profile Completion</span>
                <span className="font-semibold text-slate-700">
                  {profileStatus.completionPercentage}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${profileStatus.completionPercentage}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                {profileStatus.completedFields} of{" "}
                {profileStatus.totalFields} fields completed
              </p>
            </div>
          )}

          {/* 🔹 WELCOME CARD */}
          <div className="rounded-xl bg-slate-50 px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
              {displayName?.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Welcome back,
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {displayName}
              </p>
            </div>
          </div>

        </div>
      )}
    </aside>
  )
}
