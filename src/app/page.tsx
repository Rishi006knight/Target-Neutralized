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
} from '@/hooks/use-maritime-data';

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

  const loading =
    statsLoading ||
    incidentsLoading ||
    summaryLoading ||
    trendLoading ||
    vesselsLoading ||
    riskZonesLoading ||
    alertsLoading;

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && (
        <DashboardPage
          stats={stats as any}
          riskZones={riskZones || []}
          incidentSummary={incidentSummary as any}
          incidentTrend={incidentTrend || []}
          activeIncidents={incidents || []}
          loading={loading}
          onNavigateAlerts={() => setActivePage('alerts')}
        />
      )}
      {activePage === 'map' && (
        <MapPage
          incidents={incidents || []}
          vessels={vessels || []}
          riskZones={riskZones || []}
          loading={loading}
        />
      )}
      {activePage === 'incidents' && (
        <IncidentsPage
          incidents={incidents || []}
          loading={loading}
          onRefresh={refetchIncidents}
        />
      )}
      {activePage === 'vessels' && (
        <VesselsPage
          vessels={vessels || []}
          loading={loading}
        />
      )}
      {activePage === 'alerts' && (
        <AlertsPage
          alerts={alerts || []}
          loading={loading}
          onMarkRead={(id) => markAlertReadMutation.mutate(id)}
        />
      )}
    </AppLayout>
  );
}