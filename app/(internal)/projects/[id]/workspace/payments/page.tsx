"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Banknote, Eye, EyeOff, Lock } from "lucide-react"

type PaymentStatus = "paid" | "completed" | "pending" | "requested"

interface PaymentItem {
  label: string
  amount: string
  status: PaymentStatus
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  { label: "1st Payment (Initial)", amount: "EUR 30", status: "paid" },
  { label: "2nd Payment", amount: "70% of total payment", status: "pending" },
  { label: "3rd Payment", amount: "Remaining 30% of total payment", status: "pending" },
]

export default function WorkspacePaymentsPage() {
  const { id } = useParams<{ id: string }>()
  const [showPayments, setShowPayments] = useState(true)
  const [paymentTimeline, setPaymentTimeline] = useState<PaymentItem[]>(INITIAL_PAYMENTS)
  const [paymentRequestSent, setPaymentRequestSent] = useState(false)

  const requestPendingPayment = () => {
    setPaymentTimeline((prev) =>
      prev.map((payment) =>
        payment.status === "pending"
          ? { ...payment, status: "requested" }
          : payment
      )
    )
    setPaymentRequestSent(true)
  }

  const pendingPayment = paymentTimeline.find(
    (p) => p.status === "pending" || p.status === "requested"
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8">
          <div className="rounded-xl border bg-slate-50 px-4 py-3 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Banknote size={18} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">Payment Details</p>
              </div>
              <span className="rounded-full bg-white border px-2.5 py-1 text-[11px] text-slate-600">
                Project {id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Track payment milestones and request pending stage payments.
            </p>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Banknote size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Payment Timeline</h2>
            </div>
            <button
              onClick={() => setShowPayments((p) => !p)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
              title={showPayments ? "Hide" : "Show"}
            >
              {showPayments ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          {showPayments ? (
            <>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl border bg-slate-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Milestones</p>
                  <p className="text-base font-bold text-slate-900">{paymentTimeline.length}</p>
                </div>
                <div className="rounded-xl border bg-emerald-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700">Cleared</p>
                  <p className="text-base font-bold text-emerald-800">
                    {paymentTimeline.filter((p) => p.status === "paid" || p.status === "completed").length}
                  </p>
                </div>
                <div className="rounded-xl border bg-amber-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700">Pending Amount</p>
                  <p className="text-base font-bold text-amber-800">{pendingPayment?.amount ?? "-"}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {paymentTimeline.map((p, i) => (
                  <div
                    key={p.label}
                    className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        p.status === "paid"
                          ? "bg-emerald-500"
                          : p.status === "completed"
                          ? "bg-blue-500"
                          : p.status === "requested"
                          ? "bg-indigo-500"
                          : "bg-amber-400"
                      }`}
                    >
                      {p.status === "paid" || p.status === "completed" || p.status === "requested"
                        ? "OK"
                        : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{p.label}</p>
                      <p className="text-xs text-slate-400">{p.amount}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        p.status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "completed"
                          ? "bg-blue-50 text-blue-700"
                          : p.status === "requested"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.status === "pending" && (
                      <button
                        onClick={requestPendingPayment}
                        className="text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 transition-colors"
                      >
                        Request Payment
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {paymentRequestSent && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 mb-4">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                    Customer Notification
                  </p>
                  <p className="text-sm text-indigo-900">
                    Payment request for the pending stage has been sent to the customer.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-3 border-t">
                <Lock size={12} />
                Visible to Agent X only
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border">
              Payment details hidden
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
