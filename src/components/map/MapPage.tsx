'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Flame,
  Satellite,
  ChevronDown,
  ChevronUp,
  Bell,
  Clock,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockSatellitePasses, type Incident, type Vessel, type RiskZone } from '@/lib/mock-data';

// Dynamically import Leaflet map with ssr: false and radar sweep loading animation
const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#060b14]">
      <div className="flex flex-col items-center gap-4">
        {/* Radar Sweep Loading Animation */}
        <div className="relative w-20 h-20 rounded-full border border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="w-12 h-12 rounded-full border border-cyan-500/30" />
          <div className="w-4 h-4 rounded-full bg-cyan-400" />
          {/* Rotating Radar Sweep Cone */}
          <div
            className="absolute inset-0 radar-sweep-anim"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0, 229, 255, 0.4) 0deg, transparent 60deg, transparent 360deg)',
            }}
          />
        </div>
        <span className="font-mono text-xs text-cyan-400 tracking-widest animate-pulse">
          ACQUIRING SATELLITE RADAR GRID...
        </span>
      </div>
    </div>
  ),
});

interface MapPageProps {
  incidents: Incident[];
  vessels: Vessel[];
  liveVessels?: Vessel[];
  riskZones: RiskZone[];
  loading: boolean;
  onSelectVessel?: (vessel: Vessel) => void;
  onSelectIncident?: (incident: Incident) => void;
}

export default function MapPage({
  incidents = [],
  vessels = [],
  liveVessels = [],
  riskZones = [],
  loading,
  onSelectVessel,
  onSelectIncident,
}: MapPageProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSatelliteSchedule, setShowSatelliteSchedule] = useState(false);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const toggleReminder = (id: string, name: string) => {
    setReminders((prev) => {
      const next = !prev[id];
      if (next) {
        toast.success(`Overpass reminder set for ${name}`);
      } else {
        toast.info(`Reminder cancelled for ${name}`);
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="h-full flex flex-col space-y-3 relative">
      {/* Top Map Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-display tracking-wide text-white">
            Global Tactical Grid
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            REAL-TIME AIS STREAM, SATELLITE SAR COVERAGE, &amp; PIRACY HEATMAP
          </p>
        </div>

        {/* Filter and Layer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Filter Buttons */}
          <div className="flex bg-slate-900/90 border border-slate-800 rounded-lg p-1 font-mono text-xs">
            {['all', 'incidents', 'vessels', 'dark', 'live'].map((tab) => (
              <button
                key={tab}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === tab
                    ? tab === 'dark'
                      ? 'bg-amber-500 text-black font-bold'
                      : tab === 'live'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-cyan-500 text-black font-bold'
                    : tab === 'dark'
                    ? 'text-amber-400 hover:text-amber-300'
                    : tab === 'live'
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'dark' && <AlertCircle className="w-3 h-3" />}
                {tab === 'live' && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Heatmap Layer Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`h-8 font-mono text-xs gap-1.5 border-slate-700 transition-all ${
              showHeatmap
                ? 'bg-red-950 text-red-400 border-red-800'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-red-400 fill-red-400' : 'text-slate-400'}`} />
            <span>HEATMAP</span>
          </Button>

          {/* Satellite Passes Panel Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSatelliteSchedule(!showSatelliteSchedule)}
            className={`h-8 font-mono text-xs gap-1.5 border-slate-700 transition-all ${
              showSatelliteSchedule
                ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>SAT PASSES</span>
            {showSatelliteSchedule ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Main Tactical Map Card */}
      <Card className="flex-1 overflow-hidden border-border relative rounded-xl" style={{ minHeight: 540 }}>
        <LeafletMapClient
          incidents={incidents}
          vessels={vessels}
          liveVessels={liveVessels}
          riskZones={riskZones}
          activeTab={activeTab}
          showHeatmap={showHeatmap}
          activeSatellitePasses={showSatelliteSchedule ? mockSatellitePasses : []}
          onSelectVessel={onSelectVessel}
          onSelectIncident={onSelectIncident}
        />

        {/* Collapsible Upcoming Satellite Passes Floating Overlay */}
        {showSatelliteSchedule && (
          <div className="absolute bottom-4 left-4 z-[1000] w-80 bg-[#0c1322]/95 border border-cyan-500/40 backdrop-blur-md p-3.5 rounded-xl shadow-2xl font-mono text-xs space-y-2.5 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                <Satellite className="w-3.5 h-3.5 animate-pulse" /> UPCOMING SAR OVERFLIGHTS
              </div>
              <span className="text-[9px] text-slate-500">REAL-TIME ORBIT</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {mockSatellitePasses.map((pass) => (
                <div
                  key={pass.id}
                  className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">{pass.satelliteName}</span>
                    <span className="text-cyan-400 text-[10px] flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> in {pass.countdownMinutes}m
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Coverage: {pass.coverageArea}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {pass.sensorType}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleReminder(pass.id, pass.satelliteName)}
                      className={`text-[9px] flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                        reminders[pass.id]
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'text-slate-400 hover:text-white bg-slate-800'
                      }`}
                    >
                      <Bell className="w-2.5 h-2.5" />
                      {reminders[pass.id] ? 'REMINDER ACTIVE' : 'SET REMINDER'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tactical Legend Overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-[#060b14]/90 border border-slate-800 backdrop-blur-md p-3 rounded-lg font-mono text-[10px] text-slate-400 space-y-1.5 shadow-2xl pointer-events-none">
          <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3" /> RADAR MATRIX
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-400 transform rotate-45 shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-200">LIVE AIS STREAM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-cyan-400 transform rotate-45 shadow-[0_0_6px_#00e5ff]" />
            <span className="text-slate-200">MONITORED FLEET</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-400 transform rotate-45 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-amber-400 font-bold">DARK VESSEL (NO AIS)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <span className="text-red-400 font-bold">CRITICAL INCIDENT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 border border-dashed border-red-500 bg-red-500/20 rounded-full" />
            <span className="text-slate-300">PIRACY HAZARD ZONE</span>
          </div>
        </div>
      </Card>
    </div>
  );
}