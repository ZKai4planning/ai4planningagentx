"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  FolderKanban,
  LayoutDashboard,
  Layers3,
} from "lucide-react"
import DataTable, { Column } from "@/components/datatable"
import axiosInstance from "@/lib/axiosinstance"
import { useAuthStore } from "@/lib/zustand"

type ApiUser = {
  userId: string
  fullName?: string
  email?: string
}

type ApiService = {
  serviceId: string
  title?: string
  serviceName?: string
}

type ApiSubService = {
  subServiceId: string
  title?: string
  subServiceName?: string
}

type ApiProjectStage = {
  stageId: string
  label?: string
}

type ApiProject = {
  projectId: string
  projectStatus?: string
  councilName?: string
  council?: {
    name?: string
  } | null
  agentXName?: string
  agentYName?: string
  agentX?: ApiUser | null
  agentY?: ApiUser | null
  user?: ApiUser | null
  service?: ApiService | null
  subService?: ApiSubService | null
  projectStage?: ApiProjectStage | null
  createdAt: string
  updatedAt: string
}

type ApiPagination = {
  totalItems: number
  itemCount?: number
  currentPage: number
  totalPages: number
  pageSize: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type ProjectsResponse = {
  success?: boolean
  message?: string
  data?: ApiProject[]
  pagination?: ApiPagination
}

type ProjectRow = {
  id: string
  projectId: string
  customer: string
  service: string
  subService: string
  councilName: string
  agentXName: string
  agentYName: string
  stage: string
  status: string
  createdOn: string
  updatedOn: string
  updatedAtRaw: string
}

const DEFAULT_PAGINATION: ApiPagination = {
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPrevPage: false,
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatStatusLabel(value: string | undefined) {
  if (!value) return "Unknown"

  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getDisplayValue(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return "-"
}

function mapProjectToRow(project: ApiProject): ProjectRow {
  return {
    id: project.projectId,
    projectId: project.projectId,
    customer: getDisplayValue(project.user?.fullName, project.user?.email),
    service: getDisplayValue(project.service?.serviceName, project.service?.title),
    subService: getDisplayValue(project.subService?.title, project.subService?.subServiceName),
    councilName: getDisplayValue(project.councilName, project.council?.name),
    agentXName: getDisplayValue(project.agentXName, project.agentX?.fullName, project.agentX?.email),
    agentYName: getDisplayValue(project.agentYName, project.agentY?.fullName, project.agentY?.email),
    stage: getDisplayValue(project.projectStage?.label),
    status: project.projectStatus || "unknown",
    createdOn: formatDate(project.createdAt),
    updatedOn: formatDate(project.updatedAt),
    updatedAtRaw: project.updatedAt,
  }
}

function getStatusTone(status: string | undefined) {
  return status
    ? {
        eligibility_in_progress: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        active: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
        unknown: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      }[status] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
}

function isActiveStatus(status: string) {
  return ["active", "in_progress", "eligibility_in_progress"].includes(status)
}

function needsAttention(row: ProjectRow) {
  return ["cancelled", "unknown"].includes(row.status) || row.agentXName === "-" || row.agentYName === "-"
}

function getDaysAgo(value: string) {
  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY
  }

  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
}

function StatusBadge({ status }: { status: string | undefined }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(status)}`}>
      {formatStatusLabel(status)}
    </span>
  )
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState<ApiPagination>(DEFAULT_PAGINATION)
  const [error, setError] = useState<string | null>(null)

  const deferredSearch = useDeferredValue(search)
  const userId = useAuthStore((state) => state.userId)
  const name = useAuthStore((state) => state.name)
  const email = useAuthStore((state) => state.email)
  const displayName = name?.trim() || email?.split("@")[0] || userId || "Team"

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)

      try {
        const response = await axiosInstance.get<ProjectsResponse>("/projects/all", {
          params: {
            page,
            limit,
            isDeleted: false,
            ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
          },
        })

        const payload = response.data
        const nextPagination = payload.pagination ?? {
          ...DEFAULT_PAGINATION,
          currentPage: page,
          pageSize: limit,
        }

        setProjects((payload.data ?? []).map(mapProjectToRow))
        setPagination(nextPagination)
        setError(null)

        if (nextPagination.currentPage !== page) {
          setPage(nextPagination.currentPage)
        }
      } catch (err) {
        setProjects([])
        setPagination({
          ...DEFAULT_PAGINATION,
          currentPage: page,
          pageSize: limit,
        })
        setError("Unable to load dashboard projects right now.")
        console.error("Failed to fetch dashboard projects", err)
      } finally {
        setLoading(false)
      }
    }

    void fetchProjects()
  }, [deferredSearch, limit, page])

  const dashboardStats = useMemo(() => {
    const active = projects.filter((project) => isActiveStatus(project.status)).length
    const completed = projects.filter((project) => project.status === "completed").length
    const attention = projects.filter((project) => needsAttention(project)).length
    const recent = projects.filter((project) => getDaysAgo(project.updatedAtRaw) <= 7).length
    const councils = new Set(projects.map((project) => project.councilName).filter((value) => value !== "-")).size
    const assignedPeople = new Set(
      projects
        .flatMap((project) => [project.agentXName, project.agentYName])
        .filter((value) => value !== "-")
    ).size

    return {
      active,
      completed,
      attention,
      recent,
      councils,
      assignedPeople,
    }
  }, [projects])

  const spotlightProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const aAttention = needsAttention(a) ? 1 : 0
        const bAttention = needsAttention(b) ? 1 : 0

        if (aAttention !== bAttention) {
          return bAttention - aAttention
        }

        return new Date(b.updatedAtRaw).getTime() - new Date(a.updatedAtRaw).getTime()
      })
      .slice(0, 3)
  }, [projects])

  const stageSummary = useMemo(() => {
    return Array.from(
      projects.reduce((acc, project) => {
        const label = project.stage === "-" ? "Unassigned Stage" : project.stage
        acc.set(label, (acc.get(label) ?? 0) + 1)
        return acc
      }, new Map<string, number>())
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [projects])

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAtRaw).getTime() - new Date(a.updatedAtRaw).getTime())
      .slice(0, 4)
  }, [projects])

  const tableColumns = useMemo<Column<ProjectRow>[]>(
    () => [
      {
        key: "sno",
        label: "#",
        width: "64px",
        align: "center",
        render: (_, __, index, startIndex) => startIndex + index + 1,
      },
      {
        key: "projectId",
        label: "Project ID",
        sortable: true,
        width: "160px",
        render: (value) => <span className="font-semibold text-slate-900">{value}</span>,
      },
      {
        key: "customer",
        label: "Customer",
        sortable: true,
        width: "190px",
        render: (value) => <span className="font-medium text-slate-800">{value}</span>,
      },
      {
        key: "service",
        label: "Service",
        sortable: true,
        width: "220px",
        render: (value, row) => (
          <div>
            <p className="text-sm font-medium text-slate-800">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{row.subService}</p>
          </div>
        ),
      },
      {
        key: "councilName",
        label: "Council",
        sortable: true,
        width: "200px",
      },
      {
        key: "stage",
        label: "Stage",
        sortable: true,
        width: "170px",
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        width: "170px",
        render: (value) => <StatusBadge status={value} />,
      },
      {
        key: "updatedOn",
        label: "Updated",
        sortable: true,
        width: "140px",
      },
      {
        key: "actions",
        label: "Action",
        align: "right",
        width: "150px",
        render: (_, row) => (
          <Link
            href={`/projects/${row.projectId}/workspace/project`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <Eye size={14} />
            Open
          </Link>
        ),
      },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-8xl flex-col gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  <LayoutDashboard size={14} />
                  Operations Dashboard
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {displayName}, here is the live project view for your team.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  This dashboard now pulls the same project data as the projects page, so your overview and table stay aligned.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Live dataset</p>
                <p className="mt-1 font-medium">{pagination.totalItems} total projects</p>
                <p className="text-slate-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroMetric
                icon={<FolderKanban size={18} />}
                label="Active Pipeline"
                value={String(dashboardStats.active)}
                helper="Active or in progress on this page"
              />
              <HeroMetric
                icon={<AlertTriangle size={18} />}
                label="Needs Review"
                value={String(dashboardStats.attention)}
                helper="Unknown status or missing assignment"
              />
              <HeroMetric
                icon={<CheckCircle2 size={18} />}
                label="Completed"
                value={String(dashboardStats.completed)}
                helper="Completed projects on this page"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Open Full Projects Page
                <ArrowRight size={16} />
              </Link>
              {spotlightProjects[0] ? (
                <Link
                  href={`/projects/${spotlightProjects[0].projectId}/workspace/project`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Open Top Priority Project
                  <ArrowRight size={16} />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Queue Health</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Page snapshot</h2>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Layers3 size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <CompactStat label="Projects loaded" value={String(projects.length)} helper={`Rows per page: ${limit}`} />
              <CompactStat label="Updated in 7 days" value={String(dashboardStats.recent)} helper="Based on fetched results" />
              <CompactStat label="Councils covered" value={String(dashboardStats.councils)} helper="Unique councils on this page" />
              <CompactStat label="Assigned agents" value={String(dashboardStats.assignedPeople)} helper="Unique Agent X and Agent Y names" />
            </div>
          </div>
        </section>

        {/* <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <InsightCard label="Total Projects" value={String(pagination.totalItems)} helper="Across all pages" tone="slate" />
          <InsightCard label="Loaded Rows" value={String(projects.length)} helper={`Page ${pagination.currentPage}`} tone="blue" />
          <InsightCard label="In Progress" value={String(dashboardStats.active)} helper="Active pipeline" tone="emerald" />
          <InsightCard label="Completed" value={String(dashboardStats.completed)} helper="Current page total" tone="teal" />
          <InsightCard label="Needs Review" value={String(dashboardStats.attention)} helper="Missing data or unknown" tone="amber" />
          <InsightCard label="Recent Updates" value={String(dashboardStats.recent)} helper="Touched in last 7 days" tone="violet" />
        </section> */}

        <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Priority projects</h2>
                <p className="text-sm text-slate-500">Projects needing attention are surfaced first, then sorted by recent activity.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {spotlightProjects.length} shown
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {loading ? (
                <PanelMessage message="Loading priority projects..." />
              ) : spotlightProjects.length === 0 ? (
                <PanelMessage message={error ? "Priority projects could not be loaded." : "No projects available yet."} />
              ) : (
                spotlightProjects.map((project) => (
                  <article key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{project.projectId}</p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">{project.customer}</h3>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-800">Service:</span> {project.service}</p>
                      <p><span className="font-medium text-slate-800">Council:</span> {project.councilName}</p>
                      <p><span className="font-medium text-slate-800">Stage:</span> {project.stage}</p>
                      <p><span className="font-medium text-slate-800">Updated:</span> {project.updatedOn}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/projects/${project.projectId}/workspace/project`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Open Project
                      </Link>
                      <Link
                        href={`/projects/${project.projectId}/workspace/customer-chat`}
                        className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Customer Chat
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-6">
            {/* <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Stage distribution</h2>
              <p className="mt-1 text-sm text-slate-500">Top stages from the currently loaded project set.</p>

              <div className="mt-5 space-y-4">
                {loading ? (
                  <PanelMessage message="Loading stage summary..." />
                ) : stageSummary.length === 0 ? (
                  <PanelMessage message={error ? "Stage summary could not be loaded." : "No stage data available."} />
                ) : (
                  stageSummary.map(([label, count]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">{label}</span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{
                            width: `${Math.max((count / Math.max(projects.length, 1)) * 100, 8)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div> */}

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Recently updated</h2>
              <p className="mt-1 text-sm text-slate-500">Fast access to the latest touched projects.</p>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <PanelMessage message="Loading recent updates..." />
                ) : recentProjects.length === 0 ? (
                  <PanelMessage message={error ? "Recent updates could not be loaded." : "No recent projects found."} />
                ) : (
                  recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.projectId}/workspace/project`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{project.projectId}</p>
                        <p className="text-sm text-slate-500">{project.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{project.updatedOn}</p>
                        <p className="text-xs text-slate-500">{project.stage}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Projects table</h2>
              <p className={`text-sm ${error ? "text-rose-600" : "text-slate-500"}`}>
                {error ?? "This table uses the same live project feed as the projects page."}
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
            >
              View full projects page
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 xl:hidden">
            <div className="mb-4">
              <input
                placeholder="Search projects, customer, council, or service..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                <PanelMessage message="Loading projects..." />
              ) : projects.length === 0 ? (
                <PanelMessage message={error ? "Projects could not be loaded." : "No projects matched your search."} />
              ) : (
                projects.map((project) => (
                  <article key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{project.projectId}</p>
                        <p className="mt-1 text-sm text-slate-700">{project.customer}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoField label="Service" value={project.service} />
                      <InfoField label="Sub Service" value={project.subService} />
                      <InfoField label="Council" value={project.councilName} />
                      <InfoField label="Agent X" value={project.agentXName} />
                      <InfoField label="Agent Y" value={project.agentYName} />
                      <InfoField label="Stage" value={project.stage} />
                      <InfoField label="Created" value={project.createdOn} />
                      <InfoField label="Updated" value={project.updatedOn} />
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/projects/${project.projectId}/workspace/project`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Eye size={14} />
                        View Details
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-slate-500">
                {pagination.totalItems === 0
                  ? "0 results"
                  : `${(pagination.currentPage - 1) * limit + 1}-${Math.min(
                      (pagination.currentPage - 1) * limit + projects.length,
                      pagination.totalItems
                    )} of ${pagination.totalItems}`}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-slate-600">
                  Rows
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value))
                      setPage(1)
                    }}
                    className="rounded-lg border px-2 py-1"
                  >
                    {[5, 10, 20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPrevPage || loading}
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    className="rounded-lg border px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-slate-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <DataTable<ProjectRow>
              data={projects}
              columns={tableColumns}
              loading={loading}
              serverSide
              searchValue={search}
              onSearchChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              searchPlaceholder="Search projects, customer, council, or service..."
              currentPage={page}
              onPageChange={setPage}
              rowsPerPage={limit}
              onRowsPerPageChange={(value) => {
                setLimit(value)
                setPage(1)
              }}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              emptyMessage={error ? "Projects could not be loaded." : "No projects matched your search."}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function HeroMetric({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-blue-100">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{helper}</p>
    </div>
  )
}

function CompactStat({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function InsightCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "slate" | "blue" | "emerald" | "teal" | "amber" | "violet"
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    teal: "border-cyan-200 bg-cyan-50 text-cyan-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs opacity-80">{helper}</p>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  )
}

function PanelMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}
