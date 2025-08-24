"use client";

import { useState, useEffect } from "react";
import {
  XCircle,
  Search,
  Copy,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { CopySubscriptionCreate, RiskSettings } from "@/types/copytrading";
import { ExchangeKey } from "@/types/exchange";
import { Trader } from "@/types/api";
import { formatCurrency, formatPercentage, formatAddress } from "@/lib/utils";

interface CreateCopySubscriptionModalProps {
  onClose: () => void;
  onCreated: () => void;
  selectedTrader?: Trader;
}

export function CreateCopySubscriptionModal({
  onClose,
  onCreated,
  selectedTrader,
}: CreateCopySubscriptionModalProps) {
  const [step, setStep] = useState<"trader" | "exchange" | "risk">(
    selectedTrader ? "exchange" : "trader"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [selectedTraderState, setSelectedTraderState] = useState<Trader | null>(
    selectedTrader || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [traders, setTraders] = useState<Trader[]>([]);
  const [exchangeKeys, setExchangeKeys] = useState<ExchangeKey[]>([]);
  const [selectedExchangeKey, setSelectedExchangeKey] =
    useState<ExchangeKey | null>(null);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    copy_method: "AUTOMATIC",
    size_multiplier: 0.1,
    max_position_size_usd: 500,
  });

  // Load traders for search
  const fetchTraders = async (query?: string) => {
    try {
      const response = await fetch(`/api/leaderboard?search=${query || ""}`);
      if (!response.ok) throw new Error("Failed to fetch traders");
      const data = await response.json();
      setTraders(data);
    } catch (err) {
      console.error("Failed to fetch traders:", err);
    }
  };

  // Load exchange keys
  const fetchExchangeKeys = async () => {
    try {
      const response = await fetch("/api/user/exchange-keys");
      if (!response.ok) throw new Error("Failed to fetch exchange keys");
      const data = await response.json();
      setExchangeKeys(data);
    } catch (err) {
      console.error("Failed to fetch exchange keys:", err);
      setError(
        "Failed to load your exchange keys. Please add an exchange key first."
      );
    }
  };

  useEffect(() => {
    if (step === "trader" && !selectedTrader) {
      fetchTraders();
    }
    if (step === "exchange") {
      fetchExchangeKeys();
    }
  }, [step, selectedTrader]);

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        fetchTraders(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery]);

  const handleCreate = async () => {
    if (!selectedTraderState || !selectedExchangeKey) {
      setError("Please select both a trader and exchange key");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const createData: CopySubscriptionCreate = {
        trader_id: selectedTraderState.trader_id.toString(),
        master_trader_address: selectedTraderState.trader_address,
        platform: selectedExchangeKey.platform,
        exchange_key_id: selectedExchangeKey.id,
        risk_settings: riskSettings,
      };

      const response = await fetch("/api/user/copy-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subscription");
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Subscribe to Copy Trading
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { id: "trader", label: "Select Trader", active: step === "trader" },
            {
              id: "exchange",
              label: "Choose Exchange",
              active: step === "exchange",
            },
            { id: "risk", label: "Risk Settings", active: step === "risk" },
          ].map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepItem.active
                    ? "bg-blue-600 text-white"
                    : step === "exchange" && stepItem.id === "trader"
                    ? "bg-green-600 text-white"
                    : step === "risk" &&
                      (stepItem.id === "trader" || stepItem.id === "exchange")
                    ? "bg-green-600 text-white"
                    : "bg-zinc-700 text-zinc-400"
                }`}
              >
                {stepItem.active ||
                (step === "exchange" && stepItem.id === "trader") ||
                (step === "risk" &&
                  (stepItem.id === "trader" || stepItem.id === "exchange")) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  stepItem.active ? "text-white" : "text-zinc-400"
                }`}
              >
                {stepItem.label}
              </span>
              {index < 2 && <div className="w-8 h-px bg-zinc-700" />}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Step Content */}
        {step === "trader" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Search for a Trader
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by address or trader ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {traders.map((trader) => (
                <button
                  key={trader.trader_id}
                  onClick={() => {
                    setSelectedTraderState(trader);
                    setStep("exchange");
                  }}
                  className="w-full p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl hover:bg-zinc-800/40 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                      {trader.trader_address.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">
                          {formatAddress(trader.trader_address)}
                        </h4>
                        <span className="text-xs text-zinc-500">
                          ID: {trader.trader_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-emerald-400">
                          Win Rate: {formatPercentage(trader.win_rate)}
                        </span>
                        <span className="text-zinc-400">
                          Volume: {formatCurrency(trader.total_volume_usd)}
                        </span>
                        <span className="text-blue-400">
                          Max Profit: {formatCurrency(trader.max_profit_usd)}
                        </span>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "exchange" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Selected Trader
              </h4>
              {selectedTraderState && (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                      {selectedTraderState.trader_address
                        .slice(2, 4)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">
                        {formatAddress(selectedTraderState.trader_address)}
                      </h5>
                      <div className="flex items-center gap-3 text-sm text-zinc-400">
                        <span className="text-emerald-400">
                          {formatPercentage(selectedTraderState.win_rate)} Win
                          Rate
                        </span>
                        <span>
                          {formatCurrency(selectedTraderState.total_volume_usd)}{" "}
                          Volume
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Choose Exchange Key
              </label>
              <div className="grid gap-3">
                {exchangeKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No Exchange Keys Found
                    </h3>
                    <p className="text-zinc-400 mb-4">
                      You need to add an exchange API key before subscribing to
                      copy trading.
                    </p>
                    <a
                      href="/exchange-keys"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Add Exchange Key
                    </a>
                  </div>
                ) : (
                  exchangeKeys.map((key) => (
                    <button
                      key={key.id}
                      onClick={() => {
                        setSelectedExchangeKey(key);
                        setStep("risk");
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedExchangeKey?.id === key.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {key.platform.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            {key.nickname ||
                              key.platform.charAt(0).toUpperCase() +
                                key.platform.slice(1)}
                          </h5>
                          <p className="text-sm text-zinc-400 font-mono">
                            {key.api_key_masked}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Platform: {key.platform.toUpperCase()}
                          </p>
                        </div>
                        {key.is_active && (
                          <span className="ml-auto px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {step === "risk" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Risk Management Settings
              </h4>
            </div>

            {/* Copy Method */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Copy Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setRiskSettings((prev) => ({
                      ...prev,
                      copy_method: "AUTOMATIC",
                    }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    riskSettings.copy_method === "AUTOMATIC"
                      ? "border-green-500 bg-green-500/10"
                      : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
                  }`}
                >
                  <div className="text-sm font-medium text-white mb-2">
                    Automatic
                  </div>
                  <div className="text-xs text-zinc-400">
                    Copy trades as-is with size multiplier only
                  </div>
                </button>
                <button
                  onClick={() =>
                    setRiskSettings((prev) => ({
                      ...prev,
                      copy_method: "MANUAL",
                      trigger_limit_percent: 3,
                      tp_percent: 20,
                      sl_percent: 7,
                    }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    riskSettings.copy_method === "MANUAL"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
                  }`}
                >
                  <div className="text-sm font-medium text-white mb-2">
                    Manual
                  </div>
                  <div className="text-xs text-zinc-400">
                    Set custom TP/SL and trigger limits
                  </div>
                </button>
              </div>
            </div>

            {/* Common Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Size Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  value={riskSettings.size_multiplier}
                  onChange={(e) =>
                    setRiskSettings((prev) => ({
                      ...prev,
                      size_multiplier: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Percentage of the original trade size (0.01 = 1%)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max Position Size (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  value={riskSettings.max_position_size_usd}
                  onChange={(e) =>
                    setRiskSettings((prev) => ({
                      ...prev,
                      max_position_size_usd: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Maximum position size limit
                </p>
              </div>
            </div>

            {/* Manual Settings */}
            {riskSettings.copy_method === "MANUAL" && (
              <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <h5 className="font-medium text-white">Manual Risk Controls</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Trigger Limit %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={riskSettings.trigger_limit_percent || 3}
                      onChange={(e) =>
                        setRiskSettings((prev) => ({
                          ...prev,
                          trigger_limit_percent: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Take Profit %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={riskSettings.tp_percent || 20}
                      onChange={(e) =>
                        setRiskSettings((prev) => ({
                          ...prev,
                          tp_percent: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Stop Loss %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={riskSettings.sl_percent || 7}
                      onChange={(e) =>
                        setRiskSettings((prev) => ({
                          ...prev,
                          sl_percent: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {step !== "trader" && (
              <button
                onClick={() =>
                  setStep(
                    step === "risk"
                      ? "exchange"
                      : step === "exchange"
                      ? "trader"
                      : "trader"
                  )
                }
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {step === "risk" && (
              <button
                onClick={handleCreate}
                disabled={
                  loading || !selectedTraderState || !selectedExchangeKey
                }
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Subscribe to Trader
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
