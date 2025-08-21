"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Shield,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { walletService } from "@/lib/wallet";
import type { NonceResponse, AuthResponse } from "@/types/auth";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"wallet" | "google">("wallet");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleWalletAuth = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Connect wallet
      const connection = await walletService.connectWallet();
      setWalletAddress(connection.address);

      // Step 2: Get nonce from server
      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: connection.address,
        }),
      });

      if (!nonceResponse.ok) {
        const error = await nonceResponse.json();
        throw new Error(error.error || "Failed to get nonce");
      }

      const nonceData = await nonceResponse.json();

      // Step 3: Sign the message
      const signature = await walletService.signMessage(nonceData.message);

      // Step 4: Authenticate with signature
      const authResponse = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: connection.address,
          signature,
          message: nonceData.message,
          chain: "ethereum",
        }),
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.error || "Wallet authentication failed");
      }

      const authData = await authResponse.json();

      // Step 5: Login user
      await login(authData.access_token);

      router.push("/");
    } catch (err: any) {
      console.error("Wallet authentication error:", err);
      setError(err.message || "Failed to authenticate with wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // For now, show a placeholder for Google authentication
    // In a real implementation, you would integrate with Google OAuth
    setError("Google authentication will be implemented with Google OAuth SDK");
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-zinc-950 to-blue-900/5" />

      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white">
                  Hyperliquid Dashboard
                </h1>
                <p className="text-xs text-zinc-500">
                  Trading Analytics Platform
                </p>
              </div>
            </Link>

            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-zinc-400">
              Sign in to access your trading dashboard
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl p-6">
            {/* Tab Navigation */}
            <div className="flex mb-6 bg-zinc-800/30 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === "wallet"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Wallet className="w-4 h-4" />
                Wallet
              </button>
              <button
                onClick={() => setActiveTab("google")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === "google"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Mail className="w-4 h-4" />
                Google
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Wallet Authentication */}
            {activeTab === "wallet" && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Securely connect your Ethereum wallet to authenticate
                  </p>

                  {walletAddress && (
                    <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-1">
                        Connected Wallet
                      </p>
                      <p className="text-emerald-400 font-mono text-sm">
                        {truncateAddress(walletAddress)}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleWalletAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-500/50 disabled:to-emerald-600/50 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Connect Wallet
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-zinc-500">
                    By connecting, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </div>
            )}

            {/* Google Authentication */}
            {activeTab === "google" && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Sign in with Google
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Use your Google account for quick and secure access
                  </p>
                </div>

                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-zinc-500">
                    We'll create an account if you don't have one
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-zinc-500 text-sm">
              Don't have MetaMask?{" "}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Download here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
