import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const capacityColors = {
  high: "text-primary",
  medium: "text-amber-500",
  low: "text-destructive",
};

export default function DropPointSelector({ onSelect, onBack }) {
  const [dropPoints, setDropPoints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const points = await base44.entities.DropPoint.filter({ active: true });
      setDropPoints(points);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold">Select Drop Point</h2>
      </div>

      <div className="space-y-2">
        {dropPoints.map((point) => (
          <button
            key={point.id}
            onClick={() => setSelected(point)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
              selected?.id === point.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              selected?.id === point.id ? "bg-primary/10" : "bg-muted"
            )}>
              <MapPin className={cn("h-5 w-5", selected?.id === point.id ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{point.name}</p>
              <p className="text-xs text-muted-foreground truncate">{point.address}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {selected?.id === point.id && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              <span className={cn("text-[10px] font-medium uppercase", capacityColors[point.capacity])}>
                {point.capacity} cap.
              </span>
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
      >
        <MapPin className="h-4 w-4 mr-2" />
        Confirm & Dispatch Drone
      </Button>
    </div>
  );
}