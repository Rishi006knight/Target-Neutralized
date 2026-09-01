'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Alert } from '@/lib/mock-data';

interface AlertsPageProps {
  alerts: Alert[];
  loading: boolean;
  onMarkRead: (id: number) => void;
  onMarkAllRead?: () => void;
  onClearResolved?: () => void;
  onSelectVesselMmsi?: (mmsi: string) => void;
}

export default function AlertsPage({
  alerts = [],
  loading,
  onMarkRead,
  onMarkAllRead,
  onClearResolved,
  onSelectVesselMmsi,
}: AlertsPageProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'critical' | 'warning' | 'info' | 'system'>('all');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [snoozedIds, setSnoozedIds] = useState<number[]>([]);

  const handleDismiss = (id: number) => {
    setDismissedIds((prev) => [...prev, id]);
    toast.info('Alert dismissed from radar stream.');
  };

  const handleSnooze = (id: number, hours: number) => {
    setSnoozedIds((prev) => [...prev, id]);
    toast.info(`Alert snoozed for ${hours} hour(s).`);
  };

  const filtered = alerts
    .filter((a) => !dismissedIds.includes(a.id) && !snoozedIds.includes(a.id))
    .filter((alert) => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'critical') return alert.severity === 'critical';
      if (activeCategory === 'warning') return alert.severity === 'high' || alert.severity === 'warning';
      if (activeCategory === 'info') return alert.severity === 'info';
      if (activeCategory === 'system') return alert.category === 'System' || alert.title.includes('SAR') || alert.title.includes('SYSTEM');
      return true;
    });

  const getAlertBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-l-[#FF3B5C] bg-red-950/15';
      case 'high':
      case 'warning':
        return 'border-l-4 border-l-[#FFB020] bg-amber-950/15';
      case 'info':
      default:
        return 'border-l-4 border-l-[#00E5FF] bg-cyan-950/15';
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col max-w-5xl mx-auto w-full font-mono text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00E5FF] animate-pulse" />
            INTELLIGENCE ALERTS FEED
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            TACTICAL SENSOR NOTIFICATIONS &middot; AIS GAPS &middot; ANOMALY TRIGGERS
          </p>
        </div>

        {/* Global Alert Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              toast.info(audioEnabled ? 'Audible threat alarms muted.' : 'Audible threat alarms enabled.');
            }}
            className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-[#111827] hover:bg-[#1A2332] text-slate-300"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#00E676]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>{audioEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </Button>

          {onMarkAllRead && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onMarkAllRead();
                toast.success('All active threat alerts acknowledged.');
              }}
              className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-[#111827] hover:bg-[#1A2332] text-[#00E5FF]"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>MARK ALL READ</span>
            </Button>
          )}

          {onClearResolved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClearResolved();
                toast.info('Resolved notifications purged.');
              }}
              className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-[#111827] hover:bg-[#1A2332] text-slate-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR RESOLVED</span>
            </Button>
          )}
        </div>
      </div>

      {/* 6.2 Filter Tabs with Sliding Badges */}
      <div className="flex items-center bg-[#111827] border border-slate-800 rounded-lg p-1 overflow-x-auto gap-1 shrink-0">
        {[
          { id: 'all', label: 'ALL NOTIFICATIONS', count: alerts.length },
          { id: 'critical', label: 'CRITICAL', count: alerts.filter((a) => a.severity === 'critical').length, badgeColor: 'bg-[#FF3B5C] text-white' },
          { id: 'warning', label: 'WARNINGS', count: alerts.filter((a) => a.severity === 'high' || a.severity === 'warning').length, badgeColor: 'bg-[#FFB020] text-black' },
          { id: 'info', label: 'INFORMATIONAL', count: alerts.filter((a) => a.severity === 'info').length },
          { id: 'system', label: 'SYSTEM SENSOR', count: alerts.filter((a) => a.category === 'System' || a.title.includes('SAR')).length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                tab.badgeColor || (activeCategory === tab.id ? 'bg-black/40 text-white' : 'bg-slate-800 text-slate-400')
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 6.1 Alerts Stream List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500 font-mono">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#00E676]" />
            <span className="text-sm block">ALL CLEAR &mdash; NO ACTIVE THREAT ALERTS</span>
          </div>
        ) : (
          filtered.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;

            return (
              <Card
                key={alert.id}
                className={`glass-panel-card border transition-all duration-200 ${getAlertBorder(alert.severity)} ${
                  alert.isRead ? 'opacity-65' : 'shadow-md border-slate-700/80'
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-3 items-start">
                    {/* Severity Icon */}
                    <div className="shrink-0 mt-0.5">
                      {alert.severity === 'critical' ? (
                        <ShieldAlert className="w-5 h-5 text-[#FF3B5C] animate-pulse" />
                      ) : alert.severity === 'high' || alert.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-[#FFB020]" />
                      ) : (
                        <Info className="w-5 h-5 text-[#00E5FF]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="font-heading font-bold text-sm text-white tracking-wide truncate">
                          {alert.title}
                        </h3>
                        <span className="text-[10px] text-[#64748B] whitespace-nowrap">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Body Description */}
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {alert.message}
                      </p>

                      {/* 6.4 In-Place Accordion Expansion */}
                      {isExpanded && (
                        <div className="pt-2 mt-2 border-t border-slate-800 space-y-2 text-[11px] font-mono text-slate-400 animate-in fade-in-50 duration-150">
                          <div>SOURCE ENGINE: ML Anomaly Detector v2.4 (Threat score calculation)</div>
                          <div>TIMESTAMP: {new Date(alert.createdAt).toUTCString()}</div>
                          {alert.relatedVesselMmsi && (
                            <div>TARGET MMSI: {alert.relatedVesselMmsi}</div>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2">
                          {alert.relatedVesselMmsi && (
                            <button
                              type="button"
                              onClick={() => onSelectVesselMmsi && onSelectVesselMmsi(alert.relatedVesselMmsi!)}
                              className="px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black uppercase cursor-pointer"
                            >
                              MMSI: {alert.relatedVesselMmsi}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                            className="text-[10px] text-[#64748B] hover:text-white flex items-center gap-0.5"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            <span>{isExpanded ? 'Less' : 'Details'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSnooze(alert.id, 4)}
                            className="text-[10px] text-[#64748B] hover:text-slate-200"
                          >
                            Snooze (4h)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDismiss(alert.id)}
                            className="text-[10px] text-slate-500 hover:text-[#FF3B5C]"
                          >
                            Dismiss
                          </button>

                          {!alert.isRead ? (
                            <Button
                              size="sm"
                              className="h-6 text-[10px] font-mono bg-[#00E5FF] text-black font-bold hover:bg-[#00E5FF]/80 px-2.5 rounded cursor-pointer"
                              onClick={() => {
                                onMarkRead(alert.id);
                                toast.success('Alert marked as acknowledged.');
                              }}
                            >
                              ACKNOWLEDGE
                            </Button>
                          ) : (
                            <span className="text-[10px] text-[#00E676] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ACKNOWLEDGED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}