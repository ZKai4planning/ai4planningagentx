"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { Menu } from "lucide-react"
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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
    <div className="flex min-h-screen bg-slate-50">
      <Suspense fallback={null}>
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{email ?? "Logged in user"}</p>
            </div>

            <div className="ml-auto flex items-center gap-3">
            {/* <div>
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{email ?? "Logged in user"}</p>
            </div> */}
            <Link
              href="/profile"
              className="rounded-lg border bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Profile
            </Link>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <CustomerProvider>{children}</CustomerProvider>
        </main>
      </div>
    </div>
  )
}
