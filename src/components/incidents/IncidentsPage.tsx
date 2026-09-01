'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  FileText,
  ChevronRight,
  Download,
  ChevronLeft,
  Ship,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSeverityColor, formatCoordinate } from '@/lib/utils-maritime';
import ReportIncidentModal from './ReportIncidentModal';
import IncidentDetailModal from './IncidentDetailModal';
import type { Incident, Vessel } from '@/lib/mock-data';

interface IncidentsPageProps {
  incidents: Incident[];
  vessels?: Vessel[];
  loading: boolean;
  onRefresh: () => void;
  onCreateIncident?: (data: Partial<Incident>) => void;
  onSelectVesselMmsi?: (mmsi: string) => void;
}

function safeFormatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toISOString().replace('T', ' ').substring(0, 16);
  } catch {
    return 'Recent';
  }
}

export default function IncidentsPage({
  incidents = [],
  vessels = [],
  loading,
  onRefresh,
  onCreateIncident,
  onSelectVesselMmsi,
}: IncidentsPageProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = (incidents || []).filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && inc.incidentType !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchVessel = inc.vesselName?.toLowerCase().includes(q) || false;
      const matchDesc = inc.description?.toLowerCase().includes(q) || false;
      const matchType = inc.incidentType?.toLowerCase().includes(q) || false;
      return matchVessel || matchDesc || matchType;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedIncidents = filtered.slice(startIndex, startIndex + pageSize);

  // CSV Export Functionality
  const exportCSV = () => {
    const headers = ['ID', 'Severity', 'Type', 'Vessel', 'Latitude', 'Longitude', 'OccurredAt', 'Source', 'Description'];
    const rows = filtered.map((i) => [
      i.id,
      i.severity,
      i.incidentType,
      `"${i.vesselName || 'UNKNOWN'}"`,
      i.lat,
      i.lng,
      i.occurredAt,
      `"${i.dataSource}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oceanshield_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Incident log exported as CSV.');
  };

  // PDF Export Functionality (Printable HTML Document)
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
          <title>OceanShield OPS — Tactical Incident Summary</title>
          <style>
            body { font-family: monospace; padding: 24px; color: #111; }
            h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .critical { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>OCEANSHIELD OPS — MARITIME INCIDENT INTELLIGENCE REPORT</h1>
          <p>Generated: ${new Date().toUTCString()} | Total Events: ${filtered.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Severity</th><th>Type</th><th>Vessel Target</th><th>Location</th><th>Source</th><th>Occurred At</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (i) => `
                <tr>
                  <td>#${i.id}</td>
                  <td class="${i.severity}">${i.severity.toUpperCase()}</td>
                  <td>${i.incidentType.toUpperCase()}</td>
                  <td>${i.vesselName || 'UNKNOWN'}</td>
                  <td>${i.lat.toFixed(2)}N, ${i.lng.toFixed(2)}E</td>
                  <td>${i.dataSource}</td>
                  <td>${safeFormatDate(i.occurredAt)}</td>
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
    toast.success('Incident PDF summary report generated.');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide text-white">
            Incident Intelligence Log
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            RECORDED PIRACY INCIDENTS, ARMED BOARDINGS, &amp; RADAR DROPOUTS
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown / Buttons */}
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

          {/* Report Incident Multi-step Trigger */}
          <Button
            size="sm"
            onClick={() => setIsReportOpen(true)}
            className="h-8 font-mono text-xs tracking-wider gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          >
            <Plus className="w-4 h-4" /> REPORT INCIDENT
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass-panel-card border-border flex flex-col min-h-0 flex-1">
        {/* Filters Strip */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/40 shrink-0 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search target vessel, type, or description..."
              className="pl-8 h-8 font-mono text-xs bg-[#0c1322] border-slate-700 text-white placeholder:text-slate-500 rounded-lg"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <Select
            value={severityFilter}
            onValueChange={(v) => {
              setSeverityFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-8 font-mono text-xs bg-[#0c1322] border-slate-700 text-slate-200">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1322] border-slate-700 text-white font-mono text-xs">
              <SelectItem value="all">ALL SEVERITIES</SelectItem>
              <SelectItem value="critical">CRITICAL</SelectItem>
              <SelectItem value="high">HIGH</SelectItem>
              <SelectItem value="medium">MEDIUM</SelectItem>
              <SelectItem value="low">LOW</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-8 font-mono text-xs bg-[#0c1322] border-slate-700 text-slate-200">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1322] border-slate-700 text-white font-mono text-xs">
              <SelectItem value="all">ALL TYPES</SelectItem>
              <SelectItem value="hijack">HIJACK</SelectItem>
              <SelectItem value="boarding">BOARDING</SelectItem>
              <SelectItem value="suspicious">SUSPICIOUS</SelectItem>
              <SelectItem value="approach">APPROACH</SelectItem>
              <SelectItem value="ais_gap">AIS GAP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="font-mono text-xs w-[100px] text-cyan-400">SEVERITY</TableHead>
                <TableHead className="font-mono text-xs w-[140px] hidden sm:table-cell text-cyan-400">
                  DATE / TIME
                </TableHead>
                <TableHead className="font-mono text-xs w-[130px] text-cyan-400">CATEGORY</TableHead>
                <TableHead className="font-mono text-xs text-cyan-400">TARGET ASSET</TableHead>
                <TableHead className="font-mono text-xs w-[170px] hidden lg:table-cell text-cyan-400">
                  POSITION
                </TableHead>
                <TableHead className="font-mono text-xs w-[110px] hidden md:table-cell text-cyan-400">
                  SOURCE
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell>
                      <Skeleton className="h-6 w-16 bg-slate-800" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-24 bg-slate-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 bg-slate-800" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-28 bg-slate-800" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-16 bg-slate-800" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : paginatedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500 font-mono text-xs">
                    NO RECORDED INCIDENTS MATCHING CRITERIA
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIncidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="border-slate-800 hover:bg-slate-800/40 cursor-pointer group transition-colors"
                  >
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 hidden sm:table-cell">
                      {safeFormatDate(incident.occurredAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-200">
                      {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                        {incident.vesselName || 'UNKNOWN ASSET'}
                      </div>
                      {incident.vesselType && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                          {incident.vesselType} &middot; {incident.vesselFlag || 'Intl'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 hidden lg:table-cell">
                      {formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FileText className="w-3 h-3 text-cyan-400" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">{incident.dataSource}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
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
            Showing {filtered.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} incidents
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

      {/* Multi-Step Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        vessels={vessels}
        onSubmitIncident={(payload) => {
          if (onCreateIncident) onCreateIncident(payload);
          if (onRefresh) onRefresh();
        }}
      />

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        onSelectVessel={(name) => {
          setSelectedIncident(null);
          if (onSelectVesselMmsi) {
            const v = vessels.find((ves) => ves.name === name);
            if (v) onSelectVesselMmsi(v.mmsi);
          }
        }}
      />
    </div>
  );
}