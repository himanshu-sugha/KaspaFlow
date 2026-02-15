'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
};

const COLORS: Record<ToastType, string> = {
    success: 'rgba(73, 234, 203, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
    info: 'rgba(59, 130, 246, 0.15)',
    warning: 'rgba(253, 203, 110, 0.15)',
};

const BORDER_COLORS: Record<ToastType, string> = {
    success: 'rgba(73, 234, 203, 0.4)',
    error: 'rgba(239, 68, 68, 0.4)',
    info: 'rgba(59, 130, 246, 0.4)',
    warning: 'rgba(253, 203, 110, 0.4)',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-dismiss after 3.5s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast Container */}
            {toasts.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}>
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            style={{
                                background: COLORS[toast.type],
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${BORDER_COLORS[toast.type]}`,
                                borderRadius: '12px',
                                padding: '12px 18px',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                animation: 'toastSlideIn 0.3s ease forwards',
                                pointerEvents: 'auto',
                                maxWidth: '380px',
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ICONS[toast.type]}</span>
                            <span>{toast.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
