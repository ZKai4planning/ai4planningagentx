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
  stage: string
  status: string
  createdOn: string
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

function mapProjectToRow(project: ApiProject): ProjectRow {
  const service =
    project.service?.serviceName ||
    project.service?.title ||
    "-"

  const subService =
    project.subService?.title ||
    project.subService?.subServiceName ||
    "-"

  return {
    id: project.projectId,
    projectId: project.projectId,
    customer: project.user?.fullName || project.user?.email || "-",
    service,
    subService,
    stage: project.projectStage?.label || "-",
    status: project.projectStatus || "unknown",
    createdOn: formatDate(project.createdAt),
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
      width: "260px",
      render: (value) => (
        <p className="line-clamp-2 text-sm text-slate-600">{value}</p>
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
    <div className="mx-auto flex max-w-8xl flex-col gap-6 px-10 py-6">
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
        searchPlaceholder="Search projects, services, or sub-services..."
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
  )
}
