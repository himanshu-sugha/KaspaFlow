import { useState, useEffect } from 'react';

interface PriceData {
    kaspa: {
        usd: number;
    };
}

let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function getKasPrice(): Promise<number> {
    // Return cached price if valid
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
        return priceCache.price;
    }

    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd',
            { headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) {
            throw new Error('Price API error');
        }

        const data: PriceData = await response.json();
        const price = data.kaspa.usd;

        // Update cache
        priceCache = { price, timestamp: Date.now() };
        return price;
    } catch (error) {
        console.error('Failed to fetch KAS price:', error);
        return priceCache?.price || 0.15; // Fallback to approx price if API fails
    }
}

export function useKasPrice() {
    const [price, setPrice] = useState<number>(priceCache?.price || 0);

    useEffect(() => {
        // Initial fetch
        getKasPrice().then(setPrice);

        // Refresh every 60s
        const interval = setInterval(() => {
            getKasPrice().then(setPrice);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return price;
}
