"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { ridesApi } from "@/lib/api"

type RideStatus =
  | "requested"
  | "accepted"
  | "arrived"
  | "started"
  | "completed"
  | "cancelled"
  | string

type PaymentStatus = "pending" | "paid" | "failed" | string

interface TripHistoryResponse {
  success: boolean
  data: {
    rides: RideItem[]
    pagination: {
      current: number
      pages: number
      total: number
    }
  }
}

interface RideItem {
  _id: string
  customerId?: {
    _id: string
    fullName?: string
    profileImage?: string
  } | null
  driverId?: string | null
  totalFare?: number
  status?: RideStatus
  paymentMethod?: string
  paymentStatus?: PaymentStatus
  createdAt?: string
}

function formatDate(iso?: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

function shortId(id: string) {
  return id?.slice(-8) ?? "-"
}

export default function RideHistoryPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["rides", page],
    queryFn: async () => {
      const res = await ridesApi.getAll(page)
      return res.data as TripHistoryResponse
    },
    keepPreviousData: true,
  })

  const rides = data?.data?.rides ?? []
  const totalPages = data?.data?.pagination?.pages ?? 1

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ride History</h1>
          <p className="text-gray-600 mt-1">Dashboard › Ride History</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Ride ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Driver</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-gray-200 last:border-0">
                        <td className="p-4">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="p-4">
                          <Skeleton className="h-6 w-20" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : rides.length > 0 ? (
                  rides.map((ride) => {
                    const customerName = ride.customerId?.fullName ?? "Unknown"
                    const driver = ride.driverId ?? "-"
                    const amount = ride.totalFare ?? 0
                    const rideStatus = ride.status ?? "-"
                    const paymentStatus = ride.paymentStatus ?? "-"

                    const rideStatusClass =
                      rideStatus === "completed"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : rideStatus === "cancelled"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"

                    const paymentClass =
                      paymentStatus === "paid"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : paymentStatus === "failed"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100"

                    return (
                      <tr key={ride._id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                        <td className="p-4">
                          <p className="text-sm font-medium text-gray-900">{shortId(ride._id)}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{formatDate(ride.createdAt)}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{customerName}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm text-gray-900">{driver}</p>
                        </td>

                        <td className="p-4">
                          <p className="text-sm font-medium text-gray-900">${amount.toLocaleString()}</p>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge className={rideStatusClass}>
                              {String(rideStatus).charAt(0).toUpperCase() + String(rideStatus).slice(1)}
                            </Badge>
                            <Badge className={paymentClass}>
                              {String(paymentStatus).charAt(0).toUpperCase() + String(paymentStatus).slice(1)}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No rides found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
