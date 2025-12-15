"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Users, Car, UserCheck } from "lucide-react"
import { dashboardApi } from "@/lib/api"

export function DashboardStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
  })

  const overview = data?.data?.overview

  const stats = [
    {
      title: "Total Revenue",
      value: overview ? `$${(overview.totalRevenue ?? 0).toLocaleString()}` : "$0",
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Drivers",
      value: (overview?.totalDrivers ?? 0).toLocaleString(),
      icon: Users,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      title: "Total Rides",
      value: (overview?.totalRides ?? 0).toLocaleString(),
      icon: Car,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Total Users",
      value: (overview?.totalUsers ?? 0).toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
