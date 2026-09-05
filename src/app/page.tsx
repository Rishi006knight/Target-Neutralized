'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HudBar from '@/components/abyssal/HudBar';
import MapView from '@/components/abyssal/MapView';
import RightDock from '@/components/abyssal/RightDock';
import ThreatWindows from '@/components/abyssal/ThreatWindows';
import ClusterOverlay from '@/components/abyssal/ClusterOverlay';
import CommandPalette from '@/components/abyssal/CommandPalette';
import {
  useAbyssalIncidents,
  useAbyssalVessels,
  useAbyssalThreatWindows,
  useAbyssalClusters,
} from '@/hooks/use-abyssal-data';
import { useAisStream } from '@/hooks/use-ais-stream';
import {
  type AbyssalIncident,
  type AbyssalVessel,
  getActiveIncidentCount,
} from '@/lib/mock-data';

export default function AbyssalThreatConsole() {
  // Queries
  const { data: incidents = [] } = useAbyssalIncidents();
  const { data: baseVessels = [] } = useAbyssalVessels();
  const { data: threatWindows = [] } = useAbyssalThreatWindows();
  const { data: clusters = [] } = useAbyssalClusters();

  // Real-time live AIS telemetry stream
  const { liveVessels, isConnected, isSimulated } = useAisStream();

  // Selection & UI state
  const [selectedIncident, setSelectedIncident] = useState<AbyssalIncident | null>(null);
  const [selectedVesselMmsi, setSelectedVesselMmsi] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);
  const [rightDockCollapsed, setRightDockCollapsed] = useState(false);

  // Merge base vessels with real-time AIS stream (live stream takes precedence)
  const allVessels = useMemo(() => {
    const vesselMap = new Map<string, AbyssalVessel>();
    baseVessels.forEach((v) => vesselMap.set(v.mmsi, v));
    liveVessels.forEach((v) => vesselMap.set(v.mmsi, v));
    return Array.from(vesselMap.values());
  }, [baseVessels, liveVessels]);

  // Audio cue synthesizer (Web Audio API)
  const playHudBeep = useCallback((freq = 880, type: OscillatorType = 'sine', duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context policy fallback
    }
  }, []);

  // Keyboard Shortcuts (⌘K, Escape, C, D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        playHudBeep(1200, 'sine', 0.05);
      } else if (e.key === 'Escape') {
        if (isCommandOpen) {
          setIsCommandOpen(false);
        } else if (selectedIncident) {
          setSelectedIncident(null);
          playHudBeep(600, 'triangle', 0.04);
        }
      } else if (e.key.toLowerCase() === 'c' && !isCommandOpen && e.target === document.body) {
        setShowClusters((prev) => !prev);
        playHudBeep(750, 'sine', 0.04);
      } else if (e.key.toLowerCase() === 'd' && !isCommandOpen && e.target === document.body) {
        setRightDockCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, selectedIncident, playHudBeep]);

  // Handle incident selection (opens dossier in RightDock & highlights)
  const handleSelectIncident = useCallback((incident: AbyssalIncident) => {
    setSelectedIncident(incident);
    setSelectedVesselMmsi(null);
    setRightDockCollapsed(false);
    playHudBeep(incident.severity === 'critical' ? 950 : 700, 'sawtooth', 0.09);
  }, [playHudBeep]);

  const handleDeselectIncident = useCallback(() => {
    setSelectedIncident(null);
    playHudBeep(520, 'sine', 0.04);
  }, [playHudBeep]);

  // Handle vessel highlighting
  const handleSelectVessel = useCallback((vessel: AbyssalVessel) => {
    setSelectedVesselMmsi(vessel.mmsi);
    // If vessel is linked to an incident, open that incident's dossier
    const linkedIncident = incidents.find((i) => i.linkedVessels.includes(vessel.mmsi));
    if (linkedIncident) {
      setSelectedIncident(linkedIncident);
    }
    playHudBeep(800, 'sine', 0.05);
  }, [incidents, playHudBeep]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#03080D] select-none text-[#C9D6DF]">
      {/* ── Background Lat/Long Grid & Scanline FX ── */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)',
        }}
      />

      {/* ── Top HUD Header ── */}
      <HudBar
        onOpenCommand={() => {
          setIsCommandOpen(true);
          playHudBeep(1200, 'sine', 0.05);
        }}
        activeIncidentCount={getActiveIncidentCount()}
      />

      {/* ── Main Map Canvas (Full Viewport) ── */}
      <main className="absolute inset-0 z-0 pt-12">
        <MapView
          incidents={incidents}
          vessels={allVessels}
          clusters={clusters}
          showClusters={showClusters}
          selectedIncidentId={selectedIncident?.id || null}
          selectedVesselMmsi={selectedVesselMmsi}
          onSelectIncident={handleSelectIncident}
          onSelectVessel={handleSelectVessel}
        />
      </main>

      {/* ── Bottom-Left: 48H Predictive Threat Windows ── */}
      <ThreatWindows windows={threatWindows} />

      {/* ── Bottom-Right: ML Cluster Overlay Toggle ── */}
      <div
        className="transition-all duration-300"
        style={{
          position: 'fixed',
          bottom: 16,
          right: rightDockCollapsed ? 24 : 440,
          zIndex: 40,
        }}
      >
        <ClusterOverlay
          clusters={clusters}
          showClusters={showClusters}
          onToggle={() => {
            setShowClusters((prev) => !prev);
            playHudBeep(750, 'sine', 0.04);
          }}
          activeClusterId={activeClusterId}
          onSelectCluster={(id) => {
            setActiveClusterId(id);
            if (id) {
              const clu = clusters.find((c) => c.id === id);
              if (clu && clu.incidentIds.length > 0) {
                const firstInc = incidents.find((i) => i.id === clu.incidentIds[0]);
                if (firstInc) handleSelectIncident(firstInc);
              }
            }
          }}
        />
      </div>

      {/* ── Right Dock: Feed ↔ Dossier Investigation Panel ── */}
      <RightDock
        incidents={incidents}
        vessels={allVessels}
        clusters={clusters}
        selectedIncident={selectedIncident}
        collapsed={rightDockCollapsed}
        onToggleCollapse={() => setRightDockCollapsed((prev) => !prev)}
        onSelectIncident={handleSelectIncident}
        onDeselectIncident={handleDeselectIncident}
        onHighlightVessel={(mmsi) => {
          setSelectedVesselMmsi(mmsi);
          playHudBeep(850, 'sine', 0.05);
        }}
      />

      {/* ── ⌘K Command Palette ── */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        vessels={allVessels}
        incidents={incidents}
        onSelectVessel={(mmsi) => {
          setSelectedVesselMmsi(mmsi);
          const inc = incidents.find((i) => i.linkedVessels.includes(mmsi));
          if (inc) setSelectedIncident(inc);
        }}
        onSelectIncident={(id) => {
          const inc = incidents.find((i) => i.id === id);
          if (inc) handleSelectIncident(inc);
        }}
      />

      {/* ── Stream Status Pill (Top Right, sub-header) ── */}
      <div className="fixed top-14 left-5 z-40 pointer-events-none">
        <div className="px-2.5 py-1 rounded bg-[#08141C]/85 border border-[#0E2A38] backdrop-blur flex items-center gap-2 text-[10px] font-mono">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: isConnected ? '#22D3EE' : '#F59E0B',
              boxShadow: isConnected ? '0 0 8px #22D3EE' : 'none',
            }}
          />
          <span className="text-[#5E7A8A]">TELEMETRY:</span>
          <span className="text-[#C9D6DF] uppercase">
            {isConnected ? (isSimulated ? 'AIS STREAM SIMULATED' : 'AISSTREAM.IO LIVE') : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
}