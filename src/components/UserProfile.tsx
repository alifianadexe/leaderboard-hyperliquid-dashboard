"use client";

import { useState } from "react";
import {
  User,
  Wallet,
  Mail,
  Calendar,
  Key,
  Copy,
  LogOut,
  Settings,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Profile</h2>
            <p className="text-sm text-zinc-500">
              Manage your account settings
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoading ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 py-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Information
          </h3>

          <div className="grid gap-4">
            {/* Email */}
            {user.email && (
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* User ID */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">User ID</p>
                  <p className="text-sm text-zinc-400 font-mono">#{user.id}</p>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Member Since</p>
                  <p className="text-sm text-zinc-400">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Wallets */}
        {user.wallets && user.wallets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connected Wallets ({user.wallets.length})
            </h3>

            <div className="space-y-3">
              {user.wallets.map((wallet, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white font-mono">
                        {truncateAddress(wallet.address)}
                      </p>
                      <p className="text-sm text-zinc-400 capitalize">
                        {wallet.chain} Network
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://etherscan.io/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Account Stats</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {user.exchange_keys_count || 0}
              </p>
              <p className="text-sm text-zinc-400">Exchange Keys</p>
            </div>
            <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {user.copy_subscriptions_count || 0}
              </p>
              <p className="text-sm text-zinc-400">Copy Subscriptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
