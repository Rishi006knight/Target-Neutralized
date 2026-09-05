'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  type AbyssalIncident,
  type AbyssalVessel,
  type IncidentCluster,
  getSeverityColor,
  formatCoords,
} from '@/lib/mock-data';

interface MapViewClientProps {
  incidents: AbyssalIncident[];
  vessels: AbyssalVessel[];
  clusters: IncidentCluster[];
  showClusters: boolean;
  selectedIncidentId: string | null;
  selectedVesselMmsi: string | null;
  onSelectIncident: (incident: AbyssalIncident) => void;
  onSelectVessel: (vessel: AbyssalVessel) => void;
}

// Controller to fly to active incident or vessel
function MapNavigationController({
  selectedIncident,
  selectedVessel,
}: {
  selectedIncident: AbyssalIncident | null;
  selectedVessel: AbyssalVessel | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.lat, selectedIncident.lng], 9, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    } else if (selectedVessel) {
      map.flyTo([selectedVessel.lat, selectedVessel.lng], 9, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedIncident, selectedVessel, map]);

  return null;
}

// Mouse position tracker for bottom HUD readout
function MouseCoordinatesTracker({
  onMouseMove,
}: {
  onMouseMove: (coords: { lat: number; lng: number } | null) => void;
}) {
  useMapEvents({
    mousemove(e) {
      onMouseMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseout() {
      onMouseMove(null);
    },
  });
  return null;
}

// Helper to generate custom Leaflet HTML icon for Incidents
function createIncidentIcon(incident: AbyssalIncident, isSelected: boolean) {
  const color = getSeverityColor(incident.severity);
  const isCritical = incident.severity === 'critical';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group" style="width: 36px; height: 36px;">
      ${
        isSelected || isCritical
          ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${color}; transform: scale(1.4);"></div>`
          : ''
      }
      <div 
        class="relative flex items-center justify-center w-7 h-7 rounded-sm border transition-all duration-200"
        style="
          background: rgba(8, 20, 28, 0.95);
          border-color: ${isSelected ? '#22D3EE' : color};
          box-shadow: 0 0 ${isSelected ? '16px #22D3EE' : '8px ' + color};
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        "
      >
        <span style="font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: ${color};">
          ${incident.type === 'SOS' ? 'SOS' : incident.type === 'BOARDING' ? 'BRD' : incident.type === 'DARK TRANSFER' ? 'DRK' : 'INC'}
        </span>
      </div>
      <div 
        class="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-black" 
        style="background: ${color};"
      ></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'abyssal-incident-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Helper to generate custom Leaflet HTML icon for Vessels
function createVesselIcon(vessel: AbyssalVessel, isSelected: boolean) {
  const isDark = vessel.status === 'DARK';
  const isHighRisk = vessel.riskScore > 0.7;
  const color = isDark ? '#F43F5E' : isHighRisk ? '#F59E0B' : '#22D3EE';
  const rotation = vessel.heading || 0;

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
      ${
        isDark
          ? `<div class="absolute inset-0 rounded-full animate-pulse opacity-80" style="background: rgba(244, 63, 94, 0.4);"></div>`
          : ''
      }
      <div 
        class="relative flex items-center justify-center transition-transform duration-300"
        style="
          transform: rotate(${rotation}deg) ${isSelected ? 'scale(1.25)' : 'scale(1)'};
          filter: drop-shadow(0 0 6px ${isSelected ? '#22D3EE' : color});
        "
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L20 20L12 16L4 20L12 2Z" fill="${color}" fill-opacity="${isDark ? '0.7' : '0.9'}" stroke="${isSelected ? '#FFFFFF' : color}" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'abyssal-vessel-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function MapViewClient({
  incidents,
  vessels,
  clusters,
  showClusters,
  selectedIncidentId,
  selectedVesselMmsi,
  onSelectIncident,
  onSelectVessel,
}: MapViewClientProps) {
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === selectedIncidentId) || null,
    [incidents, selectedIncidentId]
  );

  const selectedVessel = useMemo(
    () => vessels.find((v) => v.mmsi === selectedVesselMmsi) || null,
    [vessels, selectedVesselMmsi]
  );

  // Pre-calculate cluster links
  const clusterLines = useMemo(() => {
    if (!showClusters) return [];

    const lines: { id: string; points: [number, number][]; color: string; score: number }[] = [];
    const incidentMap = new Map<string, AbyssalIncident>();
    incidents.forEach((inc) => incidentMap.set(inc.id, inc));

    clusters.forEach((cluster) => {
      const clusterIncidents = cluster.incidentIds
        .map((id) => incidentMap.get(id))
        .filter((inc): inc is AbyssalIncident => inc !== undefined);

      if (clusterIncidents.length > 1) {
        // Connect each incident to the centroid
        clusterIncidents.forEach((inc) => {
          lines.push({
            id: `${cluster.id}-${inc.id}`,
            points: [
              [cluster.centroid.lat, cluster.centroid.lng],
              [inc.lat, inc.lng],
            ],
            color: cluster.linkScore > 0.85 ? '#F43F5E' : '#22D3EE',
            score: cluster.linkScore,
          });
        });
      }
    });

    return lines;
  }, [clusters, incidents, showClusters]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#03080D]">
      <MapContainer
        center={[12.5, 48.0]}
        zoom={5}
        minZoom={3}
        maxZoom={14}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full z-0"
        style={{ background: '#03080D' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          subdomains="abcd"
        />

        <MapNavigationController
          selectedIncident={selectedIncident}
          selectedVessel={selectedVessel}
        />

        <MouseCoordinatesTracker onMouseMove={setMouseCoords} />

        {/* ── Cluster Correlation Lines ── */}
        {showClusters &&
          clusterLines.map((line) => (
            <Polyline
              key={line.id}
              positions={line.points}
              pathOptions={{
                color: line.color,
                weight: 1.5,
                opacity: 0.7,
                dashArray: '4, 6',
              }}
            />
          ))}

        {/* ── Cluster Centroid Indicators ── */}
        {showClusters &&
          clusters.map((cluster) => (
            <React.Fragment key={cluster.id}>
              <Circle
                center={[cluster.centroid.lat, cluster.centroid.lng]}
                radius={120000}
                pathOptions={{
                  color: cluster.linkScore > 0.85 ? '#F43F5E' : '#22D3EE',
                  fillColor: cluster.linkScore > 0.85 ? '#F43F5E' : '#22D3EE',
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '3, 6',
                }}
              />
              <Marker
                position={[cluster.centroid.lat, cluster.centroid.lng]}
                icon={L.divIcon({
                  html: `
                    <div class="px-2 py-0.5 rounded border border-[#0E2A38] bg-[#08141C]/90 text-[#22D3EE] text-[10px] font-mono flex items-center gap-1 shadow-lg backdrop-blur pointer-events-none whitespace-nowrap">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-ping"></span>
                      ${cluster.label} (${Math.round(cluster.linkScore * 100)}%)
                    </div>
                  `,
                  className: 'abyssal-cluster-badge',
                  iconSize: [120, 24],
                  iconAnchor: [60, 12],
                })}
              />
            </React.Fragment>
          ))}

        {/* ── Incidents Markers ── */}
        {incidents.map((incident) => {
          const isSelected = incident.id === selectedIncidentId;
          return (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={createIncidentIcon(incident, isSelected)}
              eventHandlers={{
                click: () => onSelectIncident(incident),
              }}
            >
              <Popup
                className="abyssal-popup"
                closeButton={false}
                offset={[0, -14]}
              >
                <div className="p-3 bg-[#08141C]/95 border border-[#0E2A38] rounded shadow-2xl backdrop-blur max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                      style={{
                        backgroundColor: `${getSeverityColor(incident.severity)}20`,
                        color: getSeverityColor(incident.severity),
                        border: `1px solid ${getSeverityColor(incident.severity)}40`,
                      }}
                    >
                      {incident.type}
                    </span>
                    <span className="text-[10px] font-mono text-[#5E7A8A]">
                      {incident.id}
                    </span>
                  </div>
                  <p className="text-[12px] font-sans text-[#C9D6DF] leading-tight mb-2">
                    {incident.verdict}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5E7A8A] pt-1.5 border-t border-[#0E2A38]">
                    <span>{formatCoords(incident.lat, incident.lng)}</span>
                    <span className="text-[#22D3EE] font-medium">OPEN DOSSIER →</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ── Vessel Markers ── */}
        {vessels.map((vessel) => {
          const isSelected = vessel.mmsi === selectedVesselMmsi;
          return (
            <Marker
              key={vessel.mmsi}
              position={[vessel.lat, vessel.lng]}
              icon={createVesselIcon(vessel, isSelected)}
              eventHandlers={{
                click: () => onSelectVessel(vessel),
              }}
            >
              <Popup
                className="abyssal-popup"
                closeButton={false}
                offset={[0, -10]}
              >
                <div className="p-2.5 bg-[#08141C]/95 border border-[#0E2A38] rounded shadow-2xl backdrop-blur max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold font-sans text-white truncate">
                      {vessel.name}
                    </span>
                    {vessel.status === 'DARK' ? (
                      <span className="px-1 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[9px] font-mono font-bold">
                        DARK
                      </span>
                    ) : (
                      <span className="px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[#22D3EE] text-[9px] font-mono">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono text-[#5E7A8A]">
                    <div>MMSI: <span className="text-[#C9D6DF]">{vessel.mmsi}</span></div>
                    <div>SPD: <span className="text-[#C9D6DF]">{vessel.speed} kts</span></div>
                    <div>HDG: <span className="text-[#C9D6DF]">{Math.round(vessel.heading)}°</span></div>
                    <div>RISK: <span className={vessel.riskScore > 0.7 ? 'text-amber-400' : 'text-[#2DD4BF]'}>{Math.round(vessel.riskScore * 100)}%</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Coordinates & Crosshair Readout (Bottom Center) ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-3 py-1 rounded bg-[#08141C]/80 border border-[#0E2A38] backdrop-blur flex items-center gap-3 text-[11px] font-mono text-[#5E7A8A]">
          <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
          <span>CURSOR: {mouseCoords ? formatCoords(mouseCoords.lat, mouseCoords.lng) : 'SCANNING CORRIDOR'}</span>
          <span className="text-[#1B3A4A]">|</span>
          <span>ACTIVE TARGETS: <strong className="text-[#C9D6DF]">{vessels.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
