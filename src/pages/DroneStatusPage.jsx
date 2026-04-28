import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, Battery, Clock, MapPin, QrCode, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { simulateDroneDispatch, simulateDroneStatusUpdates } from "../lib/demoData";
import StatusBadge from "../components/StatusBadge";
import { cn } from "@/lib/utils";

const statusSteps = [
  { key: "dispatched", label: "Drone Dispatched", icon: Plane },
  { key: "en_route", label: "On The Way", icon: MapPin },
  { key: "arrived", label: "Arrived", icon: Check },
  { key: "qr_verified", label: "QR Scanned", icon: QrCode },
  { key: "collecting", label: "Collecting Waste", icon: Loader2 },
  { key: "returning", label: "Returning", icon: Plane },
  { key: "delivered", label: "Delivered", icon: Check },
];

export default function DroneStatusPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const detectionId = urlParams.get("id");

  const [detection, setDetection] = useState(null);
  const [drone, setDrone] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("dispatched");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (detectionId) {
        const det = await base44.entities.WasteDetection.filter({ id: detectionId });
        if (det.length > 0) setDetection(det[0]);
      }
      
      // Simulate drone dispatch
      const droneData = await simulateDroneDispatch("Drop Point A", "QR-123");
      setDrone(droneData);
      setLoading(false);

      // Simulate real-time status updates
      const cleanup = simulateDroneStatusUpdates(({ status, eta_minutes, battery_level }) => {
        setCurrentStatus(status);
        setDrone(prev => prev ? { ...prev, eta_minutes, battery_level } : prev);
        
        if (status === "delivered" && detectionId) {
          base44.entities.WasteDetection.update(detectionId, { status: "delivered" });
        }
      });

      return cleanup;
    }
    
    const cleanupPromise = load();
    return () => {
      cleanupPromise.then(fn => fn && fn());
    };
  }, [detectionId]);

  const currentStepIdx = statusSteps.findIndex(s => s.key === currentStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Drone Status</h1>
      </div>

      {/* Drone Info Card */}
      {drone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-eco-emerald rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 animate-float" />
              <span className="font-semibold">{drone.drone_id}</span>
            </div>
            <StatusBadge status={currentStatus === "delivered" ? "delivered" : "drone_en_route"} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg font-bold">{Math.round(drone.eta_minutes || 0)}m</p>
              <p className="text-[10px] text-white/70">ETA</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Battery className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg font-bold">{drone.battery_level}%</p>
              <p className="text-[10px] text-white/70">Battery</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <MapPin className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg font-bold truncate">{detection?.drop_point?.split(" - ")[0] || "N/A"}</p>
              <p className="text-[10px] text-white/70">Destination</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* QR Code */}
      {detection?.qr_code && (
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <QrCode className="h-16 w-16 mx-auto text-primary mb-2" />
          <p className="font-mono text-lg font-bold tracking-widest">{detection.qr_code}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Drone will scan this code to verify pickup
          </p>
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4">Live Tracking</h2>
        <div className="space-y-0">
          {statusSteps.map(({ key, label, icon: Icon }, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : "bg-muted border-border text-muted-foreground"
                  )}>
                    <Icon className={cn("h-3.5 w-3.5", isCurrent && key !== "delivered" && "animate-pulse")} />
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div className={cn(
                      "w-0.5 h-8",
                      idx < currentStepIdx ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-primary">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Link to="/">
        <Button variant="outline" className="w-full h-12 rounded-xl">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}