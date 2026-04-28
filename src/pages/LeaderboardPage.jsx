import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Medal, Crown, Leaf, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setCurrentUser(me);

      // Build leaderboard from detections
      const allDetections = await base44.entities.WasteDetection.list("-created_date", 200);
      
      const userMap = {};
      allDetections.forEach((d) => {
        const email = d.created_by;
        if (!userMap[email]) {
          userMap[email] = { email, points: 0, items: 0 };
        }
        userMap[email].points += d.points_earned || 0;
        userMap[email].items += 1;
      });

      const sorted = Object.values(userMap).sort((a, b) => b.points - a.points);
      setLeaderboard(sorted);
      setLoading(false);
    }
    load();
  }, []);

  const rankIcons = [
    <Crown className="h-5 w-5 text-amber-500" />,
    <Medal className="h-5 w-5 text-slate-400" />,
    <Medal className="h-5 w-5 text-amber-700" />,
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Leaderboard</span>
        </div>
        <h1 className="text-2xl font-bold">Top Eco Heroes</h1>
        <p className="text-sm text-muted-foreground">Compete to save the planet</p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 1 && (
        <div className="flex items-end justify-center gap-3 pt-4">
          {[1, 0, 2].map((idx) => {
            const user = leaderboard[idx];
            if (!user) return <div key={idx} className="w-24" />;
            const isFirst = idx === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "flex flex-col items-center",
                  isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"
                )}
              >
                <div className={cn(
                  "rounded-full flex items-center justify-center mb-2 border-2",
                  isFirst ? "h-16 w-16 border-amber-400 bg-amber-50" : "h-12 w-12 border-border bg-muted"
                )}>
                  <Leaf className={cn("text-primary", isFirst ? "h-7 w-7" : "h-5 w-5")} />
                </div>
                {rankIcons[idx]}
                <p className="text-xs font-medium mt-1 truncate max-w-[80px]">
                  {user.email.split("@")[0]}
                </p>
                <p className={cn(
                  "font-bold",
                  isFirst ? "text-lg text-primary" : "text-sm"
                )}>
                  {user.points}
                </p>
                <p className="text-[10px] text-muted-foreground">points</p>
                <div className={cn(
                  "w-20 rounded-t-xl mt-2 bg-gradient-to-t from-primary/20 to-primary/5",
                  isFirst ? "h-24" : idx === 1 ? "h-16" : "h-12"
                )} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recycling activity yet</p>
            <p className="text-xs text-muted-foreground/70">Start scanning to appear on the leaderboard!</p>
          </div>
        ) : (
          leaderboard.map((user, idx) => (
            <motion.div
              key={user.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-border last:border-0",
                user.email === currentUser?.email && "bg-primary/5"
              )}
            >
              <span className={cn(
                "w-7 text-center font-bold text-sm",
                idx < 3 ? "text-primary" : "text-muted-foreground"
              )}>
                {idx + 1}
              </span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.email.split("@")[0]}
                  {user.email === currentUser?.email && (
                    <span className="text-xs text-primary ml-1">(You)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{user.items} items recycled</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">{user.points}</p>
                <p className="text-[10px] text-muted-foreground">pts</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}