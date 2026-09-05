'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type AbyssalIncident,
  type AbyssalVessel,
  type ThreatWindow,
  type IncidentCluster,
  type AbyssalAlert,
  seedIncidents,
  seedVessels,
  seedThreatWindows,
  seedClusters,
  seedAlerts,
} from '@/lib/mock-data';

export function useAbyssalIncidents() {
  return useQuery<AbyssalIncident[]>({
    queryKey: ['abyssal-incidents'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/incidents');
        if (!res.ok) throw new Error('Failed to fetch incidents');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : seedIncidents;
      } catch (err) {
        console.warn('Fallback to seed incidents:', err);
        return seedIncidents;
      }
    },
    refetchInterval: 20000,
    initialData: seedIncidents,
  });
}

export function useAbyssalVessels() {
  return useQuery<AbyssalVessel[]>({
    queryKey: ['abyssal-vessels'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/vessels');
        if (!res.ok) throw new Error('Failed to fetch vessels');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : seedVessels;
      } catch (err) {
        console.warn('Fallback to seed vessels:', err);
        return seedVessels;
      }
    },
    refetchInterval: 15000,
    initialData: seedVessels,
  });
}

export function useAbyssalThreatWindows() {
  return useQuery<ThreatWindow[]>({
    queryKey: ['abyssal-threat-windows'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/threat/windows');
        if (!res.ok) throw new Error('Failed to fetch threat windows');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : seedThreatWindows;
      } catch (err) {
        return seedThreatWindows;
      }
    },
    refetchInterval: 60000,
    initialData: seedThreatWindows,
  });
}

export function useAbyssalClusters() {
  return useQuery<IncidentCluster[]>({
    queryKey: ['abyssal-clusters'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/clusters');
        if (!res.ok) throw new Error('Failed to fetch clusters');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : seedClusters;
      } catch (err) {
        return seedClusters;
      }
    },
    refetchInterval: 60000,
    initialData: seedClusters,
  });
}

export function useAbyssalAlerts() {
  return useQuery<AbyssalAlert[]>({
    queryKey: ['abyssal-alerts'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/alerts');
        if (!res.ok) throw new Error('Failed to fetch alerts');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : seedAlerts;
      } catch (err) {
        return seedAlerts;
      }
    },
    refetchInterval: 15000,
    initialData: seedAlerts,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newIncident: Partial<AbyssalIncident>) => {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident),
      });
      if (!res.ok) throw new Error('Failed to create incident');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abyssal-incidents'] });
    },
  });
}
