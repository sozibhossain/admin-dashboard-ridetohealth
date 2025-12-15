"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { CommissionModal } from "@/components/commission/commission-modal"
import { Plus } from "lucide-react"
import { commissionApi, type CommissionRide } from "@/lib/api"

function formatDate(iso?: string) {
  if (!iso) return "-"
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
}

function rateToPercent(rate?: number) {
  if (rate == null) return "-"
  // if backend stores 0.02 => 2%
  if (rate > 0 && rate <= 1) return `${Math.round(rate * 100)}%`
  // if backend stores 2 => 2%
  return `${rate}%`
}

export default function CommissionPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["commissions", page],
    queryFn: () => commissionApi.getAll(page),
    keepPreviousData: true,
  })

  const rides = data?.data?.rides ?? []
  const totalPages = data?.data?.pagination?.pages ?? 0
  const totalCommission = data?.data?.totalCommission ?? 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commission</h1>
            <p className="text-gray-600 mt-1">Dashboard › Commission</p>
            <p className="text-sm text-gray-700 mt-2">
              Total Commission: <span className="font-semibold">${totalCommission.toLocaleString()}</span>
            </p>
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="bg-[#8B0000] hover:bg-[#700000]">
            <Plus className="h-4 w-4 mr-2" />
            Add Commission
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Commission</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Commission Revenue</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-0">
                      <td className="p-4">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-12" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-16" />
                      </td>
                    </tr>
                  ))
                ) : rides.length > 0 ? (
                  rides.map((ride: CommissionRide) => (
                    <tr key={ride._id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="text-sm text-gray-900">{formatDate(ride.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-900">{rateToPercent(ride.commission?.rate)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-900">
                          ${Number(ride.commission?.amount ?? 0).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      No commissions found
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

      <CommissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </MainLayout>
  )
}
