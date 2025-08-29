"use client";

import { useEffect, useState } from "react";
import { PortfolioSummary, Portfolio } from "@/types/portfolio";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function PortfolioOverview() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingPortfolios, setSyncingPortfolios] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, portfoliosRes] = await Promise.all([
        fetch("/api/portfolio/summary"),
        fetch("/api/portfolio"),
      ]);

      console.log(
        "Response status - Summary:",
        summaryRes.status,
        "Portfolios:",
        portfoliosRes.status
      );

      const summaryData = await summaryRes.json();
      const portfoliosData = await portfoliosRes.json();

      console.log("Summary data:", summaryData);
      console.log("Portfolios data:", portfoliosData);
      console.log(
        "Portfolios data type:",
        typeof portfoliosData,
        "Is array:",
        Array.isArray(portfoliosData)
      );

      // Handle summary response
      if (summaryRes.ok) {
        setSummary(summaryData);
      } else {
        console.error("Summary API error:", summaryData);
      }

      // Handle portfolios response
      if (portfoliosRes.ok) {
        if (Array.isArray(portfoliosData)) {
          setPortfolios(portfoliosData);
        } else if (
          portfoliosData.portfolios &&
          Array.isArray(portfoliosData.portfolios)
        ) {
          setPortfolios(portfoliosData.portfolios);
        } else if (portfoliosData.error) {
          throw new Error(portfoliosData.error);
        } else {
          setPortfolios([]);
          console.warn("Unexpected portfolios data structure:", portfoliosData);
        }
      } else {
        console.error("Portfolios API error:", portfoliosData);
        if (portfoliosRes.status === 401) {
          throw new Error("Authentication required");
        }
        throw new Error(portfoliosData.error || "Failed to fetch portfolios");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const syncPortfolio = async (portfolioId: number) => {
    try {
      setSyncingPortfolios((prev) => new Set(prev).add(portfolioId));

      const response = await fetch(`/api/user/portfolio/${portfolioId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          force_refresh: true,
          sync_trades: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync portfolio");
      }

      // Refresh data after sync
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync portfolio");
    } finally {
      setSyncingPortfolios((prev) => {
        const newSet = new Set(prev);
        newSet.delete(portfolioId);
        return newSet;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getLastSyncStatus = (lastSyncAt: string) => {
    const lastSync = new Date(lastSyncAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSync.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 5)
      return { status: "recent", text: "Just now", color: "text-emerald-400" };
    if (diffMinutes < 30)
      return {
        status: "moderate",
        text: `${diffMinutes}m ago`,
        color: "text-yellow-400",
      };
    if (diffMinutes < 60)
      return {
        status: "old",
        text: `${diffMinutes}m ago`,
        color: "text-orange-400",
      };

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
      return {
        status: "very_old",
        text: `${diffHours}h ago`,
        color: "text-red-400",
      };

    const diffDays = Math.floor(diffHours / 24);
    return { status: "stale", text: `${diffDays}d ago`, color: "text-red-500" };
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-900/50 rounded-xl p-6 h-32"></div>
          ))}
        </div>
        <div className="bg-zinc-900/50 rounded-xl p-6 h-96"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error Loading Portfolio
          </h3>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summary.total_balance_usd)}
              </p>
              <p className="text-sm text-zinc-400">Total Balance</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  summary.total_pnl_usd >= 0
                    ? "bg-emerald-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {summary.total_pnl_usd >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p
                className={`text-2xl font-bold ${
                  summary.total_pnl_usd >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCurrency(summary.total_pnl_usd)}
              </p>
              <p className="text-sm text-zinc-400">Total P&L</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {summary.total_active_positions}
              </p>
              <p className="text-sm text-zinc-400">Active Positions</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {summary.total_portfolios}
              </p>
              <p className="text-sm text-zinc-400">Portfolios</p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio List */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl">
        <div className="p-6 border-b border-zinc-800/40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Your Portfolios
            </h2>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="divide-y divide-zinc-800/40">
          {Array.isArray(portfolios) &&
            portfolios.map((portfolio) => {
              const syncStatus = getLastSyncStatus(portfolio.last_sync_at);
              const isRecentlyUpdated =
                new Date(portfolio.updated_at).getTime() >
                Date.now() - 5 * 60 * 1000;

              return (
                <div
                  key={portfolio.id}
                  className="p-6 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {portfolio.exchange_platform
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {portfolio.exchange_platform} Portfolio
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>ID: {portfolio.id}</span>
                          <span>•</span>
                          <span className={syncStatus.color}>
                            Last sync: {syncStatus.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(portfolio.account_balance_usd)}
                        </p>
                        <p className="text-sm text-zinc-400">Balance</p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            portfolio.total_pnl_usd >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatCurrency(portfolio.total_pnl_usd)}
                        </p>
                        <p className="text-sm text-zinc-400">P&L</p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-medium">
                          {portfolio.active_positions_count}
                        </p>
                        <p className="text-sm text-zinc-400">Positions</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            portfolio.active_positions_count > 0
                              ? "bg-emerald-400"
                              : "bg-zinc-600"
                          }`}
                        />

                        <button
                          onClick={() => syncPortfolio(portfolio.id)}
                          disabled={syncingPortfolios.has(portfolio.id)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                          title="Sync Portfolio"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              syncingPortfolios.has(portfolio.id)
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!Array.isArray(portfolios) || portfolios.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Portfolios Found
            </h3>
            <p className="text-zinc-400">
              Connect your exchange keys to start tracking your portfolios.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
