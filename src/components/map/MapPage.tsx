'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { Incident, Vessel, RiskZone } from '@/lib/mock-data';

// Dynamically import Leaflet map with ssr: false to prevent any SSR window/document crashes
const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950/50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-cyan-400">INITIALIZING TACTICAL RADAR...</span>
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
}

export default function MapPage({
  incidents,
  vessels,
  liveVessels = [],
  riskZones,
  loading,
}: MapPageProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-4">
        <Skeleton className="h-10 w-80 bg-muted/20" />
        <Skeleton className="flex-1 w-full bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tactical Map</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">GLOBAL ASSET AND THREAT VISUALIZATION</p>
        </div>

        <div className="flex bg-card border border-border rounded-md p-1 font-mono text-xs">
          {['all', 'incidents', 'vessels', 'dark', 'live'].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                activeTab === tab
                  ? tab === 'dark'
                    ? 'bg-amber-500 text-black font-bold'
                    : tab === 'live'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-primary text-primary-foreground font-bold'
                  : tab === 'dark'
                  ? 'text-amber-500/70 hover:text-amber-400'
                  : tab === 'live'
                  ? 'text-emerald-500/70 hover:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dark' && <AlertCircle className="w-3 h-3" />}
              {tab === 'live' && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-border relative" style={{ minHeight: 520 }}>
        <LeafletMapClient
          incidents={incidents}
          vessels={vessels}
          liveVessels={liveVessels}
          riskZones={riskZones}
          activeTab={activeTab}
        />

        {/* Tactical legend overlay */}
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 border border-border backdrop-blur-md p-3 rounded-md font-mono text-[10px] text-muted-foreground space-y-2 pointer-events-none shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> LIVE AIS TELEMETRY
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-sm" /> ACTIVE MONITORED VESSEL
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> DARK CONTACT (AIS GAP)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> CRITICAL INCIDENT
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> HIGH SEVERITY
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 border border-destructive bg-destructive/30" /> PIRACY RISK ZONE
          </div>
        </div>
      </Card>
    </div>
  );
}