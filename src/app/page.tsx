import { Leaderboard } from "@/components/Leaderboard";
import { ApiStatus } from "@/components/ApiStatus";
import { TrendingUp, BarChart3, Users, Zap, Activity } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Subtle background gradient */}

      <div className="relative">
        {/* Minimal Header */}
        <header className="border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-12xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Hyperliquid Dashboard
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Real-time trading analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ApiStatus />
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-400">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Centered Hero */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Live Trading Data
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              Hyperliquid{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Track the most successful traders with real-time analytics and
              performance insights.
            </p>
          </div>
        </section>

        {/* Main Leaderboard - Centered */}
        <section className="pb-24 sm:pb-32">
          <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
            <Leaderboard />
          </div>
        </section>
      </div>
    </main>
  );
}
