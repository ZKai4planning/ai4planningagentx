"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FolderKanban, Eye } from "lucide-react"
import DataTable, { Column } from "@/components/datatable"
import axiosInstance from "@/lib/axiosinstance"

type ApiUser = {
  userId: string
  fullName?: string
  email?: string
  phoneNumber?: string
  isActive?: boolean
}

type ApiService = {
  serviceId: string
  title?: string
  serviceName?: string
  description?: string
  image?: string
  status?: boolean
}

type ApiSubService = {
  subServiceId: string
  title?: string
  subServiceName?: string
  description?: string
  image?: string
  status?: boolean
}

type ApiProjectStage = {
  _id?: string
  stageId: string
  label?: string
  route?: string
  priority?: number
  initialStage?: boolean
  status?: boolean
}

type ApiProject = {
  projectId: string
  userId: string
  subServiceId: string
  projectStageId: string
  projectStatus?: string
  isDeleted?: boolean
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
  const service = getDisplayValue(
    project.service?.serviceName,
    project.service?.title
  )

  const subService = getDisplayValue(
    project.subService?.title,
    project.subService?.subServiceName
  )

  return {
    id: project.projectId,
    projectId: project.projectId,
    customer: getDisplayValue(project.user?.fullName, project.user?.email),
    service,
    subService,
    councilName: getDisplayValue(project.councilName, project.council?.name),
    agentXName: getDisplayValue(project.agentXName, project.agentX?.fullName, project.agentX?.email),
    agentYName: getDisplayValue(project.agentYName, project.agentY?.fullName, project.agentY?.email),
    stage: getDisplayValue(project.projectStage?.label),
    status: project.projectStatus || "unknown",
    createdOn: formatDate(project.createdAt),
    updatedOn: formatDate(project.updatedAt),
  }
}

function StatusBadge({ status }: { status: string | undefined }) {
  const tone = status
    ? {
        eligibility_in_progress: "bg-amber-50 text-amber-700",
        in_progress: "bg-blue-50 text-blue-700",
        active: "bg-blue-50 text-blue-700",
        completed: "bg-emerald-50 text-emerald-700",
        cancelled: "bg-rose-50 text-rose-700",
        unknown: "bg-slate-100 text-slate-700",
      }[status] ?? "bg-slate-100 text-slate-700"
    : "bg-slate-100 text-slate-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {formatStatusLabel(status)}
    </span>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState<ApiPagination>(DEFAULT_PAGINATION)
  const [error, setError] = useState<string | null>(null)

  const deferredSearch = useDeferredValue(search)

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
        setError("Unable to load projects right now.")
        console.error("Failed to fetch projects", err)
      } finally {
        setLoading(false)
      }
    }

    void fetchProjects()
  }, [deferredSearch, limit, page])

  const pageStats = useMemo(() => {
    const active = projects.filter((project) =>
      ["active", "in_progress", "eligibility_in_progress"].includes(project.status)
    ).length
    const completed = projects.filter((project) => project.status === "completed").length
    const attention = projects.filter((project) =>
      ["cancelled", "unknown"].includes(project.status)
    ).length

    return {
      active,
      completed,
      attention,
    }
  }, [projects])

  const columns = useMemo<Column<ProjectRow>[]>(() => [
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
      render: (value) => (
        <span className="font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      width: "220px",
      render: (value) => (
        <span className="font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: "service",
      label: "Service",
      sortable: true,
      width: "220px",
      render: (value) => (
        <p className="text-sm text-slate-700">{value}</p>
      ),
    },
    {
      key: "subService",
      label: "Sub Service",
      sortable: true,
      width: "220px",
      render: (value) => (
        <p className="line-clamp-2 text-sm text-slate-600">{value}</p>
      ),
    },
    {
      key: "councilName",
      label: "Council Name",
      sortable: true,
      width: "220px",
      render: (value) => (
        <p className="text-sm text-slate-700">{value}</p>
      ),
    },
    {
      key: "agentXName",
      label: "Agent X Name",
      sortable: true,
      width: "180px",
      render: (value) => (
        <span className="text-sm font-medium text-slate-700">{value}</span>
      ),
    },
    {
      key: "agentYName",
      label: "Agent Y Name",
      sortable: true,
      width: "180px",
      render: (value) => (
        <span className="text-sm font-medium text-slate-700">{value}</span>
      ),
    },
    {
      key: "stage",
      label: "Stage",
      sortable: true,
      width: "180px",
      render: (value) => (
        <span className="text-sm font-medium text-slate-700">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      width: "180px",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      width: "140px",
    },
    {
      key: "updatedOn",
      label: "Updated On",
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
          View Details
        </Link>
      ),
    },
  ], [])

  const subtitle = error ?? "Projects fetched from /projects/all"

  return (
    <div className="mx-auto flex max-w-8xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className={`text-sm ${error ? "text-rose-600" : "text-slate-500"}`}>
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FolderKanban size={16} />
          {pagination.totalItems} Total
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Total Projects"
          value={String(pagination.totalItems)}
          tone="slate"
          helper="Across all pages"
        />
        <InsightCard
          label="Loaded On Page"
          value={String(projects.length)}
          tone="blue"
          helper={`Page ${pagination.currentPage} of ${pagination.totalPages}`}
        />
        <InsightCard
          label="Active On Page"
          value={String(pageStats.active)}
          tone="emerald"
          helper="Active or in progress"
        />
        <InsightCard
          label="Completed On Page"
          value={String(pageStats.completed)}
          tone="amber"
          helper={`${pageStats.attention} need review`}
        />
      </section>

      <section className="xl:hidden">
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Project List</h2>
              <p className="text-sm text-slate-500">
                Responsive cards for quick scanning on smaller screens.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {projects.length} shown
            </div>
          </div>

          <div className="relative">
            <input
              placeholder="Search projects, services, council, or agents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                {error ? "Projects could not be loaded." : "No projects matched your search."}
              </div>
            ) : (
              projects.map((project) => (
                <article key={project.id} className="rounded-xl border bg-slate-50 p-4">
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
                    <InfoField label="Council Name" value={project.councilName} />
                    <InfoField label="Agent X Name" value={project.agentXName} />
                    <InfoField label="Agent Y Name" value={project.agentYName} />
                    <InfoField label="Stage" value={project.stage} />
                    <InfoField label="Created On" value={project.createdOn} />
                    <InfoField label="Updated On" value={project.updatedOn} />
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
      </section>

      <div className="hidden xl:block">
        <DataTable<ProjectRow>
          data={projects}
          columns={columns}
          loading={loading}
          serverSide
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search projects, services, council, or agents..."
          currentPage={page}
          onPageChange={setPage}
          rowsPerPage={limit}
          onRowsPerPageChange={(value) => {
            setLimit(value)
            setPage(1)
          }}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          emptyMessage={
            error
              ? "Projects could not be loaded."
              : "No projects matched your search."
          }
        />
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
  tone: "slate" | "blue" | "emerald" | "amber"
}) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  }

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
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
