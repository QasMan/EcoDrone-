import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      const txns = await base44.entities.Transaction.filter(
        { created_by: me.email },
        "-created_date",
        50
      );
      setTransactions(txns);
      
      // Calculate balance from detections (points as currency)
      const detections = await base44.entities.WasteDetection.filter(
        { created_by: me.email },
        "-created_date",
        200
      );
      const total = detections.reduce((sum, d) => sum + (d.points_earned || 0), 0);
      setBalance(total);
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
        <h1 className="text-xl font-bold">Wallet</h1>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary to-eco-emerald rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-5 w-5" />
          <span className="text-sm text-white/80">EcoPoints Balance</span>
        </div>
        <p className="text-4xl font-bold mb-4">{balance}</p>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Coins className="h-3 w-3" />
          <span>1 EcoPoint = RM 0.10 (redeemable)</span>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-14 rounded-xl flex flex-col items-center gap-1 text-primary border-primary/20 hover:bg-primary/5"
        >
          <ArrowUpRight className="h-4 w-4" />
          <span className="text-xs">Redeem</span>
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-xl flex flex-col items-center gap-1 text-primary border-primary/20 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Top Up</span>
        </Button>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Transaction History
        </h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground/70">Start scanning waste to earn EcoPoints</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center",
                  txn.type === "reward" ? "bg-primary/10" : txn.type === "withdrawal" ? "bg-destructive/10" : "bg-blue-50"
                )}>
                  {txn.type === "reward" ? (
                    <ArrowDownLeft className="h-4 w-4 text-primary" />
                  ) : txn.type === "withdrawal" ? (
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                  ) : (
                    <Plus className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.created_date).toLocaleDateString()}
                  </p>
                </div>
                <p className={cn(
                  "font-semibold text-sm",
                  txn.type === "reward" || txn.type === "topup" ? "text-primary" : "text-destructive"
                )}>
                  {txn.type === "withdrawal" ? "-" : "+"}{txn.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}