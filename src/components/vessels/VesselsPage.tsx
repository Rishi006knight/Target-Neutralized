'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

export default function VesselsPage({ vessels, loading }: VesselsPageProps) {
  const [darkOnly, setDarkOnly] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = vessels.filter(v => {
    if (darkOnly && !v.isDark) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.mmsi.includes(q);
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
              placeholder="Search MMSI or Name..."
              className="pl-9 font-mono text-sm bg-background border-border"
              value={search}
              onChange={e => setSearch(e.target.value)}
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
                <TableHead className="font-mono text-xs w-[90px]">MMSI</TableHead>
                <TableHead className="font-mono text-xs min-w-[160px]">VESSEL</TableHead>
                <TableHead className="font-mono text-xs w-[110px]">STATUS</TableHead>
                <TableHead className="font-mono text-xs w-[180px] hidden lg:table-cell">POSITION</TableHead>
                <TableHead className="font-mono text-xs w-[100px] hidden sm:table-cell">HDG/SPD</TableHead>
                <TableHead className="font-mono text-xs w-[130px]">RISK PROFILE</TableHead>
                <TableHead className="font-mono text-xs text-right w-[120px] hidden md:table-cell">LAST SEEN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-16 bg-muted/20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32 bg-muted/20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-muted/20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-28 bg-muted/20" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20 bg-muted/20" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-24 bg-muted/20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20 bg-muted/20 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-mono">
                    NO VESSELS FOUND
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(vessel => (
                  <TableRow key={vessel.id} className={`border-border hover:bg-muted/10 cursor-pointer ${vessel.isDark ? 'bg-amber-950/10' : ''}`}>
                    <TableCell className="font-mono text-xs">{vessel.mmsi}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {vessel.name}
                        {vessel.isDark && <AlertCircle className="w-3 h-3 text-amber-500" />}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase flex items-center gap-2">
                        <span>{vessel.type.replace(/_/g, ' ')}</span>
                        <span>&middot;</span>
                        <span>{vessel.flag}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vessel.isDark ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-amber-400 bg-amber-900/30 border border-amber-500/20">AIS OFFLINE</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-green-400 bg-green-900/30 border border-green-500/20">AIS ACTIVE</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden lg:table-cell">
                      {formatCoordinate(vessel.lat, true)}, {formatCoordinate(vessel.lng, false)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      <div className="flex items-center gap-1"><Navigation className="w-3 h-3" style={{ transform: `rotate(${vessel.heading}deg)` }} /> {vessel.heading}&deg;</div>
                      <div>{vessel.speed.toFixed(1)} kts</div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${getRiskColor(vessel.riskScore)}`} style={{ width: `${vessel.riskScore * 100}%` }} />
                      </div>
                      <div className="text-[10px] font-mono mt-1 text-muted-foreground">SCORE: {(vessel.riskScore * 100).toFixed(0)}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground text-right hidden md:table-cell">
                      {new Date(vessel.lastSeenAt).toISOString().replace('T', ' ').substring(0, 16)}
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