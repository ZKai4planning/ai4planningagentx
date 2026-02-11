"use client"

import { createContext, useContext, useState } from "react"

/* ================= TYPES ================= */

export type CustomerStatus =
  | "NOT_INTERESTED"
  | "INTERESTED"
  | "PROCESSING"
  | "FOLLOW_UP"
  | "PENDING"

export type Customer = {
  id: string
  projectId?: string
  name: string
  email: string
  phone: string
  serviceId: string
  service: string
  subService: string
  paymentStatus: "PAID" | "PENDING"
  status: CustomerStatus
}

/* ================= CONTEXT ================= */

type CustomerContextType = {
  customers: Customer[]
  updateStatus: (id: string, status: CustomerStatus) => void
}

const CustomerContext = createContext<CustomerContextType | null>(null)

/* ================= PROVIDER ================= */

export function CustomerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "ABC123-089",
      projectId: "PROJ-UK-7842",
      name: "Zaferkhan",
      email: "Zaferkhan@ai4planning.com",
      phone: "0776862279",
      serviceId: "HSPC000-07",
      service: "Residental-home owners & landlords",
      subService: "householder planning consent",
      paymentStatus: "PAID",
      status: "INTERESTED",
    },
    {
      id: "ABC123-090",
      name: "Ritesh",
      email: "Ritesh@ai4planning.com",
      phone: "09123456789",
      serviceId: "HSPC000-07",
      service: "Residental-home owners & landlords",
      subService: "householder planning consent",
      paymentStatus: "PENDING",
      status: "FOLLOW_UP",
    },
  ])

  const updateStatus = (id: string, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status } : c
      )
    )
  }

  return (
    <CustomerContext.Provider value={{ customers, updateStatus }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error("useCustomers must be used inside CustomerProvider")
  return ctx
}
