"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { dashboardApi } from "@/lib/api"

function monthLabel(year: number, month: number) {
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString("en-US", { month: "short" })
}

export function ActiveDriversChart() {
  const [period, setPeriod] = useState<"6months" | "years">("6months")

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardApi.getStats,
  })

  const monthly = data?.data?.monthlyStats ?? []

  // Simple slicing logic (assuming backend returns chronological order; if not, sort it)
  const sorted = [...monthly].sort(
    (a, b) =>
      a._id.year - b._id.year || a._id.month - b._id.month
  )

  const filtered = period === "6months" ? sorted.slice(-6) : sorted.slice(-12)

  const chartData = filtered.map((m) => ({
    month: monthLabel(m._id.year, m._id.month),
    rides: m.rides ?? 0,
  }))

  const totalRides = data?.data?.overview?.totalRides ?? 0

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Monthly Rides</CardTitle>
            <p className="text-sm text-gray-600">Rides</p>
            <p className="text-sm font-medium mt-1">{totalRides.toLocaleString()}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={period === "6months" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("6months")}
              className={cn(period === "6months" && "bg-[#8B0000] hover:bg-[#700000]")}
            >
              6 Months
            </Button>
            <Button
              variant={period === "years" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("years")}
              className={cn(period === "years" && "bg-[#8B0000] hover:bg-[#700000]")}
            >
              12 Months
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="rides" stroke="#ef4444" strokeWidth={2} fill="url(#colorRides)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
