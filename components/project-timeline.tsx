export default function ProjectTimeline() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">
        Project Duration
      </h3>

      <div className="space-y-3 text-sm">
        <p><b>Start Date:</b> 01 Jan 2026</p>
        <p><b>End Date:</b> 30 Jun 2026</p>

        <div>
          <p className="mb-1 text-slate-600">Progress</p>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 w-2/3 rounded-full bg-blue-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
