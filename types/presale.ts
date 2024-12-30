// types/presale.ts
export interface PresaleStats {
  totalRaised: number;
  totalTokensSold: number;
  uniqueBuyers: number;
  lastUpdated: Date;
}

export interface Purchase {
  walletAddress: string;
  tonAmount: number;
  tokenAmount: number;
  timestamp: Date;
  txHash?: string;
}

export interface BuyerInfo {
  walletAddress: string;
  totalTonSpent: number;
  totalTokensBought: number;
  purchases: Purchase[];
  lastPurchase: Date;
}

