"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { promoCodeApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type PromoStatus = "active" | "pending" | "expired" | string

interface PromoCodeModalProps {
  isOpen: boolean
  onClose: () => void
  promoCode?: any
}

function toDateInputValue(dateStr?: string) {
  if (!dateStr) return ""
  return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr
}

export function PromoCodeModal({ isOpen, onClose, promoCode }: PromoCodeModalProps) {
  const [formData, setFormData] = useState<{
    discountValue: string
    startDate: string
    expiryDate: string
    status: PromoStatus
  }>({
    discountValue: "",
    startDate: "",
    expiryDate: "",
    status: "active",
  })

  const queryClient = useQueryClient()

  useEffect(() => {
    if (promoCode) {
      setFormData({
        discountValue: (promoCode.discountValue ?? "").toString(),
        startDate: toDateInputValue(promoCode.startDate ?? promoCode.validFrom),
        expiryDate: toDateInputValue(promoCode.expiryDate ?? promoCode.validUntil),
        status: promoCode.status || "active",
      })
    } else {
      setFormData({
        discountValue: "",
        startDate: "",
        expiryDate: "",
        status: "active",
      })
    }
  }, [promoCode])

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (promoCode?._id) return promoCodeApi.update(promoCode._id, payload)
      return promoCodeApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] })
      toast.success(promoCode ? "Promo code updated successfully" : "Promo code created successfully")
      onClose()
    },
    onError: () => {
      toast.error(promoCode ? "Failed to update promo code" : "Failed to create promo code")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const discountValueNum = Number(formData.discountValue)

    if (!Number.isFinite(discountValueNum) || discountValueNum <= 0) {
      toast.error("Discount value must be a valid number greater than 0")
      return
    }

    if (!formData.startDate || !formData.expiryDate) {
      toast.error("Start date and expiry date are required")
      return
    }

    if (new Date(formData.expiryDate) < new Date(formData.startDate)) {
      toast.error("Expiry date cannot be before start date")
      return
    }

    // ✅ ONLY payload you requested
    const payload = {
      discountValue: discountValueNum,
      startDate: formData.startDate,   // YYYY-MM-DD
      expiryDate: formData.expiryDate, // YYYY-MM-DD
      status: formData.status,
    }

    mutation.mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{promoCode ? "Edit Promo Code" : "Add Promo Code"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                type="number"
                min={1}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder="50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-[#8B0000] hover:bg-[#700000]">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
