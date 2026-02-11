export default function PaymentSummary() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Payment Status
      </h2>

      <div className="mt-4 space-y-3">
        <ProgressRow label="Advance Paid" value="39.9%" />
        <ProgressRow label="Mid Payment" value="30%" />
        <ProgressRow label="Final Payment" value="30.1%" />
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Next payment unlocks after submission to Agent Y.
      </p>
    </div>
  )
}

function ProgressRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
