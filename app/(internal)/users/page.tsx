"use client"

import { useState, useMemo } from "react"
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Users,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import DataTable, { Column } from "@/components/datatable"
import {
  useCustomers,
  Customer,
  CustomerStatus,
} from "@/app/context/CustomerContext"

/* ================= BADGES ================= */

function PaymentBadge({ status }: { status: "PAID" | "PENDING" }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        status === "PAID"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {status}
    </span>
  )
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const styles: Record<CustomerStatus, string> = {
    NOT_INTERESTED: "bg-slate-100 text-slate-600",
    INTERESTED: "bg-blue-50 text-blue-700",
    PROCESSING: "bg-purple-50 text-purple-700",
    FOLLOW_UP: "bg-amber-50 text-amber-700",
    PENDING: "bg-indigo-50 text-indigo-700",
  }

  const labels: Record<CustomerStatus, string> = {
    NOT_INTERESTED: "Not Interested",
    INTERESTED: "Interested",
    PROCESSING: "Processing",
    FOLLOW_UP: "Follow Up",
    PENDING: "Pending",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

/* ================= PAGE ================= */

export default function CustomersPage() {
  const { customers } = useCustomers()

  const [visibleContacts, setVisibleContacts] = useState<Record<string, boolean>>(
    {}
  )
  const [statusFilter, setStatusFilter] =
    useState<CustomerStatus | "ALL">("ALL")

  const toggleContact = (id: string) => {
    setVisibleContacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  /* ================= FILTER ================= */

  const filteredCustomers = useMemo(() => {
    if (statusFilter === "ALL") return customers
    return customers.filter((c) => c.status === statusFilter)
  }, [customers, statusFilter])

  /* ================= COLUMNS ================= */

  const columns = useMemo<Column<Customer>[]>(() => [
    {
      key: "name",
      label: "Customer",
      sortable: true,
      render: (_, row) => {
        const visible = visibleContacts[row.id]

        return (
          <div className="space-y-1">
            <p className="font-medium text-slate-900">{row.name}</p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              {visible ? (
                <>
                  <span>{row.phone}</span>
                  <span className="text-slate-300">•</span>
                  <span>{row.email}</span>
                </>
              ) : (
                <>
                  <span>•••• ••••</span>
                  <span className="text-slate-300">•</span>
                  <span>••••@••••</span>
                </>
              )}

              <button
                onClick={() => toggleContact(row.id)}
                className="text-slate-400 hover:text-slate-700"
                title="Toggle contact visibility"
              >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )
      },
    },

    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },

    {
      key: "projectId",
      label: "Project ID",
      render: (value, row) =>
        row.paymentStatus === "PAID" ? (
          <span className="font-mono w-40 text-xs text-slate-700">
            {value}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },

    {
      key: "service",
      label: "Service",
      render: (_, row) => (
        <div>
          <p className="text-sm w-40 font-medium text-slate-800">
            {row.service}
          </p>
          <p className="text-xs text-slate-500">
            {row.subService}
          </p>
        </div>
      ),
    },

    {
      key: "serviceId",
      label: "Service ID",
      render: (value) => (
        <span className="font-mono w-40 text-xs text-slate-700">
          {value}
        </span>
      ),
    },

    {
      key: "paymentStatus",
      label: "Payment",
      render: (_, row) => (
        <div className="space-y-1">
          <PaymentBadge status={row.paymentStatus} />
        </div>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => {
        const canInteract = visibleContacts[row.id]

        return (
          <div className="flex items-center justify-end gap-2">
            {/* View */}
            <Link
              href={`/users/${row.id}`}
              className="rounded-lg p-2 hover:bg-slate-100"
              title="View customer"
            >
              <Eye size={16} />
            </Link>

            {/* Email */}
            <a
              href={canInteract ? `mailto:${row.email}` : undefined}
              className={`rounded-lg p-2 ${
                canInteract
                  ? "hover:bg-slate-100"
                  : "text-slate-300 cursor-not-allowed"
              }`}
              title="Send email"
            >
              <Mail size={16} />
            </a>

            {/* Phone */}
            <a
              href={canInteract ? `tel:${row.phone}` : undefined}
              className={`rounded-lg p-2 ${
                canInteract
                  ? "hover:bg-slate-100"
                  : "text-slate-300 cursor-not-allowed"
              }`}
              title="Call"
            >
              <Phone size={16} />
            </a>

            {/* WhatsApp */}
            <a
              href={
                canInteract
                  ? `https://wa.me/${row.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hi ${row.name}, this is Agent X regarding your service.`
                    )}`
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className={`rounded-lg p-2 ${
                canInteract
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              <MessageCircle size={16} />
            </a>
          </div>
        )
      },
    },
  ], [visibleContacts])

  return (
    <div className="flex flex-col gap-6 max-w-8xl mx-auto px-10 py-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Customers
          </h1>
          <p className="text-sm text-slate-500">
            Services, payments & follow-ups
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users size={16} />
          {filteredCustomers.length} Results
        </div>
      </div>

      {/* STATUS FILTER */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            "ALL",
            "INTERESTED",
            "PROCESSING",
            "FOLLOW_UP",
            "NOT_INTERESTED",
            "PENDING",
          ] as const
        ).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <DataTable<Customer>
        data={filteredCustomers}
        columns={columns}
      />
    </div>
  )
}
