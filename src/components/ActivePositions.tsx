"use client";

import { useEffect, useState } from "react";
import { PositionsOverview, Position } from "@/types/portfolio";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export function ActivePositions() {
  const [positionsData, setPositionsData] = useState<PositionsOverview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSide, setSelectedSide] = useState<string>("");
  const [minValue, setMinValue] = useState<number | null>(null);
  const [includeClosed, setIncludeClosed] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, [selectedSide, minValue, includeClosed]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedSide) params.append("side", selectedSide);
      if (minValue) params.append("min_value_usd", minValue.toString());
      params.append("include_closed", includeClosed.toString());

      const response = await fetch(
        `/api/portfolio/positions/overview?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }

      const data = await response.json();
      setPositionsData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch positions"
      );
    } finally {
      setLoading(false);
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

  const calculatePnLPercent = (position: Position) => {
    if (position.entry_price === 0) return 0;
    const pnlPercent =
      ((position.current_price - position.entry_price) / position.entry_price) *
      100;
    return position.side === "SHORT" ? -pnlPercent : pnlPercent;
  };

  const filteredPositions =
    positionsData?.positions.filter((position) =>
      position.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
            Error Loading Positions
          </h3>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={fetchPositions}
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
      {positionsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {positionsData.total_positions}
              </p>
              <p className="text-sm text-zinc-400">Total Positions</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {formatCurrency(positionsData.total_value_usd)}
              </p>
              <p className="text-sm text-zinc-400">Total Value</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  positionsData.total_unrealized_pnl_usd >= 0
                    ? "bg-emerald-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {positionsData.total_unrealized_pnl_usd >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p
                className={`text-2xl font-bold ${
                  positionsData.total_unrealized_pnl_usd >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCurrency(positionsData.total_unrealized_pnl_usd)}
              </p>
              <p className="text-sm text-zinc-400">Unrealized P&L</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm">
                  {positionsData.profitable_positions}↑
                </span>
                <span className="text-red-400 text-sm">
                  {positionsData.losing_positions}↓
                </span>
              </div>
              <p className="text-sm text-zinc-400">Profitable / Losing</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Filters</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm"
            />
          </div>

          <select
            value={selectedSide}
            onChange={(e) => setSelectedSide(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value="">All Sides</option>
            <option value="LONG">Long Only</option>
            <option value="SHORT">Short Only</option>
          </select>

          <input
            type="number"
            placeholder="Min Value ($)"
            value={minValue || ""}
            onChange={(e) =>
              setMinValue(e.target.value ? parseFloat(e.target.value) : null)
            }
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm w-32"
          />

          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={includeClosed}
              onChange={(e) => setIncludeClosed(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
            />
            Include Closed
          </label>

          <button
            onClick={fetchPositions}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl">
        <div className="p-6 border-b border-zinc-800/40">
          <h2 className="text-lg font-semibold text-white">Active Positions</h2>
        </div>

        {filteredPositions.length > 0 ? (
          <div className="divide-y divide-zinc-800/40">
            {filteredPositions.map((position) => {
              const pnlPercent = calculatePnLPercent(position);
              const isProfit = position.unrealized_pnl_usd >= 0;

              return (
                <div
                  key={position.id}
                  className="p-6 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${
                          position.side === "LONG"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {position.side === "LONG" ? "L" : "S"}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-medium text-lg">
                            {position.symbol}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              position.side === "LONG"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {position.side}
                          </span>
                          {position.is_closed && (
                            <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full text-xs font-medium">
                              CLOSED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                          <span>Size: {position.size.toFixed(4)}</span>
                          <span>Leverage: {position.leverage}x</span>
                          <span>
                            Opened:{" "}
                            {new Date(position.opened_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(position.entry_price)}
                        </p>
                        <p className="text-sm text-zinc-400">Entry Price</p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(position.current_price)}
                        </p>
                        <p className="text-sm text-zinc-400">Current Price</p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(position.value_usd)}
                        </p>
                        <p className="text-sm text-zinc-400">Position Value</p>
                      </div>

                      <div className="text-right min-w-[120px]">
                        <p
                          className={`font-medium text-lg ${
                            isProfit ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(position.unrealized_pnl_usd)}
                        </p>
                        <p
                          className={`text-sm ${
                            isProfit ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          ({formatPercent(pnlPercent)})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Positions Found
            </h3>
            <p className="text-zinc-400">
              {searchTerm || selectedSide || minValue
                ? "No positions match your current filters."
                : "You don't have any active positions."}
            </p>
          </div>
        )}
      </div>

      {/* Long/Short Summary */}
      {positionsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-400">
                Long Positions
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Count</span>
                <span className="text-white font-medium">
                  {positionsData.long_positions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Profitable</span>
                <span className="text-emerald-400 font-medium">
                  {
                    filteredPositions.filter(
                      (p) => p.side === "LONG" && p.unrealized_pnl_usd > 0
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">
                Short Positions
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Count</span>
                <span className="text-white font-medium">
                  {positionsData.short_positions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Profitable</span>
                <span className="text-emerald-400 font-medium">
                  {
                    filteredPositions.filter(
                      (p) => p.side === "SHORT" && p.unrealized_pnl_usd > 0
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
