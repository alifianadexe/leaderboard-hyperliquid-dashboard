export interface NonceResponse {
  nonce: string;
  message: string;
  expires_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: any;
  is_new_user: boolean;
  expires_in: number;
}

export interface WalletAuthRequest {
  wallet_address: string;
  signature: string;
  message: string;
  chain: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}
