"use client"

import Link from "next/link"
import {
  Users,
  FileText,
  Calendar,
  ClipboardCheck,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react"

/* ================= TYPES ================= */

type FlowStatus = "ON_TRACK" | "NEEDS_ACTION" | "BLOCKED"

interface CustomerFlow {
  id: string
  name: string
  service: string
  flowStep: number
  flowLabel: string
  actionRequired?: string
  flowStatus: FlowStatus
}

/* ================= MOCK DATA ================= */

const activeCustomers: CustomerFlow[] = [
  {
    id: "CUST-1023",
    name: "Alex Johnson",
    service: "Householder Planning Consent",
    flowStep: 6,
    flowLabel: "Questionnaire Submitted",
    actionRequired: "Review & Generate Quote",
    flowStatus: "NEEDS_ACTION",
  },
  {
    id: "CUST-1041",
    name: "Emma Williams",
    service: "Loft Conversion Approval",
    flowStep: 9,
    flowLabel: "Consultation Completed",
    flowStatus: "ON_TRACK",
  },
]

/* ================= DASHBOARD ================= */

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-8">

      {/* ================= HEADER ================= */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Agent X Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Manage customers, planning stages & agent coordination
          </p>
        </div>
      </header>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard title="Total Customers" value="12" icon={<Users />} />
        <StatsCard title="Active Projects" value="4" icon={<FileText />} />
        <StatsCard title="Needs Action" value="2" icon={<ClipboardCheck />} />
        <StatsCard title="Today’s Appointments" value="3" icon={<Calendar />} />
      </section>

      {/* ================= MAIN GRID ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ---------- ACTIVE CUSTOMERS ---------- */}
        <div className="xl:col-span-2 rounded-3xl bg-white border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-base font-semibold text-slate-900">
              Active Customers
            </h2>
            <Link
              href="/dashboard/customers"
              className="text-sm text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {activeCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className="block"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition">

                  {/* LEFT */}
                  <div>
                    <p className="font-medium text-slate-900">
                      {customer.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {customer.id} · {customer.service}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Step {customer.flowStep}/15 · {customer.flowLabel}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">
                    <FlowBadge status={customer.flowStatus} />
                    <ArrowUpRight className="text-slate-400" size={18} />
                  </div>

                </div>

                {/* ACTION REQUIRED */}
                {customer.actionRequired && (
                  <div className="px-6 pb-4">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      <AlertCircle size={14} />
                      {customer.actionRequired}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ---------- RIGHT PANEL ---------- */}
        <aside className="space-y-6">
          <div className="xl:sticky xl:top-8 space-y-6">

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-800 p-6 text-white shadow-lg">
              <h2 className="text-base font-semibold">
                Quick Actions
              </h2>

              <div className="mt-4 space-y-3">
                <ActionButton label="Assign Agent Y" />
                <ActionButton label="Generate Quote" />
                <ActionButton label="Schedule Consultation" />
              </div>
            </div>

            {/* OVERALL PROGRESS */}
            <div className="rounded-3xl bg-white border p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Overall Completion
              </h2>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Avg Progress</span>
                  <span>64%</span>
                </div>

                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[64%] rounded-full bg-gradient-to-r from-blue-600 to-blue-700" />
                </div>
              </div>
            </div>

          </div>
        </aside>
      </section>

      {/* ================= APPOINTMENTS ================= */}
      <section className="rounded-3xl bg-white border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-slate-900">
            Today’s Appointments
          </h2>
        </div>

        <div className="divide-y">
          {[
            { time: "10:30 AM", type: "Client Call", cust: "CUST-1023" },
            { time: "01:00 PM", type: "Planning Review", cust: "CUST-1041" },
            { time: "04:30 PM", type: "Document Check", cust: "CUST-1088" },
          ].map((appt) => (
            <div
              key={appt.time}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {appt.time} · {appt.cust}
                </p>
                <p className="text-sm text-slate-500">
                  {appt.type}
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                Confirmed
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white border p-5 shadow-sm flex items-center gap-4">
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function FlowBadge({ status }: { status: FlowStatus }) {
  if (status === "ON_TRACK")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 size={14} /> On Track
      </span>
    )

  if (status === "NEEDS_ACTION")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        <Clock size={14} /> Needs Action
      </span>
    )

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
      <AlertCircle size={14} /> Blocked
    </span>
  )
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/20 transition">
      {label}
    </button>
  )
}
