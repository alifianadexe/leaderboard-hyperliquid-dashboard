"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Edit2,
  Trash2,
  TestTube,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Activity,
  Shield,
  Clock,
} from "lucide-react";
import {
  ExchangeKey,
  ExchangeKeyCreate,
  ExchangeKeyUpdate,
  ExchangeKeyTestResponse,
} from "@/types/exchange";

const SUPPORTED_EXCHANGES = [
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    icon: "🌊",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "binance",
    name: "Binance",
    icon: "🟨",
    color: "from-yellow-500 to-orange-600",
  },
  {
    id: "bybit",
    name: "Bybit",
    icon: "🟦",
    color: "from-blue-500 to-purple-600",
  },
  { id: "okx", name: "OKX", icon: "⚫", color: "from-gray-500 to-gray-700" },
  {
    id: "coinbase",
    name: "Coinbase",
    icon: "🔵",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "kraken",
    name: "Kraken",
    icon: "🐙",
    color: "from-purple-500 to-indigo-600",
  },
  { id: "huobi", name: "Huobi", icon: "🔴", color: "from-red-500 to-red-700" },
  {
    id: "kucoin",
    name: "KuCoin",
    icon: "🟢",
    color: "from-green-500 to-green-700",
  },
  {
    id: "gate",
    name: "Gate.io",
    icon: "🚪",
    color: "from-teal-500 to-cyan-600",
  },
  { id: "mexc", name: "MEXC", icon: "🔶", color: "from-orange-500 to-red-600" },
];

interface ExchangeKeysManagerProps {
  className?: string;
}

export function ExchangeKeysManager({ className }: ExchangeKeysManagerProps) {
  const [keys, setKeys] = useState<ExchangeKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "create">("manage");

  // Form states
  const [formData, setFormData] = useState<ExchangeKeyCreate>({
    platform: "",
    api_key: "",
    api_secret: "",
    nickname: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<ExchangeKey | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Load exchange keys
  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/exchange-keys");
      if (!response.ok) {
        throw new Error("Failed to fetch exchange keys");
      }

      const data = await response.json();
      setKeys(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load exchange keys"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Create new key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.platform || !formData.api_key || !formData.api_secret) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      const response = await fetch("/api/user/exchange-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create exchange key");
      }

      await fetchKeys();
      setFormData({ platform: "", api_key: "", api_secret: "", nickname: "" });
      setActiveTab("manage");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create exchange key"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Update key
  const handleUpdateKey = async (keyId: number, updates: ExchangeKeyUpdate) => {
    try {
      const response = await fetch(`/api/user/exchange-keys/${keyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update exchange key");
      }

      await fetchKeys();
      setEditingKey(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update exchange key"
      );
    }
  };

  // Delete key
  const handleDeleteKey = async (keyId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/user/exchange-keys/${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete exchange key");
      }

      await fetchKeys();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete exchange key"
      );
    }
  };

  // Test key
  const handleTestKey = async (keyId: number) => {
    try {
      const response = await fetch(`/api/user/exchange-keys/${keyId}/test`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to test exchange key");
      }

      const result: ExchangeKeyTestResponse = await response.json();
      alert(`Test Result: ${result.message}`);
    } catch (err) {
      alert(
        `Test Failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const getExchangeInfo = (platform: string) => {
    return (
      SUPPORTED_EXCHANGES.find((ex) => ex.id === platform) || {
        id: platform,
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        icon: "🔗",
        color: "from-gray-500 to-gray-700",
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex items-center gap-3">
            <Key className="w-6 h-6 text-blue-400" />
            <span className="text-zinc-400">Loading exchange keys...</span>
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
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Exchange API Keys
              </h2>
              <p className="text-sm text-zinc-500">
                Manage your exchange API credentials securely
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Encrypted</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 p-1 bg-zinc-800/40 rounded-lg">
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "manage"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
            }`}
          >
            <Activity className="w-4 h-4" />
            Manage Keys ({keys.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "create"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
            }`}
          >
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
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
        {activeTab === "manage" ? (
          <div className="space-y-4">
            {keys.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <Key className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                  No API Keys
                </h3>
                <p className="text-zinc-500 mb-4">
                  You haven&apos;t added any exchange API keys yet.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Key
                </button>
              </div>
            ) : (
              keys.map((key) => {
                const exchangeInfo = getExchangeInfo(key.platform);
                return (
                  <div
                    key={key.id}
                    className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl hover:bg-zinc-800/40 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${exchangeInfo.color} flex items-center justify-center text-2xl`}
                        >
                          {exchangeInfo.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-white">
                              {key.nickname || exchangeInfo.name}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                key.is_active
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                              }`}
                            >
                              {key.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className="font-mono">
                              {key.api_key_masked}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(key.created_at).toLocaleDateString()}
                            </span>
                            {key.has_secret && (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                Secret Stored
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(key.api_key_masked)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                          title="Copy API Key"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTestKey(key.id)}
                          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                          title="Test API Key"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingKey(key)}
                          className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                          title="Edit Key"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Delete Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Exchange Platform *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {SUPPORTED_EXCHANGES.map((exchange) => (
                    <button
                      key={exchange.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          platform: exchange.id,
                        }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.platform === exchange.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
                      }`}
                    >
                      <div className="text-2xl mb-1">{exchange.icon}</div>
                      <div className="text-xs font-medium text-white">
                        {exchange.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="api_key"
                  className="block text-sm font-medium text-white mb-2"
                >
                  API Key *
                </label>
                <input
                  id="api_key"
                  type="text"
                  value={formData.api_key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      api_key: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter your API key"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="api_secret"
                  className="block text-sm font-medium text-white mb-2"
                >
                  API Secret *
                </label>
                <div className="relative">
                  <input
                    id="api_secret"
                    type={showSecret ? "text" : "password"}
                    value={formData.api_secret}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        api_secret: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your API secret"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Your API secret will be encrypted before storage
                </p>
              </div>

              <div>
                <label
                  htmlFor="nickname"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Nickname (optional)
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nickname: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="My Binance API Key"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/40">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Shield className="w-4 h-4" />
                End-to-end encrypted storage
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      platform: "",
                      api_key: "",
                      api_secret: "",
                      nickname: "",
                    });
                    setActiveTab("manage");
                  }}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create API Key
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Edit API Key
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  defaultValue={editingKey.nickname || ""}
                  onChange={(e) =>
                    setEditingKey((prev) =>
                      prev ? { ...prev, nickname: e.target.value } : null
                    )
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Enter nickname"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">
                  Active Status
                </label>
                <button
                  onClick={() =>
                    setEditingKey((prev) =>
                      prev ? { ...prev, is_active: !prev.is_active } : null
                    )
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    editingKey.is_active ? "bg-green-500" : "bg-zinc-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      editingKey.is_active ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateKey(editingKey.id, {
                    nickname: editingKey.nickname,
                    is_active: editingKey.is_active,
                  })
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
