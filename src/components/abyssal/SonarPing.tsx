'use client';

import React from 'react';

interface SonarPingProps {
  color?: string;
  size?: number;
}

export default function SonarPing({ color = '#22D3EE', size = 40 }: SonarPingProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Ring 1 */}
      <div
        className="sonar-ping absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${color}`,
          opacity: 0.6,
        }}
      />
      {/* Ring 2 — delayed */}
      <div
        className="sonar-ping absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${color}`,
          opacity: 0.4,
          animationDelay: '0.7s',
        }}
      />
      {/* Center dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: 6,
          height: 6,
          background: color,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  );
}
