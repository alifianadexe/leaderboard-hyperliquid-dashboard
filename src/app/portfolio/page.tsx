"use client";

import { useEffect, useState } from "react";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { PortfolioAnalytics } from "@/components/PortfolioAnalytics";
import { TradingHistory } from "@/components/TradingHistory";
import { ActivePositions } from "@/components/ActivePositions";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  History,
  Activity,
  RefreshCw,
  Settings,
  ArrowLeft,
} from "lucide-react";

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "positions", label: "Active Positions", icon: Activity },
    { id: "history", label: "Trading History", icon: History },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-zinc-950">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-zinc-950 to-blue-900/5" />

        <div className="relative">
          {/* Header */}
          <header className="border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-12xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                  <div className="w-px h-6 bg-zinc-700/50"></div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Portfolio Dashboard
                    </h1>
                    <p className="text-sm text-zinc-500">
                      Track your trading performance across all exchanges
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="border-b border-zinc-800/40 bg-zinc-950/50">
            <div className="max-w-12xl mx-auto px-8">
              <div className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                        activeTab === tab.id
                          ? "border-emerald-500 text-emerald-400"
                          : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-12xl mx-auto px-8 py-8">
            {activeTab === "overview" && <PortfolioOverview />}
            {activeTab === "analytics" && <PortfolioAnalytics />}
            {activeTab === "positions" && <ActivePositions />}
            {activeTab === "history" && <TradingHistory />}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
