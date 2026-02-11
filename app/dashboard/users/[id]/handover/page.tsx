"use client"

import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  X,
  FileText,
  Calendar,
  Download,
  ShieldCheck,
  Send,
} from "lucide-react"

/* ---------- MOCK PROJECT DATA ---------- */
const project = {
  serviceName: "House Holder Planning Consent",
  serviceNumber: "HSPC000-07",
  stage: "Planning",
  progress: "68%",
  duration: "6 Months",
  startDate: "01 Jan 2026",
  endDate: "30 Jun 2026",
}

const documents = [
  { id: 1, name: "Building Plan.pdf", size: "1.2 MB" },
  { id: 2, name: "Site Layout.png", size: "860 KB" },
]

export default function AgentXHandoverPage() {
  const { id } = useParams()
  const router = useRouter()

  return (
    <div className="bg-slate-50 min-h-screen px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-10">

      {/* ================= HEADER ================= */}
      <header className="space-y-6">

        {/* NAV CONTROLS */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={() => router.push(`/dashboard/customers/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <X size={16} />
            Exit
          </button>
        </div>

        {/* TITLE */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Handover to Agent Y
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and share project details & documents for execution
          </p>
        </div>
      </header>

      {/* ================= PROJECT SUMMARY ================= */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Summary label="Service" value={project.serviceName} />
        <Summary label="Service No." value={project.serviceNumber} />
        <Summary label="Stage" value={project.stage} />
        <Summary label="Progress" value={project.progress} />
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-12">

        {/* ---------- LEFT : DETAILS ---------- */}
        <div className="xl:col-span-2 space-y-12">

          {/* PROJECT DETAILS */}
          <Surface>
            <SectionTitle title="Project Details" />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Meta label="Service Name" value={project.serviceName} />
              <Meta label="Service Number" value={project.serviceNumber} />
              <Meta label="Current Stage" value={project.stage} />
              <Meta label="Project Duration" value={project.duration} />
              <Meta label="Start Date" value={project.startDate} />
              <Meta label="Estimated End" value={project.endDate} />
            </div>
          </Surface>

          {/* TIMELINE */}
          <Surface>
            <SectionTitle title="Project Timeline" />
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{project.startDate}</span>
                <span>{project.endDate}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-blue-700"
                  style={{ width: project.progress }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {project.progress} completed · {project.stage} stage
              </p>
            </div>
          </Surface>

          {/* DOCUMENTS */}
          <Surface>
            <SectionTitle title="Project Documents" />
            <p className="mt-2 text-sm text-slate-500">
              Only these documents will be accessible to Agent Y
            </p>

            <div className="mt-6 space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.size}
                    </p>
                  </div>

                  <button className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </Surface>

          {/* HANDOVER NOTES */}
          <Surface>
            <SectionTitle title="Handover Notes for Agent Y" />
            <textarea
              placeholder="Write execution instructions or important notes for Agent Y…"
              className="mt-4 w-full min-h-[160px] rounded-xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </Surface>
        </div>

        {/* ---------- RIGHT : CONFIRMATION ---------- */}
        <aside className="space-y-8">
          <div className="xl:sticky xl:top-10 space-y-8">

            {/* ACCESS SCOPE */}
            <Surface>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} className="text-blue-700" />
                <p className="font-medium text-slate-800">
                  Agent Y Access Scope
                </p>
              </div>

              <ul className="text-sm text-slate-600 space-y-2">
                <li>✔ Project details & timeline</li>
                <li>✔ Shared project documents</li>
                <li>✔ Handover notes</li>
                <li className="text-red-500">✖ Customer personal details</li>
                <li className="text-red-500">✖ Payment information</li>
                <li className="text-red-500">✖ Internal CRM notes</li>
              </ul>
            </Surface>

            {/* FINAL ACTION */}
            <Surface>
              <button className="w-full rounded-xl bg-blue-700 px-6 py-4 text-white font-medium hover:bg-blue-800 flex items-center justify-center gap-2">
                <Send size={18} />
                Send to Agent Y
              </button>
            </Surface>

          </div>
        </aside>
      </section>
    </div>
  )
}

/* ================= UI HELPERS ================= */

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
      {children}
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  )
}
