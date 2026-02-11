'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { PaymentStream } from '@/lib/stream/types';
import { sompiToKas, truncateAddress } from '@/lib/utils';

interface Particle {
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
    color: string;
}

interface ParticleFlowProps {
    streams: PaymentStream[];
}

export default function ParticleFlow({ streams }: ParticleFlowProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);

    const activeStreams = streams.filter(s => s.status === 'active');
    const totalFlowRate = activeStreams.reduce((sum, s) => sum + (s.flowRate / s.interval), 0);

    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        const count = Math.min(activeStreams.length * 15 + 10, 80);

        for (let i = 0; i < count; i++) {
            const streamIndex = i % Math.max(activeStreams.length, 1);
            const color = activeStreams[streamIndex]?.color || '#49eacb';

            particles.push({
                x: Math.random() * width,
                y: (height * 0.2) + (Math.random() * height * 0.6),
                speed: 0.5 + Math.random() * 2,
                size: 1 + Math.random() * 3,
                opacity: 0.3 + Math.random() * 0.7,
                color,
            });
        }
        return particles;
    }, [activeStreams]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear with fade trail effect
        ctx.fillStyle = 'rgba(10, 14, 23, 0.15)';
        ctx.fillRect(0, 0, width, height);

        // Draw connection lines (subtle)
        if (activeStreams.length > 0) {
            ctx.strokeStyle = 'rgba(73, 234, 203, 0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, height / 2);
            ctx.lineTo(width - 60, height / 2);
            ctx.stroke();
        }

        // Update and draw particles
        const particles = particlesRef.current;
        for (const p of particles) {
            // Move particle right
            p.x += p.speed;

            // Add slight wave motion
            const wave = Math.sin(p.x * 0.02 + Date.now() * 0.001) * 2;
            const py = p.y + wave;

            // Reset when off screen
            if (p.x > width + 10) {
                p.x = -10;
                p.y = (height * 0.2) + (Math.random() * height * 0.6);
            }

            // Draw particle with glow
            ctx.beginPath();
            ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 4;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Draw trail
            ctx.beginPath();
            ctx.moveTo(p.x, py);
            ctx.lineTo(p.x - p.speed * 8, py);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.opacity * 0.3;
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        animationRef.current = requestAnimationFrame(draw);
    }, [activeStreams]);

    // Initialize and resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (!rect) return;
            canvas.width = rect.width * (window.devicePixelRatio || 1);
            canvas.height = rect.height * (window.devicePixelRatio || 1);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
            }

            particlesRef.current = initParticles(rect.width, rect.height);
        };

        resize();
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [initParticles]);

    // Animation loop
    useEffect(() => {
        animationRef.current = requestAnimationFrame(draw);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [draw]);

    return (
        <div className="particle-container">
            <canvas ref={canvasRef} className="particle-canvas" />
            <div className="particle-overlay">
                <div className="particle-label">
                    <span className="particle-label-title">Sender</span>
                    <span className="particle-label-addr">
                        {activeStreams.length > 0
                            ? truncateAddress(activeStreams[0].sender, 4)
                            : 'Connect wallet'}
                    </span>
                </div>
                <div className="particle-flow-rate">
                    <div className="particle-flow-value">
                        {activeStreams.length > 0
                            ? sompiToKas(totalFlowRate).toFixed(4)
                            : '0.0000'}
                    </div>
                    <div className="particle-flow-unit">KAS / second</div>
                </div>
                <div className="particle-label" style={{ textAlign: 'right' }}>
                    <span className="particle-label-title">
                        {activeStreams.length} active {activeStreams.length === 1 ? 'stream' : 'streams'}
                    </span>
                    <span className="particle-label-addr">
                        {activeStreams.length > 0
                            ? truncateAddress(activeStreams[0].recipient, 4)
                            : 'No streams'}
                    </span>
                </div>
            </div>
        </div>
    );
}
