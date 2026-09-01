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
  Star,
  Bell,
  Gauge,
  Compass,
  FileText,
  Ship,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCoordinate, getRiskColor } from '@/lib/utils-maritime';
import { toast } from 'sonner';
import type { Vessel, Alert } from '@/lib/mock-data';

interface VesselDetailDrawerProps {
  vessel: Vessel | null;
  isOpen: boolean;
  onClose: () => void;
  alerts?: Alert[];
  onSelectIncident?: (id: number) => void;
  onOpenAlertRule?: () => void;
}

export default function VesselDetailDrawer({
  vessel,
  isOpen,
  onClose,
  alerts = [],
  onSelectIncident,
  onOpenAlertRule,
}: VesselDetailDrawerProps) {
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4 | 8>(1);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [notes, setNotes] = useState('');

  // Load / Save Notes to localStorage
  useEffect(() => {
    if (vessel) {
      const savedNotes = localStorage.getItem(`vessel_notes_${vessel.mmsi}`) || '';
      setNotes(savedNotes);
      const savedWatch = localStorage.getItem(`vessel_watchlist_${vessel.mmsi}`) === 'true';
      setIsWatchlisted(savedWatch);
      setPlaybackIndex(0);
      setIsPlayingRoute(false);
    }
  }, [vessel]);

  const handleSaveNotes = (text: string) => {
    setNotes(text);
    if (vessel) {
      localStorage.setItem(`vessel_notes_${vessel.mmsi}`, text);
    }
  };

  const toggleWatchlist = () => {
    if (!vessel) return;
    const next = !isWatchlisted;
    setIsWatchlisted(next);
    localStorage.setItem(`vessel_watchlist_${vessel.mmsi}`, String(next));
    toast.success(next ? `Added ${vessel.name} to Watchlist.` : `Removed ${vessel.name} from Watchlist.`);
  };

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

  const speedPercent = Math.min(100, Math.max(0, (vessel.speed / 30) * 100));
  const riskScorePercent = Math.round(vessel.riskScore * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* 5.2 480px Slide-Over Panel */}
      <aside
        className="relative w-full max-w-[480px] bg-[#111827] border-l border-[rgba(0,229,255,0.2)] shadow-2xl h-full flex flex-col z-10 overflow-hidden text-slate-200 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-label={`Vessel Details for ${vessel.name}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0A0E17]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-[#00E5FF] animate-pulse" />
            <div>
              <h2 className="font-display font-bold text-base tracking-wider text-white truncate max-w-[240px]">
                {vessel.name}
              </h2>
              <span className="font-mono text-xs text-[#64748B]">MMSI: {vessel.mmsi}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Watchlist Star Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleWatchlist}
              className={`h-8 w-8 rounded-lg cursor-pointer ${
                isWatchlisted ? 'text-amber-400' : 'text-slate-500 hover:text-white'
              }`}
              title="Add to Watchlist"
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-8 w-8 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {/* Status Badge Strip */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-[#0A0E17] border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  vessel.isDark ? 'bg-[#FF3B5C] animate-pulse' : 'bg-[#00E676]'
                }`}
              />
              <span className="font-bold text-white uppercase text-xs">
                {vessel.isDark ? 'DARK CONTACT (NO AIS)' : 'AIS BROADCASTING'}
              </span>
            </div>
            <span className="text-[10px] text-[#64748B]">
              LAST CONTACT: {new Date(vessel.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
            </span>
          </div>

          {/* 5.2 Two-Column Info Grid */}
          <div className="p-3 bg-[#1A2332] border border-slate-800 rounded-lg grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-[#64748B] block text-[9px]">TYPE / CATEGORY</span>
              <span className="text-white font-bold">{vessel.type || 'Container Vessel'}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[9px]">FLAG OF REGISTRY</span>
              <span className="text-white font-bold">{vessel.flag || 'Marshall Islands'}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[9px]">CALL SIGN</span>
              <span className="text-[#00E5FF] font-bold">V7AA9</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[9px]">GROSS TONNAGE</span>
              <span className="text-white font-bold">94,300 GT</span>
            </div>
          </div>

          {/* Semicircular Speed & Heading Gauges */}
          <div className="grid grid-cols-2 gap-3">
            {/* Speed Gauge */}
            <div className="p-3 bg-[#0A0E17] border border-slate-800 rounded-lg text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[#64748B] text-[10px]">
                <Gauge className="w-3.5 h-3.5 text-[#00E5FF]" /> SPEED
              </div>
              <div className="text-xl font-display font-bold text-[#00E5FF]">
                {currentRoutePoint.speed.toFixed(1)} <span className="text-xs font-mono text-slate-400">KTS</span>
              </div>
              {/* Mini Gauge Bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: `${speedPercent}%` }} />
              </div>
            </div>

            {/* Heading Compass */}
            <div className="p-3 bg-[#0A0E17] border border-slate-800 rounded-lg text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[#64748B] text-[10px]">
                <Compass className="w-3.5 h-3.5 text-[#00E5FF]" /> HEADING
              </div>
              <div className="text-xl font-display font-bold text-[#00E5FF]">
                {currentRoutePoint.heading.toFixed(1)}&deg;
              </div>
              <div className="text-[9px] text-[#64748B]">COURSE OVER GROUND</div>
            </div>
          </div>

          {/* Risk Score Circular Progress & Sparkline */}
          <div className="p-3 bg-[#1A2332] border border-slate-800 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* 100px Circular Ring */}
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-[#0A0E17] border-2 border-[#FF3B5C]/60 shadow-[0_0_12px_rgba(255,59,92,0.3)]">
                <span className="font-display font-bold text-lg text-white">{riskScorePercent}%</span>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-white block">COMPOSITE THREAT</span>
                <span className="text-[10px] text-[#64748B]">ML EVALUATION (30D)</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="flex items-end gap-1 h-8">
              {(vessel.scoreHistory || [0.2, 0.4, 0.6, 0.7, vessel.riskScore]).map((score, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-xs ${getRiskColor(score)}`}
                  style={{ height: `${Math.max(15, score * 100)}%` }}
                  title={`Score: ${(score * 100).toFixed(0)}%`}
                />
              ))}
            </div>
          </div>

          {/* 5.3 Route Playback Section */}
          <div className="p-3 bg-[#0A0E17] border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[#00E5FF] font-bold text-[11px] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#00E5FF]" /> HISTORICAL ROUTE PLAYBACK
              </span>
              <span className="text-[9px] text-[#64748B]">{currentRoutePoint.timestamp}</span>
            </div>

            {/* Scrubber Bar */}
            <input
              type="range"
              min={0}
              max={route.length - 1}
              value={playbackIndex}
              onChange={(e) => {
                setPlaybackIndex(Number(e.target.value));
                setIsPlayingRoute(false);
              }}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
            />

            {/* Controls Strip */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlayingRoute(!isPlayingRoute)}
                  className="h-7 px-2.5 bg-[#00E5FF] text-black font-bold text-xs hover:bg-[#00E5FF]/80"
                >
                  {isPlayingRoute ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="ml-1">{isPlayingRoute ? 'PAUSE' : 'PLAY'}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPlaybackIndex(0)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
                {[1, 2, 4, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPlaybackSpeed(s as any)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      playbackSpeed === s ? 'bg-[#00E5FF] text-black font-bold' : 'text-slate-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linked Incidents */}
          {linkedAlerts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[#FF3B5C] font-bold text-[10px] block">LINKED THREAT ALERTS</span>
              {linkedAlerts.slice(0, 2).map((alt) => (
                <div key={alt.id} className="p-2 bg-[#1A2332] border border-slate-800 rounded text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{alt.title}</span>
                    <span className="text-[9px] text-[#FF3B5C] uppercase">{alt.severity}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] line-clamp-1">{alt.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Operator Notes (Saved to LocalStorage) */}
          <div className="space-y-1">
            <span className="text-[#64748B] font-bold text-[10px] block">OPERATOR SURVEILLANCE NOTES</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => handleSaveNotes(e.target.value)}
              placeholder="Type tactical log notes for this vessel (auto-saved)..."
              className="w-full bg-[#0A0E17] border border-slate-800 rounded-lg p-2 text-xs font-mono text-white placeholder:text-slate-600 focus:border-[#00E5FF]"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
