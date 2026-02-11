// Kaspa REST API Client
// Testnet: https://api-tn10.kaspa.org
// Mainnet: https://api.kaspa.org

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

// Explorer links
export function getExplorerTxUrl(txId: string, network: string = 'testnet-10'): string {
    if (network.includes('mainnet')) {
        return `https://explorer.kaspa.org/txs/${txId}`;
    }
    return `https://explorer-tn10.kaspa.org/txs/${txId}`;
}

export function getExplorerAddrUrl(address: string, network: string = 'testnet-10'): string {
    if (network.includes('mainnet')) {
        return `https://explorer.kaspa.org/addresses/${address}`;
    }
    return `https://explorer-tn10.kaspa.org/addresses/${address}`;
}
