import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Building2,
  Bot,
  Calendar,
  FileText,
  ListChecks,
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

  const cards = [
    {
      title: "Project Overview",
      desc: "Main project context and handover controls.",
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
