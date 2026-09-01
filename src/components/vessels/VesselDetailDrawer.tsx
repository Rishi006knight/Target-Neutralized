'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  Shield,
  Radio,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCoordinate, getRiskColor } from '@/lib/utils-maritime';
import type { Vessel, Alert } from '@/lib/mock-data';

interface VesselDetailDrawerProps {
  vessel: Vessel | null;
  isOpen: boolean;
  onClose: () => void;
  alerts?: Alert[];
  onSelectIncident?: (id: number) => void;
}

export default function VesselDetailDrawer({
  vessel,
  isOpen,
  onClose,
  alerts = [],
  onSelectIncident,
}: VesselDetailDrawerProps) {
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  const route = vessel?.routeHistory || [
    { lat: (vessel?.lat || 0) - 0.5, lng: (vessel?.lng || 0) - 0.8, speed: 17.5, heading: 85.0, timestamp: '10:00 UTC' },
    { lat: (vessel?.lat || 0) - 0.2, lng: (vessel?.lng || 0) - 0.4, speed: 18.0, heading: 85.2, timestamp: '11:30 UTC' },
    { lat: vessel?.lat || 0, lng: vessel?.lng || 0, speed: vessel?.speed || 18.2, heading: vessel?.heading || 85.4, timestamp: '13:00 UTC' },
  ];

  const currentRoutePoint = route[playbackIndex] || route[route.length - 1];

  // Route playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlayingRoute) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= route.length - 1) {
            setIsPlayingRoute(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingRoute, playbackSpeed, route.length]);

  if (!isOpen || !vessel) return null;

  const linkedAlerts = alerts.filter(
    (a) => a.relatedVesselMmsi === vessel.mmsi || (vessel.name && a.message.includes(vessel.name))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* 400px Slide-Over Panel */}
      <aside
        className="relative w-full max-w-[420px] bg-[#0c1322] border-l border-slate-700/80 shadow-2xl h-full flex flex-col z-10 overflow-hidden text-slate-200 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-label={`Vessel Details for ${vessel.name}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="font-display font-bold text-lg tracking-wider text-white truncate max-w-[280px]">
                {vessel.name}
              </h2>
              <span className="font-mono text-xs text-slate-400">MMSI: {vessel.mmsi}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {/* Status Badge Strip */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  vessel.isDark ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className={vessel.isDark ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {vessel.isDark ? 'AIS OFFLINE (DARK)' : 'TRANSPONDER ACTIVE'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase">
              {vessel.type || 'Commercial Transit'}
            </span>
          </div>

          {/* Telemetry Matrix */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-1">LATITUDE / LONGITUDE</span>
              <span className="text-white font-bold text-[11px]">
                {formatCoordinate(currentRoutePoint.lat, true)}
                <br />
                {formatCoordinate(currentRoutePoint.lng, false)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-1">SPEED / HEADING</span>
              <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
                <Navigation
                  className="w-3.5 h-3.5 text-cyan-400"
                  style={{ transform: `rotate(${currentRoutePoint.heading}deg)` }}
                />
                <span>{currentRoutePoint.heading.toFixed(1)}&deg;</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-400">{currentRoutePoint.speed.toFixed(1)} kts</span>
              </div>
            </div>
          </div>

          {/* Threat Risk Meter with Sparkline History */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> ML THREAT SCORE
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  vessel.riskScore > 0.7
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : vessel.riskScore > 0.4
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {(vessel.riskScore * 100).toFixed(0)}% CRITICALITY
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${getRiskColor(vessel.riskScore)}`}
                style={{ width: `${vessel.riskScore * 100}%` }}
              />
            </div>

            {/* Mini Sparkline Chart */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-500 block mb-1">SCORE TIMELINE (PAST 24H)</span>
              <div className="flex items-end gap-1.5 h-8 bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                {(vessel.scoreHistory || [0.2, 0.25, 0.3, 0.35, vessel.riskScore]).map((score, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500/80 rounded-t hover:bg-cyan-400 transition-all"
                    style={{ height: `${Math.max(15, score * 100)}%` }}
                    title={`Score: ${(score * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Embedded Tactical Position Preview with 50nm Standoff Buffer */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> TACTICAL POSITION &amp; 50NM BUFFER
              </span>
              <span className="text-slate-500">FLAG: {vessel.flag || 'INTERNATIONAL'}</span>
            </div>

            {/* SVG Tactical Radar Display */}
            <div className="relative w-full h-36 bg-[#060b14] rounded border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Radar Rings */}
              <div className="absolute w-28 h-28 rounded-full border border-cyan-500/20" />
              <div className="absolute w-20 h-20 rounded-full border border-cyan-500/30" />
              <div className="absolute w-12 h-12 rounded-full border border-cyan-500/40" />
              <div className="absolute w-full h-[1px] bg-cyan-500/15" />
              <div className="absolute h-full w-[1px] bg-cyan-500/15" />

              {/* 50nm Standoff Ring */}
              <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-amber-500/40 bg-amber-500/5 animate-pulse" />

              {/* Vessel Blip */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="w-3 h-3 bg-cyan-400 transform rotate-45 border border-black shadow-[0_0_8px_#00e5ff]"
                  style={{ transform: `rotate(${currentRoutePoint.heading}deg)` }}
                />
                <span className="text-[9px] text-cyan-300 font-bold mt-1 bg-black/80 px-1 rounded">
                  {vessel.name}
                </span>
              </div>
            </div>
          </div>

          {/* Historical Route Playback Controls */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <FastForward className="w-3.5 h-3.5 text-cyan-400" /> ROUTE HISTORY PLAYBACK
              </span>
              <span className="text-cyan-400 text-[11px] font-bold">
                {currentRoutePoint.timestamp}
              </span>
            </div>

            {/* Scrubber Bar */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={route.length - 1}
                value={playbackIndex}
                onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlayingRoute(!isPlayingRoute)}
                  className="h-7 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-mono gap-1"
                >
                  {isPlayingRoute ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlayingRoute ? 'PAUSE' : 'PLAY'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsPlayingRoute(false);
                    setPlaybackIndex(0);
                  }}
                  className="h-7 text-xs text-slate-400 hover:text-white"
                  title="Reset track"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>

              {/* Speed Switcher */}
              <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
                {[1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed as 1 | 2 | 4)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      playbackSpeed === speed
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linked Threat Alerts */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> LINKED THREAT ALERTS (
              {linkedAlerts.length})
            </span>
            {linkedAlerts.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-1">No active threat alerts linked to this MMSI.</p>
            ) : (
              <div className="space-y-1.5">
                {linkedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2 bg-slate-950/80 border border-slate-800 rounded hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
                      <span>{alert.title}</span>
                      {alert.relatedIncidentId && onSelectIncident && (
                        <button
                          onClick={() => onSelectIncident(alert.relatedIncidentId!)}
                          className="text-cyan-400 hover:underline flex items-center gap-0.5"
                        >
                          INCIDENT #{alert.relatedIncidentId} <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] line-clamp-2 mt-0.5">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
