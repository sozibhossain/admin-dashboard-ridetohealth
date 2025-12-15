"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { servicesApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service?: any
}

export function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serviceImage: null as File | null,
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        serviceImage: null,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        serviceImage: null,
      })
    }
  }, [service])

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (service) {
        return servicesApi.update(service._id, data)
      }
      return servicesApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast.success(service ? "Service updated successfully" : "Service created successfully")
      onClose()
    },
    onError: () => {
      toast.error(service ? "Failed to update service" : "Failed to create service")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData()
    data.append("name", formData.name)
    data.append("description", formData.description)
    if (formData.serviceImage) {
      data.append("serviceImage", formData.serviceImage)
    }
    mutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter service name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter service description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Service Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, serviceImage: e.target.files?.[0] || null })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-[#8B0000] hover:bg-[#700000]">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
