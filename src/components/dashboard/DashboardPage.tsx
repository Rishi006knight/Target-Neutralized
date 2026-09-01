'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, AlertTriangle, Shield, Satellite, Bell, TrendingUp, Ship, ArrowRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSeverityColor } from '@/lib/utils-maritime';
import type { DashboardStats, RiskZone, IncidentSummary, TrendPoint, Incident } from '@/lib/mock-data';

const PIE_COLORS: Record<string, string> = {
  hijack: 'hsl(0, 84%, 60%)',
  boarding: 'hsl(38, 92%, 60%)',
  approach: 'hsl(142, 76%, 45%)',
  suspicious: 'hsl(196, 100%, 50%)',
  ais_gap: 'hsl(270, 60%, 65%)',
  ship_to_ship: 'hsl(45, 93%, 57%)',
  spoofed_ais: 'hsl(0, 84%, 60%)',
};

function getPieColor(name: string) {
  return PIE_COLORS[name] || 'hsl(270, 60%, 65%)';
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
}

export default function DashboardPage({
  stats,
  riskZones = [],
  incidentSummary,
  incidentTrend = [],
  activeIncidents = [],
  loading,
  onNavigateAlerts,
}: DashboardPageProps) {
  const pieData = Object.entries(incidentSummary?.byType || {}).map(([name, value]) => ({ name, value }));
  const trendData = (incidentTrend || []).map((p) => ({ ...p, month: formatMonth(p.month) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Overview</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">GLOBAL SITUATION REPORT</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Vessels Watched" value={stats?.vesselsWatched ?? 48} icon={Eye} loading={loading} />
        <StatCard
          title="Active Incidents"
          value={stats?.activeIncidents ?? 5}
          icon={AlertTriangle}
          loading={loading}
          valueClass="text-destructive"
        />
        <StatCard
          title="Dark Vessels (24h)"
          value={stats?.darkVessels24h ?? 3}
          icon={Shield}
          loading={loading}
          valueClass="text-amber-400"
        />
        <StatCard
          title="High Risk Zones"
          value={stats?.highRiskZones ?? (riskZones?.length || 8)}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Sat Detections"
          value="1,204"
          icon={Satellite}
          loading={loading}
          subvalue={`Last: ${
            stats?.lastSatellitePass
              ? new Date(stats.lastSatellitePass).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '12m ago'
          }`}
        />
        <StatCard
          title="Unread Alerts"
          value={stats?.unreadAlerts ?? 3}
          icon={Bell}
          loading={loading}
          valueClass={(stats?.unreadAlerts ?? 0) > 0 ? 'text-primary' : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border border">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> INCIDENT TREND (6 MONTHS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-[300px] bg-muted/20" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.length > 0 ? trendData : [{ month: 'Aug 26', count: 5 }]}>
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-muted-foreground">INCIDENT TYPES</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="w-full h-[200px] bg-muted/20" />
                ) : (
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
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))',
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-muted-foreground">RISK ZONES SUMMARY</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-muted/20" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(riskZones?.length > 0 ? riskZones : []).slice(0, 4).map((zone) => (
                      <div
                        key={zone.id}
                        className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{zone.name}</span>
                          <span className="text-xs text-muted-foreground">{zone.incidentCount} recent incidents</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-mono">{Math.round(zone.riskLevel * 100)}% RISK</span>
                          <span
                            className={`text-xs ${
                              zone.trend === 'up'
                                ? 'text-destructive font-semibold'
                                : zone.trend === 'down'
                                ? 'text-green-500 font-semibold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            Trend: {zone.trend.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Incident Feed */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="border-b border-border bg-muted/10 pb-4">
            <CardTitle className="text-sm font-mono text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                LIVE INCIDENTS
              </div>
              <button onClick={onNavigateAlerts} className="text-primary text-xs hover:underline flex items-center gap-1">
                VIEW ALL <ArrowRight className="w-3 h-3" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-auto max-h-[600px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full bg-muted/20" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(activeIncidents?.length > 0 ? activeIncidents : []).slice(0, 8).map((incident) => (
                  <div key={incident.id} className="p-4 hover:bg-muted/10 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {incident.occurredAt
                          ? new Date(incident.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Recent'}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                      {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {incident.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Ship className="w-3 h-3" />
                      {incident.vesselName || 'UNKNOWN VESSEL'} &middot; {incident.dataSource}
                    </div>
                  </div>
                ))}
                {!activeIncidents?.length && (
                  <div className="p-8 text-center text-muted-foreground font-mono text-sm">NO ACTIVE INCIDENTS</div>
                )}
              </div>
            )}
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
  loading,
  valueClass = '',
  subvalue,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  valueClass?: string;
  subvalue?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="text-muted-foreground">
          <Icon className="w-4 h-4 mb-2 opacity-70" />
          <p className="text-xs font-mono tracking-wider">{title}</p>
        </div>
        <div className="mt-2">
          {loading ? (
            <Skeleton className="h-8 w-16 bg-muted/20" />
          ) : (
            <>
              <span className={`text-2xl font-bold font-mono tracking-tight ${valueClass}`}>{value ?? 0}</span>
              {subvalue && <p className="text-[10px] text-muted-foreground mt-1 opacity-70 font-mono">{subvalue}</p>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}