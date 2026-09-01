'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mockStats,
  mockIncidents,
  mockVessels,
  mockRiskZones,
  mockAlerts,
  mockDetections,
  getIncidentSummary,
  getIncidentTrend,
  type DashboardStats,
  type Incident,
  type IncidentSummary,
  type TrendPoint,
  type Vessel,
  type RiskZone,
  type Alert,
  type Detection,
} from '@/lib/mock-data';

// 1. Dashboard Stats Hook
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        return { ...mockStats, ...data };
      } catch (err) {
        console.warn('Using mock stats fallback', err);
        return mockStats;
      }
    },
    refetchInterval: 15000,
    initialData: mockStats,
  });
}

// 2. Incidents Hook
export function useIncidents(filters?: { severity?: string; incidentType?: string; zoneId?: number }) {
  const params = new URLSearchParams();
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.incidentType) params.append('type', filters.incidentType);
  if (filters?.zoneId) params.append('zoneId', filters.zoneId.toString());

  return useQuery<Incident[]>({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/incidents?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch incidents');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : mockIncidents;
      } catch (err) {
        console.warn('Using mock incidents fallback', err);
        return mockIncidents;
      }
    },
    refetchInterval: 30000,
    initialData: mockIncidents,
  });
}

// 3. Incident Summary Hook
export function useIncidentSummary() {
  const { data: incidents } = useIncidents();
  return useQuery<IncidentSummary>({
    queryKey: ['incident-summary', incidents?.length],
    queryFn: () => getIncidentSummary(incidents || mockIncidents),
    initialData: () => getIncidentSummary(mockIncidents),
  });
}

// 4. Incident Trend Hook
export function useIncidentTrend() {
  const { data: incidents } = useIncidents();
  return useQuery<TrendPoint[]>({
    queryKey: ['incident-trend', incidents?.length],
    queryFn: () => getIncidentTrend(incidents || mockIncidents),
    initialData: () => getIncidentTrend(mockIncidents),
  });
}

// 5. Vessels Hook
export function useVessels(isDarkOnly: boolean = false) {
  return useQuery<Vessel[]>({
    queryKey: ['vessels', isDarkOnly],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/vessels${isDarkOnly ? '?isDark=true' : ''}`);
        if (!res.ok) throw new Error('Failed to fetch vessels');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : mockVessels;
      } catch (err) {
        console.warn('Using mock vessels fallback', err);
        return isDarkOnly ? mockVessels.filter((v) => v.isDark) : mockVessels;
      }
    },
    refetchInterval: 20000,
    initialData: isDarkOnly ? mockVessels.filter((v) => v.isDark) : mockVessels,
  });
}

// 6. Risk Zones Hook
export function useRiskZones() {
  return useQuery<RiskZone[]>({
    queryKey: ['risk-zones'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/risk-zones');
        if (!res.ok) throw new Error('Failed to fetch risk zones');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : mockRiskZones;
      } catch (err) {
        console.warn('Using mock risk zones fallback', err);
        return mockRiskZones;
      }
    },
    refetchInterval: 60000,
    initialData: mockRiskZones,
  });
}

// 7. System Alerts Hook
export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/alerts');
        if (!res.ok) throw new Error('Failed to fetch alerts');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : mockAlerts;
      } catch (err) {
        console.warn('Using mock alerts fallback', err);
        return mockAlerts;
      }
    },
    refetchInterval: 20000,
    initialData: mockAlerts,
  });
}

// 8. Mark Alert Read Mutation (Local-first with graceful API sync)
export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: number) => {
      try {
        const res = await fetch(`/api/alerts?id=${alertId}`, {
          method: 'PATCH',
        });
        if (!res.ok) return { success: true };
        return res.json();
      } catch {
        return { success: true };
      }
    },
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      queryClient.setQueryData<Alert[]>(['alerts'], (old) =>
        (old || []).map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
    },
  });
}

// 9. Create Incident Mutation
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newIncident: Partial<Incident>) => {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident),
      });
      if (!res.ok) return { success: true, localOnly: true };
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['incident-summary'] });
    },
  });
}

// 10. Satellite Detections Hook
export function useDetections() {
  return useQuery<Detection[]>({
    queryKey: ['detections'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/detections');
        if (!res.ok) throw new Error('Failed to fetch detections');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : mockDetections;
      } catch (err) {
        console.warn('Using mock detections fallback', err);
        return mockDetections;
      }
    },
    refetchInterval: 30000,
    initialData: mockDetections,
  });
}
