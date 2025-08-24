export interface ExchangeKeyCreate {
  platform: string;
  api_key: string;
  api_secret: string;
  nickname?: string;
}

export interface ExchangeKeyUpdate {
  api_key?: string;
  api_secret?: string;
  nickname?: string;
  is_active?: boolean;
}

export interface ExchangeKey {
  id: number;
  platform: string;
  api_key_masked: string;
  nickname?: string;
  is_active: boolean;
  created_at: string;
  has_secret: boolean;
}

export interface ExchangeKeyWithCredentials {
  id: number;
  platform: string;
  api_key: string;
  api_secret: string;
  nickname?: string;
  is_active: boolean;
  created_at: string;
}

export interface ExchangeKeyTestResponse {
  platform: string;
  status: string;
  message: string;
  tested_at: string;
  note?: string;
}
