"use client"


import { MainLayout } from "@/components/layout/main-layout"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ActiveDriversChart } from "@/components/dashboard/active-drivers-chart"

export default function DashboardPage() {



  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to your admin panel</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <ActiveDriversChart />
        </div>
      </div>
    </MainLayout>
  )
}
