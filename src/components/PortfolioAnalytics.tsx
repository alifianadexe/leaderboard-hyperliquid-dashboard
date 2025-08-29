"use client";

import { useEffect, useState } from "react";
import {
  PnLAnalysis,
  CopyTradingPerformance,
  Portfolio,
} from "@/types/portfolio";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";

export function PortfolioAnalytics() {
  const [pnlAnalysis, setPnLAnalysis] = useState<PnLAnalysis | null>(null);
  const [copyTradingPerf, setCopyTradingPerf] =
    useState<CopyTradingPerformance | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(
    null
  );
  const [periodDays, setPeriodDays] = useState(30);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPortfolio, periodDays]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();

      console.log("Portfolios data in Analytics:", data);
      console.log("Is array:", Array.isArray(data));

      // Handle different response structures
      if (Array.isArray(data)) {
        setPortfolios(data);
      } else if (data.portfolios && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios);
      } else {
        setPortfolios([]);
        console.warn(
          "Unexpected portfolios data structure in Analytics:",
          data
        );
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
      setPortfolios([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const pnlParams = new URLSearchParams();
      if (selectedPortfolio)
        pnlParams.append("portfolio_id", selectedPortfolio.toString());
      pnlParams.append("period_days", periodDays.toString());

      const [pnlRes, copyRes] = await Promise.all([
        fetch(`/api/portfolio/analysis/pnl?${pnlParams}`),
        fetch("/api/portfolio/copy-trading/performance"),
      ]);

      if (!pnlRes.ok) throw new Error("Failed to fetch P&L analysis");

      const pnlData = await pnlRes.json();
      setPnLAnalysis(pnlData);

      if (copyRes.ok) {
        const copyData = await copyRes.json();
        setCopyTradingPerf(copyData);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
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
    }).format(value || 0);
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return "0.00%";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-900/50 rounded-xl p-6 h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 rounded-xl p-6 h-96"></div>
          <div className="bg-zinc-900/50 rounded-xl p-6 h-96"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
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
      {/* Filters */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Filters</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Portfolio:</label>
            <select
              value={selectedPortfolio || ""}
              onChange={(e) =>
                setSelectedPortfolio(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              <option value="">All Portfolios</option>
              {Array.isArray(portfolios) &&
                portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.exchange_platform}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Period:</label>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(parseInt(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={365}>1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* P&L Analysis Cards */}
      {pnlAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pnlAnalysis.total_pnl_usd >= 0
                    ? "bg-emerald-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {pnlAnalysis.total_pnl_usd >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p
                className={`text-2xl font-bold ${
                  pnlAnalysis.total_pnl_usd >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCurrency(pnlAnalysis.total_pnl_usd)}
              </p>
              <p className="text-sm text-zinc-400">Total P&L ({periodDays}d)</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {formatPercent(pnlAnalysis.win_rate)}
              </p>
              <p className="text-sm text-zinc-400">Win Rate</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {pnlAnalysis.profit_factor !== undefined
                  ? pnlAnalysis.profit_factor.toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-sm text-zinc-400">Profit Factor</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-400">
                {formatPercent(pnlAnalysis.max_drawdown_percent)}
              </p>
              <p className="text-sm text-zinc-400">Max Drawdown</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trading Statistics */}
        {pnlAnalysis && (
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Trading Statistics
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-zinc-800/30 rounded-lg">
                <span className="text-zinc-400">Total Trades</span>
                <span className="text-white font-medium">
                  {pnlAnalysis.total_trades || 0}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-emerald-400 font-medium">
                    {pnlAnalysis.winning_trades || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Winning Trades</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 font-medium">
                    {pnlAnalysis.losing_trades || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Losing Trades</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-emerald-400 font-medium">
                    {pnlAnalysis.largest_win_usd !== undefined
                      ? formatCurrency(pnlAnalysis.largest_win_usd)
                      : "$0.00"}
                  </p>
                  <p className="text-sm text-zinc-400">Largest Win</p>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-red-400 font-medium">
                    {pnlAnalysis.largest_loss_usd !== undefined
                      ? formatCurrency(pnlAnalysis.largest_loss_usd)
                      : "$0.00"}
                  </p>
                  <p className="text-sm text-zinc-400">Largest Loss</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-white font-medium">
                    {pnlAnalysis.average_win_usd !== undefined
                      ? formatCurrency(pnlAnalysis.average_win_usd)
                      : "$0.00"}
                  </p>
                  <p className="text-sm text-zinc-400">Avg Win</p>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-white font-medium">
                    {pnlAnalysis.average_loss_usd !== undefined
                      ? formatCurrency(Math.abs(pnlAnalysis.average_loss_usd))
                      : "$0.00"}
                  </p>
                  <p className="text-sm text-zinc-400">Avg Loss</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copy Trading Performance */}
        {copyTradingPerf && (
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Copy Trading Performance
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-zinc-800/30 rounded-lg">
                <span className="text-zinc-400">Active Subscriptions</span>
                <span className="text-white font-medium">
                  {copyTradingPerf.total_subscriptions || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-zinc-800/30 rounded-lg">
                <span className="text-zinc-400">Total Copied Trades</span>
                <span className="text-white font-medium">
                  {copyTradingPerf.total_copied_trades || 0}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-emerald-400 font-medium">
                    {copyTradingPerf.successful_trades || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Successful</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 font-medium">
                    {copyTradingPerf.failed_trades || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Failed</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-800/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-400">Total P&L</span>
                  <span
                    className={`font-medium ${
                      (copyTradingPerf.total_pnl_usd || 0) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {copyTradingPerf.total_pnl_usd !== undefined
                      ? formatCurrency(copyTradingPerf.total_pnl_usd)
                      : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Win Rate</span>
                  <span className="text-white font-medium">
                    {formatPercent(copyTradingPerf.win_rate)}
                  </span>
                </div>
              </div>

              {copyTradingPerf.best_performing_subscription && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-emerald-400 font-medium mb-1">
                    Best Performing
                  </p>
                  <p className="text-xs text-zinc-400 mb-2">
                    {copyTradingPerf.best_performing_subscription.master_trader_address.slice(
                      0,
                      8
                    )}
                    ...
                  </p>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 text-sm">
                      {formatCurrency(
                        copyTradingPerf.best_performing_subscription.pnl_usd
                      )}
                    </span>
                    <span className="text-emerald-400 text-sm">
                      {formatPercent(
                        copyTradingPerf.best_performing_subscription.win_rate
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Daily P&L Chart Placeholder */}
      {pnlAnalysis &&
        pnlAnalysis.daily_pnl &&
        Array.isArray(pnlAnalysis.daily_pnl) &&
        pnlAnalysis.daily_pnl.length > 0 && (
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily P&L Trend
            </h3>

            <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">
                  Chart visualization would go here
                </p>
                <p className="text-sm text-zinc-500">
                  Showing {pnlAnalysis.daily_pnl.length} data points over{" "}
                  {periodDays} days
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
