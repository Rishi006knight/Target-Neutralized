'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Search, Volume2, VolumeX } from 'lucide-react';
import { getGlobalThreatScore, getSeverityColor } from '@/lib/mock-data';

interface HudBarProps {
  onOpenCommand: () => void;
  activeIncidentCount: number;
}

export default function HudBar({ onOpenCommand, activeIncidentCount }: HudBarProps) {
  const [utc, setUtc] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  const threatScore = getGlobalThreatScore();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtc(
        now.toISOString().slice(11, 19) + ' UTC'
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const threatColor =
    threatScore >= 80 ? '#F43F5E' :
    threatScore >= 60 ? '#F59E0B' :
    threatScore >= 40 ? '#22D3EE' : '#2DD4BF';

  return (
    <header
      className="glass-panel fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
      style={{ height: 48 }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <Shield size={20} style={{ color: '#22D3EE' }} />
        <span
          className="font-sans font-semibold tracking-wider"
          style={{ fontSize: 16, color: '#C9D6DF', letterSpacing: '0.1em' }}
        >
          OCEANSHIELD
        </span>
        <span className="hud-label" style={{ fontSize: 10, color: '#5E7A8A', marginLeft: 4 }}>
          2.0
        </span>
      </div>

      {/* Center: UTC Clock + Threat Gauge */}
      <div className="flex items-center gap-6">
        {/* UTC Clock */}
        <div className="mono-data text-13" style={{ color: '#22D3EE' }}>
          {utc}
        </div>

        {/* Threat Gauge */}
        <div className="flex items-center gap-3">
          <span className="hud-label">THREAT</span>
          <div className="relative" style={{ width: 36, height: 36 }}>
            {/* Background ring */}
            <svg viewBox="0 0 36 36" className="absolute inset-0" style={{ width: 36, height: 36 }}>
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="#0E2A38"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke={threatColor}
                strokeWidth="3"
                strokeDasharray={`${threatScore * 0.94} 94`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ filter: `drop-shadow(0 0 4px ${threatColor})` }}
              />
            </svg>
            {/* Radar sweep wedge */}
            <div
              className="radar-sweep absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${threatColor}22 30deg, transparent 60deg)`,
              }}
            />
            {/* Score text */}
            <span
              className="mono-data absolute inset-0 flex items-center justify-center"
              style={{ fontSize: 11, color: threatColor, fontWeight: 500 }}
            >
              {threatScore}
            </span>
          </div>
          <div className="flex flex-col">
            <span
              className="mono-data"
              style={{ fontSize: 11, color: threatColor }}
            >
              {activeIncidentCount} ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Right: ⌘K + Sound */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 px-3 py-1 rounded"
          style={{
            background: 'rgba(14, 42, 56, 0.5)',
            border: '1px solid #0E2A38',
            color: '#5E7A8A',
            fontSize: 12,
          }}
        >
          <Search size={13} />
          <span className="mono-data text-11">⌘K</span>
        </button>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded"
          style={{
            color: soundOn ? '#22D3EE' : '#5E7A8A',
            background: 'transparent',
            border: 'none',
          }}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </header>
  );
}
