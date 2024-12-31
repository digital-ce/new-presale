'use client'

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import { Account } from '@tonconnect/sdk';

const PRESALE_WALLET = "UQBeMnQn5gcGxyU5Ypjx4EM805t8RKMSX-SvGaiyoZG6HOTV";
const TGOLD_PER_TON = 7500;
const MIN_PURCHASE = 0.2;
const MAX_PURCHASE = 1000;
const TOTAL_ALLOCATION = 10000000;
const PRESALE_END_DATE = new Date('2024-12-31T18:00:00Z'); // 6 PM UTC on Dec 31, 2024

// LocalStorage keys
const STORAGE_KEYS = {
    PRESALE_STATS: 'presale_stats',
    TRANSACTIONS: 'user_transactions',
};

// Types
interface Transaction {
    tonAmount: number;
    tokenAmount: number;
    timestamp: number;
    address: string;
}

interface PresaleStats {
    totalRaised: number;
    totalTokensSold: number;
}

function isConnectedAccount(account: Account | null): account is Account {
    return account !== null;
}

export default function Presale() {
    const [tonConnectUI] = useTonConnectUI();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tonAmount, setTonAmount] = useState<string>('10');
    const [tgoldAmount, setTgoldAmount] = useState<string>((10 * TGOLD_PER_TON).toString());
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [mounted, setMounted] = useState(false);
    const [presaleStats, setPresaleStats] = useState<PresaleStats>({
        totalRaised: 0,
        totalTokensSold: 0
    });
    const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);

    // Initialize localStorage data
    useEffect(() => {
        const storedStats = localStorage.getItem(STORAGE_KEYS.PRESALE_STATS);
        if (!storedStats) {
            const initialStats: PresaleStats = {
                totalRaised: 203,
                totalTokensSold: 1522500
            };
            localStorage.setItem(STORAGE_KEYS.PRESALE_STATS, JSON.stringify(initialStats));
            setPresaleStats(initialStats);
        } else {
            setPresaleStats(JSON.parse(storedStats));
        }
    }, []);

    // Load user transactions when connected
    useEffect(() => {
        if (isConnected && tonConnectUI?.account) {
            const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            if (storedTransactions) {
                const allTransactions: Transaction[] = JSON.parse(storedTransactions);
                const userTxs = allTransactions.filter(tx => 
                    tx.address === tonConnectUI.account?.address
                );
                setUserTransactions(userTxs);
            }
        }
    }, [isConnected, tonConnectUI?.account]);

    // Handle mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Connection status tracking
    useEffect(() => {
        if (!tonConnectUI) return;
        
        const handleStatusChange = (wallet: any) => {
            setIsConnected(!!wallet);
        };

        const unsubscribe = tonConnectUI.onStatusChange(handleStatusChange);
        setIsConnected(!!tonConnectUI?.account);
        
        return () => {
            unsubscribe();
        };
    }, [tonConnectUI]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = PRESALE_END_DATE.getTime() - now.getTime();
            
            if (difference <= 0) {
                setTimeLeft('Presale Ended');
                clearInterval(timer);
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Calculate user totals
    const userTotals = userTransactions.reduce((acc, tx) => ({
        totalTonSpent: acc.totalTonSpent + tx.tonAmount,
        totalTokensBought: acc.totalTokensBought + tx.tokenAmount
    }), { totalTonSpent: 0, totalTokensBought: 0 });

    // Prevent hydration issues
    if (!mounted) {
        return null;
    }

    const handleTonAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setError('');

        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            const numValue = parseFloat(value || '0');

            if (numValue < MIN_PURCHASE) {
                setError(`Minimum purchase is ${MIN_PURCHASE} TON`);
            } else if (numValue > MAX_PURCHASE) {
                setError(`Maximum purchase is ${MAX_PURCHASE} TON`);
            }

            setTonAmount(value);
            const tgoldValue = numValue * TGOLD_PER_TON;
            setTgoldAmount(tgoldValue.toString());
        }
    };

    const recordTransaction = (address: string, tonAmount: number, tokenAmount: number) => {
        const newTransaction: Transaction = {
            address,
            tonAmount,
            tokenAmount,
            timestamp: Date.now()
        };

        // Update transactions
        const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        const transactions: Transaction[] = storedTransactions 
            ? JSON.parse(storedTransactions) 
            : [];
        transactions.push(newTransaction);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

        // Update presale stats
        const newStats = {
            totalRaised: presaleStats.totalRaised + tonAmount,
            totalTokensSold: presaleStats.totalTokensSold + tokenAmount
        };
        localStorage.setItem(STORAGE_KEYS.PRESALE_STATS, JSON.stringify(newStats));
        
        // Update state
        setPresaleStats(newStats);
        setUserTransactions(prev => [...prev, newTransaction]);
    };

    const handleTransfer = async () => {
        if (!tonConnectUI || !isConnected || !tonConnectUI.account) {
            alert('Please connect your wallet first');
            return;
        }

        const numValue = parseFloat(tonAmount);
        if (!tonAmount || numValue <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (numValue < MIN_PURCHASE || numValue > MAX_PURCHASE) {
            alert(`Please enter an amount between ${MIN_PURCHASE} and ${MAX_PURCHASE} TON`);
            return;
        }

        try {
            setIsLoading(true);
            const transferAmount = toNano(tonAmount);

            const result = await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [
                    {
                        address: PRESALE_WALLET,
                        amount: transferAmount.toString(),
                    },
                ],
            });

            // Record the transaction
            recordTransaction(
                tonConnectUI.account.address,
                parseFloat(tonAmount),
                parseFloat(tgoldAmount)
            );

            alert('Transfer successful! You will receive your $TGOLD tokens after the TGE.');
        } catch (error) {
            console.error('Error transferring:', error);
            alert('Error during transfer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
            <div className="bg-green-800 rounded-lg p-8 max-w-md w-full shadow-lg">
                <div className="mb-6">
                    <TonConnectButton />
                </div>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Telemas Gold Presale
                    </h1>

                    <p className="text-green-200 text-center mb-2">
                        Digital Mall of the Future
                    </p>

                    {/* Presale Stats */}
                    <div className="w-full bg-green-700 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-green-200 text-sm">Total Raised</p>
                                <p className="text-white font-semibold">
                                    {presaleStats.totalRaised.toFixed(2)} TON
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-green-200 text-sm">Total Sold</p>
                                <p className="text-white font-semibold">
                                    {presaleStats.totalTokensSold.toLocaleString()} $TGOLD
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="w-full bg-red-700 rounded-lg p-4 mb-6">
                        <div className="text-center">
                            <p className="text-white text-lg font-semibold mb-2">Presale Ends In</p>
                            <p className="text-red-200 text-xl">{timeLeft}</p>
                        </div>
                    </div>

                    {/* User Stats */}
                    {isConnected && (
                        <div className="w-full bg-green-700 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-green-200 text-sm">Your Total Spent</p>
                                    <p className="text-white font-semibold">
                                        {userTotals.totalTonSpent.toFixed(2)} TON
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-green-200 text-sm">Your Total $TGOLD</p>
                                    <p className="text-white font-semibold">
                                        {userTotals.totalTokensBought.toLocaleString()} $TGOLD
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="bg-red-700 p-3 rounded text-center">
                            <p className="text-red-200 text-sm">Rate</p>
                            <p className="text-white font-semibold">1 TON = {TGOLD_PER_TON} $TGOLD</p>
                        </div>
                        <div className="bg-red-700 p-3 rounded text-center">
                            <p className="text-red-200 text-sm">Min/Max Purchase</p>
                            <p className="text-white font-semibold">{MIN_PURCHASE}/{MAX_PURCHASE} TON</p>
                        </div>
                    </div>

                    <div className="w-full space-y-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-white block">Amount to Contribute:</label>
                            <input
                                type="text"
                                value={tonAmount}
                                onChange={handleTonAmountChange}
                                className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-green-300"
                                placeholder={`Enter TON amount (${MIN_PURCHASE}-${MAX_PURCHASE})`}
                            />
                            {error && <p className="text-red-300 text-sm">{error}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-white block">You will receive:</label>
                            <input
                                type="text"
                                value={`${tgoldAmount} $TGOLD`}
                                readOnly
                                className="w-full px-4 py-2 rounded bg-green-700 text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleTransfer}
                        disabled={isLoading || !isConnected || !!error}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white 
                            ${isConnected && !error
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-gray-600'} 
                            transition-colors disabled:opacity-50`}
                    >
                        {isLoading ? 'Processing...' :
                            isConnected ? 'Buy $TGOLD' : 'Connect Wallet First'}
                    </button>

                    {/* Transaction History */}
                    {isConnected && userTransactions.length > 0 && (
                        <div className="mt-6 w-full">
                            <h3 className="text-white font-semibold mb-3">Your Purchase History</h3>
                            <div className="space-y-2">
                                {userTransactions.map((purchase, index) => (
                                    <div key={index} className="bg-green-700 p-3 rounded">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-200">Amount:</span>
                                            <span className="text-white">{purchase.tonAmount} TON</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-200">$TGOLD:</span>
                                            <span className="text-white">{purchase.tokenAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-200">Date:</span>
<span className="text-white">
                                                {new Date(purchase.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 space-y-2 text-center">
                        <p className="text-green-200 text-sm">
                            Tokens will be distributed after the Token Generation Event (TGE)
                        </p>
                        <p className="text-green-200 text-sm">
                            Minimum Purchase: {MIN_PURCHASE} TON = {MIN_PURCHASE * TGOLD_PER_TON} $TGOLD
                        </p>
                    </div>

                    {/* Festive decorations */}
                    <div className="mt-6 text-center">
                        <p className="text-red-300 text-sm animate-pulse">
                            🎄 Happy Holidays! 🎄
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

