"use client";

import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  Key,
} from "lucide-react";
import { ApiStatus } from "@/components/ApiStatus";
import { UserDropdown } from "@/components/UserDropdown";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-zinc-950">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-zinc-950 to-blue-900/5" />

        <div className="relative">
          {/* Header */}
          <header className="border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-12xl mx-auto px-8 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-400" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <p className="text-xs text-zinc-500">Back to Dashboard</p>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <ApiStatus />
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-emerald-400">
                      Live
                    </span>
                  </div>
                  <UserDropdown />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-800/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <p className="text-sm text-zinc-500">
                      Manage your account preferences
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings Content */}
              <div className="px-6 py-6 space-y-8">
                {/* Coming Soon Message */}
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                    <Settings className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Settings Coming Soon
                  </h3>
                  <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                    We're working on bringing you comprehensive settings to
                    customize your dashboard experience.
                  </p>
                </div>

                {/* Planned Features */}
                <div className="grid gap-4">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Planned Features
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Notifications</p>
                        <p className="text-sm text-zinc-400">
                          Customize alert preferences and frequency
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Security</p>
                        <p className="text-sm text-zinc-400">
                          Two-factor authentication and security settings
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Key className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">API Keys</p>
                        <p className="text-sm text-zinc-400">
                          Manage exchange API keys and permissions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
