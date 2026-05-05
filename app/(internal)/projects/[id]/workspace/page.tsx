import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Building2,
  Bot,
  Calendar,
  FileCheck,
  FileText,
  ListChecks,
  Sparkles,
  StickyNote,
  User,
  Wallet,
} from "lucide-react"

function normalizeSection(section?: string): string {
  if (!section) return "project"
  if (section === "chat" || section === "communication") return "communication"
  if (section === "document" || section === "documents") return "documents"
  if (section === "coordination") return "documents"
  return section
}

export default async function WorkspaceHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ section?: string }>
}) {
  const { id } = await params
  const { section } = await searchParams
  const normalized = normalizeSection(section)

  if (normalized === "communication") redirect(`/projects/${id}/workspace/customer-chat`)
  if (normalized === "documents") redirect(`/projects/${id}/workspace/agent-y-documents`)
  if (normalized === "payments") redirect(`/projects/${id}/workspace/payments`)
  if (normalized === "logs") redirect(`/projects/${id}/workspace/logs`)
  if (normalized === "calendar") redirect(`/projects/${id}/workspace/calendar`)
  if (normalized === "notes") redirect(`/projects/${id}/workspace/notes`)

  const sopCards = [
    {
      title: "SOP",
      desc: "Open the first roadmap stage with the Agent Z SOP cards and guided checklist.",
      href: `/projects/${id}/workspace/project?section=project&step=checklist`,
      icon: FileCheck,
      tone: "blue",
    },
    {
      title: "Eligibility Check",
      desc: "Continue the Agent Z review with live customer answers and question guidance.",
      href: `/projects/${id}/workspace/project?section=project&step=eligibility`,
      icon: Sparkles,
      tone: "emerald",
    },
    {
      title: "Agent Z Workspace",
      desc: "Jump into the project workspace where Agent Z insights and triggers are shown.",
      href: `/projects/${id}/workspace/project?section=project&step=checklist`,
      icon: Bot,
      tone: "amber",
    },
  ] as const

  const cards = [
    {
      title: "Project Workspace",
      desc: "Main project context, roadmap, and handover controls.",
      href: `/projects/${id}/workspace/project`,
      icon: Building2,
    },
    {
      title: "Agent Y Chat",
      desc: "Direct coordination between Agent X and Agent Y.",
      href: `/projects/${id}/workspace/agent-y-chat`,
      icon: Bot,
    },
    {
      title: "Customer Chat",
      desc: "Customer to Agent X communication channel.",
      href: `/projects/${id}/workspace/customer-chat`,
      icon: User,
    },
    {
      title: "Agent Y Documents",
      desc: "Checklist intake and request toggles from Agent Y.",
      href: `/projects/${id}/workspace/agent-y-documents`,
      icon: FileText,
    },
    {
      title: "Customer Documents",
      desc: "Customer required docs and upload tracking.",
      href: `/projects/${id}/workspace/customer-documents`,
      icon: FileText,
    },
    {
      title: "Payments",
      desc: "Milestones, pending amounts, and requests.",
      href: `/projects/${id}/workspace/payments`,
      icon: Wallet,
    },
    {
      title: "Logs",
      desc: "Step-by-step audit and activity timeline.",
      href: `/projects/${id}/workspace/logs`,
      icon: ListChecks,
    },
    {
      title: "Calendar",
      desc: "Workspace schedule and key dates.",
      href: `/projects/${id}/workspace/calendar`,
      icon: Calendar,
    },
    {
      title: "Notes",
      desc: "Private internal notes for Agent X.",
      href: `/projects/${id}/workspace/notes`,
      icon: StickyNote,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
            <p className="text-sm font-semibold text-slate-900">Workspace Overview</p>
            <p className="text-xs text-slate-500 mt-1.5">
              Project {id}: quick access to all workspace modules.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#f8fafc_100%)] p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                  Roadmap Stage 1
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  SOP with Agent Z cards
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Start from the same SOP and eligibility card views used inside the roadmap so this workspace page has the same Agent Z entry point too.
                </p>
              </div>

              <Link
                href={`/projects/${id}/workspace/project?section=project&step=checklist`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Open SOP
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sopCards.map((card) => {
                const Icon = card.icon
                const iconStyles =
                  card.tone === "emerald"
                    ? "bg-emerald-100 text-emerald-700"
                    : card.tone === "amber"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"

                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${iconStyles}`}>
                      <Icon size={18} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-900">{card.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{card.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                      Open view
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-xl border bg-slate-50 hover:bg-white hover:shadow-sm transition p-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 grid place-items-center mb-3">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
