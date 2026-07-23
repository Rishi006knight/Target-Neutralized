'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DashboardStats, Incident, Vessel, RiskZone, Alert, Detection, IncidentSummary, TrendPoint } from '@/lib/mock-data';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
    refetchInterval: 30000,
  });
}

export function useIncidents(params?: { severity?: string; type?: string; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.severity && params.severity !== 'all') sp.set('severity', params.severity);
  if (params?.type && params.type !== 'all') sp.set('type', params.type);
  if (params?.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return useQuery<Incident[]>({
    queryKey: ['incidents', params],
    queryFn: () => fetch(`/api/incidents${qs ? '?' + qs : ''}`).then(r => r.json()),
    refetchInterval: 60000,
  });
}

export function useIncidentSummary() {
  return useQuery<IncidentSummary>({
    queryKey: ['incident-summary'],
    queryFn: () => fetch('/api/incidents/stats/summary').then(r => r.json()),
  });
}

export function useIncidentTrend() {
  return useQuery<TrendPoint[]>({
    queryKey: ['incident-trend'],
    queryFn: () => fetch('/api/incidents/stats/trend').then(r => r.json()),
  });
}

export function useVessels(params?: { isDark?: boolean; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.isDark) sp.set('isDark', 'true');
  if (params?.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return useQuery<Vessel[]>({
    queryKey: ['vessels', params],
    queryFn: () => fetch(`/api/vessels${qs ? '?' + qs : ''}`).then(r => r.json()),
    refetchInterval: 30000,
  });
}

export function useRiskZones() {
  return useQuery<RiskZone[]>({
    queryKey: ['risk-zones'],
    queryFn: () => fetch('/api/risk-zones').then(r => r.json()),
    refetchInterval: 60000,
  });
}

export function useAlerts(params?: { limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return useQuery<Alert[]>({
    queryKey: ['alerts', params],
    queryFn: () => fetch(`/api/alerts${qs ? '?' + qs : ''}`).then(r => r.json()),
    refetchInterval: 30000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetch(`/api/alerts?id=${id}`, { method: 'PATCH' }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDetections(params?: { type?: string; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.type && params.type !== 'all') sp.set('type', params.type);
  if (params?.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return useQuery<Detection[]>({
    queryKey: ['detections', params],
    queryFn: () => fetch(`/api/detections${qs ? '?' + qs : ''}`).then(r => r.json()),
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Incident>) =>
      fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
