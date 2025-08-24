"use client";

import Link from "next/link";
import { ArrowLeft, Key, Shield } from "lucide-react";
import { ExchangeKeysManager } from "@/components/ExchangeKeysManager";
import { ApiStatus } from "@/components/ApiStatus";

export default function ExchangeKeysPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-zinc-950 to-purple-900/5" />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/profile"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Exchange API Keys
                  </h1>
                  <p className="text-xs text-zinc-500">Back to Profile</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <ApiStatus />
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">
                    Secure
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Exchange API Keys Management
            </h2>
            <p className="text-zinc-400 max-w-2xl">
              Securely manage your exchange API keys to enable automated trading
              and portfolio management. All credentials are encrypted and stored
              safely.
            </p>
          </div>

          {/* Security Notice */}
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">
                  Security Notice
                </h4>
                <p className="text-sm text-blue-300/80">
                  Your API keys are encrypted using industry-standard encryption
                  before being stored. We recommend using API keys with trading
                  permissions only, never share your private keys.
                </p>
              </div>
            </div>
          </div>

          <ExchangeKeysManager />
        </div>
      </div>
    </main>
  );
}
