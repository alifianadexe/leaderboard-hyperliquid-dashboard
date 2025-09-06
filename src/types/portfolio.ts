export interface Portfolio {
  id: number;
  user_id: string;
  exchange_key_id: number;
  exchange_platform: string;
  account_balance_usd: number;
  total_pnl_usd: number;
  unrealized_pnl_usd: number;
  realized_pnl_usd: number;
  margin_used_usd: number;
  margin_available_usd: number;
  active_positions_count: number;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  portfolio_id: number;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl_usd: number;
  realized_pnl_usd: number;
  value_usd: number;
  margin_used_usd: number;
  leverage: number;
  is_closed: boolean;
  opened_at: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioDetails extends Portfolio {
  positions: Position[];
}

export interface Trade {
  id: number;
  portfolio_id: number;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  price: number;
  value_usd: number;
  fee_usd: number;
  pnl_usd?: number;
  is_copy_trade: boolean;
  copy_subscription_id?: number;
  master_trader_address?: string;
  executed_at: string;
  created_at: string;
}

export interface TradeHistoryResponse {
  trades: Trade[];
  total_count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PortfolioSummary {
  total_portfolios: number;
  total_balance_usd: number;
  total_pnl_usd: number;
  total_unrealized_pnl_usd: number;
  total_realized_pnl_usd: number;
  total_margin_used_usd: number;
  total_active_positions: number;
  best_performing_portfolio?: Portfolio;
  worst_performing_portfolio?: Portfolio;
  portfolios: Portfolio[];
}

export interface PnLAnalysis {
  portfolio_id?: number;
  period_days: number;
  total_pnl_usd: number;
  realized_pnl_usd: number;
  unrealized_pnl_usd: number;
  win_rate: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  largest_win_usd: number;
  largest_loss_usd: number;
  average_win_usd: number;
  average_loss_usd: number;
  profit_factor: number;
  max_drawdown_usd: number;
  max_drawdown_percent: number;
  daily_pnl: Array<{
    date: string;
    pnl_usd: number;
    cumulative_pnl_usd: number;
  }>;
}

export interface CopyTradingPerformance {
  subscription_id?: number;
  total_subscriptions: number;
  total_copied_trades: number;
  successful_trades: number;
  failed_trades: number;
  total_pnl_usd: number;
  win_rate: number;
  average_trade_size_usd: number;
  best_performing_subscription?: {
    subscription_id: number;
    master_trader_address: string;
    pnl_usd: number;
    win_rate: number;
  };
  worst_performing_subscription?: {
    subscription_id: number;
    master_trader_address: string;
    pnl_usd: number;
    win_rate: number;
  };
}

export interface SupportedExchange {
  platform: string;
  name: string;
  supported_features: string[];
  sync_intervals: {
    min_seconds: number;
    max_seconds: number;
    recommended_seconds: number;
  };
}

export interface PortfolioSyncRequest {
  force_refresh?: boolean;
  sync_trades?: boolean;
}

export interface PositionsOverview {
  total_positions: number;
  total_value_usd: number;
  total_unrealized_pnl_usd: number;
  long_positions: number;
  short_positions: number;
  profitable_positions: number;
  losing_positions: number;
  positions: Position[];
}
