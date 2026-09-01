'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Radio,
  Sparkles,
  MapPin,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ReferenceLine,
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
} from '@/lib/mock-data';

// 2.1 Animated Count-Up Hook using requestAnimationFrame and easeOutExpo
function useCountUp(targetValue: number, duration: number = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = Number(targetValue) || 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeProgress * (endValue - startValue) + startValue);
      setCount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  return count;
}

const PIE_COLORS: Record<string, string> = {
  hijack: '#FF3B5C',
  boarding: '#FFB020',
  approach: '#00E5FF',
  suspicious: '#7C3AED',
  ais_gap: '#00E676',
  other: '#38BDF8',
};

interface DashboardPageProps {
  stats: DashboardStats;
  riskZones: RiskZone[];
  incidentSummary: IncidentSummary;
  incidentTrend: TrendPoint[];
  activeIncidents: Incident[];
  loading: boolean;
  onNavigateAlerts: () => void;
  onNavigateMap?: (zoneId?: number) => void;
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
  onNavigateMap,
  onSelectIncident,
  onSelectVesselMmsi,
}: DashboardPageProps) {
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D' | '6M' | '1Y'>('6M');
  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null);
  const [expandedDescId, setExpandedDescId] = useState<number | null>(null);
  const [assignedStatus, setAssignedStatus] = useState<Record<number, string>>({});

  const trendData = incidentTrend.map((p, idx) => ({
    month: p.month,
    count: p.count,
    diff: idx > 0 ? p.count - incidentTrend[idx - 1].count : 0,
  }));

  const avgCount = trendData.length > 0
    ? Math.round(trendData.reduce((acc, c) => acc + c.count, 0) / trendData.length)
    : 18;

  const maxPoint = trendData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), trendData[0] || { month: '', count: 0 });

  const pieData = Object.entries(incidentSummary?.byType || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const totalIncidentsCount = pieData.reduce((a, b) => a + b.value, 0);

  const filteredIncidents = selectedIncidentType
    ? activeIncidents.filter((i) => i.incidentType === selectedIncidentType)
    : activeIncidents;

  const handleAssign = (id: number, officer: string) => {
    setAssignedStatus((prev) => ({ ...prev, [id]: officer }));
  };

  return (
    <div className="space-y-6">
      {/* 2.0 Header & Range Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-[#F1F5F9] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            COMMAND CENTER OVERVIEW
          </h1>
          <p className="text-xs text-[#64748B] font-mono mt-0.5">
            DEFENSE INTELLIGENCE &middot; GLOBAL THREAT MATRIX
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center bg-[#111827] border border-[rgba(0,229,255,0.12)] rounded-lg p-1 font-mono text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#00E5FF] mx-2 hidden sm:inline" />
          {(['7D', '30D', '90D', '6M', '1Y'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-bold ${
                dateRange === range
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                  : 'text-[#64748B] hover:text-[#F1F5F9]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2.1 Stat Cards Row (6 Cards with animated Count-Up & Top Borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Vessels Watched"
          value={stats?.vesselsWatched ?? 48}
          icon={Ship}
          topBorder="border-t-[#00E5FF]"
          iconBg="bg-[#00E5FF]/10 text-[#00E5FF]"
          valueClass="text-[#00E5FF]"
          subInfo="AISStream Global Fleet"
        />
        <StatCard
          title="Active Incidents"
          value={stats?.activeIncidents ?? 6}
          icon={AlertTriangle}
          topBorder="border-t-[#FF3B5C]"
          iconBg="bg-[#FF3B5C]/10 text-[#FF3B5C]"
          valueClass="text-[#FF3B5C]"
          subInfo="Armed / High Priority"
        />
        <StatCard
          title="Dark Vessels"
          value={stats?.darkVessels24h ?? 4}
          icon={Shield}
          topBorder="border-t-[#FFB020]"
          iconBg="bg-[#FFB020]/10 text-[#FFB020]"
          valueClass="text-[#FFB020]"
          subInfo="AIS Transponder Gaps"
        />
        <StatCard
          title="High Risk Zones"
          value={stats?.highRiskZones ?? 8}
          icon={TrendingUp}
          topBorder="border-t-[#7C3AED]"
          iconBg="bg-[#7C3AED]/10 text-[#7C3AED]"
          valueClass="text-[#7C3AED]"
          subInfo="Corridors > 70% Threat"
        />
        <StatCard
          title="Sat Detections"
          value={stats?.satDetectionsCount ?? 1204}
          icon={Satellite}
          topBorder="border-t-[#00E5FF]"
          iconBg="bg-[#00E5FF]/10 text-[#00E5FF]"
          valueClass="text-[#00E5FF]"
          subInfo="Sentinel-1A SAR Ingest"
        />
        <StatCard
          title="Unread Alerts"
          value={stats?.unreadAlerts ?? 4}
          icon={Bell}
          topBorder="border-t-[#FF3B5C]"
          iconBg="bg-[#FF3B5C]/10 text-[#FF3B5C]"
          valueClass="text-[#FF3B5C]"
          subInfo="Awaiting Action"
          onClick={onNavigateAlerts}
        />
      </div>

      {/* 2.7 Predictive High-Risk Windows Strip */}
      <div className="bg-[#111827]/90 border border-[rgba(0,229,255,0.1)] rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold text-xs text-[#FFB020]">
            <Clock className="w-4 h-4 text-[#FFB020] animate-pulse" />
            <span>PREDICTIVE THREAT WINDOWS (NEXT 48H BAYESIAN FORECAST)</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">HOURLY PEAK RISK MODULATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockPredictiveThreatWindows.map((pred) => (
            <div
              key={pred.id}
              className="p-2.5 bg-[#1A2332] border border-slate-800 rounded-lg space-y-1.5 hover:border-[rgba(0,229,255,0.3)] transition-all font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] truncate">{pred.zoneName}</span>
                <span className="text-[#FF3B5C] font-bold text-[10px]">
                  {(pred.riskProbability * 100).toFixed(0)}% PEAK
                </span>
              </div>

              {/* 24-Hour Mini Timeline Bar with Highlighted Red Gradient Window */}
              <div className="relative w-full h-3 bg-slate-900 rounded-xs overflow-hidden border border-slate-800">
                <div
                  className="absolute top-0 bottom-0 left-[25%] right-[40%] bg-gradient-to-r from-[#FF3B5C] to-[#FFB020] opacity-85"
                  title="Peak Window: 02:00 - 06:30 UTC"
                />
                <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white shadow-[0_0_4px_white]" title="Now" />
              </div>

              <div className="flex items-center justify-between text-[9px] text-[#64748B]">
                <span>WINDOW: {pred.windowUtc}</span>
                <span className="text-[#FFB020] font-bold">PEAK IN 4H</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Charts & Live Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Trend Area Chart & Incident Types Donut */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2.2 Incident Trend Area Chart */}
          <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono text-[#64748B] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00E5FF]" /> INCIDENT FREQUENCY TIMELINE
              </CardTitle>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 bg-[#00E5FF] rounded-xs" /> MONTHLY COUNT
                </span>
                <span className="flex items-center gap-1.5 text-[#7C3AED]">
                  <span className="w-2.5 h-0.5 bg-[#7C3AED] border-dashed" /> 6M AVG ({avgCount})
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <ReferenceLine
                      y={avgCount}
                      stroke="#7C3AED"
                      strokeDasharray="4 4"
                      label={{ value: '6M AVG', fill: '#7C3AED', fontSize: 10, position: 'right' }}
                    />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#111827] border border-[#00E5FF]/40 p-2.5 rounded-lg shadow-2xl font-mono text-xs text-slate-200">
                              <span className="text-[#00E5FF] font-bold block">{label}</span>
                              <div className="text-white font-bold text-sm mt-1">
                                {data.count} INCIDENTS
                              </div>
                              <div className="text-[10px] text-[#00E676] mt-0.5">
                                {data.diff >= 0 ? `+${data.diff}` : data.diff} vs previous month
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#00E5FF"
                      strokeWidth={2.5}
                      fill="url(#cyanAreaGradient)"
                      activeDot={{ r: 6, fill: '#00E5FF', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2.3 & 2.4 Incident Types Donut & Interactive Risk Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incident Types Donut Chart */}
            <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-[#64748B] flex items-center justify-between">
                  <span>INCIDENT CLASSIFICATIONS</span>
                  {selectedIncidentType && (
                    <button
                      onClick={() => setSelectedIncidentType(null)}
                      className="text-[10px] text-[#00E5FF] hover:underline"
                    >
                      CLEAR FILTER
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                {/* Donut Chart with Center Orbitron Count */}
                <div className="relative w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        onClick={(entry) => setSelectedIncidentType(entry.name)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[entry.name] || '#00E5FF'}
                            opacity={!selectedIncidentType || selectedIncidentType === entry.name ? 1 : 0.4}
                            cursor="pointer"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display font-bold text-lg text-white leading-none">
                      {totalIncidentsCount}
                    </span>
                    <span className="font-mono text-[9px] text-[#64748B] tracking-wider">TOTAL</span>
                  </div>
                </div>

                {/* Interactive Legend */}
                <div className="flex-1 space-y-1.5 font-mono text-xs">
                  {pieData.map((entry) => (
                    <div
                      key={entry.name}
                      onClick={() =>
                        setSelectedIncidentType(selectedIncidentType === entry.name ? null : entry.name)
                      }
                      className={`flex items-center justify-between p-1 rounded-md cursor-pointer transition-colors ${
                        selectedIncidentType === entry.name
                          ? 'bg-[#00E5FF]/20 text-white font-bold'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: PIE_COLORS[entry.name] || '#00E5FF' }}
                        />
                        <span className="text-[11px] capitalize">{entry.name.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-[11px] text-[#64748B] font-bold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2.4 Interactive Risk Zone Cards with Sparklines & Progress Bars */}
            <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-[#64748B]">
                  HIGH RISK CORRIDORS &middot; 7D SPARKLINE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 font-mono text-xs">
                {riskZones.slice(0, 3).map((zone) => {
                  const isHigh = zone.riskLevel > 0.75;
                  const isMed = zone.riskLevel >= 0.5 && zone.riskLevel <= 0.75;

                  return (
                    <div
                      key={zone.id}
                      className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 hover:border-[#00E5FF]/40 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-white text-sm truncate max-w-[150px]">
                          {zone.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-[11px] ${
                              isHigh ? 'text-[#FF3B5C]' : isMed ? 'text-[#FFB020]' : 'text-[#00E676]'
                            }`}
                          >
                            {Math.round(zone.riskLevel * 100)}% RISK
                          </span>
                          {zone.trend === 'up' && (
                            <span className="text-[#FF3B5C] font-bold text-[10px] animate-bounce">▲</span>
                          )}
                          {zone.trend === 'down' && (
                            <span className="text-[#00E676] font-bold text-[10px]">▼</span>
                          )}
                          {zone.trend === 'stable' && (
                            <span className="text-[#64748B] text-[10px]">&mdash;</span>
                          )}
                        </div>
                      </div>

                      {/* 6px Horizontal Progress Bar with Gradient */}
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 my-1.5">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${zone.riskLevel * 100}%`,
                            background:
                              isHigh
                                ? 'linear-gradient(90deg, #FFB020, #FF3B5C)'
                                : isMed
                                ? 'linear-gradient(90deg, #00E676, #FFB020)'
                                : '#00E676',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-0.5">
                        <span>{zone.incidentCount} INCIDENTS (30D)</span>
                        <button
                          type="button"
                          onClick={() => onNavigateMap && onNavigateMap(zone.id)}
                          className="text-[#00E5FF] hover:underline flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View on Map &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 2.5 Right Column: Live Incidents Feed Rich Cards */}
        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] flex flex-col">
          <CardHeader className="border-b border-slate-800 bg-[#111827]/60 pb-3">
            <CardTitle className="text-xs font-mono text-[#64748B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3B5C] animate-ping" />
                <span className="text-white font-bold font-heading text-sm">LIVE INCIDENT STREAM</span>
              </div>
              <button
                type="button"
                onClick={onNavigateAlerts}
                className="font-mono text-xs px-2.5 py-1 rounded-md border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black transition-all flex items-center gap-1 group cursor-pointer"
              >
                VIEW ALL <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[580px] divide-y divide-slate-800/80">
            {filteredIncidents.slice(0, 6).map((incident) => {
              const isExpanded = expandedDescId === incident.id;
              const isAssigned = assignedStatus[incident.id];
              const borderLeftClass =
                incident.severity === 'critical'
                  ? 'border-l-4 border-l-[#FF3B5C]'
                  : incident.severity === 'high'
                  ? 'border-l-4 border-l-[#FFB020]'
                  : 'border-l-4 border-l-[#00E5FF]';

              return (
                <div
                  key={incident.id}
                  className={`p-3.5 hover:bg-slate-800/30 transition-all font-mono text-xs space-y-2 ${borderLeftClass}`}
                >
                  {/* Top Row: Severity + Timestamp + NEW Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-400">
                        {incident.dataSource}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {incident.occurredAt
                        ? new Date(incident.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Recent'}
                    </span>
                  </div>

                  {/* Incident Type & Description */}
                  <div>
                    <h3 className="font-heading font-bold text-base text-white">
                      {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <p className={`text-[11px] text-slate-300 font-sans mt-0.5 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                      {incident.description}
                    </p>
                    {incident.description && incident.description.length > 80 && (
                      <button
                        type="button"
                        onClick={() => setExpandedDescId(isExpanded ? null : incident.id)}
                        className="text-[10px] text-[#00E5FF] hover:underline mt-0.5 block cursor-pointer"
                      >
                        {isExpanded ? 'Show less' : 'Read more &rarr;'}
                      </button>
                    )}
                  </div>

                  {/* Target Vessel */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectVesselMmsi && incident.linkedVessels?.[0] && onSelectVesselMmsi(incident.linkedVessels[0])}
                      className="flex items-center gap-1.5 text-white font-display text-[11px] hover:text-[#00E5FF] transition-colors cursor-pointer"
                    >
                      <Ship className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>{incident.vesselName || 'UNKNOWN ASSET'}</span>
                    </button>

                    {isAssigned ? (
                      <span className="text-[10px] text-[#00E676] flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> {isAssigned}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectIncident && onSelectIncident(incident)}
                          className="text-[10px] text-[#00E5FF] hover:underline"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssign(incident.id, 'Task Force 151')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-[#00E5FF] hover:text-black text-[10px] text-slate-300 transition-colors"
                        >
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 2.6 Correlation Intelligence Panel */}
      <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-mono text-[#00E5FF] flex items-center gap-2">
            <Network className="w-4 h-4 text-[#00E5FF] animate-pulse" /> THREAT CORRELATION ENGINE &middot; GRAPH CLUSTERS
          </CardTitle>
          <span className="text-[10px] font-mono text-[#64748B]">ML CONFIDENCE SCORING</span>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {mockThreatCorrelations.map((corr) => (
            <div
              key={corr.id}
              className="p-3 bg-[#111827] border border-slate-800 rounded-lg space-y-2 hover:border-[#00E5FF]/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-white text-sm truncate">{corr.title}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-bold border border-[#00E5FF]/30">
                  {(corr.confidenceScore * 100).toFixed(0)}% CONFIDENCE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans line-clamp-2">{corr.description}</p>
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-[#64748B]">Zone: {corr.zone}</span>
                <button
                  type="button"
                  onClick={() => onSelectVesselMmsi && corr.linkedVesselMmsi[0] && onSelectVesselMmsi(corr.linkedVesselMmsi[0])}
                  className="text-[#00E5FF] hover:underline flex items-center gap-0.5"
                >
                  Investigate &rarr;
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  topBorder,
  iconBg,
  valueClass = '',
  subInfo,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  topBorder: string;
  iconBg: string;
  valueClass?: string;
  subInfo?: string;
  onClick?: () => void;
}) {
  const animatedValue = useCountUp(value, 1500);

  return (
    <Card
      onClick={onClick}
      className={`glass-panel-card border-t-4 ${topBorder} p-3.5 space-y-2 cursor-pointer transition-all duration-200 min-h-[120px]`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-heading font-bold tracking-wider text-[#64748B] uppercase">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <span className={`text-3xl font-display font-bold tracking-tight block ${valueClass}`}>
          {animatedValue.toLocaleString()}
        </span>
        {subInfo && <p className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate">{subInfo}</p>}
      </div>
    </Card>
  );
}