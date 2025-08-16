"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface ApiStatusProps {
  className?: string;
}

export function ApiStatus({ className }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setStatus("checking");
        const response = await fetch(
          "/api/leaderboard?sort_by=win_rate&order=desc"
        );

        if (response.ok) {
          setStatus("connected");
          setError(null);
        } else {
          setStatus("error");
          setError(`API Error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader className="w-4 h-4 animate-spin" />;
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Checking...";
      case "connected":
        return "API Connected";
      case "error":
        return error || "API Error";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "text-yellow-300";
      case "connected":
        return "text-green-300";
      case "error":
        return "text-red-300";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-xs ${getStatusColor()}`}>{getStatusText()}</span>
    </div>
  );
}
