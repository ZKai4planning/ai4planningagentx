export default function CustomerProfile() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">
        Customer Profile
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p><span className="font-medium">CUST ID:</span> CUST-1023</p>
        <p><span className="font-medium">Contact:</span> 9876543210</p>
        <p><span className="font-medium">Form Status:</span> Submitted</p>
        <p><span className="font-medium">Email:</span> user@email.com</p>
      </div>
    </div>
  )
}
