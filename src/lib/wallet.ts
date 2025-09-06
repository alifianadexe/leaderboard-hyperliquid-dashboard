import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletConnection {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
}

export class WalletService {
  private static instance: WalletService;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async isWalletAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && !!window.ethereum;
  }

  async connectWallet(): Promise<WalletConnection> {
    if (!(await this.isWalletAvailable())) {
      throw new Error("MetaMask or compatible wallet not found");
    }

    if (!window.ethereum) {
      throw new Error("Ethereum provider not available");
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      return {
        address,
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to connect wallet: ${message}`);
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to sign message: ${message}`);
    }
  }

  async switchToEthereum(): Promise<void> {
    if (!(await this.isWalletAvailable())) {
      throw new Error("MetaMask not found");
    }

    if (!window.ethereum) {
      throw new Error("Ethereum provider not available");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }], // Ethereum Mainnet
      });
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      const errorCode = (switchError as { code?: number })?.code;
      if (errorCode === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x1",
                chainName: "Ethereum Mainnet",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.infura.io/v3/"],
                blockExplorerUrls: ["https://etherscan.io/"],
              },
            ],
          });
        } catch {
          throw new Error("Failed to add Ethereum network");
        }
      } else {
        throw new Error("Failed to switch to Ethereum network");
      }
    }
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  getCurrentAddress(): string | null {
    return this.signer ? this.signer.address : null;
  }
}

export const walletService = WalletService.getInstance();
