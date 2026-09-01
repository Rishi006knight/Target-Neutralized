'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCoordinate } from '@/lib/utils-maritime';
import type { Incident, Vessel, RiskZone, SatellitePass } from '@/lib/mock-data';

interface LeafletMapClientProps {
  incidents: Incident[];
  vessels: Vessel[];
  liveVessels?: Vessel[];
  riskZones: RiskZone[];
  activeTab: string;
  showHeatmap?: boolean;
  activeSatellitePasses?: SatellitePass[];
  onSelectVessel?: (vessel: Vessel) => void;
  onSelectIncident?: (incident: Incident) => void;
}

export default function LeafletMapClient({
  incidents = [],
  vessels = [],
  liveVessels = [],
  riskZones = [],
  activeTab,
  showHeatmap = false,
  activeSatellitePasses = [],
  onSelectVessel,
  onSelectIncident,
}: LeafletMapClientProps) {
  useEffect(() => {
    // Fix default marker icon paths in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const renderIncidents = activeTab === 'all' || activeTab === 'incidents';
  const renderVessels = activeTab === 'all' || activeTab === 'vessels' || activeTab === 'dark';
  const renderLiveVessels = activeTab === 'all' || activeTab === 'live';

  const createVesselIcon = (isDark: boolean, isLive: boolean = false) =>
    L.divIcon({
      html: `<div style="width:12px;height:12px;transform:rotate(45deg);background:${
        isDark ? '#f59e0b' : isLive ? '#10b981' : '#00e5ff'
      };border:1.5px solid rgba(0,0,0,0.8);box-shadow:0 0 8px ${
        isDark ? 'rgba(245,158,11,0.8)' : isLive ? 'rgba(16,185,129,0.8)' : 'rgba(0,229,255,0.8)'
      };cursor:pointer;${isLive ? 'animation:pulse-glow 2s infinite;' : ''}"></div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

  const createIncidentIcon = (severity: string) => {
    const color = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f97316' : '#eab308';
    return L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.9);box-shadow:0 0 12px ${color};cursor:pointer;animation:pulse 2s infinite;"></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  };

  const filteredVessels = activeTab === 'dark' ? (vessels || []).filter((v) => v.isDark) : (vessels || []);

  return (
    <MapContainer
      center={[8, 48]}
      zoom={3}
      style={{ height: '100%', width: '100%', background: '#060b14' }}
      zoomControl={false}
      minZoom={2}
      maxZoom={12}
    >
      {/* High-Performance Clean Dark Tactical Basemap */}
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Tactical Maritime Grid'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={12}
      />

      {/* Satellite Pass Coverage Polygon Overlays */}
      {activeSatellitePasses.map((pass) => (
        <Polygon
          key={pass.id}
          positions={pass.bounds}
          pathOptions={{
            color: '#00e5ff',
            fillColor: '#00e5ff',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 4',
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#f8fafc' }}>
              <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>SATELLITE SAR OVERPASS</span>
              <br />
              <strong>{pass.satelliteName}</strong>
              <br />
              Target: {pass.coverageArea}
              <br />
              Countdown: {pass.countdownMinutes} minutes
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Simulated Incident Density Heatmap Layer */}
      {showHeatmap &&
        (incidents || []).map((inc) => (
          <Circle
            key={`heat-${inc.id}`}
            center={[inc.lat, inc.lng]}
            radius={450000}
            pathOptions={{
              color: inc.severity === 'critical' ? '#ef4444' : '#f59e0b',
              fillColor: inc.severity === 'critical' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.25,
              weight: 0,
            }}
          />
        ))}

      {/* Risk Zones */}
      {(riskZones || []).map((zone) => (
        <Circle
          key={`zone-${zone.id}`}
          center={[zone.centerLat, zone.centerLng]}
          radius={350000}
          pathOptions={{
            color: zone.riskLevel > 0.75 ? '#ef4444' : '#f59e0b',
            fillColor: zone.riskLevel > 0.75 ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '6, 6',
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'monospace', minWidth: 200, fontSize: 11, color: '#f8fafc' }}>
              <div style={{ color: '#888', marginBottom: 2 }}>TACTICAL RISK CORRIDOR</div>
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>{zone.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>THREAT LEVEL:</span>
                <span style={{ color: zone.riskLevel > 0.75 ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                  {Math.round(zone.riskLevel * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>INCIDENTS (30D):</span>
                <span>{zone.incidentCount}</span>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Incidents Markers */}
      {renderIncidents &&
        (incidents || []).map((incident) => (
          <Marker
            key={`inc-${incident.id}`}
            position={[incident.lat, incident.lng]}
            icon={createIncidentIcon(incident.severity)}
            eventHandlers={{
              click: () => onSelectIncident && onSelectIncident(incident),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', minWidth: 210, fontSize: 11, color: '#f8fafc' }}>
                <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: 2 }}>
                  {incident.severity.toUpperCase()} ALERT
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>
                  Target: {incident.vesselName || 'UNKNOWN'}
                </div>
                <button
                  type="button"
                  style={{
                    color: '#00e5ff',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                  onClick={() => onSelectIncident && onSelectIncident(incident)}
                >
                  OPEN SITUATION LOG &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Monitored Vessels Markers */}
      {renderVessels &&
        filteredVessels.map((vessel) => (
          <Marker
            key={`ves-${vessel.id || vessel.mmsi}`}
            position={[vessel.lat, vessel.lng]}
            icon={createVesselIcon(vessel.isDark, false)}
            eventHandlers={{
              click: () => onSelectVessel && onSelectVessel(vessel),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', minWidth: 200, fontSize: 11, color: '#f8fafc' }}>
                <div
                  style={{
                    color: vessel.isDark ? '#f59e0b' : '#00e5ff',
                    fontWeight: 'bold',
                    marginBottom: 2,
                  }}
                >
                  {vessel.isDark ? 'DARK CONTACT (NO AIS)' : 'MONITORED VESSEL'}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{vessel.name}</div>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>
                  MMSI: {vessel.mmsi} &middot; {vessel.speed.toFixed(1)} kts
                </div>
                <button
                  type="button"
                  style={{
                    color: '#00e5ff',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                  onClick={() => onSelectVessel && onSelectVessel(vessel)}
                >
                  VIEW VESSEL TELEMETRY &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Live AIS Stream Vessels */}
      {renderLiveVessels &&
        (liveVessels || []).map((vessel) => (
          <Marker
            key={`live-${vessel.id || vessel.mmsi}`}
            position={[vessel.lat, vessel.lng]}
            icon={createVesselIcon(false, true)}
            eventHandlers={{
              click: () => onSelectVessel && onSelectVessel(vessel),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', minWidth: 200, fontSize: 11, color: '#f8fafc' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: 2 }}>
                  LIVE SATELLITE AIS
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{vessel.name}</div>
                <div style={{ color: '#94a3b8', marginBottom: 4 }}>
                  MMSI: {vessel.mmsi} &middot; {vessel.speed.toFixed(1)} kts
                </div>
                <button
                  type="button"
                  style={{
                    color: '#00e5ff',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                  onClick={() => onSelectVessel && onSelectVessel(vessel)}
                >
                  OPEN RADAR PROFILE &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
