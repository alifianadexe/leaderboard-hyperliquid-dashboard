"use client";

import { useEffect, useState } from "react";
import { TradeHistoryResponse, Trade, Portfolio } from "@/types/portfolio";
import {
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Copy,
} from "lucide-react";

export function TradingHistory() {
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryResponse | null>(
    null
  );
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(
    null
  );
  const [searchSymbol, setSearchSymbol] = useState("");
  const [copyTradesOnly, setCopyTradesOnly] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    fetchTradeHistory();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [selectedPortfolio, searchSymbol, copyTradesOnly, startDate, endDate]);

  useEffect(() => {
    fetchTradeHistory();
  }, [currentPage, limit]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();

      console.log("Portfolios data in Trading History:", data);
      console.log("Is array:", Array.isArray(data));

      // Handle different response structures
      if (Array.isArray(data)) {
        setPortfolios(data);
      } else if (data.portfolios && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios);
      } else {
        setPortfolios([]);
        console.warn(
          "Unexpected portfolios data structure in Trading History:",
          data
        );
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
      setPortfolios([]);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedPortfolio)
        params.append("portfolio_id", selectedPortfolio.toString());
      if (searchSymbol) params.append("symbol", searchSymbol);
      if (copyTradesOnly) params.append("copy_trades_only", "true");
      if (startDate)
        params.append("start_date", new Date(startDate).toISOString());
      if (endDate) params.append("end_date", new Date(endDate).toISOString());
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`/api/portfolio/trades/history?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch trade history");
      }

      const data = await response.json();
      setTradeHistory(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trade history"
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

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTradeTypeColor = (side: string) => {
    return side === "BUY"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getPnLColor = (pnl: number | undefined) => {
    if (pnl === undefined) return "text-zinc-400";
    return pnl >= 0 ? "text-emerald-400" : "text-red-400";
  };

  if (loading && !tradeHistory) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="bg-zinc-900/50 rounded-xl p-6 h-32"></div>
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
            Error Loading Trade History
          </h3>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={fetchTradeHistory}
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
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Filters</span>
          </div>

          <select
            value={selectedPortfolio || ""}
            onChange={(e) =>
              setSelectedPortfolio(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value="">All Portfolios</option>
            {Array.isArray(portfolios) &&
              portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.exchange_platform}
                </option>
              ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-48"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={copyTradesOnly}
              onChange={(e) => setCopyTradesOnly(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
            />
            Copy Trades Only
          </label>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Date Range:</span>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm"
          />

          <span className="text-zinc-400">to</span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm"
          />

          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSearchSymbol("");
              setSelectedPortfolio(null);
              setCopyTradesOnly(false);
            }}
            className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>

          <button
            onClick={fetchTradeHistory}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Trade History Table */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl">
        <div className="p-6 border-b border-zinc-800/40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Trading History
            </h2>
            {tradeHistory && (
              <p className="text-sm text-zinc-400">
                Showing {tradeHistory.trades.length} of{" "}
                {tradeHistory.total_count} trades
              </p>
            )}
          </div>
        </div>

        {tradeHistory && tradeHistory.trades.length > 0 ? (
          <>
            <div className="divide-y divide-zinc-800/40">
              {tradeHistory.trades.map((trade) => (
                <div
                  key={trade.id}
                  className="p-6 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-medium text-lg">
                            {trade.symbol}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getTradeTypeColor(
                              trade.side
                            )}`}
                          >
                            {trade.side}
                          </span>
                          {trade.is_copy_trade && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              Copy Trade
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>Size: {trade.size.toFixed(4)}</span>
                          <span>Fee: {formatCurrency(trade.fee_usd)}</span>
                          <span>
                            {new Date(trade.executed_at).toLocaleString()}
                          </span>
                          {trade.is_copy_trade &&
                            trade.master_trader_address && (
                              <span>
                                Master:{" "}
                                {formatAddress(trade.master_trader_address)}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(trade.price)}
                        </p>
                        <p className="text-sm text-zinc-400">Price</p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(trade.value_usd)}
                        </p>
                        <p className="text-sm text-zinc-400">Value</p>
                      </div>

                      {trade.pnl_usd !== undefined && (
                        <div className="text-right min-w-[100px]">
                          <p
                            className={`font-medium ${getPnLColor(
                              trade.pnl_usd
                            )}`}
                          >
                            {formatCurrency(trade.pnl_usd)}
                          </p>
                          <p className="text-sm text-zinc-400">P&L</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {tradeHistory.total_pages > 1 && (
              <div className="p-6 border-t border-zinc-800/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">
                    Page {tradeHistory.page} of {tradeHistory.total_pages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!tradeHistory.has_prev}
                      className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:text-zinc-400 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-4 py-2 bg-zinc-800 rounded-lg text-sm text-white">
                      {tradeHistory.page}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!tradeHistory.has_next}
                      className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:text-zinc-400 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Trades Found
            </h3>
            <p className="text-zinc-400">
              {selectedPortfolio ||
              searchSymbol ||
              startDate ||
              endDate ||
              copyTradesOnly
                ? "No trades match your current filters."
                : "You don't have any trade history yet."}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {tradeHistory && tradeHistory.trades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Total Trades</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {tradeHistory.total_count}
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-400">
                Buy Orders
              </h3>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {tradeHistory.trades.filter((t) => t.side === "BUY").length}
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">
                Sell Orders
              </h3>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {tradeHistory.trades.filter((t) => t.side === "SELL").length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
