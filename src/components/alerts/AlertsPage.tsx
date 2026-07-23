'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bell, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Alert } from '@/lib/mock-data';

interface AlertsPageProps {
  alerts: Alert[];
  loading: boolean;
  onMarkRead: (id: number) => void;
}

export default function AlertsPage({ alerts, loading, onMarkRead }: AlertsPageProps) {
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBorder = (severity: string, isRead: boolean) => {
    if (isRead) return 'border-border/50 bg-muted/5 opacity-60';
    switch (severity) {
      case 'critical': return 'border-destructive/50 bg-destructive/10';
      case 'high': return 'border-orange-500/50 bg-orange-500/10';
      case 'warning': return 'border-amber-500/50 bg-amber-500/10';
      case 'info':
      default: return 'border-primary/30 bg-primary/5';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6" /> System Alerts
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">AUTOMATED THREAT &amp; SYSTEM NOTIFICATIONS</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full bg-muted/20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3 bg-muted/20" />
                  <Skeleton className="h-4 w-2/3 bg-muted/20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-mono">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            NO ACTIVE ALERTS
          </div>
        ) : (
          alerts.map(alert => (
            <Card key={alert.id} className={`transition-colors ${getAlertBorder(alert.severity, alert.isRead)}`}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1">{getAlertIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h3 className="font-bold text-sm truncate">{alert.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{alert.message}</p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-2">
                        {alert.relatedVesselMmsi && (
                          <span className="px-2 py-0.5 rounded bg-muted/50 border border-border text-[10px] font-mono text-muted-foreground uppercase">
                            MMSI: {alert.relatedVesselMmsi}
                          </span>
                        )}
                        {alert.relatedIncidentId && (
                          <span className="px-2 py-0.5 rounded bg-muted/50 border border-border text-[10px] font-mono text-muted-foreground uppercase">
                            INCIDENT #{alert.relatedIncidentId}
                          </span>
                        )}
                      </div>

                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-mono shrink-0 hover:bg-background"
                          onClick={() => onMarkRead(alert.id)}
                        >
                          MARK READ
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}