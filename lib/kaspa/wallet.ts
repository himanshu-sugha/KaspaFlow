// wrapper for kasware browser extension (window.kasware)
// handles connect, send, balance checks, event listeners
// all funcs check if extension exists first to avoid crashes
// docs: https://docs.kasware.xyz

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
    const result = await window.kasware!.sendKaspa(toAddress, sompiAmount, options);

    // kasware sometimes returns a json object instead of a plain txid string
    // normalize it so we always get a clean hex string
    if (typeof result === 'object' && result !== null) {
        // could be {id: "..."} or {txId: "..."} or similar
        const obj = result as Record<string, unknown>;
        const txId = obj.id || obj.txId || obj.txid || obj.transaction_id;
        if (typeof txId === 'string') return txId;
        // last resort: stringify and try to extract hex hash
        const str = JSON.stringify(result);
        const match = str.match(/[a-f0-9]{64}/i);
        if (match) return match[0];
        return str; // fallback
    }

    // if its already a string, check if its json-encoded
    if (typeof result === 'string' && result.startsWith('{')) {
        try {
            const parsed = JSON.parse(result);
            const txId = parsed.id || parsed.txId || parsed.txid || parsed.transaction_id;
            if (typeof txId === 'string') return txId;
        } catch {
            // not json, use as-is
        }
    }

    return result;
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
