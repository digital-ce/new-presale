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
const PRESALE_END_DATE = new Date('2024-02-15T00:00:00Z');

// Mock data constants
const MOCK_PRESALE_STATS = {
    totalRaised: 200, // 200 TON raised
    totalTokensSold: 1500000, // 1.5M TGOLD sold
};

const MOCK_BUYER_INFO = {
    totalTonSpent: 15.5,
    totalTokensBought: 116250, // 15.5 * 7500
    purchases: [
        {
            tonAmount: 10,
            tokenAmount: 75000,
            timestamp: Date.now() - 86400000, // Yesterday
        },
        {
            tonAmount: 5.5,
            tokenAmount: 41250,
            timestamp: Date.now() - 172800000, // 2 days ago
        }
    ]
};

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

    // Mock presale data
    const presaleStats = MOCK_PRESALE_STATS;
    const buyerInfo = isConnected ? MOCK_BUYER_INFO : null;
    const presaleLoading = false;

    // Mock record purchase function
    const recordPurchase = async (
        address: string,
        tonAmount: number,
        tgoldAmount: number,
        transactionHash: string
    ) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Purchase recorded:', { address, tonAmount, tgoldAmount, transactionHash });
        return true;
    };

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
            const receiverAddress = Address.parse(PRESALE_WALLET);

            const result = await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [
                    {
                        address: receiverAddress.toString(),
                        amount: transferAmount.toString(),
                    },
                ],
            });

            // Record the purchase using mock function
            await recordPurchase(
                tonConnectUI.account.address,
                parseFloat(tonAmount),
                parseFloat(tgoldAmount),
                result.boc // Transaction hash
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
                <div className="mb-6">
                    <TonConnectButton />
                </div>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Telemas Gold Presale
                    </h1>

                    <p className="text-gray-400 text-center mb-2">
                        Digital Mall of the Future
                    </p>

                    {/* Presale Stats */}
                    {!presaleLoading && presaleStats && (
                        <div className="w-full bg-gray-700 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Total Raised</p>
                                    <p className="text-white font-semibold">
                                        {presaleStats.totalRaised.toFixed(2)} TON
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Total Sold</p>
                                    <p className="text-white font-semibold">
                                        {presaleStats.totalTokensSold.toLocaleString()} $TGOLD
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Countdown Timer */}
                    <div className="w-full bg-gray-700 rounded-lg p-4 mb-6">
                        <div className="text-center">
                            <p className="text-white text-lg font-semibold mb-2">Presale Ends In</p>
                            <p className="text-blue-400 text-xl">{timeLeft}</p>
                        </div>
                    </div>

                    {/* User Stats */}
                    {!presaleLoading && buyerInfo && (
                        <div className="w-full bg-gray-700 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Your Total Spent</p>
                                    <p className="text-white font-semibold">
                                        {buyerInfo.totalTonSpent.toFixed(2)} TON
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Your Total $TGOLD</p>
                                    <p className="text-white font-semibold">
                                        {buyerInfo.totalTokensBought.toLocaleString()} $TGOLD
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="bg-gray-700 p-3 rounded text-center">
                            <p className="text-gray-400 text-sm">Rate</p>
                            <p className="text-white font-semibold">1 TON = {TGOLD_PER_TON} $TGOLD</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded text-center">
                            <p className="text-gray-400 text-sm">Min/Max Purchase</p>
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
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                                placeholder={`Enter TON amount (${MIN_PURCHASE}-${MAX_PURCHASE})`}
                            />
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-white block">You will receive:</label>
                            <input
                                type="text"
                                value={`${tgoldAmount} $TGOLD`}
                                readOnly
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleTransfer}
                        disabled={isLoading || !isConnected || !!error}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white 
                            ${isConnected && !error
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-600'} 
                            transition-colors disabled:opacity-50`}
                    >
                        {isLoading ? 'Processing...' :
                            isConnected ? 'Buy $TGOLD' : 'Connect Wallet First'}
                    </button>

                    {/* Transaction History */}
                    {!presaleLoading && buyerInfo && buyerInfo.purchases.length > 0 && (
                        <div className="mt-6 w-full">
                            <h3 className="text-white font-semibold mb-3">Your Purchase History</h3>
                            <div className="space-y-2">
                                {buyerInfo.purchases.map((purchase, index) => (
                                    <div key={index} className="bg-gray-700 p-3 rounded">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Amount:</span>
                                            <span className="text-white">{purchase.tonAmount} TON</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">$TGOLD:</span>
                                            <span className="text-white">{purchase.tokenAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Date:</span>
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
                        <p className="text-gray-400 text-sm">
                            Tokens will be distributed after the Token Generation Event (TGE)
                        </p>
                        <p className="text-gray-400 text-sm">
                            Minimum Purchase: {MIN_PURCHASE} TON = {MIN_PURCHASE * TGOLD_PER_TON} $TGOLD
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
