"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FolderKanban,
  MessageSquare,
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
  paymentStatus?: string
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
  layoutAndCompliances: string
  status: string
  createdOn: string
  updatedOn: string
  createdAtRaw: string
  subscriptionDetails: string
  paymentStatus: "paid" | "pending"
  updatedAtRaw: string
  isNew: boolean
  consultationBooked: boolean
  consultationDate: string
  consultationTime: string
  consultationTimestamp: number | null
  consultationInitiatedBy: string
  consultant: string
  consultantTitle: string
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

function getNestedValue(source: unknown, path: readonly string[]) {
  let current: unknown = source

  for (const key of path) {
    if (!current || typeof current !== "object") {
      return undefined
    }

    current = (current as Record<string, unknown>)[key]
  }

  return current
}

function getFirstStringValue(source: unknown, candidatePaths: readonly (readonly string[])[]) {
  for (const path of candidatePaths) {
    const value = getNestedValue(source, path)
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function getFirstBooleanValue(source: unknown, candidatePaths: readonly (readonly string[])[]) {
  for (const path of candidatePaths) {
    const value = getNestedValue(source, path)

    if (typeof value === "boolean") {
      return value
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase()
      if (normalized === "true") return true
      if (normalized === "false") return false
    }
  }

  return undefined
}

function getSubscriptionDetails(project: ApiProject) {
  const candidatePaths = [
    ["subscriptionDetails"],
    ["subscriptionPlan"],
    ["planName"],
    ["subscription", "details"],
    ["subscription", "plan"],
    ["subscription", "name"],
    ["user", "subscriptionDetails"],
    ["user", "subscriptionPlan"],
    ["user", "planName"],
    ["user", "subscription", "plan"],
    ["user", "subscription", "name"],
    ["customer", "subscriptionDetails"],
    ["customer", "subscription", "plan"],
    ["project", "subscriptionDetails"],
    ["project", "subscription", "plan"],
  ] as const

  for (const path of candidatePaths) {
    const value = getNestedValue(project, path)
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return "Bronze"
}

function getCouncilName(project: ApiProject) {
  const councilName = getDisplayValue(project.councilName, project.council?.name)
  return councilName === "-" ? "Newham Council" : councilName
}

function getPaymentStatus(project: ApiProject): "paid" | "pending" {
  // Demo-only mixed payment badges until live payment status is finalized.
  const seed = `${project.projectId}:${project.createdAt}`
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 997
  }

  return hash % 2 === 0 ? "paid" : "pending"
}

function mapProjectToRow(project: ApiProject): ProjectRow {
  const consultationDateTimeValue = getFirstStringValue(project, [
    ["consultationDateTime"],
    ["consultation", "dateTime"],
    ["consultation", "scheduledAt"],
    ["consultation", "startsAt"],
    ["appointmentAt"],
    ["appointment", "dateTime"],
    ["appointment", "scheduledAt"],
    ["schedule", "scheduledAt"],
    ["schedule", "dateTime"],
    ["scheduledAt"],
  ])
  const consultationDateValue = getFirstStringValue(project, [
    ["consultationDate"],
    ["consultation", "date"],
    ["appointmentDate"],
    ["appointment", "date"],
    ["schedule", "date"],
  ])
  const consultationTimeValue = getFirstStringValue(project, [
    ["consultationTime"],
    ["consultation", "time"],
    ["appointmentTime"],
    ["appointment", "time"],
    ["schedule", "time"],
  ])
  const consultationTimestamp = getConsultationTimestamp(
    consultationDateTimeValue,
    consultationDateValue,
    consultationTimeValue
  )
  const consultationBooked =
    getFirstBooleanValue(project, [
      ["consultationBooked"],
      ["consultation", "booked"],
      ["appointmentBooked"],
      ["appointment", "booked"],
      ["schedule", "booked"],
    ]) ?? Boolean(consultationDateTimeValue || consultationDateValue || consultationTimeValue)
  const consultant =
    getFirstStringValue(project, [
      ["consultant"],
      ["consultantName"],
      ["consultation", "consultant"],
      ["consultation", "consultantName"],
      ["appointment", "consultant"],
      ["schedule", "consultant"],
    ]) ?? getDisplayValue(project.agentXName, project.agentX?.fullName, project.agentX?.email)
  const consultantTitle =
    getFirstStringValue(project, [
      ["consultantTitle"],
      ["consultation", "consultantTitle"],
      ["appointment", "consultantTitle"],
      ["schedule", "consultantTitle"],
    ]) ?? "Planning Consultant"
  const consultationInitiatedByValue = getFirstStringValue(project, [
      ["consultationInitiatedBy"],
      ["initiatedBy"],
      ["bookedBy"],
      ["scheduledBy"],
      ["consultation", "initiatedBy"],
      ["consultation", "bookedBy"],
      ["consultation", "scheduledBy"],
      ["appointment", "initiatedBy"],
      ["appointment", "bookedBy"],
      ["appointment", "scheduledBy"],
      ["schedule", "initiatedBy"],
      ["schedule", "bookedBy"],
      ["schedule", "scheduledBy"],
    ])
  const consultationInitiatedBy = consultationInitiatedByValue
    ? formatConsultationInitiator(consultationInitiatedByValue)
    : getDummyConsultationInitiator(project.projectId)

  return {
    id: project.projectId,
    projectId: project.projectId,
    customer: getDisplayValue(project.user?.fullName, project.user?.email),
    service: getDisplayValue(project.service?.serviceName, project.service?.title),
    subService: getDisplayValue(project.subService?.title, project.subService?.subServiceName),
    councilName: getCouncilName(project),
    agentXName: getDisplayValue(project.agentXName, project.agentX?.fullName, project.agentX?.email),
    agentYName: getDisplayValue(project.agentYName, project.agentY?.fullName, project.agentY?.email),
    stage: getDisplayValue(project.projectStage?.label),
    layoutAndCompliances: getDisplayValue(project.projectStage?.label),
    status: project.projectStatus || "unknown",
    createdOn: formatDate(project.createdAt),
    updatedOn: formatDate(project.updatedAt),
    createdAtRaw: project.createdAt,
    subscriptionDetails: getSubscriptionDetails(project),
    paymentStatus: getPaymentStatus(project),
    updatedAtRaw: project.updatedAt,
    isNew: isProjectNew(project.createdAt),
    consultationBooked,
    consultationDate:
      consultationTimestamp !== null
        ? formatScheduleDate(new Date(consultationTimestamp).toISOString())
        : consultationDateValue
          ? formatScheduleDate(consultationDateValue)
          : "-",
    consultationTime:
      consultationTimestamp !== null
        ? formatScheduleTime(new Date(consultationTimestamp).toISOString())
        : consultationTimeValue
          ? formatScheduleTime(consultationTimeValue)
          : "-",
    consultationTimestamp,
    consultationInitiatedBy,
    consultant,
    consultantTitle,
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

function includesStageKeyword(stage: string, keywords: string[]) {
  const normalizedStage = stage.trim().toLowerCase()

  if (!normalizedStage || normalizedStage === "-") {
    return false
  }

  return keywords.some((keyword) => normalizedStage.includes(keyword))
}

function hasPendingDocumentation(row: ProjectRow) {
  if (["completed", "cancelled"].includes(row.status)) {
    return false
  }

  return includesStageKeyword(row.stage, ["eligibility", "checklist", "document"])
}

function hasPendingCouncilSubmission(row: ProjectRow) {
  if (["completed", "cancelled"].includes(row.status)) {
    return false
  }

  return includesStageKeyword(row.stage, ["council submission"])
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

function isProjectNew(value: string) {
  return getDaysAgo(value) <= 7
}

function formatScheduleDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatScheduleTime(value: string) {
  const date = new Date(value)

  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return "-"
  }

  const normalized = trimmed.replace(/\s+/g, "")
  const parsedTime = new Date(`1970-01-01T${normalized}`)

  if (!Number.isNaN(parsedTime.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(parsedTime)
  }

  return trimmed
}

function getConsultationTimestamp(dateTimeValue?: string, dateValue?: string, timeValue?: string) {
  if (dateTimeValue) {
    const timestamp = new Date(dateTimeValue).getTime()
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }

  if (dateValue && timeValue) {
    const timestamp = new Date(`${dateValue} ${timeValue}`).getTime()
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }

  if (dateValue) {
    const timestamp = new Date(dateValue).getTime()
    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }

  return null
}

function getDummyConsultationInitiator(seed: string) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 997
  }

  return hash % 2 === 0 ? "Agent" : "Customer"
}

function formatConsultationInitiator(value?: string) {
  if (!value) {
    return "-"
  }

  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return "-"
  }

  if (["customer", "client", "user"].includes(normalized)) {
    return "Customer"
  }

  if (["agent", "consultant", "advisor", "team", "staff", "admin"].includes(normalized)) {
    return "Agent"
  }

  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function buildMockConsultationRows(projects: ProjectRow[]) {
  const mockConsultants = [
    { name: "Sarah", title: "Senior Planning Consultant" },
    { name: "Oliver", title: "Planning Consultant" },
    { name: "Priya", title: "Householder Specialist" },
    { name: "Daniel", title: "Planning Case Advisor" },
  ] as const
  const mockSlots = [
    { dayOffset: 1, hour: 9, minute: 30 },
    { dayOffset: 2, hour: 11, minute: 0 },
    { dayOffset: 4, hour: 14, minute: 30 },
    { dayOffset: -1, hour: 16, minute: 0 },
  ] as const

  const defaultRows: ProjectRow[] = [
    {
      id: "demo-1",
      projectId: "AI4P-1001",
      customer: "Oliver Bennett",
      service: "Rear Extension Planning",
      subService: "Householder",
      councilName: "Newham Council",
      agentXName: "-",
      agentYName: "-",
      stage: "Consultation",
      layoutAndCompliances: "Consultation",
      status: "in_progress",
      createdOn: "-",
      updatedOn: "-",
      createdAtRaw: new Date().toISOString(),
      subscriptionDetails: "Gold",
      paymentStatus: "paid",
      updatedAtRaw: new Date().toISOString(),
      isNew: true,
      consultationBooked: true,
      consultationDate: "-",
      consultationTime: "-",
      consultationTimestamp: null,
      consultationInitiatedBy: "Customer",
      consultant: "-",
      consultantTitle: "-",
    },
    {
      id: "demo-2",
      projectId: "AI4P-1002",
      customer: "Amelia Stone",
      service: "Loft Conversion Advice",
      subService: "Permitted Development",
      councilName: "Hackney Council",
      agentXName: "-",
      agentYName: "-",
      stage: "Consultation",
      layoutAndCompliances: "Consultation",
      status: "active",
      createdOn: "-",
      updatedOn: "-",
      createdAtRaw: new Date().toISOString(),
      subscriptionDetails: "Silver",
      paymentStatus: "paid",
      updatedAtRaw: new Date().toISOString(),
      isNew: true,
      consultationBooked: true,
      consultationDate: "-",
      consultationTime: "-",
      consultationTimestamp: null,
      consultationInitiatedBy: "Agent",
      consultant: "-",
      consultantTitle: "-",
    },
    {
      id: "demo-3",
      projectId: "AI4P-1003",
      customer: "Jacob Hughes",
      service: "Change of Use Review",
      subService: "Commercial",
      councilName: "Redbridge Council",
      agentXName: "-",
      agentYName: "-",
      stage: "Consultation",
      layoutAndCompliances: "Consultation",
      status: "in_progress",
      createdOn: "-",
      updatedOn: "-",
      createdAtRaw: new Date().toISOString(),
      subscriptionDetails: "Bronze",
      paymentStatus: "pending",
      updatedAtRaw: new Date().toISOString(),
      isNew: true,
      consultationBooked: true,
      consultationDate: "-",
      consultationTime: "-",
      consultationTimestamp: null,
      consultationInitiatedBy: "Customer",
      consultant: "-",
      consultantTitle: "-",
    },
    {
      id: "demo-4",
      projectId: "AI4P-1004",
      customer: "Sophia Clarke",
      service: "Garage Conversion Planning",
      subService: "Residential",
      councilName: "Barnet Council",
      agentXName: "-",
      agentYName: "-",
      stage: "Consultation",
      layoutAndCompliances: "Consultation",
      status: "active",
      createdOn: "-",
      updatedOn: "-",
      createdAtRaw: new Date().toISOString(),
      subscriptionDetails: "Gold",
      paymentStatus: "paid",
      updatedAtRaw: new Date().toISOString(),
      isNew: true,
      consultationBooked: true,
      consultationDate: "-",
      consultationTime: "-",
      consultationTimestamp: null,
      consultationInitiatedBy: "Agent",
      consultant: "-",
      consultantTitle: "-",
    },
  ]
  const sourceRows = [...projects.slice(0, 4)]

  if (sourceRows.length < 4) {
    sourceRows.push(...defaultRows.slice(0, 4 - sourceRows.length))
  }

  return sourceRows.map((project, index) => {
    const slot = mockSlots[index % mockSlots.length]
    const consultant = mockConsultants[index % mockConsultants.length]
    const scheduledAt = new Date()

    scheduledAt.setHours(slot.hour, slot.minute, 0, 0)
    scheduledAt.setDate(scheduledAt.getDate() + slot.dayOffset)

    return {
      ...project,
      consultationBooked: true,
      consultationTimestamp: scheduledAt.getTime(),
      consultationDate: formatScheduleDate(scheduledAt.toISOString()),
      consultationTime: formatScheduleTime(scheduledAt.toISOString()),
      consultant: project.agentXName !== "-" ? project.agentXName : consultant.name,
      consultantTitle: consultant.title,
    }
  })
}

function StatusBadge({ status }: { status: string | undefined }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(status)}`}>
      {formatStatusLabel(status)}
    </span>
  )
}

function NewProjectBadge() {
  return (
    <span className="inline-flex animate-pulse rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
      New
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
    const pendingDocumentation = projects.filter((project) => hasPendingDocumentation(project)).length
    const pendingCouncilSubmissions = projects.filter((project) => hasPendingCouncilSubmission(project)).length
    const customerFeedback = projects.length > 0 ? Math.min(3, projects.length) : 0
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
      pendingDocumentation,
      pendingCouncilSubmissions,
      customerFeedback,
      attention,
      recent,
      councils,
      assignedPeople,
    }
  }, [projects])

  const scheduledConsultations = useMemo(() => {
    const now = Date.now()

    return [...projects]
      .filter(
        (project) =>
          project.consultationBooked || project.consultationTimestamp !== null || project.consultationDate !== "-"
      )
      .sort((a, b) => {
        const aUpcoming = a.consultationTimestamp !== null && a.consultationTimestamp >= now
        const bUpcoming = b.consultationTimestamp !== null && b.consultationTimestamp >= now

        if (aUpcoming !== bUpcoming) {
          return aUpcoming ? -1 : 1
        }

        if (aUpcoming && bUpcoming && a.consultationTimestamp !== null && b.consultationTimestamp !== null) {
          return a.consultationTimestamp - b.consultationTimestamp
        }

        if (a.consultationTimestamp !== null && b.consultationTimestamp !== null) {
          return b.consultationTimestamp - a.consultationTimestamp
        }

        if (a.consultationTimestamp !== null) {
          return -1
        }

        if (b.consultationTimestamp !== null) {
          return 1
        }

        return new Date(b.updatedAtRaw).getTime() - new Date(a.updatedAtRaw).getTime()
      })
      .slice(0, 4)
  }, [projects])

  const consultantScheduleCards = useMemo(() => {
    const liveRows = scheduledConsultations.slice(0, 4)

    if (liveRows.length >= 4) {
      return liveRows
    }

    const liveIds = new Set(liveRows.map((project) => project.id))
    const fallbackRows = buildMockConsultationRows(projects).filter((project) => !liveIds.has(project.id))

    return [...liveRows, ...fallbackRows].slice(0, 4)
  }, [projects, scheduledConsultations])

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
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{value}</span>
            {row.isNew ? <NewProjectBadge /> : null}
          </div>
        ),
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
        key: "layoutAndCompliances",
        label: "Layout & Compliances",
        sortable: true,
        width: "170px",
        render: (value) => (
          <span className={value === "-" ? "text-slate-400" : "text-slate-800"}>
            {typeof value === "string" && value.trim() ? value : "-"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        width: "170px",
        render: (value) => <StatusBadge status={value} />,
      },
      {
        key: "subscriptionDetails",
        label: "Subscription",
        sortable: true,
        width: "180px",
        render: (_, row) => (
          <SubscriptionBadges plan={row.subscriptionDetails} status={row.paymentStatus} />
        ),
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

  const heroMetrics = [
    {
      icon: <FolderKanban size={18} />,
      label: "Active Projects",
      value: dashboardStats.active,
      helper: "Statuses marked active, in progress, or eligibility in progress",
      color: "var(--color-chart-1)",
    },
    {
      icon: <FolderKanban size={18} />,
      label: "Pending Documentation",
      value: dashboardStats.pendingDocumentation,
      helper: "Projects still in eligibility, checklist, or document review stages",
      color: "var(--color-chart-2)",
    },
    {
      icon: <AlertTriangle size={18} />,
      label: "High Risk Cases",
      value: dashboardStats.attention,
      helper: "Cancelled, unknown, or missing Agent X or Agent Y assignment",
      color: "var(--color-chart-3)",
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: "Pending Council Submissions",
      value: dashboardStats.pendingCouncilSubmissions,
      helper: "Projects currently sitting in the council submission stage",
      color: "var(--color-chart-4)",
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: "Successful Completions",
      value: dashboardStats.completed,
      helper: "Projects with a completed status on this page",
      color: "var(--color-chart-5)",
    },
    {
      icon: <MessageSquare size={18} />,
      label: "Customer Feedback",
      value: dashboardStats.customerFeedback,
      helper: "Placeholder count until live customer feedback is connected",
      color: "#f97316",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-8xl flex-col gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.15fr_1.25fr]">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome Agent 
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  This dashboard now pulls the same project data as the projects page, so your overview and table stay aligned.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total Projects</p>
                <p className="mt-1 font-medium">{pagination.totalItems} total projects</p>
                <p className="text-slate-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {heroMetrics.map((metric) => (
                <HeroMetric
                  key={metric.label}
                  icon={metric.icon}
                  label={metric.label}
                  value={String(metric.value)}
                  helper={metric.helper}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">KPI Mix</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Metric distribution</h2>
                <p className="mt-2 text-sm text-slate-500">Visual breakdown of the same KPI totals shown in the hero cards. A project can contribute to more than one KPI.</p>
              </div>
            </div>

            <div className="mt-6">
              <MetricPieChart
                metrics={heroMetrics.map((metric) => ({
                  label: metric.label,
                  value: metric.value,
                  helper: metric.helper,
                  color: metric.color,
                }))}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Client Consultantation Schedule</h2>
                <p className="text-sm text-slate-500">
                  Upcoming bookings appear first and the section keeps a minimum of 4 cards visible.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Min 4 shown
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {loading ? (
                <PanelMessage message="Loading consultant schedule..." />
              ) : (
                consultantScheduleCards.map((project) => {
                  const isUpcoming =
                    project.consultationTimestamp !== null && project.consultationTimestamp >= Date.now()
                  const consultantName = project.consultant === "-" ? "Our planning team" : project.consultant

                  return (
                    <article key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-slate-900">{project.customer}</h3>
                          <p className="mt-1 truncate text-sm text-slate-500">{project.subService}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isUpcoming
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                        >
                          {isUpcoming ? "Upcoming" : "Recent"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Consultant
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{consultantName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {project.consultantTitle !== "-" ? project.consultantTitle : "Planning Consultant"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Project
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{project.projectId}</p>
                            {project.isNew ? <NewProjectBadge /> : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{project.councilName}</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Date
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                            <CalendarDays size={15} className="text-blue-600" />
                            <span>{project.consultationDate !== "-" ? project.consultationDate : "Pending"}</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Time
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                            <Clock3 size={15} className="text-blue-600" />
                            <span>{project.consultationTime !== "-" ? project.consultationTime : "Pending"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                        <div>
                          {/* <p>{project.service}</p> */}
                          <p className="text-xs font-medium text-slate-500">
                            Consultation initiated by {project.consultationInitiatedBy}
                          </p>
                          {/* <p className="mt-1">{project.stage}</p> */}
                        </div>
                        {/* <StatusBadge status={project.status} /> */}
                      </div>

                      {/* <div className="mt-4 flex flex-wrap gap-2">
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
                      </div> */}
                    </article>
                  )
                })
              )}
            </div>
          </div>

          <div className="grid gap-6">
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">{project.projectId}</p>
                          {project.isNew ? <NewProjectBadge /> : null}
                        </div>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{project.projectId}</p>
                          {project.isNew ? <NewProjectBadge /> : null}
                        </div>
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
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Subscription</p>
                        <div className="mt-2">
                          <SubscriptionBadges plan={project.subscriptionDetails} status={project.paymentStatus} />
                        </div>
                      </div>
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

function formatMetricShare(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function getDonutSegments(
  metrics: Array<{
    label: string
    value: number
    helper: string
    color: string
  }>,
  total: number,
  circumference: number
) {
  let offset = 0

  return metrics
    .filter((metric) => metric.value > 0)
    .map((metric) => {
      const segmentLength = (metric.value / Math.max(total, 1)) * circumference
      const segment = {
        ...metric,
        offset,
        segmentLength,
      }

      offset += segmentLength
      return segment
    })
}

function MetricPieChart({
  metrics,
}: {
  metrics: Array<{
    label: string
    value: number
    helper: string
    color: string
  }>
}) {
  const total = metrics.reduce((sum, metric) => sum + metric.value, 0)
  const radius = 42
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius
  const segments = getDonutSegments(metrics, total, circumference)

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
      <div className="mx-auto">
        <div className="relative h-56 w-56">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
            {segments.map((metric) => (
              <circle
                key={metric.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={metric.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${metric.segmentLength} ${circumference - metric.segmentLength}`}
                strokeDashoffset={-metric.offset}
              />
            ))}
          </svg>

          <div className="absolute inset-[19%] flex items-center justify-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tracked KPI Total
              </p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{total}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Across all KPI metrics
              </p>
            </div>
          </div>
        </div>

        <p className="mt-2 max-w-56 text-center text-[11px] text-slate-500">The legend lists each metric&apos;s total and share of the overall KPI count.</p>
      </div>

      <div className="space-y-2.5">
        {metrics.map((metric) => {
          const share = formatMetricShare(metric.value, total)

          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="mt-0.5 h-3 w-3 rounded-full" style={{ backgroundColor: metric.color }} />
                    <p className="text-sm font-semibold text-slate-900">{metric.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                  <p className="text-xs text-slate-500">{share}% of KPI total</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SubscriptionBadges({
  plan,
  status,
}: {
  plan: string
  status: "paid" | "pending"
}) {
  const paymentTone = {
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
        {plan}
      </span>
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paymentTone[status]}`}>
        {status === "paid" ? "Paid" : "Pending"}
      </span>
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
