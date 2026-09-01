'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Layers,
  Compass,
  Ruler,
  Maximize2,
  Plus,
  Minus,
  Satellite,
  Flame,
  AlertTriangle,
  Ship,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockSatellitePasses, type Incident, type Vessel, type RiskZone } from '@/lib/mock-data';

const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0E17]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 flex items-center justify-center overflow-hidden">
          <div className="w-12 h-12 rounded-full border border-[#00E5FF]/30" />
          <div className="w-4 h-4 rounded-full bg-[#00E5FF]" />
          <div
            className="absolute inset-0 radar-sweep-anim"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0, 229, 255, 0.4) 0deg, transparent 60deg, transparent 360deg)',
            }}
          />
        </div>
        <span className="font-mono text-xs text-[#00E5FF] tracking-widest animate-pulse">
          INITIALIZING SATELLITE RADAR GRID...
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
  const [layers, setLayers] = useState({
    vessels: true,
    incidents: true,
    darkContacts: true,
    riskZones: true,
    heatmap: false,
    satellite: true,
  });

  const [satelliteBlend, setSatelliteBlend] = useState<number>(0);
  const [measuringMode, setMeasuringMode] = useState<boolean>(false);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCenterFleet = () => {
    if ((window as any).centerOnFleet) {
      (window as any).centerOnFleet();
      toast.success('Radar centered on monitored fleet.');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3 relative">
      {/* Top Map Header Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-display tracking-wide text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            TACTICAL SITUATIONAL RADAR
          </h1>
          <p className="text-xs text-[#64748B] font-mono">
            MULTI-LAYER SATELLITE AIS STREAM &middot; GCS MARITIME GRID
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCenterFleet}
            className="h-8 font-mono text-xs gap-1.5 border-[rgba(0,229,255,0.2)] bg-[#111827] hover:bg-[#1A2332] text-[#00E5FF]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>CENTER FLEET</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMeasuringMode(!measuringMode);
              toast.info(measuringMode ? 'Measurement tool disabled.' : 'Click two points on the map to measure nautical miles.');
            }}
            className={`h-8 font-mono text-xs gap-1.5 border-[rgba(0,229,255,0.2)] transition-all ${
              measuringMode
                ? 'bg-[#00E5FF] text-black font-bold'
                : 'bg-[#111827] hover:bg-[#1A2332] text-slate-300'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{measuringMode ? 'RULER ACTIVE' : 'MEASURE NM'}</span>
          </Button>
        </div>
      </div>

      {/* Main Tactical Map Viewport with Vignette Overlay */}
      <Card className="flex-1 overflow-hidden border-[rgba(0,229,255,0.1)] relative rounded-xl shadow-2xl" style={{ minHeight: 560 }}>
        {/* Leaflet Map */}
        <LeafletMapClient
          incidents={incidents}
          vessels={vessels}
          liveVessels={liveVessels}
          riskZones={riskZones}
          activeLayers={layers}
          satelliteBlend={satelliteBlend}
          measuringMode={measuringMode}
          activeSatellitePasses={mockSatellitePasses}
          onSelectVessel={onSelectVessel}
          onSelectIncident={onSelectIncident}
        />

        {/* 3.1 Vignette Overlay (Darker Edges) */}
        <div
          className="pointer-events-none absolute inset-0 z-[400] shadow-[inset_0_0_80px_rgba(10,14,23,0.9)]"
        />

        {/* 3.1 Compass Rose North Arrow SVG (Top Left) */}
        <div className="absolute top-4 left-4 z-[500] pointer-events-none bg-[#111827]/80 backdrop-blur-md border border-[rgba(0,229,255,0.15)] p-2 rounded-lg flex flex-col items-center">
          <Compass className="w-6 h-6 text-[#00E5FF] animate-spin-slow" />
          <span className="font-mono text-[9px] text-[#00E5FF] font-bold mt-0.5">N</span>
        </div>

        {/* 3.3 Floating Layer Toggles Control Panel (Top Right) */}
        <div className="absolute top-4 right-4 z-[500] bg-[#111827]/90 backdrop-blur-xl border border-[rgba(0,229,255,0.15)] p-3 rounded-xl shadow-2xl font-mono text-xs space-y-2 text-slate-300 w-52">
          <div className="text-[10px] font-bold text-[#00E5FF] border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" /> RADAR LAYERS
            </span>
            <span className="text-slate-500 text-[9px]">v2.4</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.vessels}
                onChange={() => toggleLayer('vessels')}
                className="accent-[#00E5FF]"
              />
              <span>Monitored Fleet</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.darkContacts}
                onChange={() => toggleLayer('darkContacts')}
                className="accent-[#FFB020]"
              />
              <span className="text-[#FFB020]">Dark Vessels</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={() => toggleLayer('incidents')}
                className="accent-[#FF3B5C]"
              />
              <span className="text-[#FF3B5C]">Active Incidents</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.riskZones}
                onChange={() => toggleLayer('riskZones')}
                className="accent-[#7C3AED]"
              />
              <span>Hazard Corridors</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.heatmap}
                onChange={() => toggleLayer('heatmap')}
                className="accent-[#FF3B5C]"
              />
              <span>Threat Heatmap</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.satellite}
                onChange={() => toggleLayer('satellite')}
                className="accent-[#00E5FF]"
              />
              <span>SAR Satellite Passes</span>
            </label>
          </div>
        </div>

        {/* 3.8 Map Crossfader Slider (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-[#111827]/90 backdrop-blur-xl border border-[rgba(0,229,255,0.15)] px-4 py-2 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-3">
          <span className={`text-[10px] font-bold ${satelliteBlend === 0 ? 'text-[#00E5FF]' : 'text-slate-500'}`}>
            TACTICAL CHART
          </span>
          <div className="w-28">
            <Slider
              value={[satelliteBlend]}
              onValueChange={(val) => setSatelliteBlend(val[0])}
              min={0}
              max={100}
              step={5}
              className="cursor-pointer"
            />
          </div>
          <span className={`text-[10px] font-bold ${satelliteBlend === 100 ? 'text-[#00E5FF]' : 'text-slate-500'}`}>
            SATELLITE
          </span>
        </div>

        {/* 3.5 Heatmap Density Legend (Bottom Left) */}
        {layers.heatmap && (
          <div className="absolute bottom-4 left-4 z-[500] bg-[#111827]/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg font-mono text-[9px] space-y-1">
            <span className="text-white font-bold block">HEATMAP DENSITY</span>
            <div className="w-28 h-2 rounded-xs bg-gradient-to-r from-transparent via-[#00E676] via-[#FFB020] to-[#FF3B5C]" />
            <div className="flex justify-between text-[#64748B]">
              <span>LOW</span>
              <span>CRITICAL</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}