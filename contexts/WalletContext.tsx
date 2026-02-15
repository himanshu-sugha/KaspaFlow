'use client';

// wallet context - wraps kasware extension state for the whole app
// checks if extension is installed, handles connect/disconnect,
// and listens for account or balance changes
// demo mode = fake wallet with 500 KAS for testing without extension

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isKaswareInstalled, connectWallet, getBalance, getNetwork, getAccounts, onAccountsChanged, onBalanceChanged, removeAccountsListener, removeBalanceListener } from '@/lib/kaspa/wallet';

interface WalletState {
    isInstalled: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    address: string;
    balance: { confirmed: number; unconfirmed: number; total: number };
    network: string;
    error: string | null;
    demoMode: boolean;
}

interface WalletContextType extends WalletState {
    connect: () => Promise<void>;
    disconnect: () => void;
    enableDemoMode: () => void;
    refreshBalance: () => Promise<void>;
}

const defaultWalletState: WalletState = {
    isInstalled: false,
    isConnected: false,
    isConnecting: false,
    address: '',
    balance: { confirmed: 0, unconfirmed: 0, total: 0 },
    network: '',
    error: null,
    demoMode: false,
};

const WalletContext = createContext<WalletContextType>({
    ...defaultWalletState,
    connect: async () => { },
    disconnect: () => { },
    enableDemoMode: () => { },
    refreshBalance: async () => { },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<WalletState>(defaultWalletState);
    const mountedRef = useRef(true);

    // small delay - kasware extension needs time to inject window.kasware
    useEffect(() => {
        mountedRef.current = true;

        // Small delay to let Kasware inject window.kasware
        const timer = setTimeout(async () => {
            if (!mountedRef.current) return;
            const installed = isKaswareInstalled();
            setState(prev => ({ ...prev, isInstalled: installed }));

            // Auto-connect if previously connected
            if (installed) {
                try {
                    const accounts = await getAccounts();
                    if (accounts.length > 0 && mountedRef.current) {
                        const bal = await getBalance();
                        const net = await getNetwork();
                        setState(prev => ({
                            ...prev,
                            isConnected: true,
                            address: accounts[0],
                            balance: bal,
                            network: net,
                        }));
                    }
                } catch {
                    // Not previously connected, that's fine
                }
            }
        }, 500);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
        };
    }, []);

    // listen for wallet changes (user switches account, balance updates, etc)
    useEffect(() => {
        if (!state.isConnected || state.demoMode) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (!mountedRef.current) return;
            if (accounts.length === 0) {
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    address: '',
                    balance: { confirmed: 0, unconfirmed: 0, total: 0 },
                }));
            } else {
                setState(prev => ({ ...prev, address: accounts[0] }));
            }
        };

        const handleBalanceChanged = (balance: { confirmed: number; unconfirmed: number; total: number }) => {
            if (!mountedRef.current) return;
            setState(prev => ({
                ...prev, balance: {
                    confirmed: Number(balance?.confirmed) || 0,
                    unconfirmed: Number(balance?.unconfirmed) || 0,
                    total: Number(balance?.total) || 0,
                }
            }));
        };

        onAccountsChanged(handleAccountsChanged);
        onBalanceChanged(handleBalanceChanged);

        return () => {
            removeAccountsListener(handleAccountsChanged);
            removeBalanceListener(handleBalanceChanged);
        };
    }, [state.isConnected, state.demoMode]);

    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));
        try {
            const accounts = await connectWallet();
            if (accounts.length === 0) throw new Error('No accounts returned');

            const bal = await getBalance();
            const net = await getNetwork();

            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                address: accounts[0],
                balance: bal,
                network: net,
                demoMode: false,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to connect wallet';
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: message,
            }));
        }
    }, []);

    const disconnect = useCallback(() => {
        setState(prev => ({
            ...defaultWalletState,
            isInstalled: prev.isInstalled,
        }));
    }, []);

    const enableDemoMode = useCallback(() => {
        setState(() => ({
            isInstalled: true,
            isConnected: true,
            isConnecting: false,
            address: 'kaspatest:qz0s22ece8ej0864mnk70fgr7dqllaglcgs3qzlrfq',
            balance: { confirmed: 500_00000000, unconfirmed: 0, total: 500_00000000 },
            network: 'testnet-10',
            error: null,
            demoMode: true,
        }));
    }, []);

    const refreshBalance = useCallback(async () => {
        if (state.demoMode || !state.isConnected) return;
        try {
            const bal = await getBalance();
            setState(prev => ({ ...prev, balance: bal }));
        } catch {
            // Silently fail
        }
    }, [state.demoMode, state.isConnected]);

    return (
        <WalletContext.Provider value={{ ...state, connect, disconnect, enableDemoMode, refreshBalance }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
