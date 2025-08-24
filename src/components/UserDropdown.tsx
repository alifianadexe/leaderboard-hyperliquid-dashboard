"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Wallet,
  Mail,
  Key,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/30 rounded-lg transition-all duration-200"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getDisplayName = () => {
    if (user.email) {
      return user.email.split("@")[0];
    }
    if (user.wallets && user.wallets.length > 0) {
      const address = user.wallets[0].address;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return `User #${user.id}`;
  };

  const getAvatar = () => {
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    if (user.wallets && user.wallets.length > 0) {
      return user.wallets[0].address[2].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/30 rounded-xl transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
          {getAvatar()}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">{getDisplayName()}</p>
          <p className="text-xs text-zinc-500">
            {user.email ? "Email" : "Wallet"} User
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900/95 border border-zinc-800/50 rounded-xl backdrop-blur-xl shadow-2xl z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-zinc-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {getAvatar()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{getDisplayName()}</p>
                <p className="text-xs text-zinc-400">ID: #{user.id}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile */}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <User className="w-4 h-4" />
              View Profile
            </button>

            {/* Exchange Keys */}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/exchange-keys");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <Key className="w-4 h-4" />
              Exchange Keys
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            {/* Account Type */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {user.email ? (
                  <>
                    <Mail className="w-3 h-3" />
                    Email Account
                  </>
                ) : (
                  <>
                    <Wallet className="w-3 h-3" />
                    Wallet Account
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-2 my-2 border-t border-zinc-800/40" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
