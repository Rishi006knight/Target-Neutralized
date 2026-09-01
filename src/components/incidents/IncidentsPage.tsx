'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Filter, FileText, ChevronRight } from 'lucide-react';
import { getSeverityColor, formatCoordinate } from '@/lib/utils-maritime';
import type { Incident } from '@/lib/mock-data';

interface IncidentsPageProps {
  incidents: Incident[];
  loading: boolean;
  onRefresh: () => void;
  onCreateIncident?: (data: Partial<Incident>) => void;
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

export default function IncidentsPage({ incidents = [], loading, onRefresh, onCreateIncident }: IncidentsPageProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);

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

  const handleReportSubmit = async (data: Record<string, string>) => {
    try {
      const incidentPayload = {
        ...data,
        lat: parseFloat(data.lat) || 0,
        lng: parseFloat(data.lng) || 0,
        occurredAt: new Date(data.occurredAt || Date.now()).toISOString(),
        dataSource: data.dataSource || 'Manual Report',
      };
      if (onCreateIncident) {
        onCreateIncident(incidentPayload as any);
        onRefresh();
        setIsReportOpen(false);
        return;
      }
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentPayload),
      });
      if (res.ok) {
        onRefresh();
        setIsReportOpen(false);
      }
    } catch {
      /* error handled silently */
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Log</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">RECORDED EVENTS &amp; THREATS</p>
        </div>
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono text-xs tracking-wider gap-2">
              <Plus className="w-4 h-4" /> REPORT INCIDENT
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-mono tracking-wider">NEW INCIDENT REPORT</DialogTitle>
            </DialogHeader>
            <ReportIncidentForm onSubmit={handleReportSubmit} onCancel={() => setIsReportOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border flex flex-col min-h-0 flex-1">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/10 shrink-0 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vessel, type, or description..."
              className="pl-9 font-mono text-sm bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px] font-mono text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL SEVERITIES</SelectItem>
              <SelectItem value="critical">CRITICAL</SelectItem>
              <SelectItem value="high">HIGH</SelectItem>
              <SelectItem value="medium">MEDIUM</SelectItem>
              <SelectItem value="low">LOW</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] font-mono text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL TYPES</SelectItem>
              <SelectItem value="hijack">HIJACK</SelectItem>
              <SelectItem value="boarding">BOARDING</SelectItem>
              <SelectItem value="suspicious">SUSPICIOUS</SelectItem>
              <SelectItem value="approach">APPROACH</SelectItem>
              <SelectItem value="ais_gap">AIS GAP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs w-[100px]">SEVERITY</TableHead>
                <TableHead className="font-mono text-xs w-[150px] hidden sm:table-cell">DATE/TIME</TableHead>
                <TableHead className="font-mono text-xs w-[140px]">TYPE</TableHead>
                <TableHead className="font-mono text-xs">VESSEL</TableHead>
                <TableHead className="font-mono text-xs w-[180px] hidden lg:table-cell">LOCATION</TableHead>
                <TableHead className="font-mono text-xs w-[90px] hidden md:table-cell">SOURCE</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell>
                      <Skeleton className="h-6 w-20 bg-muted/20" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-28 bg-muted/20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-muted/20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36 bg-muted/20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-28 bg-muted/20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-16 bg-muted/20" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-mono">
                    NO INCIDENTS FOUND MATCHING CRITERIA
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((incident) => (
                  <TableRow key={incident.id} className="border-border hover:bg-muted/10 cursor-pointer group">
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      {safeFormatDate(incident.occurredAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{incident.vesselName || 'UNKNOWN'}</div>
                      {incident.vesselType && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">
                          {incident.vesselType}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden lg:table-cell">
                      {formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span className="font-mono">{incident.dataSource}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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

function ReportIncidentForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    incidentType: 'suspicious',
    severity: 'medium',
    lat: '12.5',
    lng: '45.0',
    vesselName: '',
    vesselType: '',
    description: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    dataSource: 'Manual Operator Ingest',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-muted-foreground mb-1.5 block">INCIDENT TYPE</label>
          <Select value={form.incidentType} onValueChange={(v) => update('incidentType', v)}>
            <SelectTrigger className="font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hijack">HIJACK</SelectItem>
              <SelectItem value="boarding">BOARDING</SelectItem>
              <SelectItem value="approach">APPROACH</SelectItem>
              <SelectItem value="suspicious">SUSPICIOUS</SelectItem>
              <SelectItem value="ais_gap">AIS GAP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="font-mono text-xs text-muted-foreground mb-1.5 block">SEVERITY</label>
          <Select value={form.severity} onValueChange={(v) => update('severity', v)}>
            <SelectTrigger className="font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">CRITICAL</SelectItem>
              <SelectItem value="high">HIGH</SelectItem>
              <SelectItem value="medium">MEDIUM</SelectItem>
              <SelectItem value="low">LOW</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-muted-foreground mb-1.5 block">LATITUDE</label>
          <Input
            type="number"
            step="0.000001"
            value={form.lat}
            onChange={(e) => update('lat', e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-muted-foreground mb-1.5 block">LONGITUDE</label>
          <Input
            type="number"
            step="0.000001"
            value={form.lng}
            onChange={(e) => update('lng', e.target.value)}
            className="font-mono"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-muted-foreground mb-1.5 block">VESSEL NAME</label>
          <Input
            value={form.vesselName}
            onChange={(e) => update('vesselName', e.target.value)}
            placeholder="e.g. PACIFIC MARINER"
            className="font-mono"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-muted-foreground mb-1.5 block">TIME OF INCIDENT (UTC)</label>
          <Input
            type="datetime-local"
            value={form.occurredAt}
            onChange={(e) => update('occurredAt', e.target.value)}
            className="font-mono"
          />
        </div>
      </div>
      <div>
        <label className="font-mono text-xs text-muted-foreground mb-1.5 block">DESCRIPTION</label>
        <Textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Detailed situational report..."
          className="font-mono text-sm resize-none h-24"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="font-mono">
          CANCEL
        </Button>
        <Button
          onClick={() => onSubmit(form)}
          className="font-mono"
          disabled={!form.description || form.description.length < 3}
        >
          SUBMIT REPORT
        </Button>
      </div>
    </div>
  );
}