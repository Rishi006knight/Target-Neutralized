'use client';

import React, { useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { Search, Anchor, AlertTriangle, Navigation, X } from 'lucide-react';
import { type AbyssalVessel, type AbyssalIncident, formatCoords } from '@/lib/mock-data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: AbyssalVessel[];
  incidents: AbyssalIncident[];
  onSelectVessel: (mmsi: string) => void;
  onSelectIncident: (id: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  vessels,
  incidents,
  onSelectVessel,
  onSelectIncident,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      style={{ paddingTop: 120, background: 'rgba(3, 8, 13, 0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-panel corner-brackets overflow-hidden"
        style={{
          width: 560,
          maxHeight: 440,
          borderRadius: 6,
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="bracket-bottom" />
        <Command
          label="OceanShield Command"
          className="flex flex-col"
        >
          {/* Input */}
          <div
            className="flex items-center gap-3 px-4"
            style={{ borderBottom: '1px solid #0E2A38', height: 48 }}
          >
            <Search size={16} style={{ color: '#5E7A8A', flexShrink: 0 }} />
            <Command.Input
              ref={inputRef}
              placeholder="Search vessels, incidents, or actions…"
              className="flex-1 bg-transparent outline-none mono-data text-13"
              style={{ color: '#C9D6DF', border: 'none' }}
            />
            <button onClick={onClose} style={{ color: '#5E7A8A', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>

          {/* Results */}
          <Command.List
            className="overflow-y-auto p-2"
            style={{ maxHeight: 380 }}
          >
            <Command.Empty className="px-4 py-8 text-center" style={{ color: '#5E7A8A', fontSize: 13 }}>
              No results found.
            </Command.Empty>

            {/* Incidents */}
            <Command.Group
              heading={
                <span className="hud-label px-2" style={{ fontSize: 10 }}>
                  INCIDENTS
                </span>
              }
            >
              {incidents.slice(0, 8).map((inc) => (
                <Command.Item
                  key={inc.id}
                  value={`${inc.id} ${inc.type} ${inc.vesselName || ''} ${inc.verdict}`}
                  onSelect={() => { onSelectIncident(inc.id); onClose(); }}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer"
                  style={{ fontSize: 13 }}
                >
                  <AlertTriangle size={13} style={{ color: inc.severity === 'critical' ? '#F43F5E' : '#F59E0B', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="mono-data text-11" style={{ color: '#22D3EE' }}>{inc.id}</span>
                      <span style={{ color: '#C9D6DF', fontSize: 12 }}>{inc.type}</span>
                    </div>
                    <div
                      className="truncate"
                      style={{ fontSize: 11, color: '#5E7A8A' }}
                    >
                      {inc.vesselName || 'Unknown vessel'} — {inc.source}
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Vessels */}
            <Command.Group
              heading={
                <span className="hud-label px-2" style={{ fontSize: 10 }}>
                  VESSELS
                </span>
              }
            >
              {vessels.slice(0, 10).map((v) => (
                <Command.Item
                  key={v.mmsi}
                  value={`${v.name} ${v.mmsi} ${v.type} ${v.flag}`}
                  onSelect={() => { onSelectVessel(v.mmsi); onClose(); }}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer"
                  style={{ fontSize: 13 }}
                >
                  {v.status === 'DARK' ? (
                    <AlertTriangle size={13} style={{ color: '#F43F5E', flexShrink: 0 }} />
                  ) : (
                    <Anchor size={13} style={{ color: '#22D3EE', flexShrink: 0 }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#C9D6DF', fontSize: 12, fontWeight: 600 }}>{v.name}</span>
                      {v.status === 'DARK' && (
                        <span className="mono-data text-11" style={{ color: '#F43F5E' }}>DARK</span>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-2"
                      style={{ fontSize: 11, color: '#5E7A8A' }}
                    >
                      <span className="mono-data">{v.mmsi}</span>
                      <span>·</span>
                      <span>{v.type}</span>
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group
              heading={
                <span className="hud-label px-2" style={{ fontSize: 10 }}>
                  ACTIONS
                </span>
              }
            >
              <Command.Item
                value="show all clusters"
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer"
                style={{ fontSize: 13 }}
              >
                <Navigation size={13} style={{ color: '#22D3EE', flexShrink: 0 }} />
                <span style={{ color: '#C9D6DF', fontSize: 12 }}>Show ML Clusters</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
