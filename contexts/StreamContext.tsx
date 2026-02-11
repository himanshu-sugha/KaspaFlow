'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { PaymentStream, StreamCreateConfig, StreamStats, StreamTransaction } from '@/lib/stream/types';
import { createStream, startStream, pauseStream, cancelStream, saveStreams, loadStreams, cleanupAllStreams, StreamUpdateCallback } from '@/lib/stream/engine';
import { useWallet } from './WalletContext';
import { sompiToKas } from '@/lib/utils';

// State
interface StreamState {
    streams: PaymentStream[];
    isCreating: boolean;
    error: string | null;
}

// Actions
type StreamAction =
    | { type: 'SET_STREAMS'; streams: PaymentStream[] }
    | { type: 'ADD_STREAM'; stream: PaymentStream }
    | { type: 'UPDATE_STREAM'; streamId: string; updates: Partial<PaymentStream> }
    | { type: 'REMOVE_STREAM'; streamId: string }
    | { type: 'SET_CREATING'; value: boolean }
    | { type: 'SET_ERROR'; error: string | null };

function streamReducer(state: StreamState, action: StreamAction): StreamState {
    switch (action.type) {
        case 'SET_STREAMS':
            return { ...state, streams: action.streams };
        case 'ADD_STREAM':
            return { ...state, streams: [...state.streams, action.stream], isCreating: false };
        case 'UPDATE_STREAM':
            return {
                ...state,
                streams: state.streams.map(s =>
                    s.id === action.streamId ? { ...s, ...action.updates } : s
                ),
            };
        case 'REMOVE_STREAM':
            return { ...state, streams: state.streams.filter(s => s.id !== action.streamId) };
        case 'SET_CREATING':
            return { ...state, isCreating: action.value };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        default:
            return state;
    }
}

// Context
interface StreamContextType extends StreamState {
    createNewStream: (config: StreamCreateConfig) => void;
    startStreamById: (streamId: string) => void;
    pauseStreamById: (streamId: string) => void;
    cancelStreamById: (streamId: string) => void;
    removeStreamById: (streamId: string) => void;
    stats: StreamStats;
    activeStreams: PaymentStream[];
    completedStreams: PaymentStream[];
    recentTransactions: StreamTransaction[];
}

const StreamContext = createContext<StreamContextType | null>(null);

export function StreamProvider({ children }: { children: React.ReactNode }) {
    const { address, demoMode } = useWallet();
    const [state, dispatch] = useReducer(streamReducer, {
        streams: [],
        isCreating: false,
        error: null,
    });
    const streamsRef = useRef(state.streams);
    streamsRef.current = state.streams;

    // Load streams from localStorage on mount
    useEffect(() => {
        const saved = loadStreams();
        if (saved.length > 0) {
            dispatch({ type: 'SET_STREAMS', streams: saved });
        }
    }, []);

    // Save streams whenever they change
    useEffect(() => {
        if (state.streams.length > 0) {
            saveStreams(state.streams);
        }
    }, [state.streams]);

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanupAllStreams();
    }, []);

    const onStreamUpdate: StreamUpdateCallback = useCallback((streamId: string, updates: Partial<PaymentStream>) => {
        dispatch({ type: 'UPDATE_STREAM', streamId, updates });
    }, []);

    const createNewStream = useCallback((config: StreamCreateConfig) => {
        try {
            dispatch({ type: 'SET_CREATING', value: true });
            dispatch({ type: 'SET_ERROR', error: null });
            const stream = createStream(config, address);
            dispatch({ type: 'ADD_STREAM', stream });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to create stream' });
            dispatch({ type: 'SET_CREATING', value: false });
        }
    }, [address]);

    const startStreamById = useCallback((streamId: string) => {
        const stream = streamsRef.current.find(s => s.id === streamId);
        if (!stream) return;
        startStream(stream, onStreamUpdate, demoMode);
    }, [demoMode, onStreamUpdate]);

    const pauseStreamById = useCallback((streamId: string) => {
        const stream = streamsRef.current.find(s => s.id === streamId);
        if (!stream) return;
        pauseStream(streamId, onStreamUpdate, stream);
    }, [onStreamUpdate]);

    const cancelStreamById = useCallback((streamId: string) => {
        cancelStream(streamId, onStreamUpdate);
    }, [onStreamUpdate]);

    const removeStreamById = useCallback((streamId: string) => {
        dispatch({ type: 'REMOVE_STREAM', streamId });
    }, []);

    // Derived state
    const activeStreams = state.streams.filter(s => s.status === 'active' || s.status === 'pending' || s.status === 'paused' || s.status === 'error');
    const completedStreams = state.streams.filter(s => s.status === 'completed' || s.status === 'cancelled');

    const recentTransactions = state.streams
        .flatMap(s => s.txHistory.map(tx => ({ ...tx, streamColor: s.color })))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);

    const stats: StreamStats = {
        activeStreams: state.streams.filter(s => s.status === 'active').length,
        totalStreams: state.streams.length,
        totalKasSent: state.streams.reduce((sum, s) => sum + s.amountSent, 0),
        totalTransactions: state.streams.reduce((sum, s) => sum + s.txHistory.length, 0),
        currentFlowRate: state.streams
            .filter(s => s.status === 'active')
            .reduce((sum, s) => sum + (s.flowRate / s.interval), 0), // sompi per second
    };

    return (
        <StreamContext.Provider
            value={{
                ...state,
                createNewStream,
                startStreamById,
                pauseStreamById,
                cancelStreamById,
                removeStreamById,
                stats,
                activeStreams,
                completedStreams,
                recentTransactions,
            }}
        >
            {children}
        </StreamContext.Provider>
    );
}

export function useStreams() {
    const context = useContext(StreamContext);
    if (!context) throw new Error('useStreams must be used within StreamProvider');
    return context;
}
