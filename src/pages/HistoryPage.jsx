import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Recycle, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "../components/StatusBadge";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      const data = await base44.entities.WasteDetection.filter(
        { created_by: me.email },
        "-created_date",
        50
      );
      setDetections(data);
      setLoading(false);
    }
    load();
  }, []);

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
        <Link to="/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Recycling History</h1>
      </div>

      {detections.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Recycle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recycling history yet</p>
          <p className="text-xs text-muted-foreground/70 mb-4">
            Start scanning waste to build your history
          </p>
          <Link to="/scan">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">
              Start Scanning
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {detections.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/drone-status?id=${d.id}`}>
                <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Recycle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{d.result}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.confidence}% confidence
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(d.created_date).toLocaleDateString()}
                    </div>
                    {d.drop_point && (
                      <span className="truncate max-w-[150px]">{d.drop_point}</span>
                    )}
                    {d.points_earned > 0 && (
                      <span className="text-primary font-medium">+{d.points_earned} pts</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}