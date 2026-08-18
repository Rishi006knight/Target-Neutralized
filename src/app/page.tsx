'use client';

import React, { useState } from 'react';
import { AppLayout, PageId } from '@/components/layout/AppLayout';
import DashboardPage from '@/components/dashboard/DashboardPage';
import MapPage from '@/components/map/MapPage';
import IncidentsPage from '@/components/incidents/IncidentsPage';
import VesselsPage from '@/components/vessels/VesselsPage';
import AlertsPage from '@/components/alerts/AlertsPage';
import { useAisStream } from '@/hooks/use-ais-stream';

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  const {
    liveVessels,
    liveIncidents,
    liveAlerts,
    liveRiskZones,
    stats,
    incidentSummary,
    incidentTrend,
    isConnected,
    markAlertRead,
    addManualIncident,
  } = useAisStream();

  // Loading state only while first connecting with no vessels yet
  const loading = !isConnected && liveVessels.length === 0;

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && (
        <DashboardPage
          stats={stats}
          riskZones={liveRiskZones}
          incidentSummary={incidentSummary}
          incidentTrend={incidentTrend}
          activeIncidents={liveIncidents}
          loading={loading}
          onNavigateAlerts={() => setActivePage('alerts')}
        />
      )}
      {activePage === 'map' && (
        <MapPage
          incidents={liveIncidents}
          vessels={liveVessels}
          liveVessels={liveVessels}
          riskZones={liveRiskZones}
          loading={loading}
        />
      )}
      {activePage === 'incidents' && (
        <IncidentsPage
          incidents={liveIncidents}
          loading={loading}
          onRefresh={() => {}}
          onCreateIncident={addManualIncident}
        />
      )}
      {activePage === 'vessels' && (
        <VesselsPage
          vessels={liveVessels}
          loading={loading}
        />
      )}
      {activePage === 'alerts' && (
        <AlertsPage
          alerts={liveAlerts}
          loading={loading}
          onMarkRead={markAlertRead}
        />
      )}
    </AppLayout>
  );
}