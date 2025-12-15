"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { taxiApi, servicesApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface TaxiModalProps {
  isOpen: boolean
  onClose: () => void
  taxi?: any
}

export function TaxiModal({ isOpen, onClose, taxi }: TaxiModalProps) {
  const [formData, setFormData] = useState({
    taxiName: "",
    model: "",
    plateNumber: "",
    color: "",
    year: "",
    vin: "",
    serviceId: "",
  })
  const queryClient = useQueryClient()

  const { data: servicesData } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => {
      const response = await servicesApi.getAll(1)
      return response.data
    },
    enabled: isOpen,
  })

  useEffect(() => {
    if (taxi) {
      setFormData({
        taxiName: taxi.taxiName || "",
        model: taxi.model || "",
        plateNumber: taxi.plateNumber || "",
        color: taxi.color || "",
        year: taxi.year?.toString() || "",
        vin: taxi.vin || "",
        serviceId: taxi.serviceId?._id || "",
      })
    } else {
      setFormData({
        taxiName: "",
        model: "",
        plateNumber: "",
        color: "",
        year: "",
        vin: "",
        serviceId: "",
      })
    }
  }, [taxi])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (taxi) {
        return taxiApi.update(data)
      }
      return taxiApi.create(formData.serviceId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxis"] })
      toast.success(taxi ? "Taxi updated successfully" : "Taxi created successfully")
      onClose()
    },
    onError: () => {
      toast.error(taxi ? "Failed to update taxi" : "Failed to create taxi")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      taxiName: formData.taxiName,
      model: formData.model,
      plateNumber: formData.plateNumber,
      color: formData.color,
      year: formData.year,
      vin: formData.vin,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{taxi ? "Edit Taxi" : "Add Taxi"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service Type</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {servicesData?.data?.map((service: any) => (
                    <SelectItem key={service._id} value={service._id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxiName">Taxi Name</Label>
              <Input
                id="taxiName"
                value={formData.taxiName}
                onChange={(e) => setFormData({ ...formData, taxiName: e.target.value })}
                placeholder="Enter taxi name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="M-1234"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plateNumber">Plate Number</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="plate-1324236"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2020"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                placeholder="V-232349800-5479"
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
              {taxi ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
