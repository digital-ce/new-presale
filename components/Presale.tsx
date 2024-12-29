// components/Presale.tsx
'use client'

import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { Account } from '@tonconnect/sdk';

// Wallet address to receive the TON
const PRESALE_WALLET = "EQD5cZx11P2Y8YhKTgyY9RY0CfqCsE6OMh0v7S3FBgdVMfpP";
const TGOLD_PER_TON = 10000; // 1 TON = 10000 $TGOLD

function isConnectedAccount(account: Account | null): account is Account {
    return account !== null;
}

export default function Presale() {
    const [tonConnectUI] = useTonConnectUI();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tonAmount, setTonAmount] = useState<string>('1');
    const [tgoldAmount, setTgoldAmount] = useState<string>(TGOLD_PER_TON.toString());

    // Add connection status tracking
    useEffect(() => {
        if (!tonConnectUI) return;

        const unsubscribe = tonConnectUI.onStatusChange(
            (wallet) => {
                console.log('Connection status changed:', !!wallet);
                setIsConnected(!!wallet);
            }
        );

        setIsConnected(!!tonConnectUI.account);

        return () => {
            unsubscribe();
        };
    }, [tonConnectUI]);

    // Handle TON amount input change
    const handleTonAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) { // Allow numbers and decimals
            setTonAmount(value);
            // Calculate TGOLD amount
            const tgoldValue = parseFloat(value || '0') * TGOLD_PER_TON;
            setTgoldAmount(tgoldValue.toString());
        }
    };

    // Handle transfer process
    const handleTransfer = async () => {
        if (!isConnected || !isConnectedAccount(tonConnectUI.account)) {
            alert('Please connect your wallet first');
            return;
        }

        if (!tonAmount || parseFloat(tonAmount) <= 0) {
            alert('Please enter a valid amount');
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
                    <h1 className="text-2xl font-bold text-white mb-6">
                        $TGOLD Presale
                    </h1>

                    <p className="text-gray-400 text-center mb-6">
                        1 TON = {TGOLD_PER_TON} $TGOLD
                    </p>

                    <div className="w-full space-y-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-white block">TON Amount:</label>
                            <input
                                type="text"
                                value={tonAmount}
                                onChange={handleTonAmountChange}
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                                placeholder="Enter TON amount"
                            />
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
                        disabled={isLoading || !isConnected}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white 
                            ${isConnected
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-600'} 
                            transition-colors disabled:opacity-50`}
                    >
                        {isLoading ? 'Processing...' :
                            isConnected ? 'Buy $TGOLD' : 'Connect Wallet First'}
                    </button>

                    <p className="text-gray-400 text-sm mt-4 text-center">
                        Tokens will be distributed after the Token Generation Event (TGE)
                    </p>
                </div>
            </div>
        </div>
    );
}
