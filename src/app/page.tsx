'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout, PageId } from '@/components/layout/AppLayout';
import DashboardPage from '@/components/dashboard/DashboardPage';
import MapPage from '@/components/map/MapPage';
import IncidentsPage from '@/components/incidents/IncidentsPage';
import VesselsPage from '@/components/vessels/VesselsPage';
import AlertsPage from '@/components/alerts/AlertsPage';
import AnalyticsPage from '@/components/analytics/AnalyticsPage';
import AlertRulesPage from '@/components/rules/AlertRulesPage';
import VesselDetailDrawer from '@/components/vessels/VesselDetailDrawer';
import IncidentDetailModal from '@/components/incidents/IncidentDetailModal';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import CommandPalette from '@/components/command/CommandPalette';
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
  type Vessel,
  type Incident,
  type Alert,
} from '@/lib/mock-data';
import { toast } from 'sonner';

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { data: stats } = useDashboardStats();
  const { data: incidents, refetch: refetchIncidents } = useIncidents();
  const { data: incidentSummary } = useIncidentSummary();
  const { data: incidentTrend } = useIncidentTrend();
  const { data: vessels } = useVessels();
  const { data: riskZones } = useRiskZones();
  const { data: alerts } = useAlerts();

  const markAlertReadMutation = useMarkAlertRead();
  const createIncidentMutation = useCreateIncident();
  const { liveVessels } = useAisStream();

  // Local state for dynamic real-time simulated telemetry & alerts
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>(() => mockAlerts);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [satDetectionsCount, setSatDetectionsCount] = useState<number>(1204);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K, Cmd+1-5, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      // Cmd+1-5 Switch Pages
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); setActivePage('dashboard'); }
        if (e.key === '2') { e.preventDefault(); setActivePage('map'); }
        if (e.key === '3') { e.preventDefault(); setActivePage('incidents'); }
        if (e.key === '4') { e.preventDefault(); setActivePage('vessels'); }
        if (e.key === '5') { e.preventDefault(); setActivePage('alerts'); }
      }
      // Escape
      if (e.key === 'Escape') {
        setSelectedVessel(null);
        setSelectedIncident(null);
        setIsCommandOpen(false);
        setIsReportOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync initial alerts
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setActiveAlerts(alerts);
    }
  }, [alerts]);

  // 8.8 Simulated Real-Time Engine (Coordinate jitter, emergency incident toasts, sat counter)
  useEffect(() => {
    // 1. Sat detections counter increment
    const satInterval = setInterval(() => {
      setSatDetectionsCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 10000);

    // 2. Periodic tactical emergency alerts
    const alertSpawnInterval = setInterval(() => {
      const sampleAlertTitles = [
        'FAST SKIFF INTERCEPT DETECTED — GULF OF ADEN',
        'AIS TRANSPONDER DROP — BONNY OFFSHORE',
        'SUSPICIOUS RENDEZVOUS IDENTIFIED BY SAR SATELLITE',
      ];
      const randomTitle = sampleAlertTitles[Math.floor(Math.random() * sampleAlertTitles.length)];

      const spawnedAlert: Alert = {
        id: Date.now(),
        severity: 'critical',
        category: 'Critical',
        title: randomTitle,
        message: `Tactical sensor grid detected aggressive surface approach at 28.5 kts closing on monitored transit corridor.`,
        isRead: false,
        relatedVesselMmsi: '538006842',
        relatedIncidentId: 101,
        createdAt: new Date().toISOString(),
      };

      setActiveAlerts((prev) => [spawnedAlert, ...prev]);

      toast.error(spawnedAlert.title, {
        description: spawnedAlert.message,
        duration: 8000,
        action: {
          label: 'VIEW ALERT',
          onClick: () => setActivePage('alerts'),
        },
      });
    }, 60000);

    return () => {
      clearInterval(satInterval);
      clearInterval(alertSpawnInterval);
    };
  }, []);

  const unreadCount = activeAlerts.filter((a) => !a.isRead).length;

  const currentStats = {
    ...(stats || mockStats),
    satDetectionsCount,
    unreadAlerts: unreadCount,
  };

  const currentIncidents = Array.isArray(incidents) && incidents.length > 0 ? incidents : mockIncidents;
  const currentRiskZones = Array.isArray(riskZones) && riskZones.length > 0 ? riskZones : mockRiskZones;
  const currentVessels = liveVessels?.length > 0 ? liveVessels : vessels || mockVessels;
  const currentSummary = incidentSummary || {
    total: 6,
    bySeverity: { critical: 3, high: 2, medium: 1, low: 0 },
    byType: { boarding: 2, hijack: 1, approach: 2, ais_gap: 1 },
  };
  const currentTrend = Array.isArray(incidentTrend) && incidentTrend.length > 0 ? incidentTrend : [
    { month: '2025-11', count: 14 },
    { month: '2025-12', count: 22 },
    { month: '2026-01', count: 18 },
    { month: '2026-02', count: 25 },
    { month: '2026-03', count: 19 },
    { month: '2026-04', count: 23 },
  ];

  const handleMarkAlertRead = (id: number) => {
    setActiveAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    markAlertReadMutation.mutate(id);
  };

  const handleMarkAllAlertsRead = () => {
    setActiveAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const handleClearResolvedAlerts = () => {
    setActiveAlerts((prev) => prev.filter((a) => !a.isRead));
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      unreadAlertsCount={unreadCount}
      onOpenCommandPalette={() => setIsCommandOpen(true)}
    >
      {/* 1. Dashboard View */}
      {activePage === 'dashboard' && (
        <DashboardPage
          stats={currentStats}
          riskZones={currentRiskZones}
          incidentSummary={currentSummary}
          incidentTrend={currentTrend}
          activeIncidents={currentIncidents}
          loading={false}
          onNavigateAlerts={() => setActivePage('alerts')}
          onNavigateMap={() => setActivePage('map')}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          onSelectVesselMmsi={(mmsi) => {
            const v = currentVessels.find((ves) => ves.mmsi === mmsi);
            if (v) setSelectedVessel(v);
          }}
        />
      )}

      {/* 2. Tactical Live Map View */}
      {activePage === 'map' && (
        <MapPage
          incidents={currentIncidents}
          vessels={currentVessels}
          liveVessels={currentVessels}
          riskZones={currentRiskZones}
          loading={false}
          onSelectVessel={(v) => setSelectedVessel(v)}
          onSelectIncident={(i) => setSelectedIncident(i)}
        />
      )}

      {/* 3. Incidents Log View */}
      {activePage === 'incidents' && (
        <IncidentsPage
          incidents={currentIncidents}
          vessels={currentVessels}
          loading={false}
          onRefresh={refetchIncidents}
          onCreateIncident={(payload) => createIncidentMutation.mutate(payload)}
          onSelectVesselMmsi={(mmsi) => {
            const v = currentVessels.find((ves) => ves.mmsi === mmsi);
            if (v) setSelectedVessel(v);
          }}
          onNavigateMap={() => setActivePage('map')}
        />
      )}

      {/* 4. Vessel Tracker View */}
      {activePage === 'vessels' && (
        <VesselsPage
          vessels={currentVessels}
          alerts={activeAlerts}
          loading={false}
          onSelectIncidentId={(id) => {
            const inc = currentIncidents.find((i) => i.id === id);
            if (inc) setSelectedIncident(inc);
          }}
          onNavigateMap={() => setActivePage('map')}
        />
      )}

      {/* 5. Alerts View */}
      {activePage === 'alerts' && (
        <AlertsPage
          alerts={activeAlerts}
          loading={false}
          onMarkRead={handleMarkAlertRead}
          onMarkAllRead={handleMarkAllAlertsRead}
          onClearResolved={handleClearResolvedAlerts}
          onSelectVesselMmsi={(mmsi) => {
            const v = currentVessels.find((ves) => ves.mmsi === mmsi);
            if (v) setSelectedVessel(v);
          }}
        />
      )}

      {/* 6. Analytics View */}
      {activePage === 'analytics' && (
        <AnalyticsPage
          incidents={currentIncidents}
          riskZones={currentRiskZones}
        />
      )}

      {/* 7. Alert Rules View */}
      {activePage === 'rules' && (
        <AlertRulesPage />
      )}

      {/* Spotlight Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={setActivePage}
        vessels={currentVessels}
        incidents={currentIncidents}
        onSelectVessel={(v) => setSelectedVessel(v)}
        onSelectIncident={(i) => setSelectedIncident(i)}
        onOpenReportIncident={() => setIsReportOpen(true)}
      />

      {/* 480px Vessel Detail Slide-Over */}
      <VesselDetailDrawer
        vessel={selectedVessel}
        isOpen={Boolean(selectedVessel)}
        onClose={() => setSelectedVessel(null)}
        alerts={activeAlerts}
        onSelectIncident={(id) => {
          setSelectedVessel(null);
          const inc = currentIncidents.find((i) => i.id === id);
          if (inc) setSelectedIncident(inc);
        }}
        onOpenAlertRule={() => {
          setSelectedVessel(null);
          setActivePage('rules');
        }}
      />

      {/* Global Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        onSelectVessel={(name) => {
          setSelectedIncident(null);
          const v = currentVessels.find((ves) => ves.name === name);
          if (v) setSelectedVessel(v);
        }}
        onTrackOnMap={() => {
          setSelectedIncident(null);
          setActivePage('map');
        }}
      />

      {/* Global Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        vessels={currentVessels}
        onSubmitIncident={(payload) => {
          createIncidentMutation.mutate(payload);
          refetchIncidents();
        }}
      />
    </AppLayout>
  );
}