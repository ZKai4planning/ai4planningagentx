"use client"

import { useParams, notFound } from "next/navigation"
import { useState, useMemo } from "react"
import {
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Building2,
  StickyNote,
  Clock,
} from "lucide-react"
import {
  useCustomers,
  CustomerStatus,
} from "@/app/context/CustomerContext"

/* ================= NOTES ================= */

type Note = {
  text: string
  type: "customer" | "internal"
  date: string
  status: CustomerStatus
}

/* ================= PAGE ================= */

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { customers, updateStatus } = useCustomers()

  /** 🔑 GET REAL CUSTOMER */
  const customer = useMemo(
    () => customers.find((c) => c.id === id),
    [customers, id]
  )

  if (!customer) return notFound()

  /** 🔑 DERIVED DATA (NO HARDCODE) */
  const isPaymentCompleted = customer.paymentStatus === "PAID"
  const projectId = customer.projectId

  const project = {
    service: customer.service,
    serviceId: customer.serviceId,
    stage: "Pre-Planning",
    timeline: "01 Jan → 30 Jun 2026",
  }

  const [showContact, setShowContact] = useState(false)

  const [notes, setNotes] = useState<Note[]>([
    {
      text: "Initial enquiry created.",
      type: "customer",
      date: "20 Feb 2026",
      status: customer.status,
    },
  ])

  const [noteInput, setNoteInput] = useState("")
  const [noteStatus, setNoteStatus] =
    useState<CustomerStatus>(customer.status)

  const currentStatus = notes[0]?.status ?? customer.status

  /* ================= ADD NOTE + SYNC ================= */

  const addNote = () => {
    if (!noteInput.trim()) return

    const newNote: Note = {
      text: noteInput.trim(),
      type: "internal",
      date: "Today",
      status: noteStatus,
    }

    setNotes((prev) => [newNote, ...prev])
    updateStatus(customer.id, noteStatus)
    setNoteInput("")
  }

  return (
    <div className="min-h-screen bg-slate-100 px-10 py-6 max-w-8xl mx-auto space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {project.service}
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Service ID · <span className="font-mono">{project.serviceId}</span>

          {isPaymentCompleted && projectId && (
            <>
              <span className="mx-2">·</span>
              Project ID · <span className="font-mono">{projectId}</span>
            </>
          )}
        </p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">

        {/* ================= LEFT ================= */}
        <div className="xl:col-span-2 space-y-6">

          <Card title="Project Overview" icon={<Building2 size={15} />}>
            <Meta label="Stage" value={project.stage} />
            <Meta label="Timeline" value={project.timeline} />
            <Meta label="Customer ID" value={customer.id} />
          </Card>

          {/* 🔐 PAYMENT (ONLY IF PAID) */}
          {isPaymentCompleted && (
            <Card title="Payment Details" icon={<Lock size={15} />}>
              <div className="space-y-3">

                <div className="flex justify-between border-b pb-2">
                  <p className="text-sm font-medium">
                    Payment Status
                  </p>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    PAID
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Project allocated after successful payment.
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 flex gap-1 items-center">
                  <Lock size={10} />
                  Visible to internal team only
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-6">

          {/* CUSTOMER */}
          <Card title="Customer" icon={<Phone size={15} />}>
            <p className="font-semibold">{customer.name}</p>

            {showContact ? (
              <div className="mt-2 text-sm space-y-1">
                <p className="flex gap-2"><Phone size={13} /> {customer.phone}</p>
                <p className="flex gap-2"><Mail size={13} /> {customer.email}</p>
                <p className="flex gap-2"><MapPin size={13} /> Hyderabad</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Contact hidden</p>
            )}

            <button
              onClick={() => setShowContact(!showContact)}
              className="mt-3 text-xs text-blue-600 flex gap-1"
            >
              {showContact ? <EyeOff size={12} /> : <Eye size={12} />}
              Toggle contact
            </button>
          </Card>

          {/* NOTES */}
          <Card title="Notes & Follow-up" icon={<StickyNote size={15} />}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[11px] text-slate-500">Current Status</p>
              <StatusBadge status={currentStatus} />
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto mb-3">
              {notes.map((n, i) => (
                <div
                  key={i}
                  className="rounded-lg px-3 py-2 text-xs bg-amber-50 text-amber-800"
                >
                  <div className="flex justify-between mb-1">
                    <StatusBadge status={n.status} />
                    <span className="text-[10px] text-slate-400">{n.date}</span>
                  </div>
                  <p>{n.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-2">
              <select
                value={noteStatus}
                onChange={(e) =>
                  setNoteStatus(e.target.value as CustomerStatus)
                }
                className="border rounded-lg px-2 text-xs"
              >
                <option value="INTERESTED">Interested</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="PROCESSING">Processing</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>

              <input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add follow-up note"
                className="flex-1 border rounded-lg px-3 py-1.5 text-xs"
              />

              <button
                onClick={addNote}
                className="bg-blue-600 text-white text-xs px-3 rounded-lg"
              >
                Add
              </button>
            </div>

            <p className="text-[10px] text-slate-400 flex gap-1 items-center">
              <Clock size={10} />
              Internal follow-ups only
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */

function StatusBadge({ status }: { status: CustomerStatus }) {
  const map: Record<CustomerStatus, string> = {
    INTERESTED: "bg-blue-50 text-blue-700",
    FOLLOW_UP: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-purple-50 text-purple-700",
    NOT_INTERESTED: "bg-slate-100 text-slate-600",
    PENDING: "bg-indigo-50 text-indigo-700",
  }

  const label: Record<CustomerStatus, string> = {
    INTERESTED: "Interested",
    FOLLOW_UP: "Follow Up",
    PROCESSING: "Processing",
    NOT_INTERESTED: "Not Interested",
    PENDING: "Pending",
  }

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${map[status]}`}
    >
      {label[status]}
    </span>
  )
}


function Card({ title, icon, children }: any) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}
