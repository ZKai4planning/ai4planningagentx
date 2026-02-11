interface PaymentStep {
  label: string
  percentage: string
  amount: string
  status: "paid" | "pending" | "locked"
}

export default function PaymentFlow({
  steps,
}: {
  steps: PaymentStep[]
}) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-xl border bg-white px-5 py-4"
        >
          <div>
            <p className="font-medium text-slate-800">
              {step.label}
            </p>
            <p className="text-sm text-slate-500">
              {step.percentage}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-900">
              ₹{step.amount}
            </span>

            <PaymentStatus status={step.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PaymentStatus({
  status,
}: {
  status: "paid" | "pending" | "locked"
}) {
  if (status === "paid") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        Paid
      </span>
    )
  }

  if (status === "pending") {
    return (
      <button className="rounded-lg bg-blue-700 px-4 py-2 text-xs text-white hover:bg-blue-800">
        Pay Now
      </button>
    )
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
      Locked
    </span>
  )
}
