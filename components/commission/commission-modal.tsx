"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { commissionApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CommissionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CommissionModal({ isOpen, onClose }: CommissionModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    commission: "", // ✅ "10"
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: { date: string; commission: string }) => commissionApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] })
      toast.success("Commission created successfully")
      onClose()
      setFormData({ date: "", commission: "" })
    },
    onError: () => {
      toast.error("Failed to create commission")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date) {
      toast.error("Date is required")
      return
    }

    const num = Number(formData.commission)
    if (!Number.isFinite(num) || num <= 0) {
      toast.error("Commission must be a valid number greater than 0")
      return
    }

    // ✅ exact payload
    mutation.mutate({
      date: formData.date, // "YYYY-MM-DD"
      commission: formData.commission, // keep as string if backend expects string
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Commission</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Commission (%)</Label>
            <Input
              id="commission"
              type="number"
              min={1}
              max={100}
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
              placeholder="10"
              required
            />
          </div>

          <DialogFooter>
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
