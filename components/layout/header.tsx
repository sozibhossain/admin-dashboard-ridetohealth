"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, notificationApi } from "@/lib/api"

// shadcn dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function Header() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll(1).then(res => res.data),
    refetchInterval: 60000, // auto refresh every 1 min
  })

  const unreadCount = notificationsData?.notifications?.filter((n: any) => !n.read).length || 0

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully")
      setOpen(false)
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
    },
    onError: () => {
      toast.error("Failed to change password")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.oldPassword || !form.newPassword) {
      toast.error("Please fill all fields")
      return
    }

    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match")
      return
    }

    changePasswordMutation.mutate({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    })
  }

  return (
    <>
      <header className="fixed top-0 right-0 left-[173px] z-30 h-[70px] bg-white border-b border-border">
        <div className="flex h-full items-center justify-end px-6 gap-4">
          {/* Notification Bell */}
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* User Profile */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Alex rock</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={form.oldPassword}
                onChange={(e) => setForm((p) => ({ ...p, oldPassword: e.target.value }))}
                placeholder="Enter old password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={changePasswordMutation.isPending}
                onClick={() => {
                  setOpen(false)
                  setForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="bg-[#8B0000] hover:bg-[#700000]"
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
