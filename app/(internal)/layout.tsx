"use client"

import { Suspense, useState } from "react"
import Sidebar from "../../components/sidebar"
import { CustomerProvider } from "../context/CustomerContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Suspense fallback={null}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </Suspense>

      <div className="flex-1 overflow-y-auto">
        <CustomerProvider>{children}</CustomerProvider>
      </div>
    </div>
  )
}
