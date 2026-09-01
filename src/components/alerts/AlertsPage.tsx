'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  CheckCheck,
  Trash2,
  Filter,
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

function safeRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'Recently';
  }
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

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />;
      case 'high':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getAlertLeftBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-950/20';
      case 'high':
      case 'warning':
        return 'border-l-4 border-l-amber-500 bg-amber-950/20';
      case 'info':
      default:
        return 'border-l-4 border-l-cyan-500 bg-cyan-950/20';
    }
  };

  const filtered = alerts.filter((alert) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'critical') return alert.severity === 'critical';
    if (activeCategory === 'warning') return alert.severity === 'high' || alert.severity === 'warning';
    if (activeCategory === 'info') return alert.severity === 'info';
    if (activeCategory === 'system') return alert.category === 'System' || alert.title.includes('SAR') || alert.title.includes('SYSTEM');
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'high' || a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;
  const systemCount = alerts.filter((a) => a.category === 'System' || a.title.includes('SAR')).length;

  return (
    <div className="space-y-4 h-full flex flex-col max-w-5xl mx-auto w-full">
      {/* Header & Global Alert Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" /> Automated System Threat Alerts
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            REAL-TIME SENSOR NOTIFICATIONS, DARK DETECTIONS, &amp; ANOMALY TRIGGERS
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onMarkAllRead && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onMarkAllRead();
                toast.success('All threat alerts acknowledged.');
              }}
              className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-400"
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
                toast.info('Resolved alerts cleared.');
              }}
              className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR RESOLVED</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs with Count Badges */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 font-mono text-xs overflow-x-auto gap-1 shrink-0">
        {[
          { id: 'all', label: 'ALL ALERTS', count: alerts.length },
          { id: 'critical', label: 'CRITICAL', count: criticalCount, badgeColor: 'bg-red-500 text-white' },
          { id: 'warning', label: 'WARNINGS', count: warningCount, badgeColor: 'bg-amber-500 text-black' },
          { id: 'info', label: 'INFORMATIONAL', count: infoCount },
          { id: 'system', label: 'SYSTEM SENSOR', count: systemCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === tab.id
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
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

      {/* Alerts Stream List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 font-mono pr-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3 bg-slate-800" />
                  <Skeleton className="h-4 w-2/3 bg-slate-800" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-mono">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-400" />
            <span className="text-sm block">ALL CLEAR — NO ACTIVE THREAT NOTIFICATIONS</span>
          </div>
        ) : (
          filtered.map((alert) => (
            <Card
              key={alert.id}
              className={`glass-panel-card border transition-all ${getAlertLeftBorder(alert.severity)} ${
                alert.isRead ? 'opacity-65' : 'border-slate-700/80 shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3.5 items-start">
                  <div className="shrink-0 mt-0.5">{getAlertIcon(alert.severity)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h3 className="font-bold text-sm text-white tracking-wide truncate">
                        {alert.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {safeRelativeTime(alert.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed font-sans">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {alert.relatedVesselMmsi && (
                          <button
                            type="button"
                            onClick={() => onSelectVesselMmsi && onSelectVesselMmsi(alert.relatedVesselMmsi!)}
                            className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-[10px] text-cyan-400 hover:border-cyan-400 uppercase"
                          >
                            MMSI: {alert.relatedVesselMmsi}
                          </button>
                        )}
                        {alert.relatedIncidentId && (
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 uppercase">
                            INCIDENT #{alert.relatedIncidentId}
                          </span>
                        )}
                      </div>

                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] font-mono shrink-0 text-cyan-400 hover:text-black hover:bg-cyan-400 px-2 rounded"
                          onClick={() => {
                            onMarkRead(alert.id);
                            toast.success('Alert marked as acknowledged.');
                          }}
                        >
                          ACKNOWLEDGE
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}