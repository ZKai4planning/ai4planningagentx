"use client"

import { useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  Banknote,
  LogOut,
  MessageSquare,
  FileText,
  StickyNote,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
} from "lucide-react"
import { cn } from "@/app/lib/utils"

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

/* ================= MENU CONFIG ================= */

const defaultMenu: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
  },
  // {
  //   label: "Submit to Agent Y",
  //   icon: Send,
  //   href: "/dashboard/submit",
  // },
]

function normalizeWorkspaceSection(sectionParam: string | null): string {
  if (sectionParam === "chat" || sectionParam === "communication") {
    return "communication"
  }

  if (sectionParam === "document" || sectionParam === "documents") {
    return "documents"
  }

  if (sectionParam === "coordination") {
    return "documents"
  }

  return sectionParam ?? "project"
}

/* ================= COMPONENT ================= */

export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const workspaceMatch = pathname.match(/^\/projects\/([^/]+)\/workspace(?:\/.*)?$/)
  const workspaceRouteMatch = pathname.match(/^\/projects\/[^/]+\/workspace\/([^/?#]+)/)
  const projectId = workspaceMatch?.[1]
  const isWorkspace = Boolean(projectId)
  const routeSection = workspaceRouteMatch?.[1]
  const currentWorkspaceSection =
    routeSection === "chat"
      ? "customer-chat"
      : routeSection === "agent-y-chat"
      ? "agent-y-chat"
      : routeSection === "customer-chat"
      ? "customer-chat"
      : routeSection === "agent-y-documents"
      ? "agent-y-documents"
      : routeSection === "customer-documents"
      ? "customer-documents"
      : routeSection === "documents"
      ? "agent-y-documents"
      : routeSection === "project"
      ? "project"
      : routeSection === "calendar"
      ? "calendar"
      : routeSection === "payments"
      ? "payments"
      : routeSection === "logs"
      ? "logs"
      : routeSection === "notes"
      ? "notes"
      : normalizeWorkspaceSection(searchParams.get("section"))

  const workspaceMenu: MenuItem[] = isWorkspace
    ? [
        {
          label: "Project Overview",
          icon: Building2,
          href: `/projects/${projectId}/workspace/project`,
          workspaceSection: "project",
        },
        {
          label: "Chat",
          icon: MessageSquare,
          children: [
            {
              label: "Agent Y Chat",
              href: `/projects/${projectId}/workspace/agent-y-chat`,
            },
            {
              label: "Customer Chat",
              href: `/projects/${projectId}/workspace/customer-chat`,
            },
          ],
        },
        {
          label: "Documents",
          icon: FileText,
          children: [
            {
              label: "Agent Y Documents",
              href: `/projects/${projectId}/workspace/agent-y-documents`,
            },
            {
              label: "Customer Documents",
              href: `/projects/${projectId}/workspace/customer-documents`,
            },
          ],
        },
        {
          label: "Payment Details",
          icon: Banknote,
          href: `/projects/${projectId}/workspace/payments`,
          workspaceSection: "payments",
        },
        {
          label: "Logs",
          icon: ListChecks,
          href: `/projects/${projectId}/workspace/logs`,
          workspaceSection: "logs",
        },
        {
          label: "Notes",
          icon: StickyNote,
          href: `/projects/${projectId}/workspace/notes`,
          workspaceSection: "notes",
        },
        // {
        //   label: "Project Handover",
        //   icon: Send,
        //   href: "/projects/handover",
        // },
        // {
        //   label: "All Projects",
        //   icon: FolderKanban,
        //   href: "/projects",
        // },
        {
          label: "Calendar",
          icon: Calendar,
          href: `/projects/${projectId}/workspace/calendar`,
          workspaceSection: "calendar",
        },
         {
          label: "Exit Workspace",
          icon: LogOut,
          href: "/projects",
        },
      ]
    : defaultMenu

  const menu = workspaceMenu

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
              AI4 Planning
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

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = item.workspaceSection && isWorkspace
            ? currentWorkspaceSection === item.workspaceSection
            : !!item.href &&
              (pathname === item.href ||
                (item.href !== "/projects" && pathname.startsWith(`${item.href}/`)))
          const hasActiveChild = Boolean(
            item.children?.some((child) => pathname === child.href)
          )

          const isOpen = openGroup === item.label || hasActiveChild

          /* ---------- SIMPLE LINK ---------- */
          if (!item.children) {
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition",
                  collapsed ? "justify-center px-3" : "px-4",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600" />
                )}

                <Icon size={18} />

                {!collapsed && <span>{item.label}</span>}

                {/* Tooltip */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-slate-900 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          }

          /* ---------- GROUP ---------- */
          return (
            <div key={item.label} className="relative">
              <button
                onClick={() =>
                  !collapsed &&
                  setOpenGroup(isOpen ? null : item.label)
                }
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl py-3 text-sm font-medium transition",
                  collapsed ? "justify-center px-3" : "px-4",
                  hasActiveChild
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {hasActiveChild && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600" />
                )}
                <Icon size={18} />

                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">
                      {item.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition",
                        isOpen && "rotate-180"
                      )}
                    />
                  </>
                )}

                {/* Tooltip */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-slate-900 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>

              {/* SUB MENU */}
              {!collapsed && isOpen && (
                <div className="ml-10 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childActive =
                      pathname === child.href

                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition",
                          childActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ================= FOOTER ================= */}
      {!collapsed && (
        <div className="border-t px-4 py-4">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Good Afternoon
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Agent X 👋
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
