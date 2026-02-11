"use client"

import { useState, useMemo } from "react"
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

/* ================= TYPES ================= */

export type Column<T> = {
  key: keyof T | "sno" | "actions"
  label: string
  align?: "left" | "center" | "right"
  width?: string
  sortable?: boolean
  className?: string
  render?: (
    value: any,
    row: T,
    index: number,
    startIndex: number
  ) => React.ReactNode
  sticky?: boolean
  left?: number
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]

  /** optional status filtering */
  statusKey?: keyof T
  statusOptions?: { label: string; value: string }[]
}

/* ================= COMPONENT ================= */

export default function DataTable<
  T extends { id: string | number }
>({
  data,
  columns,
  statusKey,
  statusOptions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    const s = search.toLowerCase()

    return data.filter((row: any) => {
      const matchesSearch = Object.values(row).some((v) =>
        String(v).toLowerCase().includes(s)
      )

      const matchesStatus =
        !statusKey || statusFilter === "ALL"
          ? true
          : String(row[statusKey]) === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter, statusKey])

  /* ================= SORT ================= */

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a: any, b: any) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1
      if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortOrder])

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const visibleData = sortedData.slice(startIndex, startIndex + rowsPerPage)

  /* ================= EXPORT ================= */

  const handleExport = () => {
    const headers = columns
      .filter(c => !["sno", "actions"].includes(c.key as string))
      .map(c => c.label)

    const rows = sortedData.map((row: any) =>
      columns
        .filter(c => !["sno", "actions"].includes(c.key as string))
        .map(c => row[c.key as keyof T])
        .join(",")
    )

    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ column }: { column: keyof T }) => {
    if (sortKey !== column)
      return <ArrowUpDown className="inline ml-1 w-4 h-4 text-gray-400" />
    return sortOrder === "asc"
      ? <ArrowUp className="inline ml-1 w-4 h-4" />
      : <ArrowDown className="inline ml-1 w-4 h-4" />
  }

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-4">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="border px-4 py-2 rounded-lg w-64 text-sm"
        />

        <div className="flex gap-3">
          {statusOptions && statusKey && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border px-4 py-2 rounded-lg text-sm"
            >
              <option value="ALL">All</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() =>
                    col.sortable &&
                    col.key !== "sno" &&
                    col.key !== "actions" &&
                    handleSort(col.key as keyof T)
                  }
                  className={`px-5 py-3 text-sm font-semibold whitespace-nowrap
                    ${col.sortable ? "cursor-pointer" : ""}
                    ${col.sticky ? "sticky top-0 bg-gray-100 z-30" : ""}
                  `}
                >
                  {col.label}
                  {col.sortable &&
                    col.key !== "sno" &&
                    col.key !== "actions" && (
                      <SortIcon column={col.key as keyof T} />
                    )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleData.map((row, index) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {columns.map(col => {
                  const value =
                    col.key === "sno" || col.key === "actions"
                      ? undefined
                      : (row as any)[col.key]

                  return (
                    <td key={String(col.key)} className="px-10 py-2 text-sm">
                      {col.render
                        ? col.render(value, row, index, startIndex)
                        : String(value ?? "")}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Rows per page:
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-2 border px-2 py-1 rounded"
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
