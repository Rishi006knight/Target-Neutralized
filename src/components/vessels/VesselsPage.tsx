'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Search,
  Navigation,
  AlertCircle,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCoordinate, getRiskColor } from '@/lib/utils-maritime';
import VesselDetailDrawer from './VesselDetailDrawer';
import type { Vessel, Alert } from '@/lib/mock-data';

interface VesselsPageProps {
  vessels: Vessel[];
  alerts?: Alert[];
  loading: boolean;
  onSelectIncidentId?: (id: number) => void;
}

function safeFormatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Active now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Active now';
    return d.toISOString().replace('T', ' ').substring(0, 16);
  } catch {
    return 'Active now';
  }
}

export default function VesselsPage({
  vessels = [],
  alerts = [],
  loading,
  onSelectIncidentId,
}: VesselsPageProps) {
  const [darkOnly, setDarkOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = (vessels || []).filter((v) => {
    if (darkOnly && !v.isDark) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.name ? v.name.toLowerCase().includes(q) : false;
      const matchMmsi = v.mmsi ? v.mmsi.includes(q) : false;
      const matchFlag = v.flag ? v.flag.toLowerCase().includes(q) : false;
      return matchName || matchMmsi || matchFlag;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVessels = filtered.slice(startIndex, startIndex + pageSize);

  // CSV Export Functionality
  const exportCSV = () => {
    const headers = ['MMSI', 'Name', 'Type', 'Flag', 'Latitude', 'Longitude', 'Speed_kts', 'Heading_deg', 'IsDark', 'ThreatScore', 'LastSeen'];
    const rows = filtered.map((v) => [
      v.mmsi,
      `"${v.name}"`,
      `"${v.type || 'Commercial'}"`,
      `"${v.flag || 'Intl'}"`,
      v.lat,
      v.lng,
      v.speed,
      v.heading,
      v.isDark,
      (v.riskScore * 100).toFixed(0),
      `"${v.lastSeenAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oceanshield_fleet_tracking_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fleet registry exported as CSV.');
  };

  // PDF Printable Export Functionality
  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked. Please enable popups to export PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OceanShield OPS — Monitored Fleet Registry</title>
          <style>
            body { font-family: monospace; padding: 24px; color: #111; }
            h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .dark { color: #d97706; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>OCEANSHIELD OPS — MONITORED FLEET TELEMETRY REPORT</h1>
          <p>Generated: ${new Date().toUTCString()} | Total Tracked Assets: ${filtered.length}</p>
          <table>
            <thead>
              <tr>
                <th>MMSI</th><th>Vessel Name</th><th>Type</th><th>Flag</th><th>Speed/Heading</th><th>Threat Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (v) => `
                <tr>
                  <td>${v.mmsi}</td>
                  <td><strong>${v.name}</strong></td>
                  <td>${v.type || 'Commercial'}</td>
                  <td>${v.flag || 'Intl'}</td>
                  <td>${v.speed.toFixed(1)} kts / ${v.heading.toFixed(1)}&deg;</td>
                  <td>${(v.riskScore * 100).toFixed(0)}%</td>
                  <td class="${v.isDark ? 'dark' : ''}">${v.isDark ? 'AIS OFFLINE' : 'ACTIVE'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    toast.success('Fleet registry PDF report generated.');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide text-white">
            Global Fleet Vessel Tracker
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            AIS TELEMETRY REGISTRY, TRANSPONDER STATUS, &amp; ML THREAT EVALUATION
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={exportCSV}
            className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={exportPDF}
            className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass-panel-card border-border flex flex-col min-h-0 flex-1">
        {/* Filters Strip */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 shrink-0 flex-wrap gap-3">
          <div className="relative w-full max-w-sm min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search MMSI, Name, or Country Flag..."
              className="pl-8 h-8 font-mono text-xs bg-[#0c1322] border-slate-700 text-white placeholder:text-slate-500 rounded-lg"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={darkOnly}
              onCheckedChange={(v) => {
                setDarkOnly(v);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="dark-mode" className="font-mono text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
              SHOW DARK VESSELS ONLY
              {darkOnly && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </Label>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="font-mono text-xs w-[100px] text-cyan-400">MMSI</TableHead>
                <TableHead className="font-mono text-xs min-w-[180px] text-cyan-400">VESSEL NAME</TableHead>
                <TableHead className="font-mono text-xs w-[130px] text-cyan-400">STATUS</TableHead>
                <TableHead className="font-mono text-xs w-[180px] hidden lg:table-cell text-cyan-400">
                  POSITION
                </TableHead>
                <TableHead className="font-mono text-xs w-[120px] hidden sm:table-cell text-cyan-400">
                  SPEED &amp; HDG
                </TableHead>
                <TableHead className="font-mono text-xs w-[140px] text-cyan-400">THREAT PROFILE</TableHead>
                <TableHead className="font-mono text-xs text-right w-[140px] hidden md:table-cell text-cyan-400">
                  LAST SEEN
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell>
                      <Skeleton className="h-4 w-16 bg-slate-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32 bg-slate-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 bg-slate-800" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-28 bg-slate-800" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-20 bg-slate-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-2 w-24 bg-slate-800" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-20 bg-slate-800 float-right" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedVessels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500 font-mono text-xs">
                    NO MONITORED VESSELS FOUND
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVessels.map((vessel) => (
                  <TableRow
                    key={vessel.id || vessel.mmsi}
                    onClick={() => setSelectedVessel(vessel)}
                    className={`border-slate-800 hover:bg-slate-800/40 cursor-pointer group transition-colors ${
                      vessel.isDark ? 'bg-amber-950/15' : ''
                    }`}
                  >
                    <TableCell className="font-mono text-xs font-bold text-slate-400">
                      {vessel.mmsi}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-white group-hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                        {vessel.name || 'UNKNOWN'}
                        {vessel.isDark && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase flex items-center gap-1.5">
                        <span>{vessel.type ? vessel.type.replace(/_/g, ' ') : 'Commercial Transit'}</span>
                        <span>&middot;</span>
                        <span>{vessel.flag || 'International'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vessel.isDark ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800">
                          AIS OFFLINE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800">
                          AIS ACTIVE
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 hidden lg:table-cell">
                      {formatCoordinate(vessel.lat, true)}, {formatCoordinate(vessel.lng, false)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Navigation
                          className="w-3 h-3 text-cyan-400"
                          style={{ transform: `rotate(${vessel.heading || 0}deg)` }}
                        />
                        <span>{(vessel.heading || 0).toFixed(1)}&deg;</span>
                      </div>
                      <div className="text-[11px] font-mono mt-0.5 text-cyan-300">
                        {(vessel.speed || 0).toFixed(1)} kts
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${getRiskColor(vessel.riskScore || 0.1)}`}
                          style={{ width: `${Math.min(100, Math.max(5, (vessel.riskScore || 0.1) * 100))}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono mt-1 text-slate-400">
                        SCORE: {((vessel.riskScore || 0.1) * 100).toFixed(0)}%
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 text-right hidden md:table-cell">
                      {safeFormatDate(vessel.lastSeenAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/60 font-mono text-xs text-slate-400 shrink-0">
          <span>
            Showing {filtered.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} vessels
          </span>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 p-0 border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 p-0 font-mono text-xs ${
                    currentPage === pageNum
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 w-7 p-0 border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 400px Vessel Detail Slide-Over */}
      <VesselDetailDrawer
        vessel={selectedVessel}
        isOpen={Boolean(selectedVessel)}
        onClose={() => setSelectedVessel(null)}
        alerts={alerts}
        onSelectIncident={onSelectIncidentId}
      />
    </div>
  );
}