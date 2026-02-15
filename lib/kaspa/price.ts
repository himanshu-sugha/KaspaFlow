// StreamKAS — Live KAS/USD Price Feed

let cachedPrice: { usd: number; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

export async function getKasPrice(): Promise<number> {
    if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_TTL) {
        return cachedPrice.usd;
    }

    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd',
            { cache: 'no-store' }
        );
        if (!res.ok) throw new Error('CoinGecko API error');
        const data = await res.json();
        const usd = data?.kaspa?.usd ?? 0;
        cachedPrice = { usd, timestamp: Date.now() };
        return usd;
    } catch {
        // Return last cached value if available, otherwise 0
        return cachedPrice?.usd ?? 0;
    }
}

// React hook for live price
import { useState, useEffect } from 'react';

export function useKasPrice(refreshInterval = 60_000) {
    const [price, setPrice] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchPrice = async () => {
            const p = await getKasPrice();
            if (mounted) {
                setPrice(p);
                setLoading(false);
            }
        };

        fetchPrice();
        const timer = setInterval(fetchPrice, refreshInterval);

        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [refreshInterval]);

    return { price, loading };
}
