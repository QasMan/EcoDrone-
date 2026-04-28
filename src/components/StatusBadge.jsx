import { cn } from "@/lib/utils";

const statusStyles = {
  detected: "bg-blue-100 text-blue-700",
  drone_dispatched: "bg-yellow-100 text-yellow-700",
  drone_en_route: "bg-orange-100 text-orange-700",
  qr_scanned: "bg-purple-100 text-purple-700",
  collected: "bg-primary/10 text-primary",
  delivered: "bg-primary/20 text-primary font-semibold",
  rewarded: "bg-eco-light text-eco-dark",
};

const statusLabels = {
  detected: "Detected",
  drone_dispatched: "Drone Dispatched",
  drone_en_route: "Drone En Route",
  qr_scanned: "QR Scanned",
  collected: "Collected",
  delivered: "Delivered",
  rewarded: "Rewarded",
};

export default function StatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      statusStyles[status] || "bg-muted text-muted-foreground"
    )}>
      {statusLabels[status] || status}
    </span>
  );
}