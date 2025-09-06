"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  Key,
  Monitor,
  Moon,
  Sun,
  Globe,
  RefreshCw,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Save,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { ApiStatus } from "@/components/ApiStatus";
import { UserDropdown } from "@/components/UserDropdown";

interface UserSettings {
  theme: "dark" | "light" | "system";
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    sounds: boolean;
  };
  dashboard: {
    autoRefresh: boolean;
    refreshInterval: number;
    defaultView: "table" | "cards" | "compact";
    showPnL: boolean;
    showPositions: boolean;
  };
  privacy: {
    shareProfile: boolean;
    showInLeaderboard: boolean;
    anonymizeData: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: "dark",
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      sounds: true,
    },
    dashboard: {
      autoRefresh: true,
      refreshInterval: 30,
      defaultView: "table",
      showPnL: true,
      showPositions: true,
    },
    privacy: {
      shareProfile: false,
      showInLeaderboard: true,
      anonymizeData: false,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 24,
    },
  });

  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "security" | "privacy"
  >("general");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = <T extends keyof UserSettings>(
    section: T,
    key: keyof UserSettings[T],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [key]: value,
      },
    }));
  };
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
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <p className="text-sm text-zinc-500">
                      Customize your dashboard experience
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    saved
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex mt-6 p-1 bg-zinc-800/40 rounded-lg overflow-x-auto">
                {[
                  { id: "general", label: "General", icon: Monitor },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "privacy", label: "Privacy", icon: Globe },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="p-6">
              {activeTab === "general" && (
                <div className="space-y-8">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Appearance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "light", label: "Light", icon: Sun },
                        { id: "system", label: "System", icon: Monitor },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              theme: id as UserSettings["theme"],
                            }))
                          }
                          className={`p-4 rounded-xl border-2 transition-all ${
                            settings.theme === id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600"
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                          <div className="text-sm font-medium text-white">
                            {label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Dashboard
                    </h3>
                    <div className="space-y-4">
                      {/* Auto Refresh */}
                      <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-5 h-5 text-zinc-400" />
                          <div>
                            <p className="font-medium text-white">
                              Auto Refresh
                            </p>
                            <p className="text-sm text-zinc-400">
                              Automatically update data
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            updateSettings(
                              "dashboard",
                              "autoRefresh",
                              !settings.dashboard.autoRefresh
                            )
                          }
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            settings.dashboard.autoRefresh
                              ? "bg-blue-500"
                              : "bg-zinc-600"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.dashboard.autoRefresh
                                ? "translate-x-6"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Refresh Interval */}
                      {settings.dashboard.autoRefresh && (
                        <div className="p-4 bg-zinc-800/30 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-white">
                              Refresh Interval
                            </label>
                            <span className="text-sm text-zinc-400">
                              {settings.dashboard.refreshInterval}s
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="300"
                            step="5"
                            value={settings.dashboard.refreshInterval}
                            onChange={(e) =>
                              updateSettings(
                                "dashboard",
                                "refreshInterval",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-zinc-500 mt-1">
                            <span>5s</span>
                            <span>5min</span>
                          </div>
                        </div>
                      )}

                      {/* Data Display Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
                          <div>
                            <p className="font-medium text-white">Show P&L</p>
                            <p className="text-sm text-zinc-400">
                              Display profit/loss data
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updateSettings(
                                "dashboard",
                                "showPnL",
                                !settings.dashboard.showPnL
                              )
                            }
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${
                              settings.dashboard.showPnL
                                ? "bg-green-500"
                                : "bg-zinc-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                settings.dashboard.showPnL
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
                          <div>
                            <p className="font-medium text-white">
                              Show Positions
                            </p>
                            <p className="text-sm text-zinc-400">
                              Display position data
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updateSettings(
                                "dashboard",
                                "showPositions",
                                !settings.dashboard.showPositions
                              )
                            }
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${
                              settings.dashboard.showPositions
                                ? "bg-green-500"
                                : "bg-zinc-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                settings.dashboard.showPositions
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "email",
                          label: "Email Notifications",
                          icon: Mail,
                          desc: "Get updates via email",
                        },
                        {
                          key: "browser",
                          label: "Browser Notifications",
                          icon: Globe,
                          desc: "Show browser notifications",
                        },
                        {
                          key: "mobile",
                          label: "Mobile Push",
                          icon: Smartphone,
                          desc: "Push notifications on mobile",
                        },
                        {
                          key: "sounds",
                          label: "Sound Alerts",
                          icon: Volume2,
                          desc: "Play sounds for notifications",
                        },
                      ].map(({ key, label, icon: Icon, desc }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-zinc-400" />
                            <div>
                              <p className="font-medium text-white">{label}</p>
                              <p className="text-sm text-zinc-400">{desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              updateSettings(
                                "notifications",
                                key as keyof UserSettings["notifications"],
                                !settings.notifications[
                                  key as keyof typeof settings.notifications
                                ]
                              )
                            }
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${
                              settings.notifications[
                                key as keyof typeof settings.notifications
                              ]
                                ? "bg-blue-500"
                                : "bg-zinc-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                settings.notifications[
                                  key as keyof typeof settings.notifications
                                ]
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Settings
                    </h3>
                    <div className="space-y-4">
                      {/* Two Factor Auth */}
                      <div className="p-4 bg-zinc-800/30 rounded-xl border border-orange-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                            <div>
                              <p className="font-medium text-white">
                                Two-Factor Authentication
                              </p>
                              <p className="text-sm text-zinc-400">
                                Add an extra layer of security
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              updateSettings(
                                "security",
                                "twoFactorEnabled",
                                !settings.security.twoFactorEnabled
                              )
                            }
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${
                              settings.security.twoFactorEnabled
                                ? "bg-green-500"
                                : "bg-zinc-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                settings.security.twoFactorEnabled
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                        {!settings.security.twoFactorEnabled && (
                          <p className="text-xs text-orange-400 mt-2">
                            Recommended: Enable 2FA to protect your account
                          </p>
                        )}
                      </div>

                      {/* Login Alerts */}
                      <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
                        <div>
                          <p className="font-medium text-white">Login Alerts</p>
                          <p className="text-sm text-zinc-400">
                            Get notified of new logins
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSettings(
                              "security",
                              "loginAlerts",
                              !settings.security.loginAlerts
                            )
                          }
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            settings.security.loginAlerts
                              ? "bg-blue-500"
                              : "bg-zinc-600"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.security.loginAlerts
                                ? "translate-x-6"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Session Timeout */}
                      <div className="p-4 bg-zinc-800/30 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-medium text-white">
                            Session Timeout
                          </label>
                          <span className="text-sm text-zinc-400">
                            {settings.security.sessionTimeout}h
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="168"
                          step="1"
                          value={settings.security.sessionTimeout}
                          onChange={(e) =>
                            updateSettings(
                              "security",
                              "sessionTimeout",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-zinc-500 mt-1">
                          <span>1h</span>
                          <span>1 week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Privacy Settings
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "shareProfile",
                          label: "Share Profile",
                          desc: "Allow others to view your profile",
                        },
                        {
                          key: "showInLeaderboard",
                          label: "Show in Leaderboard",
                          desc: "Appear in public rankings",
                        },
                        {
                          key: "anonymizeData",
                          label: "Anonymize Data",
                          desc: "Hide personal identifiers",
                        },
                      ].map(({ key, label, desc }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-white">{label}</p>
                            <p className="text-sm text-zinc-400">{desc}</p>
                          </div>
                          <button
                            onClick={() =>
                              updateSettings(
                                "privacy",
                                key as keyof UserSettings["privacy"],
                                !settings.privacy[
                                  key as keyof typeof settings.privacy
                                ]
                              )
                            }
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${
                              settings.privacy[
                                key as keyof typeof settings.privacy
                              ]
                                ? "bg-blue-500"
                                : "bg-zinc-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                settings.privacy[
                                  key as keyof typeof settings.privacy
                                ]
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exchange Keys Link */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">
                            Exchange API Keys
                          </p>
                          <p className="text-sm text-zinc-400">
                            Manage your exchange credentials
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/exchange-keys"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Manage Keys
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
