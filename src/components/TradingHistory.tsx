"use client";

import { useEffect, useState } from "react";
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

// Extended interfaces to handle actual API response structure
interface ApiTrade {
  id: number;
  exchange_trade_id: string;
  exchange_order_id: string;
  symbol: string;
  side: "BUY" | "SELL";
  trade_type: string;
  size: number;
  price: number;
  fee_usd: number;
  realized_pnl_usd: number;
  is_closing_trade: boolean;
  is_copy_trade: boolean;
  copy_info?: {
    copy_subscription_id: number;
    master_trader_address: string;
    copy_trade_execution_id: number;
  } | null;
  executed_at: string;
  created_at: string;
}

interface ApiTradeHistoryResponse {
  trades: ApiTrade[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary: {
    total_trades: number;
    copy_trades: number;
    manual_trades: number;
  };
  filters_applied: {
    portfolio_id: number | null;
    symbol: string | null;
    copy_trades_only: boolean | null;
    start_date: string | null;
    end_date: string | null;
  };
}

// Normalized trade interface for component use
interface NormalizedTrade {
  id: number;
  portfolio_id?: number;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  price: number;
  value_usd: number;
  fee_usd: number;
  pnl_usd?: number;
  is_copy_trade: boolean;
  copy_subscription_id?: number;
  master_trader_address?: string;
  executed_at: string;
  created_at: string;
}

interface NormalizedTradeHistoryResponse {
  trades: NormalizedTrade[];
  total_count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Extended portfolio interface to handle different API response structures
interface ExtendedPortfolio {
  id: number;
  user_id?: string;
  exchange_key_id?: number;
  exchange_platform?: string;
  exchange_info?: {
    platform: string;
    nickname: string;
    exchange_key_id: number;
  };
  account_balance_usd: number;
  total_pnl_usd: number;
  unrealized_pnl_usd?: number;
  realized_pnl_usd?: number;
  margin_used_usd?: number;
  margin_available_usd?: number;
  active_positions_count: number;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
}

export function TradingHistory() {
  const [tradeHistory, setTradeHistory] = useState<NormalizedTradeHistoryResponse | null>(
    null
  );
  const [portfolios, setPortfolios] = useState<ExtendedPortfolio[]>([]);
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

  // Normalize portfolio data similar to other components
  const normalizePortfolio = (portfolio: any): ExtendedPortfolio => ({
    id: portfolio.id,
    user_id: portfolio.user_id,
    exchange_key_id: portfolio.exchange_info?.exchange_key_id || portfolio.exchange_key_id,
    exchange_platform: portfolio.exchange_info?.platform || portfolio.exchange_platform || "Exchange",
    exchange_info: portfolio.exchange_info,
    account_balance_usd: portfolio.balance?.total_usd || portfolio.account_balance_usd || 0,
    total_pnl_usd: portfolio.pnl?.total_usd || portfolio.total_pnl_usd || 0,
    unrealized_pnl_usd: portfolio.pnl?.unrealized_usd || portfolio.unrealized_pnl_usd || 0,
    realized_pnl_usd: portfolio.pnl?.realized_usd || portfolio.realized_pnl_usd || 0,
    margin_used_usd: portfolio.balance?.margin_used_usd || portfolio.margin_used_usd || 0,
    margin_available_usd: portfolio.balance?.available_usd || portfolio.margin_available_usd || 0,
    active_positions_count: portfolio.positions_count || portfolio.active_positions_count || 0,
    last_sync_at: portfolio.last_updated || portfolio.last_sync_at || new Date().toISOString(),
    created_at: portfolio.created_at || new Date().toISOString(),
    updated_at: portfolio.last_updated || portfolio.updated_at || new Date().toISOString(),
  });

  // Normalize API response to component format
  const normalizeTradeHistoryData = (apiData: ApiTradeHistoryResponse): NormalizedTradeHistoryResponse => {
    const normalizedTrades: NormalizedTrade[] = apiData.trades.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      size: trade.size,
      price: trade.price,
      value_usd: trade.size * trade.price, // Calculate value from size * price
      fee_usd: trade.fee_usd,
      pnl_usd: trade.realized_pnl_usd !== 0 ? trade.realized_pnl_usd : undefined,
      is_copy_trade: trade.is_copy_trade,
      copy_subscription_id: trade.copy_info?.copy_subscription_id,
      master_trader_address: trade.copy_info?.master_trader_address,
      executed_at: trade.executed_at,
      created_at: trade.created_at,
    }));

    return {
      trades: normalizedTrades,
      total_count: apiData.pagination.total_count,
      page: apiData.pagination.page,
      total_pages: apiData.pagination.total_pages,
      has_next: apiData.pagination.has_next,
      has_prev: apiData.pagination.has_prev,
    };
  };

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();

      console.log("Portfolios data in Trading History:", data);
      console.log("Is array:", Array.isArray(data));

      // Handle different response structures
      if (Array.isArray(data)) {
        setPortfolios(data.map(normalizePortfolio));
      } else if (data.portfolios && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios.map(normalizePortfolio));
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

      const apiData: ApiTradeHistoryResponse = await response.json();
      console.log("Trade History API Data:", apiData);
      
      const normalizedData = normalizeTradeHistoryData(apiData);
      console.log("Normalized Trade History Data:", normalizedData);
      
      setTradeHistory(normalizedData);
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
