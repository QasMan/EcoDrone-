import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ScanLine, Plane, MessageCircle, Wallet, Leaf, ArrowRight, Recycle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StatusBadge from "../components/StatusBadge";

const quickActions = [
  { icon: ScanLine, label: "Scan Waste", path: "/scan", color: "bg-primary" },
  { icon: Plane, label: "Drone Status", path: "/drone-status", color: "bg-eco-emerald" },
  { icon: MessageCircle, label: "AI Chat", path: "/chat", color: "bg-blue-500" },
  { icon: Wallet, label: "Wallet", path: "/wallet", color: "bg-amber-500" },
];

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [stats, setStats] = useState({ total: 0, points: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const me = await base44.auth.me();
    setUser(me);
    const detections = await base44.entities.WasteDetection.filter(
      { created_by: me.email },
      "-created_date",
      5
    );
    setRecentDetections(detections);
    const totalPoints = detections.reduce((sum, d) => sum + (d.points_earned || 0), 0);
    setStats({ total: detections.length, points: totalPoints });
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.full_name || "Eco Hero"} 🌿
          </h1>
        </div>
        <Link to="/profile">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
        </Link>
      </div>

      {/* Eco Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-eco-emerald p-5 text-white"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Recycle className="h-5 w-5" />
            <span className="text-sm font-medium text-white/80">Your Impact</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-white/70">Items Recycled</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.points}</p>
              <p className="text-xs text-white/70">EcoPoints Earned</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, path, color }, i) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={path}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className={`${color} p-2.5 rounded-xl text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Start Scanning CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link to="/scan">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-eco-light to-accent p-5 border border-primary/20 group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-xl text-white animate-pulse-green">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Start Scanning</p>
                  <p className="text-xs text-muted-foreground">
                    Scan waste to earn EcoPoints
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Activity
        </h2>
        {recentDetections.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border border-border">
            <Recycle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No scans yet</p>
            <p className="text-xs text-muted-foreground/70">Start scanning to see activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDetections.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Recycle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{d.result}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.confidence}% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={d.status} />
                  {d.points_earned > 0 && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      +{d.points_earned} pts
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Mode Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Demo Mode:</span> Using simulated AI & drone data. Connect backend APIs for real operation.
        </p>
      </div>
    </div>
  );
}