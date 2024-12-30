 // hooks/usePresale.ts
import { useState, useEffect } from 'react';
import { PresaleService } from '../lib/presaleService';
import type { PresaleStats, BuyerInfo } from '../types/presale';

export function usePresale(walletAddress?: string) {
  const [presaleStats, setPresaleStats] = useState<PresaleStats | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load presale stats
        const stats = await PresaleService.getPresaleStats();
        setPresaleStats(stats);

        // Load buyer info if wallet is connected
        if (walletAddress) {
          const buyer = await PresaleService.getBuyerInfo(walletAddress);
          setBuyerInfo(buyer);
        }
      } catch (err) {
        console.error('Error loading presale data:', err);
        setError('Failed to load presale data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [walletAddress]);

  const recordPurchase = async (
    walletAddress: string,
    tonAmount: number,
    tokenAmount: number,
    txHash?: string
  ) => {
    try {
      await PresaleService.recordPurchase(
        walletAddress,
        tonAmount,
        tokenAmount,
        txHash
      );
      
      // Refresh data after purchase
      const [newStats, newBuyerInfo] = await Promise.all([
        PresaleService.getPresaleStats(),
        PresaleService.getBuyerInfo(walletAddress)
      ]);
      
      setPresaleStats(newStats);
      setBuyerInfo(newBuyerInfo);
    } catch (err) {
      console.error('Error recording purchase:', err);
      throw new Error('Failed to record purchase');
    }
  };

  return {
    presaleStats,
    buyerInfo,
    loading,
    error,
    recordPurchase
  };
}
