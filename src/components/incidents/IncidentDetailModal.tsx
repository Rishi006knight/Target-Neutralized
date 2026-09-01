'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, MapPin, Clock, Radio, Activity } from 'lucide-react';
import { formatCoordinate, getSeverityColor } from '@/lib/utils-maritime';
import type { Incident } from '@/lib/mock-data';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVessel?: (vesselName: string) => void;
}

export default function IncidentDetailModal({
  incident,
  isOpen,
  onClose,
  onSelectVessel,
}: IncidentDetailModalProps) {
  if (!incident) return null;

  const statusColors = {
    New: 'bg-red-950 text-red-400 border-red-800',
    Investigating: 'bg-amber-950 text-amber-400 border-amber-800',
    Responding: 'bg-cyan-950 text-cyan-400 border-cyan-800',
    Resolved: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  };

  const responseStatus = incident.responseStatus || 'Responding';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] bg-[#0c1322] border border-slate-700/80 text-slate-100 shadow-2xl p-6 rounded-xl font-mono">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="text-slate-400 text-xs">INCIDENT #{incident.id}</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${
                statusColors[responseStatus] || statusColors.Responding
              }`}
            >
              STATUS: {responseStatus.toUpperCase()}
            </span>
          </div>

          <DialogTitle className="font-display text-xl text-white mt-2 tracking-wide">
            {incident.incidentType.replace(/_/g, ' ').toUpperCase()} &middot; {incident.vesselName || 'UNKNOWN ASSET'}
          </DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="space-y-4 pt-3 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">TARGET VESSEL</span>
              {incident.vesselName ? (
                <button
                  type="button"
                  onClick={() => onSelectVessel && onSelectVessel(incident.vesselName!)}
                  className="text-cyan-400 hover:underline font-bold flex items-center gap-1 truncate max-w-full text-left"
                >
                  <Radio className="w-3 h-3 shrink-0" />
                  <span className="truncate">{incident.vesselName}</span>
                </button>
              ) : (
                <span className="text-slate-400">UNKNOWN</span>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">GEOLOCATION</span>
              <span className="text-white font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                {formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">INTELLIGENCE SOURCE</span>
              <span className="text-slate-300 font-semibold truncate block">{incident.dataSource}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">OCCURRENCE TIME (UTC)</span>
              <span className="text-white flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                {new Date(incident.occurredAt).toUTCString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">VESSEL FLAG &amp; TYPE</span>
              <span className="text-slate-300">
                {incident.vesselType || 'Merchant Cargo'} &middot; {incident.vesselFlag || 'International'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">RESPONSE UNIT</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Naval Task Force
              </span>
            </div>
          </div>

          {/* Full Situational Narrative */}
          <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-slate-300 font-bold block text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> SITUATION REPORT NARRATIVE
            </span>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {incident.description || 'No detailed situation report filed.'}
            </p>
          </div>

          {/* Chronological Incident Timeline */}
          <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2.5">
            <span className="text-slate-300 font-bold block text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> EVENT TIMELINE LOG
            </span>

            <div className="space-y-2 border-l border-slate-700 ml-2 pl-3">
              {(incident.timeline || [
                { time: 'T-00:45', title: 'Initial Radar Trigger', description: 'Fast suspicious surface craft closed to within visual range.' },
                { time: 'T-00:20', title: 'Distress Beacon Activated', description: 'Master transmitted emergency distress call to Regional Maritime Centre.' },
                { time: 'T-00:00', title: 'Intervention Dispatched', description: 'Coast guard air and surface patrol units deployed to intercept.' },
              ]).map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-[11px]">{event.time}</span>
                    <span className="text-white font-semibold text-xs">{event.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
