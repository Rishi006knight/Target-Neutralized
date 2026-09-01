'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Navigation, AlertCircle } from 'lucide-react';
import { formatCoordinate, getRiskColor } from '@/lib/utils-maritime';
import type { Vessel } from '@/lib/mock-data';

interface VesselsPageProps {
  vessels: Vessel[];
  loading: boolean;
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

export default function VesselsPage({ vessels = [], loading }: VesselsPageProps) {
  const [darkOnly, setDarkOnly] = useState(false);
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vessel Tracker</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">GLOBAL FLEET MONITORING</p>
        </div>
      </div>

      <Card className="bg-card border-border flex flex-col min-h-0 flex-1">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10 shrink-0 flex-wrap gap-3">
          <div className="relative w-full max-w-sm min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search MMSI, Name, or Flag..."
              className="pl-9 font-mono text-sm bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="dark-mode" checked={darkOnly} onCheckedChange={setDarkOnly} />
            <Label htmlFor="dark-mode" className="font-mono text-xs flex items-center gap-2 cursor-pointer">
              SHOW DARK VESSELS ONLY
              {darkOnly && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </Label>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs w-[100px]">MMSI</TableHead>
                <TableHead className="font-mono text-xs min-w-[160px]">VESSEL</TableHead>
                <TableHead className="font-mono text-xs w-[120px]">STATUS</TableHead>
                <TableHead className="font-mono text-xs w-[180px] hidden lg:table-cell">POSITION</TableHead>
                <TableHead className="font-mono text-xs w-[110px] hidden sm:table-cell">HDG/SPD</TableHead>
                <TableHead className="font-mono text-xs w-[130px]">RISK PROFILE</TableHead>
                <TableHead className="font-mono text-xs text-right w-[140px] hidden md:table-cell">LAST SEEN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell>
                      <Skeleton className="h-4 w-16 bg-muted/20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32 bg-muted/20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 bg-muted/20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-28 bg-muted/20" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-20 bg-muted/20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-2 w-24 bg-muted/20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-20 bg-muted/20 float-right" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-mono">
                    NO VESSELS FOUND
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((vessel) => (
                  <TableRow
                    key={vessel.id || vessel.mmsi}
                    className={`border-border hover:bg-muted/10 cursor-pointer ${
                      vessel.isDark ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <TableCell className="font-mono text-xs font-semibold">{vessel.mmsi}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {vessel.name || 'UNKNOWN'}
                        {vessel.isDark && <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase flex items-center gap-2">
                        <span>{vessel.type ? vessel.type.replace(/_/g, ' ') : 'Commercial Transit'}</span>
                        <span>&middot;</span>
                        <span>{vessel.flag || 'International'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vessel.isDark ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-amber-400 bg-amber-900/30 border border-amber-500/20">
                          AIS OFFLINE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-500/20">
                          AIS ACTIVE
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden lg:table-cell">
                      {formatCoordinate(vessel.lat, true)}, {formatCoordinate(vessel.lng, false)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Navigation
                          className="w-3 h-3 text-cyan-400"
                          style={{ transform: `rotate(${vessel.heading || 0}deg)` }}
                        />{' '}
                        {vessel.heading ?? 0}&deg;
                      </div>
                      <div className="text-[11px] font-mono mt-0.5 text-foreground">
                        {(vessel.speed ?? 0).toFixed(1)} kts
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getRiskColor(vessel.riskScore ?? 0.1)}`}
                          style={{ width: `${Math.min(100, Math.max(5, (vessel.riskScore ?? 0.1) * 100))}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono mt-1 text-muted-foreground">
                        SCORE: {((vessel.riskScore ?? 0.1) * 100).toFixed(0)}%
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground text-right hidden md:table-cell">
                      {safeFormatDate(vessel.lastSeenAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}