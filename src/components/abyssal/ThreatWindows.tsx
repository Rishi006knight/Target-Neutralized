'use client';

import React from 'react';
import { type ThreatWindow, getSeverityColor } from '@/lib/mock-data';

interface ThreatWindowsProps {
  windows: ThreatWindow[];
}

export default function ThreatWindows({ windows }: ThreatWindowsProps) {
  return (
    <div
      className="glass-panel corner-brackets fixed z-40"
      style={{
        bottom: 16,
        left: 16,
        width: 320,
        padding: '12px 14px',
      }}
    >
      <div className="bracket-bottom" />
      <div className="hud-label" style={{ marginBottom: 10 }}>
        48H THREAT WINDOWS
      </div>
      <div className="flex flex-col gap-2">
        {windows.map((w) => {
          const color =
            w.score >= 80 ? '#F43F5E' :
            w.score >= 60 ? '#F59E0B' :
            w.score >= 40 ? '#22D3EE' : '#2DD4BF';

          return (
            <div key={w.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span
                  className="font-sans"
                  style={{ fontSize: 11, color: '#C9D6DF', fontWeight: 600 }}
                >
                  {w.region}
                </span>
                <div className="flex items-center gap-2">
                  <span className="mono-data text-11" style={{ color }}>
                    {w.score}%
                  </span>
                  <span className="mono-data text-11" style={{ color: '#5E7A8A' }}>
                    PEAK {w.peakIn}
                  </span>
                </div>
              </div>
              {/* Meter bar */}
              <div
                style={{
                  height: 4,
                  background: '#0E2A38',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${w.score}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                    boxShadow: w.score >= 80 ? `0 0 8px ${color}66` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
