"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Plus,
  Trash2,
  Play,
  Pause,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  XCircle,
  BarChart3,
  Users,
  Settings,
  RefreshCw,
} from "lucide-react";
import {
  CopySubscription,
  CopySubscriptionSummary,
  RiskSettings,
} from "@/types/copytrading";
import {
  formatCurrency,
  formatPercentage,
  formatTimeAgo,
  formatAddress,
} from "@/lib/utils";
import { CreateCopySubscriptionModal } from "@/components/CreateCopySubscriptionModal";

interface CopySubscriptionsManagerProps {
  className?: string;
}

export function CopySubscriptionsManager({
  className,
}: CopySubscriptionsManagerProps) {
  const [summary, setSummary] = useState<CopySubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "paused" | "all">(
    "active"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<CopySubscription | null>(null);

  // Load subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/copy-subscriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch copy subscriptions");
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load copy subscriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Pause/Resume subscription
  const handlePauseResume = async (
    subscriptionId: number,
    isPaused: boolean
  ) => {
    try {
      const endpoint = isPaused ? "resume" : "pause";
      const response = await fetch(
        `/api/user/copy-subscriptions/${subscriptionId}/${endpoint}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${endpoint} subscription`
        );
      }

      await fetchSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update subscription"
      );
    }
  };

  // Delete subscription
  const handleDelete = async (subscriptionId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this copy trading subscription? This will cancel all pending orders and stop copying the trader."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/user/copy-subscriptions/${subscriptionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete subscription");
      }

      await fetchSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete subscription"
      );
    }
  };

  // Update subscription
  // Update subscription - keeping for future use
  // const handleUpdate = async (
  //   subscriptionId: number,
  //   updates: CopySubscriptionUpdate
  // ) => {
  //   try {
  //     const response = await fetch(
  //       `/api/user/copy-subscriptions/${subscriptionId}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(updates),
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Failed to update subscription");
  //     }

  //     await fetchSubscriptions();
  //     setEditingSubscription(null);
  //   } catch (err) {
  //     setError(
  //       err instanceof Error ? err.message : "Failed to update subscription"
  //     );
  //   }
  // };

  const getFilteredSubscriptions = () => {
    if (!summary) return [];

    switch (activeTab) {
      case "active":
        return summary.subscriptions.filter(
          (sub) => sub.is_active && !sub.is_paused
        );
      case "paused":
        return summary.subscriptions.filter((sub) => sub.is_paused);
      case "all":
        return summary.subscriptions;
      default:
        return summary.subscriptions;
    }
  };

  // Status color helper - keeping for future use
  // const getStatusColor = (subscription: CopySubscription) => {
  //   if (!subscription.is_active) return "text-gray-400";
  //   if (subscription.is_paused) return "text-yellow-400";
  //   return "text-green-400";
  // };

  const getStatusText = (subscription: CopySubscription) => {
    if (!subscription.is_active) return "Inactive";
    if (subscription.is_paused) return "Paused";
    return "Active";
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex items-center gap-3">
            <Copy className="w-6 h-6 text-blue-400" />
            <span className="text-zinc-400">Loading copy subscriptions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Copy Trading Subscriptions
              </h2>
              <p className="text-sm text-zinc-500">
                Manage your copy trading subscriptions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSubscriptions}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Subscribe to Trader
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Subscriptions</p>
                  <p className="text-lg font-bold text-white">
                    {summary.total_subscriptions}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Active</p>
                  <p className="text-lg font-bold text-green-400">
                    {summary.active_subscriptions}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total P&L</p>
                  <p
                    className={`text-lg font-bold ${
                      summary.total_pnl_usd >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(summary.total_pnl_usd)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Success Rate</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {summary.total_subscriptions > 0
                      ? formatPercentage(
                          summary.active_subscriptions /
                            summary.total_subscriptions
                        )
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mt-6 p-1 bg-zinc-800/40 rounded-lg">
          {[
            {
              id: "active",
              label: "Active",
              count: summary?.active_subscriptions || 0,
            },
            {
              id: "paused",
              label: "Paused",
              count:
                summary?.subscriptions.filter((s) => s.is_paused).length || 0,
            },
            {
              id: "all",
              label: "All",
              count: summary?.total_subscriptions || 0,
            },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "active" | "paused" | "all")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {getFilteredSubscriptions().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Copy className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                No Copy Trading Subscriptions
              </h3>
              <p className="text-zinc-500 mb-4">
                You haven&apos;t subscribed to any traders yet.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Subscribe to a Trader
              </button>
            </div>
          ) : (
            getFilteredSubscriptions().map((subscription) => (
              <div
                key={subscription.id}
                className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl hover:bg-zinc-800/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                      {(() => {
                        if (
                          subscription.trader_address &&
                          typeof subscription.trader_address === "string" &&
                          subscription.trader_address.length >= 4
                        ) {
                          return subscription.trader_address
                            .slice(2, 4)
                            .toUpperCase();
                        }
                        if (subscription.trader_id) {
                          const idStr = subscription.trader_id.toString();
                          return idStr.length >= 2
                            ? idStr.slice(0, 2).toUpperCase()
                            : idStr.toUpperCase();
                        }
                        return "TR";
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-white">
                          Trader{" "}
                          {formatAddress(
                            subscription.trader_address ||
                              (subscription.trader_id
                                ? subscription.trader_id.toString()
                                : null) ||
                              "Unknown"
                          )}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            subscription.is_active && !subscription.is_paused
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : subscription.is_paused
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                          }`}
                        >
                          {getStatusText(subscription)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span>
                          {subscription.exchange_platform || "Exchange"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" />
                          {subscription.total_copied_trades || 0} trades
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(subscription.created_at)}
                        </span>
                        {subscription.total_pnl_usd !== undefined && (
                          <span
                            className={`flex items-center gap-1 ${
                              subscription.total_pnl_usd >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {subscription.total_pnl_usd >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {formatCurrency(subscription.total_pnl_usd)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {subscription.is_active && (
                      <button
                        onClick={() =>
                          handlePauseResume(
                            subscription.id,
                            subscription.is_paused
                          )
                        }
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          subscription.is_paused
                            ? "text-zinc-400 hover:text-green-400 hover:bg-green-500/10"
                            : "text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                        }`}
                        title={subscription.is_paused ? "Resume" : "Pause"}
                      >
                        {subscription.is_paused ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingSubscription(subscription)}
                      className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Edit Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Risk Settings Summary */}
                <div className="mt-3 p-3 bg-zinc-900/40 rounded-lg border-l-4 border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-md ${
                          subscription.risk_settings.copy_method === "AUTOMATIC"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {subscription.risk_settings.copy_method}
                      </span>
                      <span className="text-zinc-400">
                        Size:{" "}
                        {formatPercentage(
                          subscription.risk_settings.size_multiplier
                        )}
                      </span>
                      <span className="text-zinc-400">
                        Max:{" "}
                        {formatCurrency(
                          subscription.risk_settings.max_position_size_usd
                        )}
                      </span>
                      {subscription.risk_settings.copy_method === "MANUAL" && (
                        <>
                          <span className="text-zinc-400">
                            TP: {subscription.risk_settings.tp_percent}%
                          </span>
                          <span className="text-zinc-400">
                            SL: {subscription.risk_settings.sl_percent}%
                          </span>
                        </>
                      )}
                    </div>
                    {subscription.successful_trades !== undefined &&
                      subscription.total_copied_trades !== undefined && (
                        <span className="text-sm text-zinc-400">
                          Success:{" "}
                          {formatPercentage(
                            subscription.successful_trades /
                              Math.max(subscription.total_copied_trades, 1)
                          )}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <CreateCopySubscriptionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchSubscriptions}
        />
      )}

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <EditCopySubscriptionModal
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onUpdated={() => {
            fetchSubscriptions();
            setEditingSubscription(null);
          }}
        />
      )}
    </div>
  );
}

// Edit Modal Component
function EditCopySubscriptionModal({
  subscription,
  onClose,
  onUpdated,
}: {
  subscription: CopySubscription;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(
    subscription.risk_settings
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/user/copy-subscriptions/${subscription.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ risk_settings: riskSettings }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update subscription");
      }

      onUpdated();
    } catch (error) {
      console.error("Failed to update subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Edit Risk Settings
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Copy Method */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Copy Method
            </label>
            <div className="grid grid-cols-2 gap-3">
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
                <div className="text-sm font-medium text-white mb-1">
                  Automatic
                </div>
                <div className="text-xs text-zinc-400">
                  Copy trades as-is with size multiplier
                </div>
              </button>
              <button
                onClick={() =>
                  setRiskSettings((prev) => ({
                    ...prev,
                    copy_method: "MANUAL",
                  }))
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  riskSettings.copy_method === "MANUAL"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">
                  Manual
                </div>
                <div className="text-xs text-zinc-400">
                  Set custom TP/SL and triggers
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
            </div>
          </div>

          {/* Manual Settings */}
          {riskSettings.copy_method === "MANUAL" && (
            <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <h4 className="font-medium text-white">Manual Risk Controls</h4>
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

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
