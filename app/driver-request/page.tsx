"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { driversApi, type DriverItem } from "@/lib/api"
import { Trash2, MoreVertical, Check, X } from "lucide-react"

// shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

export default function DriverRequestPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["drivers", page],
    queryFn: () => driversApi.getAll(page),
    keepPreviousData: true,
  })

  const pendingDrivers = useMemo(() => {
    const list = data?.data ?? []
    return list.filter((d) => d.status === "pending")
  }, [data])

  const approveMutation = useMutation({
    mutationFn: (driverId: string) => driversApi.approve(driverId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (driverId: string) => driversApi.reject(driverId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (driverId: string) => driversApi.delete(driverId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] })
    },
  })

  const totalPages = data?.totalPages ?? 1

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Request</h1>
          <p className="text-gray-600 mt-1">Dashboard › Driver Request</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Driver Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Phone Number</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-0">
                      <td className="p-4" colSpan={5}>
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td className="p-6 text-sm text-red-600" colSpan={5}>
                      Failed to load drivers.
                    </td>
                  </tr>
                ) : pendingDrivers.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-gray-600" colSpan={5}>
                      No pending driver requests.
                    </td>
                  </tr>
                ) : (
                  pendingDrivers.map((driver: DriverItem) => {
                    const user = driver.userId
                    const fullName = user?.fullName ?? "Unknown"
                    const email = user?.email ?? "-"
                    const phone = user?.phoneNumber ?? "-"

                    const busy =
                      approveMutation.isPending ||
                      rejectMutation.isPending ||
                      deleteMutation.isPending

                    return (
                      <tr key={driver._id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{initials(fullName) || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="leading-tight">
                              <p className="font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500">{driver._id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{phone}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{email}</p>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                            pending
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {/* Dropdown: Approve / Reject */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-9 w-9"
                                  disabled={busy}
                                  title="Actions"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => approveMutation.mutate(driver._id)}
                                  className="cursor-pointer"
                                >
                                  <Check className="mr-2 h-4 w-4 text-green-600" />
                                  Approve
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => rejectMutation.mutate(driver._id)}
                                  className="cursor-pointer"
                                >
                                  <X className="mr-2 h-4 w-4 text-red-600" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Delete */}
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 hover:bg-red-50"
                              disabled={busy}
                              onClick={() => deleteMutation.mutate(driver._id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {data?.page ?? page} of {totalPages}
              {isFetching ? <span className="ml-2 text-xs text-gray-400">Updating…</span> : null}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
