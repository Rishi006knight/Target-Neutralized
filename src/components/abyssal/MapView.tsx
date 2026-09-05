'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  type AbyssalIncident,
  type AbyssalVessel,
  type IncidentCluster,
} from '@/lib/mock-data';

interface MapViewProps {
  incidents: AbyssalIncident[];
  vessels: AbyssalVessel[];
  clusters: IncidentCluster[];
  showClusters: boolean;
  selectedIncidentId: string | null;
  selectedVesselMmsi: string | null;
  onSelectIncident: (incident: AbyssalIncident) => void;
  onSelectVessel: (vessel: AbyssalVessel) => void;
}

const DynamicMapViewClient = dynamic(
  () => import('./MapViewClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#03080D] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Lat/Long Grid Backdrop */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0E2A38 1px, transparent 1px),
              linear-gradient(to bottom, #0E2A38 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radar loading pulse */}
        <div className="relative flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-[#22D3EE]/30 animate-ping absolute"></div>
          <div className="w-24 h-24 rounded-full border border-[#22D3EE]/50 flex items-center justify-center bg-[#08141C]/80 backdrop-blur">
            <span className="w-3 h-3 rounded-full bg-[#22D3EE] shadow-[0_0_12px_#22D3EE]"></span>
          </div>
        </div>
        <p className="mt-4 font-mono text-[11px] text-[#22D3EE] tracking-widest uppercase animate-pulse">
          INITIALIZING ABYSSAL GEOSPATIAL ENGINE...
        </p>
      </div>
    ),
  }
);

export default function MapView(props: MapViewProps) {
  return <DynamicMapViewClient {...props} />;
}
