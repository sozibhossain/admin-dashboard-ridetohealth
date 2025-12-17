import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Wallet, MapPin, Car } from "lucide-react";

export function DriverDetailsModal({ isOpen, onClose, driver }: any) {
  if (!driver) return null;

  const fullName = driver.userId?.fullName || "Unknown Driver";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Driver Profile</DialogTitle>
        </DialogHeader>

        {/* Header Section: Avatar & Status */}
        <div className="flex items-center gap-6 py-4">
          <Avatar className="h-24 w-24 border-2 border-gray-100">
            <AvatarImage src={driver.userId?.profileImage} />
            <AvatarFallback className="bg-primary/10 text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge className={driver.isOnline ? "bg-green-500" : "bg-gray-400"}>
                {driver.isOnline ? "Online" : "Offline"}
              </Badge>
              <Badge variant="outline" className={driver.isAvailable ? "border-blue-500 text-blue-600" : ""}>
                {driver.isAvailable ? "Available for Rides" : "Busy"}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {driver.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Earnings & Stats Grid */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Wallet className="w-5 h-5 mx-auto mb-1 text-gray-600" />
            <p className="text-xs text-gray-500">Earnings</p>
            <p className="font-bold">${driver.earnings?.total || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-xs text-gray-500">Rating</p>
            <p className="font-bold">{driver.ratings?.average || 0} / 5</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Car className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-xs text-gray-500">Rides</p>
            <p className="font-bold">{driver.completedRides || 0}</p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Contact & System Info</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{driver.userId?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{driver.userId?.phoneNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Vehicle Reference</p>
              <p className="font-mono text-[10px] break-all">{driver.vehicleId}</p>
            </div>
            <div>
              <p className="text-gray-500">Current Coordinates</p>
              <div className="flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3" />
                <span>{driver.currentLocation?.coordinates?.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Section */}
        {driver.ratings?.totalRatings > 0 && (
          <div className="mt-4 p-4 border rounded-lg bg-orange-50/30">
            <h3 className="text-sm font-semibold mb-2">Rating Count</h3>
            <div className="flex gap-4 text-xs">
              <span>5★: {driver.ratings.count5}</span>
              <span>4★: {driver.ratings.count4}</span>
              <span>3★: {driver.ratings.count3}</span>
              {/* etc */}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}