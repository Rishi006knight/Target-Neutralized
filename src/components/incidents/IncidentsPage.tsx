'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  MapPin,
  MoreVertical,
  ArrowUpDown,
  X,
  CheckSquare,
  Square,
  ShieldAlert,
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
  onNavigateMap?: () => void;
}

export default function IncidentsPage({
  incidents = [],
  vessels = [],
  loading,
  onRefresh,
  onCreateIncident,
  onSelectVesselMmsi,
  onNavigateMap,
}: IncidentsPageProps) {
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'severity' | 'occurredAt' | 'vesselName'>('occurredAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const pageSize = 10;

  // Filtered & Sorted Incidents
  const filtered = useMemo(() => {
    return (incidents || []).filter((inc) => {
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
    }).sort((a, b) => {
      if (sortField === 'occurredAt') {
        const diff = new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
        return sortAsc ? -diff : diff;
      }
      if (sortField === 'vesselName') {
        const diff = (a.vesselName || '').localeCompare(b.vesselName || '');
        return sortAsc ? diff : -diff;
      }
      return 0;
    });
  }, [incidents, severityFilter, typeFilter, search, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) setSelectedIds([]);
    else setSelectedIds(paginated.map((i) => i.id));
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `oceanshield_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} incidents as CSV.`);
  };

  return (
    <div className="space-y-4 h-full flex flex-col relative">
      {/* 4.0 Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B5C] shadow-[0_0_8px_#FF3B5C]" />
            INCIDENT INTELLIGENCE DESK
          </h1>
          <p className="text-xs text-[#64748B] font-mono mt-0.5">
            ARMED BOARDINGS &middot; SKIFF INTERCEPTS &middot; SITUATION LOGS
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={exportCSV}
            className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-[#111827] hover:bg-[#1A2332] text-slate-300 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>EXPORT CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsReportOpen(true)}
            className="h-8 font-mono text-xs tracking-wider gap-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> REPORT INCIDENT
          </Button>
        </div>
      </div>

      {/* 4.1 Advanced Filter Bar */}
      <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] p-3 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Debounced Search */}
          <div className="relative w-full max-w-sm min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search target vessel, type, or description..."
              className="pl-8 h-8 font-mono text-xs bg-[#0A0E17] border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:border-[#00E5FF]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Severity Pills with Count Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto font-mono text-xs">
            {[
              { id: 'all', label: 'ALL', count: incidents.length },
              { id: 'critical', label: 'CRITICAL', count: incidents.filter((i) => i.severity === 'critical').length },
              { id: 'high', label: 'HIGH', count: incidents.filter((i) => i.severity === 'high').length },
              { id: 'medium', label: 'MEDIUM', count: incidents.filter((i) => i.severity === 'medium').length },
            ].map((sev) => (
              <button
                key={sev.id}
                type="button"
                onClick={() => {
                  setSeverityFilter(sev.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  severityFilter === sev.id
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : 'bg-[#0A0E17] text-[#64748B] hover:text-white border border-slate-800'
                }`}
              >
                <span>{sev.label}</span>
                <span className={`px-1 rounded-full text-[9px] ${severityFilter === sev.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {sev.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Chips & Result Counter */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span>SHOWING {filtered.length} OF {incidents.length} INCIDENTS</span>
            {(severityFilter !== 'all' || search) && (
              <button
                type="button"
                onClick={() => {
                  setSeverityFilter('all');
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Clear Filters <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-[10px] text-slate-500 hidden sm:inline">SORT: {sortField.toUpperCase()} ({sortAsc ? 'ASC' : 'DESC'})</span>
        </div>
      </Card>

      {/* 4.2 Data Grid Table */}
      <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-[#111827] sticky top-0 z-20 backdrop-blur-xl border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-10">
                  <button type="button" onClick={toggleSelectAll} className="cursor-pointer text-slate-400">
                    {selectedIds.length === paginated.length && paginated.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#00E5FF]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-mono text-xs w-[100px] text-[#00E5FF]">SEVERITY</TableHead>
                <TableHead
                  onClick={() => toggleSort('occurredAt')}
                  className="font-mono text-xs w-[130px] text-[#00E5FF] cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>DATE / TIME</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-mono text-xs w-[140px] text-[#00E5FF]">CATEGORY</TableHead>
                <TableHead
                  onClick={() => toggleSort('vesselName')}
                  className="font-mono text-xs text-[#00E5FF] cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>TARGET ASSET</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-mono text-xs w-[180px] hidden lg:table-cell text-[#00E5FF]">
                  POSITION
                </TableHead>
                <TableHead className="font-mono text-xs w-[120px] hidden md:table-cell text-[#00E5FF]">
                  SOURCE
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((incident, idx) => {
                const isSelected = selectedIds.includes(incident.id);
                return (
                  <TableRow
                    key={incident.id}
                    className={`border-slate-800/80 cursor-pointer group transition-colors duration-200 ${
                      idx % 2 === 1 ? 'bg-white/[0.01]' : 'bg-transparent'
                    } ${isSelected ? 'bg-[#00E5FF]/10' : 'hover:bg-[#00E5FF]/[0.04]'}`}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => toggleSelectRow(incident.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#00E5FF]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            incident.severity === 'critical' ? 'bg-[#FF3B5C]' : 'bg-[#FFB020]'
                          }`}
                        />
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)} className="font-mono text-xs text-slate-400">
                      {new Date(incident.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)} className="font-heading font-bold text-xs text-white">
                      {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)}>
                      <div className="font-display font-bold text-xs text-white group-hover:text-[#00E5FF] transition-colors">
                        {incident.vesselName || 'UNKNOWN ASSET'}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5 uppercase">
                        {incident.vesselType || 'Commercial'} &middot; {incident.vesselFlag || 'Intl'}
                      </div>
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)} className="font-mono text-xs text-slate-400 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00E5FF]/70" />
                        <span>
                          {formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)} className="hidden md:table-cell font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                      {incident.dataSource}
                    </TableCell>

                    <TableCell onClick={() => setSelectedIncident(incident)}>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00E5FF] transition-all group-hover:translate-x-0.5" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Strip */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-[#111827]/90 font-mono text-xs text-[#64748B] shrink-0">
          <span>
            PAGE {currentPage} OF {totalPages} ({filtered.length} TOTAL)
          </span>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 p-0 border-slate-800 bg-[#0A0E17] text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i + 1}
                size="sm"
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-7 w-7 p-0 font-mono text-xs ${
                  currentPage === i + 1
                    ? 'bg-[#00E5FF] text-black font-bold'
                    : 'border-slate-800 bg-[#0A0E17] text-slate-400'
                }`}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 w-7 p-0 border-slate-800 bg-[#0A0E17] text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 4.5 Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111827] border border-[#00E5FF]/40 px-5 py-2.5 rounded-full shadow-2xl font-mono text-xs flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-white font-bold">{selectedIds.length} INCIDENTS SELECTED</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => toast.success(`Exported ${selectedIds.length} selected incidents.`)}
              className="bg-[#00E5FF] text-black font-bold text-xs h-7 px-3 rounded-full"
            >
              EXPORT SELECTED
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Assigned to Task Force 151.')}
              className="border-slate-700 text-slate-300 text-xs h-7 px-3 rounded-full"
            >
              ASSIGN
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-white h-7 w-7 p-0 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

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
        onTrackOnMap={() => {
          setSelectedIncident(null);
          if (onNavigateMap) onNavigateMap();
        }}
      />

      {/* Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        vessels={vessels}
        onSubmitIncident={(payload) => {
          if (onCreateIncident) onCreateIncident(payload);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}