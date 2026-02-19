"use client"

import Link from "next/link"
import { FolderKanban, Eye } from "lucide-react"
import DataTable, { Column } from "@/components/datatable"

/* ================= TYPES ================= */

type ProjectStage =
  | "Pre-Planning"
  | "progress"
  | "Council Submission"

type ProjectRow = {
  id: string
  projectId: string
  service: string
  stage: ProjectStage
  progress: number
  assignedBy: string
  assignedOn: string
  isActive: boolean
}

/* ================= MOCK DATA ================= */
/* Appears ONLY after Agent X assigns project */

const activeProjects: ProjectRow[] = [
  {
    id: "PROJ-UK-7842",
    projectId: "PROJ-UK-7842",
    service: "Householder Planning Consent",
    stage: "Pre-Planning",
    progress: 70,
    assignedBy: "Agent X",
    assignedOn: "12 Feb 2026",
    isActive: true,
  },
  {
    id: "PROJ-UK-7911",
    projectId: "PROJ-UK-7911",
    service: "Planning Appeal Support",
    stage: "progress",
    progress: 40,
    assignedBy: "Agent X",
    assignedOn: "10 Feb 2026",
    isActive: true,
  },
]

/* ================= HELPERS ================= */

function StageBadge({ stage }: { stage: ProjectStage }) {
  const styles: Record<ProjectStage, string> = {
    "Pre-Planning": "bg-blue-50 text-blue-700",
    "progress": "bg-amber-50 text-amber-700",
    "Council Submission": "bg-emerald-50 text-emerald-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[stage]}`}
    >
      {stage}
    </span>
  )
}

/* ================= COLUMNS ================= */

const columns: Column<ProjectRow>[] = [
  {
    key: "sno",
    label: "#",
    width: "60px",
    sticky: true,
    left: 0,
    render: (_, __, index, startIndex) => startIndex + index + 1,
  },

  {
    key: "projectId",
    label: "Project",
    sortable: true,
    render: (value, row) => (
      <div className="space-y-0.5">
        <p className="font-semibold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">
          Assigned {row.assignedOn} · {row.assignedBy}
        </p>
      </div>
    ),
  },

  {
    key: "service",
    label: "Service",
    sortable: true,
    render: (value) => (
      <p className="text-sm font-medium text-slate-800">
        {value}
      </p>
    ),
  },

  {
    key: "stage",
    label: "Stage",
    sortable: true,
    render: (value) => <StageBadge stage={value} />,
  },

  {
    key: "progress",
    label: "Progress",
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-28 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-600">
          {value}%
        </span>
      </div>
    ),
  },

  {
    key: "actions",
    label: "Action",
    align: "right",
    sticky: true,
    left: 1100,
    render: (_, row) => (
      <Link
        href={`/projects/${row.projectId}/workspace/project`}
        className="
          inline-flex items-center gap-2
          rounded-lg bg-blue-600 px-4 py-2
          text-xs font-semibold text-white
          hover:bg-blue-700 transition
        "
      ><Eye size={14} />
        View Details
      </Link>
    ),
  },
]

/* ================= PAGE ================= */

export default function ActiveProjectsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-8xl mx-auto px-10 py-6">

      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Active Projects
          </h1>
          <p className="text-sm text-slate-500">
            Projects currently assigned to you
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FolderKanban size={16} />
          {activeProjects.length} Active
        </div>
      </div>

      {/* TABLE */}
      <DataTable<ProjectRow>
        data={activeProjects}
        columns={columns}
    
      />
    </div>
  )
}
