'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  AlertTriangle,
  Shield,
  Satellite,
  Bell,
  TrendingUp,
  Ship,
  ArrowRight,
  BarChart3,
  Calendar,
  Network,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { getSeverityColor } from '@/lib/utils-maritime';
import {
  mockThreatCorrelations,
  mockPredictiveThreatWindows,
  type DashboardStats,
  type RiskZone,
  type IncidentSummary,
  type TrendPoint,
  type Incident,
  type ThreatCorrelation,
  type PredictiveThreatWindow,
} from '@/lib/mock-data';

const PIE_COLORS: Record<string, string> = {
  hijack: '#ef4444',
  boarding: '#f97316',
  approach: '#10b981',
  suspicious: '#00e5ff',
  ais_gap: '#a855f7',
  other: '#3b82f6',
};

function getPieColor(name: string) {
  return PIE_COLORS[name] || '#00e5ff';
}

function formatMonth(key: string) {
  if (!key) return '';
  const [year, month] = key.split('-');
  if (!month) return key;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || ''} ${(year || '').slice(2)}`.trim();
}

interface DashboardPageProps {
  stats: DashboardStats;
  riskZones: RiskZone[];
  incidentSummary: IncidentSummary;
  incidentTrend: TrendPoint[];
  activeIncidents: Incident[];
  loading: boolean;
  onNavigateAlerts: () => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectVesselMmsi?: (mmsi: string) => void;
}

export default function DashboardPage({
  stats,
  riskZones = [],
  incidentSummary,
  incidentTrend = [],
  activeIncidents = [],
  loading,
  onNavigateAlerts,
  onSelectIncident,
  onSelectVesselMmsi,
}: DashboardPageProps) {
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D' | '6M' | '1Y'>('6M');
  const [expandedCorrelationId, setExpandedCorrelationId] = useState<string | null>('CORR-01');

  // Filter trend data according to dateRange
  const trendSliceMap: Record<string, number> = {
    '7D': 1,
    '30D': 2,
    '90D': 3,
    '6M': 6,
    '1Y': 6,
  };

  const visibleTrend = (incidentTrend || []).slice(-trendSliceMap[dateRange]).map((p) => ({
    ...p,
    month: formatMonth(p.month),
  }));

  const pieData = Object.entries(incidentSummary?.byType || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide text-white">
            Command Center Overview
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            GLOBAL TACTICAL SITUATION REPORT &amp; ML THREAT MATRIX
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 font-mono text-xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 mx-2 hidden sm:inline" />
          {(['7D', '30D', '90D', '6M', '1Y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === range
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Redesigned Stat Cards with Color-Coded Borders & Inner Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Vessels Watched"
          value={stats?.vesselsWatched ?? 48}
          icon={Eye}
          borderColor="border-t-cyan-500"
          valueClass="text-cyan-400"
          subtext="AISStream Global Fleet"
          loading={loading}
        />
        <StatCard
          title="Active Incidents"
          value={stats?.activeIncidents ?? 6}
          icon={AlertTriangle}
          borderColor="border-t-red-500"
          valueClass="text-red-400"
          subtext="Critical / High Priority"
          loading={loading}
        />
        <StatCard
          title="Dark Vessels (24h)"
          value={stats?.darkVessels24h ?? 4}
          icon={Shield}
          borderColor="border-t-amber-500"
          valueClass="text-amber-400"
          subtext="AIS Transponder Gaps"
          loading={loading}
        />
        <StatCard
          title="High Risk Zones"
          value={stats?.highRiskZones ?? 8}
          icon={TrendingUp}
          borderColor="border-t-red-500"
          valueClass="text-red-400"
          subtext="Corridors > 70% Threat"
          loading={loading}
        />
        <StatCard
          title="Sat Detections"
          value={stats?.satDetectionsCount ? stats.satDetectionsCount.toLocaleString() : '1,204'}
          icon={Satellite}
          borderColor="border-t-cyan-500"
          valueClass="text-cyan-300"
          subtext={`Pass: ${
            stats?.lastSatellitePass
              ? new Date(stats.lastSatellitePass).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '12m ago'
          }`}
          loading={loading}
        />
        <StatCard
          title="Unread Alerts"
          value={stats?.unreadAlerts ?? 4}
          icon={Bell}
          borderColor="border-t-amber-500"
          valueClass={(stats?.unreadAlerts ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}
          subtext="Awaiting Action"
          loading={loading}
        />
      </div>

      {/* Main Visuals Grid: Trend Chart & Live Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trend & Types */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Trend Chart */}
          <Card className="glass-panel-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" /> INCIDENT TREND TIMELINE ({dateRange})
                </span>
                <span className="text-cyan-400 text-[11px] font-mono font-bold">
                  {visibleTrend.reduce((acc, curr) => acc + curr.count, 0)} TOTAL EVENTS
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-[260px] bg-slate-900/60" />
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visibleTrend.length > 0 ? visibleTrend : [{ month: 'Aug 26', count: 8 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(0, 229, 255, 0.08)' }}
                        contentStyle={{
                          backgroundColor: '#0c1322',
                          borderColor: '#1e293b',
                          color: '#f8fafc',
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      />
                      <Bar dataKey="count" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Types & Risk Zone Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Breakdown */}
            <Card className="glass-panel-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">
                  INCIDENT CLASSIFICATIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          pieData.length > 0
                            ? pieData
                            : [
                                { name: 'boarding', value: 4 },
                                { name: 'hijack', value: 2 },
                                { name: 'approach', value: 5 },
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPieColor(entry.name)} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0c1322',
                          borderColor: '#1e293b',
                          color: '#f8fafc',
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gradient Risk Zone Summary Cards */}
            <Card className="glass-panel-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">
                  HIGH THREAT CORRIDORS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {(riskZones?.length > 0 ? riskZones : []).slice(0, 3).map((zone) => {
                  const isHigh = zone.riskLevel > 0.75;
                  const isMed = zone.riskLevel >= 0.5 && zone.riskLevel <= 0.75;
                  const gradientClass = isHigh
                    ? 'bg-gradient-to-r from-red-950/60 to-slate-900/90 border-red-800/60'
                    : isMed
                    ? 'bg-gradient-to-r from-amber-950/60 to-slate-900/90 border-amber-800/60'
                    : 'bg-gradient-to-r from-emerald-950/60 to-slate-900/90 border-emerald-800/60';

                  return (
                    <div
                      key={zone.id}
                      className={`p-2.5 rounded-lg border font-mono text-xs ${gradientClass} transition-all`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white truncate max-w-[160px]">{zone.name}</span>
                        <span
                          className={`font-bold text-[11px] ${
                            isHigh ? 'text-red-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {Math.round(zone.riskLevel * 100)}% RISK
                        </span>
                      </div>

                      {/* Horizontal Progress Bar */}
                      <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${
                            isHigh ? 'bg-red-500' : isMed ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${zone.riskLevel * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Live Incidents Feed */}
        <Card className="glass-panel-card border-border flex flex-col">
          <CardHeader className="border-b border-slate-800/80 bg-slate-900/40 pb-3">
            <CardTitle className="text-xs font-mono text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-white font-bold">LIVE INCIDENT STREAM</span>
              </div>
              <button
                onClick={onNavigateAlerts}
                className="font-mono text-xs px-2.5 py-1 rounded-md border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1 group"
              >
                VIEW ALL <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[580px] divide-y divide-slate-800/80">
            {(activeIncidents?.length > 0 ? activeIncidents : []).slice(0, 6).map((incident) => (
              <div
                key={incident.id}
                onClick={() => onSelectIncident && onSelectIncident(incident)}
                className="p-3.5 hover:bg-slate-800/40 transition-colors cursor-pointer group font-mono text-xs"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(
                      incident.severity
                    )}`}
                  >
                    {incident.severity}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {incident.occurredAt
                      ? new Date(incident.occurredAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recent'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 mb-2 font-sans">
                  {incident.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Ship className="w-3 h-3 text-cyan-400" />
                    {incident.vesselName || 'UNKNOWN'}
                  </span>
                  <span className="text-cyan-400 hover:underline flex items-center gap-0.5">
                    DETAILS <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Threat Correlation & Predictive Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Correlation Panel */}
        <Card className="glass-panel-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-cyan-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Network className="w-4 h-4" /> THREAT CORRELATION &amp; MOTHER-VESSEL SIGNATURES
              </span>
              <span className="text-[10px] text-slate-400">ML GRAPH CLUSTERS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 font-mono text-xs">
            {mockThreatCorrelations.map((corr) => {
              const isExpanded = expandedCorrelationId === corr.id;
              return (
                <div
                  key={corr.id}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
                >
                  <div
                    onClick={() => setExpandedCorrelationId(isExpanded ? null : corr.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-white block">{corr.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {corr.zone} &middot; Confidence: {(corr.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="pt-2 mt-2 border-t border-slate-800 space-y-2 text-[11px]">
                      <p className="text-slate-300 font-sans">{corr.description}</p>
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="text-slate-400">LINKED ASSETS:</span>
                        {corr.linkedVesselMmsi.map((mmsi) => (
                          <button
                            key={mmsi}
                            type="button"
                            onClick={() => onSelectVesselMmsi && onSelectVesselMmsi(mmsi)}
                            className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 hover:border-cyan-400"
                          >
                            MMSI: {mmsi}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Predictive Intelligence Section */}
        <Card className="glass-panel-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> PREDICTIVE PEAK THREAT WINDOWS (48H FORECAST)
              </span>
              <span className="text-[10px] text-slate-400">BAYESIAN PROBABILITY</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 font-mono text-xs">
            {mockPredictiveThreatWindows.map((pred) => (
              <div
                key={pred.id}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{pred.zoneName}</span>
                  <span className="text-red-400 font-bold text-[11px]">
                    {(pred.riskProbability * 100).toFixed(0)}% PEAK RISK
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-amber-300">
                  <Clock className="w-3 h-3" />
                  <span>WINDOW: {pred.windowUtc}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{pred.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  borderColor,
  valueClass = '',
  subtext,
  loading,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  valueClass?: string;
  subtext?: string;
  loading: boolean;
}) {
  return (
    <Card className={`glass-panel-card border ${borderColor} p-3.5 space-y-1.5`}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] font-mono tracking-wider truncate uppercase">{title}</span>
        <Icon className="w-4 h-4 opacity-80 text-slate-400 shrink-0" />
      </div>
      <div className="pt-0.5">
        {loading ? (
          <Skeleton className="h-7 w-16 bg-slate-800" />
        ) : (
          <span className={`text-2xl font-tech font-bold tracking-tight block ${valueClass}`}>
            {value ?? 0}
          </span>
        )}
        {subtext && <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{subtext}</p>}
      </div>
    </Card>
  );
}