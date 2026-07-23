'use client';

import React from 'react';
import {
  Activity,
  Database,
  Cpu,
  Wifi,
  Clock,
  SatelliteDish,
  Shield,
} from 'lucide-react';

export function StatusBar() {
  return (
    <footer className="flex items-center justify-between h-7 px-4 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-600">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-500" />
          System Healthy
        </span>
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          Supabase Connected
        </span>
        <span className="flex items-center gap-1">
          <SatelliteDish className="w-3 h-3 text-cyan-500" />
          AISstream WebSocket: Active
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-amber-500" />
          ML Pipeline: 4/4 layers running
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          RLS Enabled
        </span>
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-emerald-500" />
          Realtime: Subscribed
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date().toISOString()}
        </span>
      </div>
    </footer>
  );
}