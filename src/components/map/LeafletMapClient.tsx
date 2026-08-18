'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCoordinate } from '@/lib/utils-maritime';
import type { Incident, Vessel, RiskZone } from '@/lib/mock-data';

interface LeafletMapClientProps {
  incidents: Incident[];
  vessels: Vessel[];
  liveVessels?: Vessel[];
  riskZones: RiskZone[];
  activeTab: string;
}

export default function LeafletMapClient({
  incidents,
  vessels,
  liveVessels = [],
  riskZones,
  activeTab,
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
      html: `<div style="width:10px;height:10px;transform:rotate(45deg);background:${
        isDark ? '#f59e0b' : isLive ? '#10b981' : 'hsl(196, 100%, 50%)'
      };border:1px solid rgba(0,0,0,0.5);box-shadow:0 0 6px rgba(0,0,0,0.5);${
        isLive ? 'animation:pulse-glow 2s infinite;' : ''
      }"></div>`,
      className: '',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

  const createIncidentIcon = (severity: string) => {
    const color = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f97316' : '#eab308';
    return L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.8);box-shadow:0 0 10px ${color}80;animation:pulse 2s infinite;"></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  };

  const filteredVessels = activeTab === 'dark' ? vessels.filter((v) => v.isDark) : vessels;

  return (
    <MapContainer
      center={[5, 45]}
      zoom={3}
      style={{ height: '100%', width: '100%', background: '#0c1220' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Risk Zones */}
      {riskZones.map((zone) => (
        <Circle
          key={`zone-${zone.id}`}
          center={[zone.centerLat, zone.centerLng]}
          radius={350000}
          pathOptions={{
            color: zone.riskLevel > 0.7 ? '#ef4444' : '#eab308',
            fillColor: zone.riskLevel > 0.7 ? '#ef4444' : '#eab308',
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '6, 6',
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'sans-serif', minWidth: 200, fontSize: 12 }}>
              <div style={{ fontFamily: 'monospace', color: '#888', marginBottom: 4 }}>
                MARITIME RISK ZONE
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 13 }}>{zone.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>THREAT LEVEL:</span>
                  <span style={{ color: zone.riskLevel > 0.7 ? '#ef4444' : '#eab308', fontWeight: 'bold' }}>
                    {Math.round(zone.riskLevel * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>INCIDENTS (30D):</span>
                  <span>{zone.incidentCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TREND:</span>
                  <span>{zone.trend.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Incidents */}
      {renderIncidents &&
        incidents.map((incident) => (
          <Marker
            key={`inc-${incident.id}`}
            position={[incident.lat, incident.lng]}
            icon={createIncidentIcon(incident.severity)}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', minWidth: 220, fontSize: 12 }}>
                <div style={{ fontFamily: 'monospace', color: '#ef4444', marginBottom: 4, fontWeight: 'bold' }}>
                  {incident.severity.toUpperCase()} ALERT
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>
                  {new Date(incident.occurredAt).toUTCString()}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TARGET:</span>
                    <span>{incident.vesselName || 'UNKNOWN'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>POSITION:</span>
                    <span>
                      {formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SOURCE:</span>
                    <span>{incident.dataSource}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Vessels */}
      {renderVessels &&
        filteredVessels.map((vessel) => (
          <Marker
            key={`ves-${vessel.id || vessel.mmsi}`}
            position={[vessel.lat, vessel.lng]}
            icon={createVesselIcon(vessel.isDark, false)}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', minWidth: 200, fontSize: 12 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    color: vessel.isDark ? '#f59e0b' : 'hsl(196, 100%, 50%)',
                    marginBottom: 4,
                    fontWeight: 'bold',
                  }}
                >
                  {vessel.isDark ? 'DARK CONTACT' : 'MONITORED VESSEL'}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{vessel.name}</div>
                <div style={{ color: '#888', marginBottom: 8, fontSize: 11, textTransform: 'uppercase' }}>
                  {vessel.type.replace(/_/g, ' ')} &middot; {vessel.flag}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>MMSI:</span>
                    <span>{vessel.mmsi}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SPEED:</span>
                    <span>{vessel.speed.toFixed(1)} kts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>HEADING:</span>
                    <span>{vessel.heading}&deg;</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>THREAT SCORE:</span>
                    <span style={{ color: vessel.riskScore > 0.7 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                      {(vessel.riskScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Live AIS Stream Vessels */}
      {renderLiveVessels &&
        liveVessels.map((vessel) => (
          <Marker
            key={`live-${vessel.id || vessel.mmsi}`}
            position={[vessel.lat, vessel.lng]}
            icon={createVesselIcon(false, true)}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', minWidth: 200, fontSize: 12 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    color: '#10b981',
                    marginBottom: 4,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  LIVE AIS TELEMETRY
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{vessel.name}</div>
                <div style={{ color: '#888', marginBottom: 8, fontSize: 11, textTransform: 'uppercase' }}>
                  {vessel.type.replace(/_/g, ' ')} &middot; {vessel.flag}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>MMSI:</span>
                    <span>{vessel.mmsi}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SPEED:</span>
                    <span>{vessel.speed.toFixed(1)} kts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>HEADING:</span>
                    <span>{vessel.heading}&deg;</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
