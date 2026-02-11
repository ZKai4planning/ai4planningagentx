import { ReactNode } from "react"

export default function StatsCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-lg transition-all">
      {/* Accent glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition" />

      <div className="relative p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-semibold text-slate-900">
            {value}
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow">
          {icon}
        </div>
      </div>
    </div>
  )
}
