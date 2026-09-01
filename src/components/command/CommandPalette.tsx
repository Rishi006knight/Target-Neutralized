'use client';

import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Radar,
  AlertTriangle,
  Ship,
  Bell,
  BarChart3,
  Sliders,
  Plus,
  Compass,
  FileSpreadsheet,
  Moon,
  Search,
} from 'lucide-react';
import type { PageId } from '@/components/layout/AppLayout';
import type { Vessel, Incident } from '@/lib/mock-data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  vessels: Vessel[];
  incidents: Incident[];
  onSelectVessel?: (vessel: Vessel) => void;
  onSelectIncident?: (incident: Incident) => void;
  onOpenReportIncident?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  vessels = [],
  incidents = [],
  onSelectVessel,
  onSelectIncident,
  onOpenReportIncident,
}: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  const handleSelect = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="bg-[#111827] border border-cyan-500/20 text-slate-100 shadow-2xl rounded-xl overflow-hidden font-mono text-xs">
        <CommandInput
          placeholder="Type a command, search MMSI, vessel, or threat zone..."
          className="border-none text-slate-100 placeholder:text-slate-500 font-mono text-xs h-12"
        />
        <CommandList className="max-h-80 overflow-y-auto p-2">
          <CommandEmpty className="py-6 text-center text-slate-500 font-mono text-xs">
            No matching tactical contacts or commands found.
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="QUICK ACTIONS" className="text-cyan-400 font-bold tracking-wider">
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('dashboard'))}
              className="cursor-pointer flex items-center gap-2 hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Go to Command Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('map'))}
              className="cursor-pointer flex items-center gap-2 hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2"
            >
              <Radar className="w-4 h-4 text-cyan-400" />
              <span>Go to Tactical Live Radar Map</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('incidents'))}
              className="cursor-pointer flex items-center gap-2 hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>View Incident Intelligence Log</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('vessels'))}
              className="cursor-pointer flex items-center gap-2 hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2"
            >
              <Ship className="w-4 h-4 text-cyan-400" />
              <span>Open Fleet Vessel Tracker</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onNavigate('analytics'))}
              className="cursor-pointer flex items-center gap-2 hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Open Intelligence Center Analytics</span>
            </CommandItem>
            {onOpenReportIncident && (
              <CommandItem
                onSelect={() => handleSelect(onOpenReportIncident)}
                className="cursor-pointer flex items-center gap-2 hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2 text-cyan-300 font-bold"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Report New Maritime Threat / Incident</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-slate-800" />

          {/* Monitored Vessels */}
          <CommandGroup heading="TRACKED ASSETS &amp; VESSELS" className="text-cyan-400 font-bold tracking-wider">
            {vessels.slice(0, 5).map((v) => (
              <CommandItem
                key={v.id || v.mmsi}
                onSelect={() =>
                  handleSelect(() => {
                    if (onSelectVessel) onSelectVessel(v);
                  })
                }
                className="cursor-pointer flex items-center justify-between hover:bg-cyan-950/40 hover:text-cyan-400 rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <Ship className={`w-3.5 h-3.5 ${v.isDark ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <span className="text-white font-bold">{v.name}</span>
                  <span className="text-slate-500 text-[10px]">MMSI: {v.mmsi}</span>
                </div>
                <span className="text-[10px] text-cyan-400">{v.speed.toFixed(1)} kts</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-slate-800" />

          {/* Incidents */}
          <CommandGroup heading="ACTIVE PIRACY INCIDENTS" className="text-red-400 font-bold tracking-wider">
            {incidents.slice(0, 4).map((inc) => (
              <CommandItem
                key={inc.id}
                onSelect={() =>
                  handleSelect(() => {
                    if (onSelectIncident) onSelectIncident(inc);
                  })
                }
                className="cursor-pointer flex items-center justify-between hover:bg-red-950/40 hover:text-red-300 rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-200">
                    {inc.incidentType.toUpperCase()} &middot; {inc.vesselName || 'UNKNOWN'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">#{inc.id}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}

export default CommandPalette;
