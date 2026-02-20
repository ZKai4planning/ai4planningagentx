"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  MessageSquare,
  Search,
  UserRound,
  Wallet,
} from "lucide-react"

type ProjectStatus = "active" | "attention" | "completed"
type Priority = "high" | "medium" | "low"

type ProjectItem = {
  id: string
  name: string
  customer: string
  status: ProjectStatus
  priority: Priority
  completion: number
  waitingOn: "customer" | "agent_x" | "agent_y" | "none"
  lastActivityHoursAgo: number
  unreadMessages: number
}

const PROJECTS: ProjectItem[] = [
  {
    id: "aB3$k!",
    name: "Residential Extension - Brick Lane",
    customer: "Zafer Khan",
    status: "active",
    priority: "high",
    completion: 45,
    waitingOn: "customer",
    lastActivityHoursAgo: 7,
    unreadMessages: 2,
  },
  {
    id: "HSPC-UK-112",
    name: "Loft Conversion - Camden",
    customer: "Emma Lewis",
    status: "attention",
    priority: "high",
    completion: 62,
    waitingOn: "agent_x",
    lastActivityHoursAgo: 31,
    unreadMessages: 1,
  },
  {
    id: "HSPC-UK-208",
    name: "Rear Extension - Islington",
    customer: "Arjun Patel",
    status: "active",
    priority: "medium",
    completion: 58,
    waitingOn: "agent_y",
    lastActivityHoursAgo: 4,
    unreadMessages: 0,
  },
  {
    id: "HSPC-UK-219",
    name: "Garage Conversion - Croydon",
    customer: "Nadia Ali",
    status: "active",
    priority: "low",
    completion: 76,
    waitingOn: "none",
    lastActivityHoursAgo: 2,
    unreadMessages: 0,
  },
  {
    id: "HSPC-UK-230",
    name: "Side Extension - Hackney",
    customer: "Leo Martin",
    status: "completed",
    priority: "low",
    completion: 100,
    waitingOn: "none",
    lastActivityHoursAgo: 1,
    unreadMessages: 0,
  },
  {
    id: "HSPC-UK-247",
    name: "Change of Use - Lambeth",
    customer: "Ava Brown",
    status: "attention",
    priority: "medium",
    completion: 38,
    waitingOn: "customer",
    lastActivityHoursAgo: 54,
    unreadMessages: 3,
  },
]

const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const DASHBOARD_NOTIFICATIONS = [
  {
    id: "d-n-1",
    from: "Agent Y" as const,
    text: "Requested CIL Form and Location Plan for PRJ aB3$k!.",
    time: "8m ago",
    href: `/projects/aB3$k!/workspace/agent-y-documents`,
  },
  {
    id: "d-n-2",
    from: "Customer" as const,
    text: "Submitted ownership certificate and asked for confirmation.",
    time: "22m ago",
    href: `/projects/aB3$k!/workspace/customer-documents`,
  },
  {
    id: "d-n-3",
    from: "Customer" as const,
    text: "Unread message received in Customer Chat.",
    time: "35m ago",
    href: `/projects/aB3$k!/workspace/customer-chat`,
  },
]

export default function DashboardPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all")
  const [showNotifications, setShowNotifications] = useState(false)

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()

    return PROJECTS.filter((p) => {
      const statusMatch = statusFilter === "all" ? true : p.status === statusFilter
      const searchMatch =
        q.length === 0 ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q)
      return statusMatch && searchMatch
    }).sort((a, b) => {
      if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      }
      return b.lastActivityHoursAgo - a.lastActivityHoursAgo
    })
  }, [search, statusFilter])

  const spotlightProjects = useMemo(
    () => [...PROJECTS].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]).slice(0, 2),
    []
  )

  const activeCount = PROJECTS.filter((p) => p.status === "active").length
  const attentionCount = PROJECTS.filter((p) => p.status === "attention").length
  const completedCount = PROJECTS.filter((p) => p.status === "completed").length
  const needsActionCount = PROJECTS.filter(
    (p) => p.priority === "high" || p.waitingOn === "agent_x"
  ).length
  const unreadMessageCount = PROJECTS.reduce((sum, p) => sum + p.unreadMessages, 0)
  const slaRiskCount = PROJECTS.filter((p) => p.lastActivityHoursAgo >= 24).length

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
      <section className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-10 border-y bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Main Dashboard Header</p>
            <p className="text-xs text-slate-500">Aligned quick access and cross-channel notifications</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Bell size={13} className="text-blue-600" />
              {DASHBOARD_NOTIFICATIONS.length} notifications
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] rounded-xl border bg-white shadow-lg p-2 z-40">
                <div className="px-2 py-1 border-b mb-1">
                  <p className="text-xs font-bold text-slate-800">Notifications</p>
                </div>
                <div className="max-h-[320px] overflow-y-auto space-y-1">
                  {DASHBOARD_NOTIFICATIONS.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      className="block rounded-lg border bg-slate-50 px-3 py-2 hover:bg-slate-100 transition"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                            n.from === "Agent Y" ? "text-indigo-700" : "text-emerald-700"
                          }`}
                        >
                          {n.from === "Agent Y" ? <Bot size={11} /> : <UserRound size={11} />}
                          {n.from}
                        </span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-700">{n.text}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link href="/projects" className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Project List
          </Link>
          <Link href="/dashboard" className="rounded-lg border bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
            Dashboard
          </Link>
        </div> */}

      </section>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Agent X Dashboard</h1>
          <p className="text-sm text-slate-500">
            Spotlight 1-2 priority projects, with fast access to all projects and features.
          </p>
        </div>
        <Link
          href="/projects"
          className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Open All Projects
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi title="Total Projects" value={String(PROJECTS.length)} tone="slate" />
        <Kpi title="Active" value={String(activeCount)} tone="blue" />
        <Kpi title="Needs Attention" value={String(attentionCount)} tone="red" />
        <Kpi title="Needs Action" value={String(needsActionCount)} tone="amber" />
        <Kpi title="Unread Messages" value={String(unreadMessageCount)} tone="indigo" />
        <Kpi title="SLA Risk (24h+)" value={String(slaRiskCount)} tone="violet" />
      </section>

      <section className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Priority Spotlight</h2>
            <span className="text-xs text-slate-500">Top 2 for immediate attention</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {spotlightProjects.map((p) => (
              <div key={p.id} className="rounded-xl border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{p.id}</p>
                  <PriorityBadge value={p.priority} />
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-2">{p.name}</p>
                <p className="text-xs text-slate-500">{p.customer}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/projects/${p.id}/workspace/project`}
                    className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 font-semibold"
                  >
                    Open Project
                  </Link>
                  <Link
                    href={`/projects/${p.id}/workspace/customer-documents`}
                    className="text-xs rounded-lg border bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Documents
                  </Link>
                  <Link
                    href={`/projects/${p.id}/workspace/customer-chat`}
                    className="text-xs rounded-lg border bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Customer Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-bold text-slate-900 mb-4">Quick Feature Access</h2>
          <div className="space-y-2">
            <QuickLink href="/projects" icon={<ListChecks size={14} />} label="Project List" desc="Browse all projects" />
            <QuickLink href="/projects" icon={<FileText size={14} />} label="Documents Queue" desc="Open docs from project cards" />
            <QuickLink href="/projects" icon={<MessageSquare size={14} />} label="Message Follow-ups" desc="Go to chats per project" />
            <QuickLink href="/projects" icon={<Wallet size={14} />} label="Payment Tracking" desc="Open payment details in workspace" />
          </div>
          <div className="mt-4 rounded-lg border bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-600">
              Completed projects: <span className="font-bold text-slate-900">{completedCount}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-900">All Projects Access</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, customer"
                className="pl-8 pr-3 py-2 rounded-lg border text-sm w-[240px] bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | ProjectStatus)}
              className="rounded-lg border bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="attention">Needs Attention</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2">Project</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Completion</th>
                <th className="pb-2">Waiting On</th>
                <th className="pb-2">Last Activity</th>
                <th className="pb-2">Unread Msg</th>
                <th className="pb-2">Features</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3">
                    <p className="font-semibold text-slate-900">{p.id}</p>
                    <p className="text-xs text-slate-500">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.customer}</p>
                  </td>
                  <td className="py-3">
                    <StatusBadge value={p.status} />
                  </td>
                  <td className="py-3 text-slate-700 font-semibold">{p.completion}%</td>
                  <td className="py-3 text-slate-600 capitalize">{p.waitingOn.replace("_", " ")}</td>
                  <td className="py-3 text-slate-600">{p.lastActivityHoursAgo}h ago</td>
                  <td className="py-3 text-slate-700">{p.unreadMessages}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/projects/${p.id}/workspace/project`}
                        className="text-xs rounded-md border bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Project
                      </Link>
                      <Link
                        href={`/projects/${p.id}/workspace/customer-documents`}
                        className="text-xs rounded-md border bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Docs
                      </Link>
                      <Link
                        href={`/projects/${p.id}/workspace/agent-y-chat`}
                        className="text-xs rounded-md border bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Agent Y
                      </Link>
                      <Link
                        href={`/projects/${p.id}/workspace/customer-chat`}
                        className="text-xs rounded-md border bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Customer
                      </Link>
                      <Link
                        href={`/projects/${p.id}/workspace/payments`}
                        className="text-xs rounded-md border bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Payments
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Kpi({
  title,
  value,
  tone,
}: {
  title: string
  value: string
  tone: "slate" | "blue" | "red" | "amber" | "indigo" | "violet"
}) {
  const tones = {
    slate: "bg-slate-50 border-slate-200 text-slate-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    red: "bg-rose-50 border-rose-200 text-rose-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
  }

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-[11px] uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

function PriorityBadge({ value }: { value: Priority }) {
  const styles =
    value === "high"
      ? "bg-rose-100 text-rose-700"
      : value === "medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-200 text-slate-700"

  return <span className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1 ${styles}`}>{value}</span>
}

function StatusBadge({ value }: { value: ProjectStatus }) {
  if (value === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={12} />
        Completed
      </span>
    )
  }

  if (value === "attention") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
        <AlertTriangle size={12} />
        Needs Attention
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
      <Clock3 size={12} />
      Active
    </span>
  )
}

function QuickLink({
  href,
  icon,
  label,
  desc,
}: {
  href: string
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <Link href={href} className="block rounded-lg border bg-slate-50 px-3 py-2 hover:bg-slate-100">
      <div className="flex items-center gap-2 text-slate-800">
        {icon}
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </Link>
  )
}
