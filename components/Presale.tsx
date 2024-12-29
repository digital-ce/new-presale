// components/Presale.tsx
'use client'

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { Account } from '@tonconnect/sdk';

const PRESALE_WALLET = "UQBeMnQn5gcGxyU5Ypjx4EM805t8RKMSX-SvGaiyoZG6HOTV";
const TGOLD_PER_TON = 7500; // Updated rate: 1 TON = 7500 $TGOLD

// Presale Parameters
const MIN_PURCHASE = 1; // Minimum TON purchase
const MAX_PURCHASE = 1000; // Maximum TON purchase
const TOTAL_ALLOCATION = 10000000; // Total $TGOLD for presale
const PRESALE_END_DATE = new Date('2024-02-15T00:00:00Z'); // Example end date

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

    // Connection status tracking
    useEffect(() => {
        if (!tonConnectUI) return;
        const unsubscribe = tonConnectUI.onStatusChange(
            (wallet) => {
                setIsConnected(!!wallet);
            }
        );
        setIsConnected(!!tonConnectUI.account);
        return () => unsubscribe();
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

    // Handle TON amount input change
    const handleTonAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setError('');

        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            const numValue = parseFloat(value || '0');

            // Validation
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

    // Handle transfer process
    const handleTransfer = async () => {
        if (!isConnected || !isConnectedAccount(tonConnectUI.account)) {
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

            await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [
                    {
                        address: receiverAddress.toString(),
                        amount: transferAmount.toString(),
                    },
                ],
            });

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

                    <div className="w-full bg-gray-700 rounded-lg p-4 mb-6">
                        <div className="text-center">
                            <p className="text-white text-lg font-semibold mb-2">Presale Ends In</p>
                            <p className="text-blue-400 text-xl">{timeLeft}</p>
                        </div>
                    </div>

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