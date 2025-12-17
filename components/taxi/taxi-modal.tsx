"use client"

import type { FC } from "react"
import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { taxiApi, servicesApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface TaxiModalProps {
  isOpen: boolean
  onClose: () => void
  taxi?: any // You can improve this with a proper type later
}

export const TaxiModal: FC<TaxiModalProps> = ({ isOpen, onClose, taxi }) => {
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

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => {
      const response = await servicesApi.getAll(1)
      return response.data // assuming response has { data: [...] }
    },
    enabled: isOpen, // only fetch when modal is open
  })

  // Reset form when taxi prop changes or modal opens/closes
  useEffect(() => {
    if (taxi) {
      setFormData({
        taxiName: taxi.taxiName || "",
        model: taxi.model || "",
        plateNumber: taxi.plateNumber || "",
        color: taxi.color || "",
        year: taxi.year?.toString() || "",
        vin: taxi.vin || "",
        serviceId: taxi.serviceId?._id || taxi.serviceId || "", // handle both populated and ref cases
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
  }, [taxi, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (taxi) {
        // Assuming update takes taxi ID and data
        return taxiApi.update(taxi._id, data)
      } else {
        // Create needs serviceId + other data
        if (!data.serviceId) {
          throw new Error("Service is required")
        }
        return taxiApi.create(data.serviceId, {
          taxiName: data.taxiName,
          model: data.model,
          plateNumber: data.plateNumber,
          color: data.color,
          year: data.year,
          vin: data.vin,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxis"] })
      toast.success(taxi ? "Taxi updated successfully" : "Taxi created successfully")
      onClose()
    },
    onError: (error: any) => {
      toast.error(error?.message || (taxi ? "Failed to update taxi" : "Failed to create taxi"))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.serviceId) {
      toast.error("Please select a service type")
      return
    }

    mutation.mutate(formData)
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
              <Label htmlFor="serviceId">Service Type *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value })
                }
                disabled={servicesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={servicesLoading ? "Loading..." : "Select service"} />
                </SelectTrigger>
                <SelectContent>
                  {servicesData?.data?.map((service: any) => (
                    <SelectItem key={service._id} value={service._id}>
                      {service.name}
                    </SelectItem>
                  ))}
                  {servicesLoading && (
                    <SelectItem value="loading" disabled>
                      Loading services...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxiName">Taxi Name</Label>
              <Input
                id="taxiName"
                value={formData.taxiName}
                onChange={(e) =>
                  setFormData({ ...formData, taxiName: e.target.value })
                }
                placeholder="Enter taxi name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="e.g. Toyota Prius"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plateNumber">Plate Number</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) =>
                  setFormData({ ...formData, plateNumber: e.target.value })
                }
                placeholder="ABC-1234"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="Yellow"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                placeholder="2023"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) =>
                  setFormData({ ...formData, vin: e.target.value })
                }
                placeholder="1HGBH41JXMN109186"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || servicesLoading}
              className="bg-[#8B0000] hover:bg-[#700000]"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {taxi ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}