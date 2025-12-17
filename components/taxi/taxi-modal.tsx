"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taxiApi, servicesApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

interface Service {
  _id: string;
  name: string;
}

interface Taxi {
  _id: string;
  taxiName: string;
  model: string;
  plateNumber: string;
  color: string;
  year: number;
  vin: string;
  serviceImage: string; // Backend returns the URL string
  serviceId: {
    _id: string;
    name: string;
  };
}

interface TaxiModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxi?: Taxi | null;
}

export function TaxiModal({ isOpen, onClose, taxi }: TaxiModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    taxiName: "",
    model: "",
    plateNumber: "",
    color: "",
    year: "",
    vin: "",
    serviceId: "",
  });

  // Handle the image separately to manage File object and local preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const queryClient = useQueryClient();

  const { data: servicesData } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => {
      const response = await servicesApi.getAll(1);
      return response.data;
    },
    enabled: isOpen,
  });

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
      });
      setPreviewUrl(taxi.serviceImage || "");
      setSelectedFile(null);
    } else {
      setFormData({
        taxiName: "",
        model: "",
        plateNumber: "",
        color: "",
        year: "",
        vin: "",
        serviceId: "",
      });
      setPreviewUrl("");
      setSelectedFile(null);
    }
  }, [taxi, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create temporary preview URL
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: async (payload: FormData) => {
      if (taxi) {
        return taxiApi.update(taxi._id, payload);
      }
      // Assuming create API expects (serviceId, formData)
      return taxiApi.create(formData.serviceId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxis"] });
      toast.success(taxi ? "Taxi updated" : "Taxi created");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error saving taxi");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData object to send file and text together
    const data = new FormData();
    data.append("taxiName", formData.taxiName);
    data.append("model", formData.model);
    data.append("plateNumber", formData.plateNumber);
    data.append("color", formData.color);
    data.append("year", formData.year);
    data.append("vin", formData.vin);
    data.append("serviceId", formData.serviceId);

    if (selectedFile) {
      data.append("serviceImage", selectedFile);
    }

    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{taxi ? "Edit Taxi" : "Add Taxi"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service Type</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(v) => setFormData({ ...formData, serviceId: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {servicesData?.data?.map((s: Service) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Taxi Name */}
            <div className="space-y-2">
              <Label htmlFor="taxiName">Taxi Name</Label>
              <Input
                id="taxiName"
                value={formData.taxiName}
                onChange={(e) => setFormData({ ...formData, taxiName: e.target.value })}
                required
              />
            </div>

            {/* Model & Plate */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Plate Number</Label>
              <Input id="plateNumber" value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })} required />
            </div>

            {/* Color & Year */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
            </div>

            {/* VIN */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} required />
            </div>

            {/* IMAGE UPLOAD FIELD */}
            <div className="space-y-2 md:col-span-2">
              <Label>Service Image</Label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md hover:border-[#8B0000] transition-colors cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full h-40">
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="text-[#8B0000] font-medium">Upload a file</span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#8B0000] hover:bg-[#700000] text-white"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {taxi ? "Update Taxi" : "Create Taxi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}