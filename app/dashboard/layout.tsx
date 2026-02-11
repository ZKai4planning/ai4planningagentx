"use client"

import { useState } from "react"
import Sidebar from "../../components/sidebar"
import { CustomerProvider } from "../context/CustomerContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    // 🔴 IMPORTANT: overflow-hidden here
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* ONLY THIS AREA SCROLLS */}
      <div className="flex-1 overflow-y-auto">
        <CustomerProvider>
          {children}
        </CustomerProvider>
      </div>
    </div>
  )
}
