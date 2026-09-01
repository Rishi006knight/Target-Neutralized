'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
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
  Star,
  MapPin,
  CheckSquare,
  Square,
  Copy,
  X,
  SlidersHorizontal,
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
  onNavigateMap?: () => void;
}

export default function VesselsPage({
  vessels = [],
  alerts = [],
  loading,
  onSelectIncidentId,
  onNavigateMap,
}: VesselsPageProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'watchlist' | 'dark' | 'active'>('all');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedMmsis, setSelectedMmsis] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter logic
  const filtered = useMemo(() => {
    return (vessels || []).filter((v) => {
      if (filterMode === 'dark' && !v.isDark) return false;
      if (filterMode === 'active' && v.isDark) return false;
      if (filterMode === 'watchlist') {
        const isSaved = typeof window !== 'undefined' && localStorage.getItem(`vessel_watchlist_${v.mmsi}`) === 'true';
        if (!isSaved) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = v.name ? v.name.toLowerCase().includes(q) : false;
        const matchMmsi = v.mmsi ? v.mmsi.includes(q) : false;
        const matchFlag = v.flag ? v.flag.toLowerCase().includes(q) : false;
        return matchName || matchMmsi || matchFlag;
      }
      return true;
    });
  }, [vessels, filterMode, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const copyMmsi = (mmsi: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mmsi);
    toast.success(`Copied MMSI ${mmsi} to clipboard.`);
  };

  const toggleSelect = (mmsi: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMmsis((prev) => (prev.includes(mmsi) ? prev.filter((x) => x !== mmsi) : [...prev, mmsi]));
  };

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
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `oceanshield_fleet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} vessels as CSV.`);
  };

  const comparedVessels = vessels.filter((v) => selectedMmsis.includes(v.mmsi));

  return (
    <div className="space-y-4 h-full flex flex-col relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            FLEET VESSEL TRACKER
          </h1>
          <p className="text-xs text-[#64748B] font-mono mt-0.5">
            REAL-TIME AIS TELEMETRY &middot; ANOMALY SCORING &middot; GHOST SHIP RADAR
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedMmsis.length >= 2 && (
            <Button
              size="sm"
              onClick={() => setIsComparing(true)}
              className="h-8 font-mono text-xs gap-1.5 bg-[#7C3AED] hover:bg-[#7C3AED]/80 text-white font-bold cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>COMPARE ({selectedMmsis.length})</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={exportCSV}
            className="h-8 font-mono text-xs gap-1.5 border-slate-700 bg-[#111827] hover:bg-[#1A2332] text-slate-300 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>EXPORT CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter Strip */}
      <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] p-3 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search MMSI, Vessel Name, Flag..."
              className="pl-8 h-8 font-mono text-xs bg-[#0A0E17] border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:border-[#00E5FF]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[
              { id: 'all', label: 'ALL VESSELS', count: vessels.length },
              { id: 'watchlist', label: 'WATCHLIST', count: typeof window !== 'undefined' ? Object.keys(localStorage).filter((k) => k.startsWith('vessel_watchlist_') && localStorage.getItem(k) === 'true').length : 0 },
              { id: 'dark', label: 'DARK ONLY', count: vessels.filter((v) => v.isDark).length },
              { id: 'active', label: 'AIS ACTIVE', count: vessels.filter((v) => !v.isDark).length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterMode(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === tab.id
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : 'bg-[#0A0E17] text-[#64748B] hover:text-white border border-slate-800'
                }`}
              >
                {tab.id === 'watchlist' && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                <span>{tab.label}</span>
                <span className={`px-1 rounded-full text-[9px] ${filterMode === tab.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1 border-t border-slate-800/60">
          <span>SHOWING {filtered.length} OF {vessels.length} MONITORED FLEET ASSETS</span>
          <span>AIS REFRESH RATE: 5.0s</span>
        </div>
      </Card>

      {/* Fleet Table */}
      <Card className="glass-panel-card border-[rgba(0,229,255,0.08)] flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-[#111827] sticky top-0 z-20 backdrop-blur-xl border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-10">
                  <Square className="w-4 h-4 text-slate-600" />
                </TableHead>
                <TableHead className="font-mono text-xs w-[120px] text-[#00E5FF]">MMSI</TableHead>
                <TableHead className="font-mono text-xs min-w-[180px] text-[#00E5FF]">VESSEL NAME</TableHead>
                <TableHead className="font-mono text-xs w-[130px] text-[#00E5FF]">STATUS</TableHead>
                <TableHead className="font-mono text-xs w-[180px] hidden lg:table-cell text-[#00E5FF]">POSITION</TableHead>
                <TableHead className="font-mono text-xs w-[130px] hidden sm:table-cell text-[#00E5FF]">HDG / SPD</TableHead>
                <TableHead className="font-mono text-xs w-[140px] text-[#00E5FF]">RISK PROFILE</TableHead>
                <TableHead className="font-mono text-xs text-right w-[120px] hidden md:table-cell text-[#00E5FF]">LAST SEEN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((vessel, idx) => {
                const isSelected = selectedMmsis.includes(vessel.mmsi);
                return (
                  <TableRow
                    key={vessel.id || vessel.mmsi}
                    onClick={() => setSelectedVessel(vessel)}
                    className={`border-slate-800/80 cursor-pointer group transition-colors duration-200 ${
                      idx % 2 === 1 ? 'bg-white/[0.01]' : 'bg-transparent'
                    } ${isSelected ? 'bg-[#7C3AED]/10' : 'hover:bg-[#00E5FF]/[0.04]'}`}
                  >
                    <TableCell onClick={(e) => toggleSelect(vessel.mmsi, e)}>
                      <button type="button" className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#7C3AED]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </TableCell>

                    <TableCell onClick={(e) => copyMmsi(vessel.mmsi, e)}>
                      <div className="flex items-center gap-1 text-[#64748B] group-hover:text-white font-mono text-xs font-bold">
                        <span>{vessel.mmsi}</span>
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#00E5FF]" />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-display font-bold text-xs text-white group-hover:text-[#00E5FF] transition-colors">
                        {vessel.name}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5 uppercase">
                        {vessel.type || 'Commercial'} &middot; {vessel.flag || 'Intl'}
                      </div>
                    </TableCell>

                    <TableCell>
                      {vessel.isDark ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#FF3B5C] bg-red-950/80 border border-red-800 animate-pulse">
                          DARK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#00E676] bg-emerald-950/80 border border-emerald-800 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                          AIS ACTIVE
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-400 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00E5FF]/70" />
                        <span>
                          {formatCoordinate(vessel.lat, true)}, {formatCoordinate(vessel.lng, false)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-300 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Navigation
                          className="w-3 h-3 text-[#00E5FF]"
                          style={{ transform: `rotate(${vessel.heading || 0}deg)` }}
                        />
                        <span className="font-bold">{vessel.speed.toFixed(1)} kts</span>
                      </div>
                      <span className="text-[10px] text-[#64748B]">HDG: {vessel.heading.toFixed(1)}&deg;</span>
                    </TableCell>

                    <TableCell>
                      <div className="w-20 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${getRiskColor(vessel.riskScore || 0.1)}`}
                          style={{ width: `${Math.min(100, Math.max(5, (vessel.riskScore || 0.1) * 100))}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono mt-1 text-[#64748B]">
                        THREAT: {((vessel.riskScore || 0.1) * 100).toFixed(0)}%
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-400 text-right hidden md:table-cell">
                      {new Date(vessel.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Strip */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-[#111827]/90 font-mono text-xs text-[#64748B] shrink-0">
          <span>PAGE {currentPage} OF {totalPages} ({filtered.length} TOTAL)</span>

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

      {/* 5.5 Vessel Comparison Modal */}
      {isComparing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-[#7C3AED]/40 rounded-xl p-6 max-w-4xl w-full space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="font-heading font-bold text-lg text-white">VESSEL TELEMETRY COMPARISON</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsComparing(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedVessels.map((v) => (
                <div key={v.mmsi} className="p-3.5 bg-[#0A0E17] border border-slate-800 rounded-lg space-y-2">
                  <span className="font-display font-bold text-sm text-white block truncate">{v.name}</span>
                  <span className="text-[10px] text-[#64748B] block">MMSI: {v.mmsi}</span>
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Speed:</span>
                      <span className="text-white font-bold">{v.speed.toFixed(1)} kts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Heading:</span>
                      <span className="text-white font-bold">{v.heading.toFixed(1)}&deg;</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Threat Score:</span>
                      <span className="text-[#FF3B5C] font-bold">{(v.riskScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Transponder:</span>
                      <span className={v.isDark ? 'text-[#FF3B5C] font-bold' : 'text-[#00E676]'}>
                        {v.isDark ? 'OFFLINE' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 480px Slide-Over */}
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