// natural language parser for stream commands
// parses inputs like "stream 50 KAS to kaspatest:qz0... over 30 minutes"
// runs entirely client-side — no API keys, no network calls

export interface ParsedStreamCommand {
    amount: number | null;       // KAS
    recipient: string | null;
    durationMinutes: number | null;
    intervalSeconds: number | null;
    confidence: number;          // 0-1 overall confidence
    fields: {
        amount: { value: number | null; raw: string; confidence: number };
        recipient: { value: string | null; raw: string; confidence: number };
        duration: { value: number | null; raw: string; confidence: number };
        interval: { value: number | null; raw: string; confidence: number };
    };
    isValid: boolean;
    suggestion: string | null;   // hint if parsing fails
}

// amount patterns: "50 KAS", "0.5 kas", "100kas"
const AMOUNT_PATTERNS = [
    /(\d+\.?\d*)\s*kas/i,
    /(?:send|stream|pay|transfer)\s+(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:to|→|->)/i,
];

// duration patterns: "30 minutes", "1 hour", "2h", "90s", "for 5 min"
const DURATION_PATTERNS = [
    /(?:over|for|in|during|within)\s+(\d+\.?\d*)\s*(minutes?|mins?|m(?:in)?|hours?|hrs?|h|seconds?|secs?|s)\b/i,
    /(\d+\.?\d*)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)\s*(?:stream|duration)?/i,
    /(\d+)\s*m(?:in)?\b/i,
    /(\d+)\s*h(?:r|our)?s?\b/i,
];

// address patterns: kaspa: or kaspatest: followed by base32 chars
const ADDRESS_PATTERN = /(?:kaspa(?:test)?:[a-z0-9]{10,})/i;

// interval patterns: "every 10s", "every 30 seconds", "interval 15s"
const INTERVAL_PATTERNS = [
    /every\s+(\d+)\s*(?:seconds?|secs?|s)\b/i,
    /interval\s+(\d+)\s*(?:seconds?|secs?|s)?\b/i,
    /(\d+)\s*s\s+intervals?/i,
];

function parseDurationToMinutes(value: number, unit: string): number {
    const u = unit.toLowerCase().replace(/s$/, '');
    if (/^(hour|hr|h)/.test(u)) return value * 60;
    if (/^(second|sec|s)/.test(u)) return value / 60;
    return value; // minutes by default
}

export function parseStreamCommand(input: string): ParsedStreamCommand {
    const trimmed = input.trim();

    // parse amount
    let amount: number | null = null;
    let amountRaw = '';
    let amountConf = 0;
    for (const pattern of AMOUNT_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match) {
            amount = parseFloat(match[1]);
            amountRaw = match[0];
            amountConf = amount > 0 ? 1 : 0;
            break;
        }
    }

    // parse recipient address
    let recipient: string | null = null;
    let recipientRaw = '';
    let recipientConf = 0;
    const addrMatch = trimmed.match(ADDRESS_PATTERN);
    if (addrMatch) {
        recipient = addrMatch[0];
        recipientRaw = addrMatch[0];
        recipientConf = recipient.length > 20 ? 1 : 0.5;
    }

    // parse duration
    let durationMinutes: number | null = null;
    let durationRaw = '';
    let durationConf = 0;
    for (const pattern of DURATION_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match) {
            const val = parseFloat(match[1]);
            const unit = match[2] || 'minutes';
            durationMinutes = parseDurationToMinutes(val, unit);
            durationRaw = match[0];
            durationConf = durationMinutes > 0 ? 1 : 0;
            break;
        }
    }

    // parse interval (optional)
    let intervalSeconds: number | null = null;
    let intervalRaw = '';
    let intervalConf = 0;
    for (const pattern of INTERVAL_PATTERNS) {
        const match = trimmed.match(pattern);
        if (match) {
            intervalSeconds = parseInt(match[1]);
            intervalRaw = match[0];
            intervalConf = intervalSeconds > 0 ? 1 : 0;
            break;
        }
    }

    // overall confidence = average of required fields
    const requiredConfs = [amountConf, recipientConf, durationConf];
    const confidence = requiredConfs.reduce((a, b) => a + b, 0) / requiredConfs.length;
    const isValid = amount !== null && amount > 0 &&
        recipient !== null &&
        durationMinutes !== null && durationMinutes > 0;

    // generate suggestion if incomplete
    let suggestion: string | null = null;
    if (!isValid) {
        const missing: string[] = [];
        if (!amount) missing.push('amount (e.g. "50 KAS")');
        if (!recipient) missing.push('address (e.g. "kaspatest:qz0...")');
        if (!durationMinutes) missing.push('duration (e.g. "over 10 minutes")');
        suggestion = `Missing: ${missing.join(', ')}`;
    }

    return {
        amount,
        recipient,
        durationMinutes,
        intervalSeconds,
        confidence,
        fields: {
            amount: { value: amount, raw: amountRaw, confidence: amountConf },
            recipient: { value: recipient, raw: recipientRaw, confidence: recipientConf },
            duration: { value: durationMinutes, raw: durationRaw, confidence: durationConf },
            interval: { value: intervalSeconds, raw: intervalRaw, confidence: intervalConf },
        },
        isValid,
        suggestion,
    };
}

// example prompts the input cycles through
export const EXAMPLE_PROMPTS = [
    'stream 50 KAS to kaspatest:qz0s22... over 30 minutes',
    'send 10 KAS to kaspatest:abc123 for 5 min every 10s',
    'pay 100 KAS to kaspatest:qr... in 1 hour',
    '25 KAS to kaspatest:qz0... over 15 minutes every 30s',
];
