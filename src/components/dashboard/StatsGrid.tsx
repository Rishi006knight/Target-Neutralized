'use client';

import React from 'react';
import {
  Ship,
  AlertTriangle,
  Radar,
  Eye,
  Satellite,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatsGridProps {
  stats: DashboardStats;
}

const STAT_CARDS = [
  {
    key: 'total_vessels_tracked' as const,
    label: 'Vessels Tracked',
    icon: Ship,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    format: (v: number) => v.toLocaleString(),
    trendKey: 'vessels_trend' as const,
  },
  {
    key: 'active_anomalies' as const,
    label: 'Active Anomalies',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    format: (v: number) => v.toString(),
    trendKey: 'anomaly_trend' as const,
  },
  {
    key: 'critical_alerts' as const,
    label: 'Critical Alerts',
    icon: ShieldAlert,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    format: (v: number) => v.toString(),
  },
  {
    key: 'dark_vessels_detected' as const,
    label: 'Dark Vessels',
    icon: Eye,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    format: (v: number) => v.toString(),
  },
  {
    key: 'sar_scenes_processed' as const,
    label: 'SAR Scenes',
    icon: Satellite,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    format: (v: number) => v.toString(),
  },
  {
    key: 'high_risk_zones' as const,
    label: 'High-Risk Zones',
    icon: Radar,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    format: (v: number) => v.toString(),
  },
];

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const trend = card.trendKey ? stats[card.trendKey] : undefined;

        return (
          <Card
            key={card.key}
            className={cn(
              'bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors',
              card.border && `hover:${card.border}`
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn('p-1.5 rounded-md', card.bg)}>
                  <Icon className={cn('w-3.5 h-3.5', card.color)} />
                </div>
                {trend !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] font-medium flex items-center gap-0.5',
                      trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {trend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>
              <div className={cn('text-xl font-bold', card.color)}>
                {card.format(value)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{card.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}