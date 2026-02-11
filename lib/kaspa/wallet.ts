// Kasware Wallet API Wrapper
// Docs: https://docs.kasware.xyz

export interface KaswareAPI {
    requestAccounts(): Promise<string[]>;
    getAccounts(): Promise<string[]>;
    getBalance(): Promise<{ confirmed: number; unconfirmed: number; total: number }>;
    getNetwork(): Promise<string>;
    switchNetwork(network: string): Promise<void>;
    disconnect(): Promise<void>;
    getPublicKey(): Promise<string>;
    sendKaspa(
        toAddress: string,
        sompiAmount: number,
        options?: { priorityFee?: number }
    ): Promise<string>; // returns txId
    signMessage(msg: string, type?: 'auto' | 'schnorr' | 'ecdsa'): Promise<string>;
    on(event: string, callback: (...args: unknown[]) => void): void;
    removeListener(event: string, callback: (...args: unknown[]) => void): void;
}

declare global {
    interface Window {
        kasware?: KaswareAPI;
    }
}

export function isKaswareInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.kasware;
}

export async function connectWallet(): Promise<string[]> {
    if (!isKaswareInstalled()) {
        throw new Error('Kasware wallet extension is not installed. Please install it from kasware.xyz');
    }
    return window.kasware!.requestAccounts();
}

export async function getAccounts(): Promise<string[]> {
    if (!isKaswareInstalled()) return [];
    return window.kasware!.getAccounts();
}

export async function getBalance(): Promise<{ confirmed: number; unconfirmed: number; total: number }> {
    if (!isKaswareInstalled()) throw new Error('Kasware not installed');
    return window.kasware!.getBalance();
}

export async function getNetwork(): Promise<string> {
    if (!isKaswareInstalled()) throw new Error('Kasware not installed');
    return window.kasware!.getNetwork();
}

export async function sendKas(
    toAddress: string,
    sompiAmount: number,
    priorityFee?: number
): Promise<string> {
    if (!isKaswareInstalled()) throw new Error('Kasware not installed');
    const options = priorityFee ? { priorityFee } : undefined;
    return window.kasware!.sendKaspa(toAddress, sompiAmount, options);
}

export function onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!isKaswareInstalled()) return;
    window.kasware!.on('accountsChanged', callback as (...args: unknown[]) => void);
}

export function onBalanceChanged(callback: (balance: { confirmed: number; unconfirmed: number; total: number }) => void): void {
    if (!isKaswareInstalled()) return;
    window.kasware!.on('balanceChanged', callback as (...args: unknown[]) => void);
}

export function onNetworkChanged(callback: (network: string) => void): void {
    if (!isKaswareInstalled()) return;
    window.kasware!.on('networkChanged', callback as (...args: unknown[]) => void);
}

export function removeAccountsListener(callback: (accounts: string[]) => void): void {
    if (!isKaswareInstalled()) return;
    window.kasware!.removeListener('accountsChanged', callback as (...args: unknown[]) => void);
}

export function removeBalanceListener(callback: (balance: { confirmed: number; unconfirmed: number; total: number }) => void): void {
    if (!isKaswareInstalled()) return;
    window.kasware!.removeListener('balanceChanged', callback as (...args: unknown[]) => void);
}
