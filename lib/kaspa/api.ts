// kaspa rest api client - read-only queries (balance, utxos, tx info)
// writing (sending kas) goes through kasware extension instead
// testnet 10: api-tn10.kaspa.org | explorer: tn10.kaspa.stream

const TESTNET_API = 'https://api-tn10.kaspa.org';
const MAINNET_API = 'https://api.kaspa.org';

export function getApiBase(network: string = 'testnet-10'): string {
    if (network.includes('mainnet')) return MAINNET_API;
    return TESTNET_API;
}

export interface BalanceResponse {
    address: string;
    balance: number;
}

export interface UtxoEntry {
    address: string;
    outpoint: {
        transactionId: string;
        index: number;
    };
    utxoEntry: {
        amount: string;
        scriptPublicKey: {
            scriptPublicKey: string;
        };
        blockDaaScore: string;
        isCoinbase: boolean;
    };
}

export interface TransactionResponse {
    transaction_id: string;
    block_hash: string[];
    block_time: number;
    is_accepted: boolean;
    inputs: Array<{
        transaction_id: string;
        index: number;
        previous_outpoint_hash: string;
        previous_outpoint_index: string;
        signature_script: string;
        sig_op_count: string;
    }>;
    outputs: Array<{
        amount: number;
        script_public_key: string;
        script_public_key_address: string;
        script_public_key_type: string;
    }>;
}

export interface BlockDagInfo {
    networkName: string;
    blockCount: string;
    headerCount: string;
    tipHashes: string[];
    difficulty: number;
    pastMedianTime: string;
    virtualParentHashes: string[];
    pruningPointHash: string;
    virtualDaaScore: string;
}

async function apiRequest<T>(endpoint: string, network?: string): Promise<T> {
    const base = getApiBase(network);
    const response = await fetch(`${base}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function getBalanceByAddress(address: string, network?: string): Promise<BalanceResponse> {
    return apiRequest<BalanceResponse>(`/addresses/${address}/balance`, network);
}

export async function getUtxosByAddress(address: string, network?: string): Promise<UtxoEntry[]> {
    return apiRequest<UtxoEntry[]>(`/addresses/${address}/utxos`, network);
}

export async function getTransactionById(txId: string, network?: string): Promise<TransactionResponse> {
    return apiRequest<TransactionResponse>(`/transactions/${txId}`, network);
}

export async function getBlockDagInfo(network?: string): Promise<BlockDagInfo> {
    return apiRequest<BlockDagInfo>(`/info/blockdag`, network);
}

export async function getKaspaPrice(): Promise<{ price: number }> {
    return apiRequest<{ price: number }>('/info/price');
}

// verify if a tx actually landed on-chain
// returns status + block time so we can show confirmation in the ui
export interface TxVerification {
    verified: boolean;
    isAccepted: boolean;
    blockTime: number | null;
    blockHash: string | null;
    error?: string;
}

export async function verifyTransaction(txId: string, network?: string): Promise<TxVerification> {
    try {
        const tx = await getTransactionById(txId, network);
        return {
            verified: true,
            isAccepted: tx.is_accepted,
            blockTime: tx.block_time || null,
            blockHash: tx.block_hash?.[0] || null,
        };
    } catch (err) {
        // tx not found yet = still propagating
        return {
            verified: false,
            isAccepted: false,
            blockTime: null,
            blockHash: null,
            error: err instanceof Error ? err.message : 'verification failed',
        };
    }
}

// Explorer links
export function getExplorerTxUrl(txId: string, network: string = 'testnet-10'): string {
    if (network.includes('mainnet')) {
        return `https://explorer.kaspa.org/txs/${txId}`;
    }
    return `https://tn10.kaspa.stream/txs/${txId}`;
}

export function getExplorerAddrUrl(address: string, network: string = 'testnet-10'): string {
    if (network.includes('mainnet')) {
        return `https://explorer.kaspa.org/addresses/${address}`;
    }
    return `https://tn10.kaspa.stream/addresses/${address}`;
}
