// lib/presaleService.ts
import { db } from './firebase';
import { 
  doc, 
  collection, 
  getDoc, 
  setDoc, 
  updateDoc, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import type { PresaleStats, BuyerInfo, Purchase } from '../types/presale';

export class PresaleService {
  private static STATS_DOC_ID = 'presale_stats';
  private static BUYERS_COLLECTION = 'presale_buyers';

  static async getPresaleStats(): Promise<PresaleStats> {
    const statsRef = doc(db, 'stats', this.STATS_DOC_ID);
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      const initialStats: PresaleStats = {
        totalRaised: 0,
        totalTokensSold: 0,
        uniqueBuyers: 0,
        lastUpdated: new Date()
      };
      await setDoc(statsRef, initialStats);
      return initialStats;
    }
    
    return statsDoc.data() as PresaleStats;
  }

  static async getBuyerInfo(walletAddress: string): Promise<BuyerInfo | null> {
    const buyerRef = doc(db, this.BUYERS_COLLECTION, walletAddress);
    const buyerDoc = await getDoc(buyerRef);
    
    if (!buyerDoc.exists()) {
      return null;
    }
    
    return buyerDoc.data() as BuyerInfo;
  }

  static async recordPurchase(
    walletAddress: string,
    tonAmount: number,
    tokenAmount: number,
    txHash?: string
  ): Promise<void> {
    await runTransaction(db, async (transaction) => {
      // Get references
      const buyerRef = doc(db, this.BUYERS_COLLECTION, walletAddress);
      const statsRef = doc(db, 'stats', this.STATS_DOC_ID);
      
      // Get current data
      const buyerDoc = await transaction.get(buyerRef);
      const statsDoc = await transaction.get(statsRef);
      
      const timestamp = new Date();
      const purchase: Purchase = {
        walletAddress,
        tonAmount,
        tokenAmount,
        timestamp,
        txHash
      };

      if (!buyerDoc.exists()) {
        // New buyer
        const buyerInfo: BuyerInfo = {
          walletAddress,
          totalTonSpent: tonAmount,
          totalTokensBought: tokenAmount,
          purchases: [purchase],
          lastPurchase: timestamp
        };
        
        transaction.set(buyerRef, buyerInfo);
        
        // Update stats for new buyer
        const currentStats = statsDoc.data() as PresaleStats;
        transaction.update(statsRef, {
          totalRaised: currentStats.totalRaised + tonAmount,
          totalTokensSold: currentStats.totalTokensSold + tokenAmount,
          uniqueBuyers: currentStats.uniqueBuyers + 1,
          lastUpdated: timestamp
        });
      } else {
        // Existing buyer
        const buyerInfo = buyerDoc.data() as BuyerInfo;
        
        transaction.update(buyerRef, {
          totalTonSpent: buyerInfo.totalTonSpent + tonAmount,
          totalTokensBought: buyerInfo.totalTokensBought + tokenAmount,
          purchases: [...buyerInfo.purchases, purchase],
          lastPurchase: timestamp
        });
        
        // Update stats for existing buyer
        const currentStats = statsDoc.data() as PresaleStats;
        transaction.update(statsRef, {
          totalRaised: currentStats.totalRaised + tonAmount,
          totalTokensSold: currentStats.totalTokensSold + tokenAmount,
          lastUpdated: timestamp
        });
      }
    });
  }
}
