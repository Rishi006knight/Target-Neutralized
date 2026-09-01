'use client';

import React, { useState } from 'react';
import { AppLayout, PageId } from '@/components/layout/AppLayout';
import DashboardPage from '@/components/dashboard/DashboardPage';
import MapPage from '@/components/map/MapPage';
import IncidentsPage from '@/components/incidents/IncidentsPage';
import VesselsPage from '@/components/vessels/VesselsPage';
import AlertsPage from '@/components/alerts/AlertsPage';
import {
  useDashboardStats,
  useIncidents,
  useIncidentSummary,
  useIncidentTrend,
  useVessels,
  useRiskZones,
  useAlerts,
  useMarkAlertRead,
  useCreateIncident,
} from '@/hooks/use-maritime-data';
import { useAisStream } from '@/hooks/use-ais-stream';
import {
  mockStats,
  mockIncidents,
  mockVessels,
  mockRiskZones,
  mockAlerts,
} from '@/lib/mock-data';

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: incidents, isLoading: incidentsLoading, refetch: refetchIncidents } = useIncidents();
  const { data: incidentSummary, isLoading: summaryLoading } = useIncidentSummary();
  const { data: incidentTrend, isLoading: trendLoading } = useIncidentTrend();
  const { data: vessels, isLoading: vesselsLoading } = useVessels();
  const { data: riskZones, isLoading: riskZonesLoading } = useRiskZones();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();

  const markAlertReadMutation = useMarkAlertRead();
  const createIncidentMutation = useCreateIncident();
  const { liveVessels } = useAisStream();

  const loading =
    statsLoading &&
    incidentsLoading &&
    vesselsLoading &&
    riskZonesLoading &&
    alertsLoading;

  const currentStats = stats || mockStats;
  const currentIncidents = Array.isArray(incidents) && incidents.length > 0 ? incidents : mockIncidents;
  const currentRiskZones = Array.isArray(riskZones) && riskZones.length > 0 ? riskZones : mockRiskZones;
  const currentVessels = Array.isArray(vessels) && vessels.length > 0 ? vessels : mockVessels;
  const currentAlerts = Array.isArray(alerts) && alerts.length > 0 ? alerts : mockAlerts;
  const currentSummary = incidentSummary || { total: 5, bySeverity: { critical: 2, high: 2, medium: 1, low: 0 }, byType: { boarding: 1, hijack: 1, approach: 1, ais_gap: 1, suspicious: 1 } };
  const currentTrend = Array.isArray(incidentTrend) && incidentTrend.length > 0 ? incidentTrend : [{ month: '2026-03', count: 3 }, { month: '2026-04', count: 5 }, { month: '2026-05', count: 4 }, { month: '2026-06', count: 7 }, { month: '2026-07', count: 6 }, { month: '2026-08', count: 8 }];

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && (
        <DashboardPage
          stats={currentStats}
          riskZones={currentRiskZones}
          incidentSummary={currentSummary}
          incidentTrend={currentTrend}
          activeIncidents={currentIncidents}
          loading={loading}
          onNavigateAlerts={() => setActivePage('alerts')}
        />
      )}
      {activePage === 'map' && (
        <MapPage
          incidents={currentIncidents}
          vessels={currentVessels}
          liveVessels={liveVessels?.length > 0 ? liveVessels : currentVessels}
          riskZones={currentRiskZones}
          loading={loading}
        />
      )}
      {activePage === 'incidents' && (
        <IncidentsPage
          incidents={currentIncidents}
          loading={loading}
          onRefresh={refetchIncidents}
          onCreateIncident={(payload) => createIncidentMutation.mutate(payload)}
        />
      )}
      {activePage === 'vessels' && (
        <VesselsPage
          vessels={liveVessels?.length > 0 ? [...liveVessels, ...currentVessels.filter(v => !liveVessels.some(lv => lv.mmsi === v.mmsi))] : currentVessels}
          loading={loading}
        />
      )}
      {activePage === 'alerts' && (
        <AlertsPage
          alerts={currentAlerts}
          loading={loading}
          onMarkRead={(id) => markAlertReadMutation.mutate(id)}
        />
      )}
    </AppLayout>
  );
}