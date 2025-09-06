"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { UserProfile } from "@/components/UserProfile";
import { ApiStatus } from "@/components/ApiStatus";

export default function ProfilePage() {
  return (
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
                  <h1 className="text-xl font-bold text-white">User Profile</h1>
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-8 py-12">
          <UserProfile />
        </div>
      </div>
    </main>
  );
}
