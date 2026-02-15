// StreamKAS Utility Functions

// 1 KAS = 100,000,000 sompi
export const SOMPI_PER_KAS = 100_000_000;

export function sompiToKas(sompi: number): number {
    if (!sompi || isNaN(sompi)) return 0;
    return sompi / SOMPI_PER_KAS;
}

export function kasToSompi(kas: number): number {
    return Math.floor(kas * SOMPI_PER_KAS);
}

export function formatKas(sompi: number, decimals: number = 4): string {
    const kas = sompiToKas(sompi || 0);
    return kas.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatKasCompact(sompi: number): string {
    const kas = sompiToKas(sompi || 0);
    if (kas >= 1_000_000) return `${(kas / 1_000_000).toFixed(2)}M`;
    if (kas >= 1_000) return `${(kas / 1_000).toFixed(2)}K`;
    return kas.toFixed(4);
}

export function truncateAddress(address: string, chars: number = 6): string {
    if (!address || address.length < chars * 2 + 3) return address;
    return `${address.slice(0, chars + 7)}...${address.slice(-chars)}`;
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
}

export function formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Complete';
    if (seconds < 60) return `${seconds}s remaining`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m remaining`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m remaining`;
}

export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function generateId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isValidKaspaAddress(address: string): boolean {
    // Kaspa addresses start with 'kaspa:' or 'kaspatest:'
    if (!address) return false;
    return /^(kaspa|kaspatest):[a-z0-9]{61,63}$/.test(address);
}

export function calculateFlowRate(totalSompi: number, durationSeconds: number, intervalSeconds: number): number {
    const numPayments = Math.floor(durationSeconds / intervalSeconds);
    if (numPayments <= 0) return totalSompi;
    return Math.floor(totalSompi / numPayments);
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
