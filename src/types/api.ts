export interface Trader {
  trader_id: number;
  trader_address: string;
  win_rate: number;
  total_volume_usd: number;
  account_age_days: number;
  avg_risk_ratio: number;
  max_drawdown: number;
  max_profit_usd: number;
  max_loss_usd: number;
  updated_at: string;
  trader_score?: number;
}

export type LeaderboardResponse = Trader[];

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    leaderboard: string;
    trader: (id: number) => string;
  };
}
