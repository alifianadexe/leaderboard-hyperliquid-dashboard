"use client";

import { useState, useEffect, useCallback } from "react";
import { Trader } from "@/types/api";
import {
  cn,
  formatCurrency,
  formatPercentage,
  formatAddress,
  formatTimeAgo,
} from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trophy,
  Users,
  DollarSign,
  Clock,
  Activity,
  Copy,
} from "lucide-react";
import { CreateCopySubscriptionModal } from "@/components/CreateCopySubscriptionModal";

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("trader_score"); // Updated default
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);

  // Pagination state
  const [currentPage] = useState(1);
  const [limit] = useState(50);

  // Filter state - keeping for future use
  // const [filters, setFilters] = useState({
  //   minWinRate: null as number | null,
  //   minVolume: null as number | null,
  //   minTrades: null as number | null,
  //   onlyProfitable: false,
  //   excludeNewTraders: false,
  // });

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        sort_by: sortBy,
        order: sortOrder,
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add filters if they have values - commented out for now
      // if (filters.minWinRate !== null)
      //   params.append("min_win_rate", filters.minWinRate.toString());
      // if (filters.minVolume !== null)
      //   params.append("min_volume", filters.minVolume.toString());
      // if (filters.minTrades !== null)
      //   params.append("min_trades", filters.minTrades.toString());
      // if (filters.onlyProfitable) params.append("only_profitable", "true");
      // if (filters.excludeNewTraders)
      //   params.append("exclude_new_traders", "true");

      const response = await fetch(`/api/leaderboard?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      // Handle the new paginated API response format
      let tradersArray = [];
      // let paginationData: Record<string, unknown> = {};

      if (Array.isArray(data)) {
        // Legacy format (direct array)
        tradersArray = data;
        // setTotalCount(data.length);
        // setTotalPages(1);
      } else if (data && Array.isArray(data.traders)) {
        // New paginated format with traders array
        tradersArray = data.traders;
        // paginationData = data;
      } else if (data && Array.isArray(data.data)) {
        // Alternative paginated format with data array
        tradersArray = data.data;
        // paginationData = data;
      } else if (data && Array.isArray(data.items)) {
        // Another possible paginated format
        tradersArray = data.items;
        // paginationData = data;
      } else {
        console.warn("Unexpected API response format:", data);
        tradersArray = [];
      }

      // Update pagination state if available - keeping for future use
      // if (paginationData.total_count !== undefined)
      //   setTotalCount(paginationData.total_count as number);
      // if (paginationData.total_pages !== undefined)
      //   setTotalPages(paginationData.total_pages as number);
      // if (paginationData.page !== undefined)
      //   setCurrentPage(paginationData.page as number);

      setTraders(tradersArray);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch leaderboard"
      );
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, currentPage, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "desc" ? (
      <TrendingDown className="w-3 h-3 ml-1" />
    ) : (
      <TrendingUp className="w-3 h-3 ml-1" />
    );
  };

  const handleCopyTrader = (trader: Trader) => {
    setSelectedTrader(trader);
    setShowCopyModal(true);
  };

  if (loading) {
    return (
      <div
        className={cn(
          "bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl",
          className
        )}
      >
        <div className="px-8 py-6 border-b border-zinc-800/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Top Traders
                </h2>
                <p className="text-sm text-zinc-400">
                  Loading performance data...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-500/10 border border-zinc-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse"></div>
                <span className="text-xs font-medium text-zinc-500">
                  Loading
                </span>
              </div>
            </div>
          </div>

          {/* Loading Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-zinc-800/40 to-zinc-800/20 border border-zinc-700/50 rounded-xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-700/50"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-zinc-700/50 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-zinc-700/50 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-3 animate-pulse"
              >
                <div className="w-8 h-6 bg-zinc-800 rounded"></div>
                <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-zinc-800 rounded w-16"></div>
                </div>
                <div className="w-16 h-4 bg-zinc-800 rounded"></div>
                <div className="w-20 h-4 bg-zinc-800 rounded"></div>
                <div className="w-24 h-4 bg-zinc-800 rounded"></div>
                <div className="w-12 h-4 bg-zinc-800 rounded"></div>
                <div className="w-16 h-4 bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "bg-zinc-900/60 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-2xl",
          className
        )}
      >
        <div className="px-8 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-red-400 mb-2">
            Error Loading Leaderboard
          </h3>
          <p className="text-red-300/80 mb-8 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="inline-flex items-center gap-3 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl transition-all duration-200 font-medium hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="px-8 py-8 border-b border-zinc-800/40">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Top Traders
              </h2>
              <p className="text-sm text-zinc-500">
                Real-time performance rankings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="p-3 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/40 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Active Traders
            </p>
            <p className="text-2xl font-bold text-white monospace">
              {traders.length}
            </p>
          </div>
          <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Total Volume
            </p>
            <p className="text-2xl font-bold text-white monospace">
              {Array.isArray(traders) && traders.length > 0
                ? formatCurrency(
                    traders.reduce(
                      (sum, t) => sum + (t.total_volume_usd || 0),
                      0
                    )
                  )
                : formatCurrency(0)}
            </p>
          </div>
          <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Avg Win Rate
            </p>
            <p className="text-2xl font-bold text-emerald-400 monospace">
              {Array.isArray(traders) && traders.length > 0
                ? formatPercentage(
                    traders.reduce((sum, t) => sum + (t.win_rate || 0), 0) /
                      traders.length
                  )
                : "0%"}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section - Add spacing above */}
      <div className="pt-6">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800/20 border-b border-zinc-800/30">
                  <th className="text-center py-6 px-6 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Rank
                    </div>
                  </th>
                  <th className="text-left py-6 px-6 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                    Trader
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("win_rate")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Win Rate
                      {getSortIcon("win_rate")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("total_volume_usd")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Volume
                      {getSortIcon("total_volume_usd")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("max_profit_usd")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Max Profit
                      {getSortIcon("max_profit_usd")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("avg_risk_ratio")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Avg Risk Ratio
                      {getSortIcon("avg_risk_ratio")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("max_drawdown")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Max Drawdown
                      {getSortIcon("max_drawdown")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("max_loss_usd")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Max Loss
                      {getSortIcon("max_loss_usd")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6">
                    <button
                      onClick={() => handleSort("trader_score")}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-200 uppercase tracking-widest"
                    >
                      Score
                      {getSortIcon("trader_score")}
                    </button>
                  </th>
                  <th className="text-center py-6 px-6 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                    Age
                  </th>
                  <th className="text-center py-6 px-6 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated
                    </div>
                  </th>
                  <th className="text-center py-6 px-6 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/20 space-y-1">
                {Array.isArray(traders) &&
                  traders.map((trader, index) => (
                    <tr
                      key={trader.trader_id}
                      className="hover:bg-zinc-800/10 transition-all duration-200 group"
                    >
                      <td className="py-5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative">
                            <span className="text-lg font-bold text-zinc-200 monospace">
                              {index + 1}
                            </span>
                            {index < 3 && (
                              <div
                                className={`absolute -top-1 -right-3 w-2 h-2 rounded-full ${
                                  index === 0
                                    ? "bg-yellow-400"
                                    : index === 1
                                    ? "bg-zinc-300"
                                    : "bg-amber-600"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0">
                            {trader.trader_address.slice(2, 4).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white monospace group-hover:text-emerald-400 transition-colors truncate">
                              {formatAddress(trader.trader_address)}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                              ID: {trader.trader_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-bold monospace border ${
                            trader.win_rate >= 0.6
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : trader.win_rate >= 0.4
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          {formatPercentage(trader.win_rate)}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-sm font-semibold text-zinc-200 monospace">
                          {formatCurrency(trader.total_volume_usd)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-sm font-bold text-emerald-400 monospace">
                          {formatCurrency(trader.max_profit_usd)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-sm font-semibold text-zinc-200 monospace">
                          {trader.avg_risk_ratio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-sm font-semibold text-red-400 monospace">
                          {formatPercentage(trader.max_drawdown)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-sm font-semibold text-red-400 monospace">
                          {formatCurrency(trader.max_loss_usd)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-sm font-bold text-blue-400 monospace">
                          {trader.trader_score
                            ? trader.trader_score.toFixed(2)
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-zinc-800/30 rounded-md text-sm text-zinc-300 monospace">
                          {trader.account_age_days}d
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-xs text-zinc-500">
                          {formatTimeAgo(trader.updated_at)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => handleCopyTrader(trader)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                          title="Copy this trader"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {traders.length === 0 && !loading && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <Users className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-400 mb-2">
            No Traders Found
          </h3>
          <p className="text-zinc-500">The leaderboard is currently empty.</p>
        </div>
      )}

      {/* Copy Trading Modal */}
      {showCopyModal && selectedTrader && (
        <CreateCopySubscriptionModal
          selectedTrader={selectedTrader}
          onClose={() => {
            setShowCopyModal(false);
            setSelectedTrader(null);
          }}
          onCreated={() => {
            setShowCopyModal(false);
            setSelectedTrader(null);
            // Optionally show success message
          }}
        />
      )}
    </div>
  );
}
