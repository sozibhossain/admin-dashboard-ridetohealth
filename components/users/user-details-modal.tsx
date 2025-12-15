"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { usersApi } from "@/lib/api"

type UserDetailsResponse = {
  success: boolean
  data: UserDetails
}

type UserDetails = {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  profileImage: string | null
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt?: string
  lastActive?: string
  lastSeen?: string
  wallet?: { balance?: number }
  currentLocation?: { coordinates?: [number, number] }
  paymentMethods?: {
    _id: string
    type: string
    cardNumber?: string
    cardHolderName?: string
    expiryDate?: string
    isDefault?: boolean
  }[]
  loginHistory?: { _id: string; device?: string; ipAddress?: string; loginTime?: string }[]
  rideHistory?: {
    _id: string
    createdAt?: string
    status?: string
    totalFare?: number
    paymentMethod?: string
    paymentStatus?: string
    pickupLocation?: { address?: string }
    dropoffLocation?: { address?: string }
  }[]
  totalCompletedRides?: number
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

function dt(iso?: string) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function UserDetailsModal({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  userId: string | null
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await usersApi.getOne(userId as string)
      return res.data as UserDetailsResponse
    },
    enabled: open && !!userId,
  })

  const user = useMemo(() => data?.data, [data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ make modal fixed height */}
      <DialogContent className="w-[800px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {/* ✅ scrollable body */}
        <div className="max-h-[75vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError || !user ? (
            <div className="text-sm text-red-600">Failed to load user details.</div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback>{initials(user.fullName) || "?"}</AvatarFallback>
                  </Avatar>

                  <div className="leading-tight">
                    <p className="text-lg font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user._id}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={
                      user.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    {user.isActive ? "Active" : "Deactive"}
                  </Badge>

                  <div className="flex gap-2">
                    <Badge className={user.isEmailVerified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}>
                      Email {user.isEmailVerified ? "Verified" : "Not Verified"}
                    </Badge>
                    <Badge className={user.isPhoneVerified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}>
                      Phone {user.isPhoneVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{user.phoneNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm text-gray-900">{user.role || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm text-gray-900">{dt(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Active</p>
                  <p className="text-sm text-gray-900">{dt(user.lastActive)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Seen</p>
                  <p className="text-sm text-gray-900">{dt(user.lastSeen)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                  <p className="text-sm text-gray-900">${Number(user.wallet?.balance ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Completed Rides</p>
                  <p className="text-sm text-gray-900">{user.totalCompletedRides ?? 0}</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Payment Methods</p>

                {user.paymentMethods?.length ? (
                  <div className="space-y-2">
                    {user.paymentMethods.map((pm) => (
                      <div key={pm._id} className="flex items-center justify-between rounded-md border border-gray-100 p-3">
                        <div>
                          <p className="text-sm text-gray-900">
                            {pm.type?.toUpperCase()} {pm.cardNumber ? `•••• ${pm.cardNumber}` : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pm.cardHolderName || "-"} · Exp {pm.expiryDate || "-"}
                          </p>
                        </div>
                        {pm.isDefault ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Default</Badge> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No payment methods.</p>
                )}
              </div>

              {/* Recent Login History */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Recent Logins</p>

                {user.loginHistory?.length ? (
                  <div className="space-y-2">
                    {user.loginHistory.slice(-5).reverse().map((lh) => (
                      <div key={lh._id} className="rounded-md border border-gray-100 p-3">
                        <p className="text-sm text-gray-900">{lh.device || "-"}</p>
                        <p className="text-xs text-gray-500">
                          {lh.ipAddress || "-"} · {dt(lh.loginTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No login history.</p>
                )}
              </div>

              {/* Recent Ride History */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Recent Rides</p>

                {user.rideHistory?.length ? (
                  <div className="space-y-2">
                    {user.rideHistory.slice(-5).reverse().map((r) => (
                      <div key={r._id} className="rounded-md border border-gray-100 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{r.status || "-"}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${Number(r.totalFare ?? 0).toLocaleString()}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">{dt(r.createdAt)}</p>

                        <p className="text-xs text-gray-600 mt-2">
                          <span className="font-medium">From:</span> {r.pickupLocation?.address || "-"}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">To:</span> {r.dropoffLocation?.address || "-"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {r.paymentMethod || "-"} · {r.paymentStatus || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No rides found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
