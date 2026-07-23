'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Radar,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  Filter,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ANOMALY_LABELS, ML_LAYERS, COLORS } from '@/lib/constants';
import type { AnomalyEvent, AnomalySeverity } from '@/types';

interface AlertFeedProps {
  anomalies: AnomalyEvent[];
  onAlertClick?: (anomaly: AnomalyEvent) => void;
  compact?: boolean;
}

const SEVERITY_CONFIG: Record<
  AnomalySeverity,
  { color: string; bg: string; border: string; icon: React.ElementType; pulse: boolean }
> = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-l-red-500',
    icon: Zap,
    pulse: true,
  },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-l-orange-500', icon: AlertTriangle, pulse: false },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500', icon: Shield, pulse: false },
  low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-l-green-500', icon: Radar, pulse: false },
};

export function AlertFeed({ anomalies, onAlertClick, compact }: AlertFeedProps) {
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);

  const filtered = anomalies.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (!showResolved && a.resolved) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const severityOrder: Record<AnomalySeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Alert Feed
            <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-400">
              {sorted.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] text-slate-500"
            onClick={() => setShowResolved(!showResolved)}
          >
            {showResolved ? 'Hide resolved' : 'Show resolved'}
          </Button>
        </div>
        {/* Severity filter pills */}
        <div className="flex items-center gap-1 mt-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-medium transition-all',
                severityFilter === sev
                  ? sev === 'all'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : SEVERITY_CONFIG[sev].bg + ' ' + SEVERITY_CONFIG[sev].color
                  : 'text-slate-600 hover:text-slate-400'
              )}
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={compact ? 'h-[300px]' : 'h-[500px]'}>
          <div className="px-2 pb-2 space-y-1">
            {sorted.map((anomaly) => {
              const config = SEVERITY_CONFIG[anomaly.severity];
              const SeverityIcon = config.icon;
              const layerInfo = ML_LAYERS[anomaly.layer];

              return (
                <button
                  key={anomaly.id}
                  onClick={() => onAlertClick?.(anomaly)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border-l-2 transition-all hover:bg-slate-800/50',
                    config.border,
                    anomaly.resolved && 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn('mt-0.5 p-1 rounded', config.bg)}>
                      <SeverityIcon
                        className={cn('w-3 h-3', config.color, config.pulse && 'animate-pulse')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {anomaly.vessel_name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 border-slate-700 text-slate-400"
                        >
                          {layerInfo.name}
                        </Badge>
                        {anomaly.resolved && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {anomaly.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-600 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {anomaly.location.lat.toFixed(2)}, {anomaly.location.lon.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(anomaly.timestamp)}
                        </span>
                        <Badge
                          className="text-[9px] px-1 py-0 border-0"
                          style={{
                            backgroundColor: layerInfo.color + '20',
                            color: layerInfo.color,
                          }}
                        >
                          {ANOMALY_LABELS[anomaly.category]}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600 mt-1 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}