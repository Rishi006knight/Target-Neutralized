'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Clock,
  Shield,
  TrendingUp,
  Award,
  Zap,
  Activity,
} from 'lucide-react';
import type { Incident, RiskZone } from '@/lib/mock-data';

interface AnalyticsPageProps {
  incidents: Incident[];
  riskZones: RiskZone[];
}

const MONTHLY_FREQUENCY = [
  { month: 'Sep 25', total: 12, critical: 4, boarding: 5, hijack: 1 },
  { month: 'Oct 25', total: 16, critical: 6, boarding: 7, hijack: 2 },
  { month: 'Nov 25', total: 14, critical: 5, boarding: 6, hijack: 1 },
  { month: 'Dec 25', total: 22, critical: 9, boarding: 9, hijack: 3 },
  { month: 'Jan 26', total: 18, critical: 7, boarding: 8, hijack: 2 },
  { month: 'Feb 26', total: 25, critical: 11, boarding: 10, hijack: 4 },
  { month: 'Mar 26', total: 19, critical: 6, boarding: 8, hijack: 2 },
  { month: 'Apr 26', total: 23, critical: 8, boarding: 11, hijack: 3 },
];

const TARGETED_VESSEL_TYPES = [
  { type: 'Crude Oil Tanker', count: 38, percentage: '36%' },
  { type: 'Container Ship', count: 31, percentage: '29%' },
  { type: 'Bulk Carrier', count: 22, percentage: '21%' },
  { type: 'General Cargo', count: 9, percentage: '9%' },
  { type: 'Tug & Barge', count: 6, percentage: '5%' },
];

const SEASONAL_TREND = [
  { season: 'Q1 (Winter Monsoon)', incidents: 52, avgRisk: 78 },
  { season: 'Q2 (Inter-Monsoon Calm)', incidents: 74, avgRisk: 91 },
  { season: 'Q3 (SW Monsoon High Waves)', incidents: 34, avgRisk: 54 },
  { season: 'Q4 (NE Monsoon Transitions)', incidents: 61, avgRisk: 82 },
];

const REGIONAL_COMPARISON = [
  { region: 'Gulf of Aden / Red Sea', attacks: 42, boarded: 12, aborted: 30 },
  { region: 'Gulf of Guinea', attacks: 36, boarded: 22, aborted: 14 },
  { region: 'Straits of Malacca', attacks: 24, boarded: 18, aborted: 6 },
  { region: 'Somali Basin', attacks: 18, boarded: 6, aborted: 12 },
  { region: 'Sulu-Celebes Sea', attacks: 9, boarded: 3, aborted: 6 },
];

export default function AnalyticsPage({ incidents = [], riskZones = [] }: AnalyticsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" /> Maritime Tactical Analytics
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            STRATEGIC PATTERN MINING, SEASONALITY, &amp; RESPONSE METRICS
          </p>
        </div>
      </div>

      {/* Response Time Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border border-t-2 border-t-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="font-mono text-xs">AVG DETECTION LATENCY</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">4.2 min</div>
            <p className="text-[10px] text-cyan-400 font-mono mt-1">Satellite SAR to Grid Push</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-t-2 border-t-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="font-mono text-xs">MEDIAN TASK FORCE DISPATCH</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">11.8 min</div>
            <p className="text-[10px] text-amber-400 font-mono mt-1">Coast Guard / Naval Alerting</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-t-2 border-t-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="font-mono text-xs">P95 CITADEL SECURE TIME</span>
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">8.5 min</div>
            <p className="text-[10px] text-red-400 font-mono mt-1">Alarm to Citadel Lock</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-t-2 border-t-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="font-mono text-xs">DETERRENCE SUCCESS RATE</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">76.4%</div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Armed Escort &amp; Evasive Action</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Incident Frequency & Targeted Vessel Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground flex items-center justify-between">
              <span>MONTHLY INCIDENT FREQUENCY (PAST 8 MONTHS)</span>
              <span className="text-cyan-400 text-[10px]">CORRIDOR DRIFT METRICS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_FREQUENCY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0c1322',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Bar dataKey="total" name="Total Attacks" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="critical" name="Critical Red Alerts" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="boarding" name="Armed Boardings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Most Targeted Vessel Breakdown */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground">
              MOST TARGETED VESSEL PROFILES
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 font-mono text-xs pt-2">
            {TARGETED_VESSEL_TYPES.map((v) => (
              <div key={v.type} className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="truncate">{v.type}</span>
                  <span className="text-cyan-400 font-bold">
                    {v.count} ({v.percentage})
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
                    style={{ width: v.percentage }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Seasonality & Regional Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> MONSOON SEASONALITY &amp; SEA STATE IMPACT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SEASONAL_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="season" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0c1322',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    name="Incident Volume"
                    stroke="#00e5ff"
                    strokeWidth={3}
                    dot={{ fill: '#00e5ff', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRisk"
                    name="Average Threat Score"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Grouped Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-muted-foreground">
              REGIONAL ATTACK VOLUME &amp; INTERCEPTION SUCCESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REGIONAL_COMPARISON} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis dataKey="region" type="category" stroke="#64748b" fontSize={9} width={110} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0c1322',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Bar dataKey="attacks" name="Total Attacks" fill="#3b82f6" />
                  <Bar dataKey="aborted" name="Repelled / Aborted" fill="#10b981" />
                  <Bar dataKey="boarded" name="Boarded / Seized" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Generated Analytical Insights */}
      <Card className="bg-slate-900/60 border border-slate-800 p-4 font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-3">
          <Activity className="w-4 h-4 animate-pulse" /> AUTO-GENERATED TACTICAL RECONNAISSANCE SUMMARY
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-amber-400 font-bold block mb-1">TANKER TARGETING SHIFT</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Crude carriers traveling at &lt;14 kts represent 65% of all attempted boarding attempts in the Red Sea corridor.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-cyan-400 font-bold block mb-1">INTER-MONSOON WINDOW CORRELATION</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Calm seas in April and May increase skiff operating range from 150nm to over 400nm offshore into the Somali Basin.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-emerald-400 font-bold block mb-1">CITADEL DEFENSE EFFICACY</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              100% of merchant vessels that locked citadel within 10 minutes avoided hostage extraction until naval interdiction.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
