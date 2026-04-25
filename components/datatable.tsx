"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

/* ================= TYPES ================= */

export type Column<T> = {
  key: keyof T | "sno" | "actions"|"favourite"
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
  statusKey?: keyof T
  statusOptions?: { label: string; value: string }[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  rowsPerPage?: number
  onRowsPerPageChange?: (value: number) => void
  currentPage?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  totalPages?: number
  serverSide?: boolean
  loading?: boolean
  emptyMessage?: string
  showExport?: boolean
}

/* ================= COMPONENT ================= */

export default function DataTable<
  T extends { id: string | number }
>({
  data,
  columns,
  statusKey,
  statusOptions,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  onPageChange,
  totalItems,
  totalPages,
  serverSide = false,
  loading = false,
  emptyMessage = "No records found.",
  showExport = true,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(5)
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const resolvedSearch = searchValue ?? internalSearch
  const resolvedRowsPerPage = rowsPerPage ?? internalRowsPerPage
  const resolvedCurrentPage = currentPage ?? internalCurrentPage

  const setSearch = onSearchChange ?? setInternalSearch
  const setRowsPerPage = onRowsPerPageChange ?? setInternalRowsPerPage
  const setCurrentPage = onPageChange ?? setInternalCurrentPage

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    if (serverSide) return data

    const s = resolvedSearch.toLowerCase()

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
  }, [data, resolvedSearch, serverSide, statusFilter, statusKey])

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

  const resolvedTotalPages = Math.max(
    serverSide ? (totalPages ?? 1) : Math.ceil(sortedData.length / resolvedRowsPerPage),
    1
  )
  const resolvedTotalItems = serverSide ? (totalItems ?? data.length) : sortedData.length
  const startIndex = (resolvedCurrentPage - 1) * resolvedRowsPerPage
  const visibleData = serverSide
    ? sortedData
    : sortedData.slice(startIndex, startIndex + resolvedRowsPerPage)

  useEffect(() => {
    if (resolvedCurrentPage > resolvedTotalPages) {
      setCurrentPage(resolvedTotalPages)
    }
  }, [resolvedCurrentPage, resolvedTotalPages, setCurrentPage])

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

  const getAlignClass = (align: Column<T>["align"]) => {
    if (align === "center") return "text-center"
    if (align === "right") return "text-right"
    return "text-left"
  }

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-4">
        <input
          placeholder={searchPlaceholder}
          value={resolvedSearch}
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

          {showExport && (
            <button
              onClick={handleExport}
              disabled={visibleData.length === 0}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
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
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    left: col.sticky ? col.left : undefined,
                  }}
                  className={`px-5 py-3 text-sm font-semibold whitespace-nowrap ${getAlignClass(col.align)}
                    ${col.sortable ? "cursor-pointer" : ""}
                    ${col.sticky ? "sticky top-0 bg-gray-100 z-30" : ""}
                    ${col.className ?? ""}
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
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : visibleData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleData.map((row, index) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  {columns.map(col => {
                    const value =
                      col.key === "sno" || col.key === "actions"
                        ? undefined
                        : (row as any)[col.key]

                    return (
                      <td
                        key={String(col.key)}
                        style={{
                          width: col.width,
                          minWidth: col.width,
                          left: col.sticky ? col.left : undefined,
                        }}
                        className={`px-5 py-3 text-sm align-top ${getAlignClass(col.align)} ${
                          col.sticky ? "sticky bg-white z-20" : ""
                        } ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(value, row, index, startIndex)
                          : String(value ?? "")}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Rows per page:
          <select
            value={resolvedRowsPerPage}
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

        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            {resolvedTotalItems === 0
              ? "0 results"
              : `${startIndex + 1}-${Math.min(
                  startIndex + visibleData.length,
                  resolvedTotalItems
                )} of ${resolvedTotalItems}`}
          </span>
          <button
            disabled={resolvedCurrentPage === 1}
            onClick={() => setCurrentPage(resolvedCurrentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-slate-600">
            Page {resolvedCurrentPage} of {resolvedTotalPages}
          </span>
          <button
            disabled={resolvedCurrentPage === resolvedTotalPages}
            onClick={() => setCurrentPage(resolvedCurrentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
