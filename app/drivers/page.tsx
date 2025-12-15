"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { driversApi } from "@/lib/api"
import { toast } from "sonner"
import { Eye, Trash2 } from "lucide-react"

type DriverStatus = "pending" | "approved" | "rejected" | string

interface DriverUser {
  _id: string
  fullName: string
  email?: string
  phoneNumber?: string
  profileImage: string | null
}

interface Driver {
  _id: string
  userId: DriverUser | null
  vehicleId: string | null
  completedRides: number
  status: DriverStatus
}

interface DriversResponse {
  success: boolean
  page: number
  totalPages: number
  totalDrivers: number
  data: Driver[]
}

function getInitials(name?: string) {
  if (!name) return "?"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

export default function DriversPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["drivers", page],
    queryFn: async () => {
      const response = await driversApi.getAll(page)
      return response.data as DriversResponse
    },
  })

  const approvedDrivers = useMemo(() => {
    return (data?.data ?? []).filter((d) => d.status === "approved")
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      toast.success("Driver deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete driver")
    },
  })

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers Profile</h1>
          <p className="text-gray-600 mt-1">Dashboard › Drivers Profile</p>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Drivers Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Phone Number</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Total Rides</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <tr key={i} className="border-b border-gray-200 last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                          </div>
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-28" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-9" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : approvedDrivers.length > 0 ? (
                  approvedDrivers.map((driver) => {
                    const fullName = driver.userId?.fullName ?? "Unknown"
                    const phone = driver.userId?.phoneNumber ?? "-"

                    return (
                      <tr key={driver._id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={driver.userId?.profileImage || undefined} />
                              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                            </Avatar>
                            <p className="font-medium text-gray-900">{fullName}</p>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{phone}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{driver.completedRides ?? 0}</p>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-gray-100">
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(driver._id)}
                              className="h-9 w-9 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No approved drivers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.totalPages && data.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <PaginationControls currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
