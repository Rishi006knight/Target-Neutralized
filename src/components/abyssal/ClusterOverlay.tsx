'use client';

import React from 'react';
import { GitBranch } from 'lucide-react';
import { type IncidentCluster } from '@/lib/mock-data';

interface ClusterOverlayProps {
  clusters: IncidentCluster[];
  showClusters: boolean;
  onToggle: () => void;
  activeClusterId: string | null;
  onSelectCluster: (id: string | null) => void;
}

export default function ClusterOverlay({
  clusters,
  showClusters,
  onToggle,
  activeClusterId,
  onSelectCluster,
}: ClusterOverlayProps) {
  return (
    <div className="fixed z-40" style={{ bottom: 16, right: 16 }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="glass-panel flex items-center gap-2 px-3 py-2 rounded"
        style={{
          color: showClusters ? '#22D3EE' : '#5E7A8A',
          boxShadow: showClusters ? '0 0 12px rgba(34, 211, 238, 0.2)' : 'none',
          cursor: 'pointer',
          border: `1px solid ${showClusters ? '#22D3EE33' : '#0E2A38'}`,
        }}
      >
        <GitBranch size={14} />
        <span className="hud-label" style={{ color: 'inherit', fontSize: 11 }}>
          ML CLUSTERS
        </span>
        <span className="mono-data text-11" style={{ color: '#22D3EE' }}>
          {clusters.length}
        </span>
      </button>

      {/* Cluster list panel */}
      {showClusters && (
        <div
          className="glass-panel corner-brackets absolute bottom-11 right-0 mt-2"
          style={{
            width: 260,
            padding: '10px 12px',
          }}
        >
          <div className="bracket-bottom" />
          <div className="hud-label" style={{ marginBottom: 8 }}>
            LINKED INCIDENTS
          </div>
          <div className="flex flex-col gap-1.5">
            {clusters.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCluster(activeClusterId === c.id ? null : c.id)}
                className="flex items-center justify-between px-2 py-1.5 rounded text-left w-full"
                style={{
                  background: activeClusterId === c.id ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                  border: activeClusterId === c.id ? '1px solid #22D3EE33' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div className="flex flex-col">
                  <span style={{ fontSize: 12, color: '#C9D6DF', fontWeight: 600 }}>
                    {c.label}
                  </span>
                  <span className="mono-data text-11" style={{ color: '#5E7A8A' }}>
                    {c.incidentIds.length} incidents
                  </span>
                </div>
                <span
                  className="mono-data text-11"
                  style={{ color: '#22D3EE' }}
                >
                  {(c.linkScore * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
