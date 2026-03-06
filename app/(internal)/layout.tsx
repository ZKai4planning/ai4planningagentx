"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import Sidebar from "../../components/sidebar"
import { CustomerProvider } from "../context/CustomerContext"
import axiosInstance from "@/lib/axiosinstance"
import { useAuthStore } from "@/lib/zustand"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const userId = useAuthStore((state) => state.userId)
  const name = useAuthStore((state) => state.name)
  const email = useAuthStore((state) => state.email)
  const setProfileName = useAuthStore((state) => state.setProfileName)

  const displayName = useMemo(() => {
    if (name && name.trim().length > 0) return name.trim()
    if (email) return email.split("@")[0]
    return "User"
  }, [email, name])

  useEffect(() => {
    const fetchName = async () => {
      if (!userId) return
      if (name && name.trim().length > 0) return

      try {
        const response = await axiosInstance.get(
          `/employee/profile/${encodeURIComponent(userId)}`
        )
        const payload = response.data as Record<string, unknown> | undefined
        const candidate =
          (typeof payload?.name === "string" && payload.name) ||
          (typeof (payload?.data as Record<string, unknown> | undefined)?.name ===
            "string" &&
            ((payload?.data as Record<string, unknown>).name as string)) ||
          null

        if (candidate && candidate.trim().length > 0) {
          setProfileName(candidate.trim())
        }
      } catch {
        // no-op: fall back to email/user id labels
      }
    }

    void fetchName()
  }, [name, setProfileName, userId])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Suspense fallback={null}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </Suspense>

      <div className="flex-1 overflow-y-auto">
        <header className="border-b bg-white px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{email ?? "Logged in user"}</p>
            </div>
            <Link
              href="/profile"
              className="rounded-lg border bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Profile
            </Link>
          </div>
        </header>
        <CustomerProvider>{children}</CustomerProvider>
      </div>
    </div>
  )
}
