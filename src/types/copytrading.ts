export interface CopySubscriptionCreate {
  trader_id: string;
  master_trader_address: string;
  platform: string;
  exchange_key_id: number;
  risk_settings: RiskSettings;
}

export interface CopySubscriptionUpdate {
  is_active?: boolean;
  risk_settings?: RiskSettings;
}

export interface CopySubscription {
  id: number;
  user_id: string;
  trader_id: string;
  exchange_key_id: number;
  is_active: boolean;
  is_paused: boolean;
  risk_settings: RiskSettings;
  created_at: string;
  updated_at: string;
  trader_address?: string;
  exchange_platform?: string;
  total_copied_trades?: number;
  successful_trades?: number;
  total_pnl_usd?: number;
}

export interface CopySubscriptionSummary {
  subscriptions: CopySubscription[];
  total_subscriptions: number;
  active_subscriptions: number;
  total_pnl_usd: number;
}

export interface CopySubscriptionResponse {
  id: number;
  master_trader_address: string;
  is_active: boolean;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
  risk_settings: RiskSettings;
}

export interface RiskSettings {
  copy_method: "AUTOMATIC" | "MANUAL";
  size_multiplier: number;
  max_position_size_usd: number;
  trigger_limit_percent?: number;
  tp_percent?: number;
  sl_percent?: number;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  size: number;
  trigger_price: number;
  order_type: string;
  created_at: string;
}

export interface ExecutionHistory {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  size: number;
  price: number;
  pnl_usd: number;
  executed_at: string;
  status: "success" | "failed" | "partial";
}
