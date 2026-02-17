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
  Send,
  Paperclip,
} from "lucide-react"
import {
  useCustomers,
  CustomerStatus,
} from "@/app/context/CustomerContext"

/* ================= TYPES ================= */

type Note = {
  id: string
  text: string
  type: "customer" | "internal"
  date: string
  status: CustomerStatus
}

type Message = {
  id: string
  text: string
  from: "agent" | "customer"
}

/* ================= PAGE ================= */

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { customers, updateStatus } = useCustomers()

  const customer = useMemo(
    () => customers.find((c) => c.id === id),
    [customers, id]
  )

  if (!customer) return notFound()

  /* ================= PAYMENT LOGIC ================= */

  const hasInitialPayment = customer.paymentStatus === "PAID"
  const projectId = hasInitialPayment ? customer.projectId : null

  const project = {
    service: customer.service,
    serviceId: customer.serviceId,
    stage: hasInitialPayment ? "Pre-Planning" : "Lead Stage",
    timeline: hasInitialPayment
      ? "01 Jan → 30 Jun 2026"
      : "Starts after initial payment",
  }

  const [showContact, setShowContact] = useState(false)

  /* ================= NOTES ================= */

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      text: "Initial enquiry created.",
      type: "customer",
      date: "20 Feb 2026",
      status: customer.status,
    },
  ])

  const [noteInput, setNoteInput] = useState("")
  const [noteStatus, setNoteStatus] =
    useState<CustomerStatus>(customer.status)

  const addNote = () => {
    if (!noteInput.trim()) return

    const newNote: Note = {
      id: crypto.randomUUID(),
      text: noteInput,
      type: "internal",
      date: "Today",
      status: noteStatus,
    }

    setNotes((prev) => [newNote, ...prev])
    updateStatus(customer.id, noteStatus)
    setNoteInput("")
  }

  /* ================= CHAT ================= */

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      text: "Hello, I’ve submitted the questionnaire.",
      from: "customer",
    },
  ])

  const [chatInput, setChatInput] = useState("")

  const sendMessage = () => {
    if (!chatInput.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: chatInput, from: "agent" },
    ])
    setChatInput("")
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-100 px-10 py-6 max-w-8xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {project.service}
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Service ID ·{" "}
          <span className="font-mono">{project.serviceId}</span>

          {hasInitialPayment && projectId && (
            <>
              <span className="mx-2">·</span>
              Project ID ·{" "}
              <span className="font-mono">{projectId}</span>
            </>
          )}
        </p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">

          {/* PROJECT OVERVIEW */}
          <Card title="Project Overview" icon={<Building2 size={15} />}>
            <Meta label="Stage" value={project.stage} />
            <Meta label="Timeline" value={project.timeline} />
            <Meta label="Customer ID" value={customer.id} />
          </Card>

          {/* PAYMENT – ONLY AFTER INITIAL PAYMENT */}
          {hasInitialPayment && (
            <Card title="Payment Milestones" icon={<Lock size={15} />}>
              <PaymentRow label="Initial Payment" amount="€30" status="PAID" />
              <PaymentRow
                label="70% Project Payment"
                amount="€70"
                status="PENDING"
              />
              <PaymentRow
                label="Final 30%"
                amount="€30"
                status="LOCKED"
              />

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Payment Progress</span>
                  <span>30%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[30%] rounded-full bg-emerald-500" />
                </div>
              </div>
            </Card>
          )}

          {/* NOTES */}
          <Card title="Follow-ups & Activity" icon={<StickyNote size={15} />}>
            <div className="relative pl-4 border-l space-y-3 max-h-[260px] overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="relative">
                  <span
                    className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full ${
                      n.type === "internal"
                        ? "bg-blue-600"
                        : "bg-emerald-500"
                    }`}
                  />
                  <div className="rounded-xl px-3 py-2 text-xs bg-slate-50 border">
                    <div className="flex justify-between mb-1">
                      <StatusBadge status={n.status} />
                      <span className="text-[10px] text-slate-400">
                        {n.date}
                      </span>
                    </div>
                    {n.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
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
                placeholder="Add internal note"
                className="flex-1 border rounded-lg px-3 py-1.5 text-xs"
              />

              <button
                onClick={addNote}
                className="bg-blue-600 text-white px-3 text-xs rounded-lg"
              >
                Add
              </button>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* CUSTOMER */}
          <Card title="Customer" icon={<Phone size={15} />}>
            <p className="font-semibold">{customer.name}</p>

            {showContact ? (
              <div className="mt-2 text-sm space-y-1">
                <p className="flex gap-2">
                  <Phone size={13} /> {customer.phone}
                </p>
                <p className="flex gap-2">
                  <Mail size={13} /> {customer.email}
                </p>
                <p className="flex gap-2">
                  <MapPin size={13} /> Hyderabad
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                Contact hidden
              </p>
            )}

            <button
              onClick={() => setShowContact(!showContact)}
              className="mt-3 text-xs text-blue-600 flex gap-1"
            >
              {showContact ? <EyeOff size={12} /> : <Eye size={12} />}
              Toggle contact
            </button>
          </Card>

          {/* CHAT */}
          <Card title="Customer Chat & Documents" icon={<Mail size={15} />}>
            <div className="flex flex-col h-[320px]">
              <div className="flex-1 space-y-2 overflow-y-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] px-3 py-2 text-xs rounded-xl ${
                      m.from === "agent"
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t pt-2">
                <label className="cursor-pointer">
                  <Paperclip size={16} />
                  <input type="file" className="hidden" />
                </label>

                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 border rounded-lg px-3 py-1.5 text-xs"
                />

                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-3 rounded-lg"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */

function StatusBadge({ status }: { status: CustomerStatus }) {
  const styles: Record<CustomerStatus, string> = {
    INTERESTED: "bg-blue-50 text-blue-700",
    FOLLOW_UP: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-purple-50 text-purple-700",
    NOT_INTERESTED: "bg-slate-100 text-slate-600",
    PENDING: "bg-indigo-50 text-indigo-700",
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  )
}

function Card({ title, icon, children }: any) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex gap-2 text-sm font-bold">
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
      <p className="text-[10px] uppercase text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

function PaymentRow({
  label,
  amount,
  status,
}: {
  label: string
  amount: string
  status: "PAID" | "PENDING" | "LOCKED"
}) {
  const styles = {
    PAID: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    LOCKED: "bg-slate-100 text-slate-500",
  }

  return (
    <div className="flex justify-between items-center border-b pb-2">
      <p className="text-sm">{label}</p>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status} · {amount}
      </span>
    </div>
  )
}
