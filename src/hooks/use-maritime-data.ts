'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DashboardStats,
  Incident,
  Vessel,
  RiskZone,
  Alert,
  IncidentSummary,
  TrendPoint,
  mockStats,
  mockIncidents,
  mockVessels,
  mockRiskZones,
  mockAlerts,
  getIncidentSummary,
  getIncidentTrend,
} from '@/lib/mock-data';

// 1. Dashboard Command Stats Hook
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        return data.vesselsWatched !== undefined ? data : mockStats;
      } catch (err) {
        console.warn('Using mock stats fallback', err);
        return mockStats;
      }
    },
    refetchInterval: 15000,
  });
}

// 2. Incidents Hook
export function useIncidents(filters?: { severity?: string; type?: string }) {
  return useQuery<Incident[]>({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.severity && filters.severity !== 'all') params.append('severity', filters.severity);
        if (filters?.type && filters.type !== 'all') params.append('type', filters.type);

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
    staleTime: 60000,
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
    refetchInterval: 10000,
  });
}

// 8. Mark Alert Read Mutation
export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: number) => {
      const res = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to mark alert as read');
      return res.json();
    },
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      const previousAlerts = queryClient.getQueryData<Alert[]>(['alerts']);
      if (previousAlerts) {
        queryClient.setQueryData<Alert[]>(['alerts'], (old) =>
          (old || []).map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
        );
      }
      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(['alerts'], context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
      if (!res.ok) throw new Error('Failed to create incident');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['incident-summary'] });
      queryClient.invalidateQueries({ queryKey: ['incident-trend'] });
    },
  });
}
