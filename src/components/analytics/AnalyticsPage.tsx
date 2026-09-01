'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ComposedChart,
} from 'recharts';
import {
  BarChart3,
  Clock,
  Shield,
  TrendingUp,
  Award,
  Zap,
  Activity,
  Download,
  Calendar,
  Sparkles,
  Layers,
  Network,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Incident, RiskZone } from '@/lib/mock-data';

interface AnalyticsPageProps {
  incidents: Incident[];
  riskZones: RiskZone[];
}

const MONTHLY_FREQUENCY = [
  { month: 'Sep 25', incidents: 14, movingAvg: 12 },
  { month: 'Oct 25', incidents: 18, movingAvg: 15 },
  { month: 'Nov 25', incidents: 16, movingAvg: 16 },
  { month: 'Dec 25', incidents: 24, movingAvg: 19 },
  { month: 'Jan 26', incidents: 20, movingAvg: 20 },
  { month: 'Feb 26', incidents: 28, movingAvg: 23 },
  { month: 'Mar 26', incidents: 22, movingAvg: 23 },
  { month: 'Apr 26', incidents: 26, movingAvg: 25 },
];

const TARGETED_VESSELS = [
  { type: 'Crude Tankers', critical: 18, high: 14, medium: 6, total: 38 },
  { type: 'Container Ships', critical: 12, high: 11, medium: 8, total: 31 },
  { type: 'Bulk Carriers', critical: 9, high: 8, medium: 5, total: 22 },
  { type: 'General Cargo', critical: 3, high: 4, medium: 2, total: 9 },
  { type: 'Tug & Barge', critical: 2, high: 3, medium: 1, total: 6 },
];

const SEASONAL_CURVES = [
  { month: 'Jan', y2024: 12, y2025: 16, y2026: 20 },
  { month: 'Feb', y2024: 15, y2025: 22, y2026: 28 },
  { month: 'Mar', y2024: 14, y2025: 18, y2026: 22 },
  { month: 'Apr', y2024: 18, y2025: 24, y2026: 26 },
  { month: 'May', y2024: 22, y2025: 28, y2026: 31 },
  { month: 'Jun', y2024: 19, y2025: 21, y2026: 24 },
  { month: 'Jul', y2024: 11, y2025: 14, y2026: 15 },
  { month: 'Aug', y2024: 13, y2025: 17, y2026: 18 },
];

const REGIONAL_TACTICS = [
  { region: 'Gulf of Aden', attacks: 42, boarded: 12, aborted: 30 },
  { region: 'Gulf of Guinea', attacks: 36, boarded: 22, aborted: 14 },
  { region: 'Straits of Malacca', attacks: 24, boarded: 18, aborted: 6 },
  { region: 'Somali Basin', attacks: 18, boarded: 6, aborted: 12 },
  { region: 'Sulu Sea', attacks: 9, boarded: 3, aborted: 6 },
];

const CORRELATION_MATRIX = [
  { type: 'HIJACK', hijack: 1.0, boarding: 0.78, approach: 0.84, ais_gap: 0.92 },
  { type: 'BOARDING', hijack: 0.78, boarding: 1.0, approach: 0.65, ais_gap: 0.71 },
  { type: 'APPROACH', hijack: 0.84, boarding: 0.65, approach: 1.0, ais_gap: 0.58 },
  { type: 'AIS GAP', hijack: 0.92, boarding: 0.71, approach: 0.58, ais_gap: 1.0 },
];

export default function AnalyticsPage({ incidents = [], riskZones = [] }: AnalyticsPageProps) {
  const [selectedRange, setSelectedRange] = useState('6M');

  const exportPDFReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked. Enable popups to download PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OceanShield OPS — Strategic Analytics Brief</title>
          <style>
            body { font-family: monospace; padding: 32px; color: #111; }
            h1 { font-size: 22px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            h2 { font-size: 16px; margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>OCEANSHIELD OPS &mdash; STRATEGIC DEFENSE ANALYTICS REPORT</h1>
          <p>Generated: ${new Date().toUTCString()} | Defense Intel Matrix v2.4</p>
          <h2>1. Incident Frequency Breakdown</h2>
          <table>
            <tr><th>Month</th><th>Reported Events</th><th>Moving Average</th></tr>
            ${MONTHLY_FREQUENCY.map((m) => `<tr><td>${m.month}</td><td>${m.incidents}</td><td>${m.movingAvg}</td></tr>`).join('')}
          </table>
          <h2>2. Most Targeted Vessel Classes</h2>
          <table>
            <tr><th>Vessel Type</th><th>Critical</th><th>High</th><th>Total Target Events</th></tr>
            ${TARGETED_VESSELS.map((v) => `<tr><td>${v.type}</td><td>${v.critical}</td><td>${v.high}</td><td>${v.total}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    toast.success('Analytics Intelligence PDF report generated.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full font-mono text-xs">
      {/* 7.1 Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#7C3AED]" />
            INTELLIGENCE CENTER &middot; STRATEGIC ANALYTICS
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            PATTERN RECOGNITION &middot; HISTORICAL CORRELATIONS &middot; RESPONSE PERFORMANCE
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#111827] border border-slate-800 rounded-lg p-1">
            {['30D', '90D', '6M', '1Y', '3Y'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${
                  selectedRange === range ? 'bg-[#7C3AED] text-white' : 'text-[#64748B] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={exportPDFReport}
            className="h-8 font-mono text-xs gap-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT PDF
          </Button>
        </div>
      </div>

      {/* 7.4 Response Time Performance Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[#64748B] font-bold text-[10px]">AVG NAVAL RESPONSE</span>
            <div className="text-2xl font-display font-bold text-[#00E676]">42 MINS</div>
            <span className="text-[10px] text-[#00E676]">&darr; 8 mins vs last quarter</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#00E676] flex items-center justify-center font-bold text-white text-xs">
            FAST
          </div>
        </Card>

        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[#64748B] font-bold text-[10px]">MEDIAN CITADEL LOCKOUT</span>
            <div className="text-2xl font-display font-bold text-[#00E5FF]">3.4 MINS</div>
            <span className="text-[10px] text-slate-400">Crew containment latency</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#00E5FF] flex items-center justify-center font-bold text-white text-xs">
            98%
          </div>
        </Card>

        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[#64748B] font-bold text-[10px]">P95 RADAR INTERCEPT</span>
            <div className="text-2xl font-display font-bold text-[#FFB020]">1.8 NM</div>
            <span className="text-[10px] text-slate-400">Perimeter detection standoff</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#FFB020] flex items-center justify-center font-bold text-white text-xs">
            P95
          </div>
        </Card>
      </div>

      {/* Row 1: Frequency Composed Chart & Vessel Targeting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7.2 Incident Frequency with Moving Average */}
        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-[#64748B] flex items-center justify-between">
              <span>MONTHLY FREQUENCY &middot; MOVING AVERAGE</span>
              <span className="text-[#7C3AED] font-bold">+23% IN FEBRUARY</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MONTHLY_FREQUENCY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#7C3AED', color: '#fff', fontSize: 11 }}
                  />
                  <Bar dataKey="incidents" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="movingAvg" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-3 p-2 bg-[#0A0E17] rounded border border-slate-800">
              <strong className="text-[#00E5FF]">Strategic Insight:</strong> Attack frequency peaked in late winter, driven by calm inter-monsoon seas in the Gulf of Guinea and mother-dhow deployments in the Somali Basin.
            </p>
          </CardContent>
        </Card>

        {/* 7.3 Targeted Vessel Types */}
        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-[#64748B]">
              TARGETED VESSEL PROFILES BY SEVERITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TARGETED_VESSELS} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={10} width={90} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#00E5FF', color: '#fff', fontSize: 11 }}
                  />
                  <Bar dataKey="critical" stackId="a" fill="#FF3B5C" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="high" stackId="a" fill="#FFB020" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="medium" stackId="a" fill="#00E5FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-[#64748B] pt-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#FF3B5C]" /> CRITICAL</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#FFB020]" /> HIGH</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#00E5FF]" /> MEDIUM</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: 3-Year Seasonal Trend & Correlation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7.5 Seasonal Trend Line Chart */}
        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-[#64748B]">
              3-YEAR SEASONAL MONSOON TREND CORRELATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SEASONAL_CURVES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#00E5FF', color: '#fff', fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="y2024" stroke="#64748b" strokeWidth={1.5} dot={false} name="2024" />
                  <Line type="monotone" dataKey="y2025" stroke="#FFB020" strokeWidth={1.5} dot={false} name="2025" />
                  <Line type="monotone" dataKey="y2026" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 4 }} name="2026 (Live)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 7.7 Incident Correlation Heatmap Matrix */}
        <Card className="glass-panel-card border-[rgba(0,229,255,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-[#64748B]">
              TACTICAL ANOMALY CO-OCCURRENCE MATRIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-[#00E5FF]">
                    <th className="p-2 text-left">PATTERN</th>
                    <th className="p-2">HIJACK</th>
                    <th className="p-2">BOARDING</th>
                    <th className="p-2">APPROACH</th>
                    <th className="p-2">AIS GAP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {CORRELATION_MATRIX.map((row) => (
                    <tr key={row.type}>
                      <td className="p-2 text-left font-bold text-white text-[10px]">{row.type}</td>
                      <td className={`p-2 font-bold ${row.hijack > 0.8 ? 'text-[#FF3B5C] bg-red-950/20' : 'text-slate-300'}`}>
                        {row.hijack.toFixed(2)}
                      </td>
                      <td className={`p-2 font-bold ${row.boarding > 0.8 ? 'text-[#FF3B5C] bg-red-950/20' : 'text-slate-300'}`}>
                        {row.boarding.toFixed(2)}
                      </td>
                      <td className={`p-2 font-bold ${row.approach > 0.8 ? 'text-[#FF3B5C] bg-red-950/20' : 'text-slate-300'}`}>
                        {row.approach.toFixed(2)}
                      </td>
                      <td className={`p-2 font-bold ${row.ais_gap > 0.8 ? 'text-[#FF3B5C] bg-red-950/20' : 'text-slate-300'}`}>
                        {row.ais_gap.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[#64748B] mt-3">
              Values indicate Pearson co-occurrence coefficient across historical pirate attack vectors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
