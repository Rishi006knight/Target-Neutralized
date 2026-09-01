'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  MapPin,
  Clock,
  Radio,
  Activity,
  Ship,
  FileText,
  AlertTriangle,
  Plus,
  Send,
  Download,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCoordinate, getSeverityColor } from '@/lib/utils-maritime';
import { toast } from 'sonner';
import type { Incident, IncidentEvent } from '@/lib/mock-data';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVessel?: (vesselName: string) => void;
  onTrackOnMap?: (incident: Incident) => void;
}

export default function IncidentDetailModal({
  incident,
  isOpen,
  onClose,
  onSelectVessel,
  onTrackOnMap,
}: IncidentDetailModalProps) {
  const [timelineEvents, setTimelineEvents] = useState<IncidentEvent[]>([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('Responding');

  React.useEffect(() => {
    if (incident) {
      setTimelineEvents(
        incident.timeline || [
          { time: '10:42 UTC', title: 'Radar Contact Detected', description: 'Fast approaching target identified.' },
          { time: '10:55 UTC', title: 'Distress Signal Logged', description: 'Vessel master broadcast security alert.' },
        ]
      );
      setCurrentStatus(incident.responseStatus || 'Responding');
    }
  }, [incident]);

  if (!incident) return null;

  const handleAddTimelineEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryText.trim()) return;

    const newEvent: IncidentEvent = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      title: 'Operator Update',
      description: newEntryText.trim(),
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);
    setNewEntryText('');
    toast.success('Incident timeline event logged.');
  };

  const statusColors: Record<string, string> = {
    New: 'bg-red-950 text-red-400 border-red-800',
    Investigating: 'bg-amber-950 text-amber-400 border-amber-800',
    Responding: 'bg-cyan-950 text-cyan-400 border-cyan-800',
    Resolved: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[640px] bg-[#111827] border border-[rgba(0,229,255,0.2)] text-[#F1F5F9] shadow-2xl p-6 rounded-xl font-mono text-xs max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="text-[#64748B] text-xs font-bold">INCIDENT #{incident.id}</span>
            </div>

            {/* Status Selector */}
            <select
              value={currentStatus}
              onChange={(e) => {
                setCurrentStatus(e.target.value);
                toast.success(`Incident status updated to ${e.target.value}`);
              }}
              className="bg-[#0A0E17] border border-slate-700 text-[#00E5FF] px-2.5 py-1 rounded text-xs font-bold cursor-pointer"
            >
              <option value="New">STATUS: NEW</option>
              <option value="Investigating">STATUS: INVESTIGATING</option>
              <option value="Responding">STATUS: RESPONDING</option>
              <option value="Resolved">STATUS: RESOLVED</option>
            </select>
          </div>

          <DialogTitle className="font-heading font-bold text-xl text-white mt-2 tracking-wide">
            {incident.incidentType.replace(/_/g, ' ').toUpperCase()} &middot; {incident.vesselName || 'UNKNOWN ASSET'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Linked Target Vessel Card */}
          <div className="p-3 bg-[#1A2332] border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Ship className="w-5 h-5 text-[#00E5FF]" />
              <div>
                <span className="font-display font-bold text-white block text-sm">
                  {incident.vesselName || 'UNIDENTIFIED VESSEL'}
                </span>
                <span className="text-[#64748B] text-[10px]">
                  {incident.vesselType || 'Commercial'} &middot; Flag: {incident.vesselFlag || 'International'}
                </span>
              </div>
            </div>

            {incident.vesselName && onSelectVessel && (
              <button
                type="button"
                onClick={() => onSelectVessel(incident.vesselName!)}
                className="px-2.5 py-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF] hover:text-black transition-colors"
              >
                OPEN VESSEL PROFILE &rarr;
              </button>
            )}
          </div>

          {/* Incident Telemetry & Geolocation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 bg-[#0A0E17] border border-slate-800 rounded">
              <span className="text-[#64748B] block text-[9px]">LATITUDE / LNG</span>
              <span className="text-white font-bold">
                {formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}
              </span>
            </div>
            <div className="p-2 bg-[#0A0E17] border border-slate-800 rounded">
              <span className="text-[#64748B] block text-[9px]">OCCURRED AT</span>
              <span className="text-white font-bold">
                {new Date(incident.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </span>
            </div>
            <div className="p-2 bg-[#0A0E17] border border-slate-800 rounded">
              <span className="text-[#64748B] block text-[9px]">SOURCE REPORT</span>
              <span className="text-[#00E5FF] font-bold truncate block">{incident.dataSource}</span>
            </div>
            <div className="p-2 bg-[#0A0E17] border border-slate-800 rounded">
              <span className="text-[#64748B] block text-[9px]">THREAT SEVERITY</span>
              <span className="text-[#FF3B5C] font-bold uppercase">{incident.severity}</span>
            </div>
          </div>

          {/* Full Narrative */}
          <div className="p-3 bg-[#0A0E17] border border-slate-800 rounded-lg space-y-1">
            <span className="text-[#64748B] font-bold text-[10px] block">OPERATIONAL BRIEF / NARRATIVE</span>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">{incident.description}</p>
          </div>

          {/* 4.3 Vertical Incident Timeline with Add-Entry Form */}
          <div className="space-y-2">
            <span className="text-[#00E5FF] font-bold text-[11px] block">CHRONOLOGICAL INCIDENT TIMELINE</span>
            <div className="p-3 bg-[#0A0E17] border border-slate-800 rounded-lg space-y-3 max-h-44 overflow-y-auto">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="flex gap-3 items-start border-l border-slate-800 pl-3 relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] absolute -left-[4px] top-1" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-[11px]">{evt.title}</span>
                      <span className="text-[#64748B] text-[9px]">{evt.time}</span>
                    </div>
                    <p className="text-slate-400 font-sans text-[11px]">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Timeline Input */}
            <form onSubmit={handleAddTimelineEntry} className="flex gap-2">
              <Input
                placeholder="Add operator update to timeline..."
                value={newEntryText}
                onChange={(e) => setNewEntryText(e.target.value)}
                className="bg-[#1A2332] border-slate-700 text-white font-mono text-xs h-8"
              />
              <Button type="submit" size="sm" className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold h-8">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onTrackOnMap) onTrackOnMap(incident);
                onClose();
              }}
              className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-mono text-xs gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" /> TRACK ON MAP
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success('Incident situational report generated.');
                }}
                className="border-slate-700 text-slate-300 hover:text-white font-mono text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> EXPORT REPORT
              </Button>
              <Button
                size="sm"
                onClick={onClose}
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold font-mono text-xs"
              >
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
