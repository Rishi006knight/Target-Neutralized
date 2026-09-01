'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCoordinate, getRiskColor } from '@/lib/utils-maritime';
import { calculateDistanceKm } from '@/lib/anomaly-detector';
import type { Incident, Vessel, RiskZone, SatellitePass } from '@/lib/mock-data';

interface LeafletMapClientProps {
  incidents: Incident[];
  vessels: Vessel[];
  liveVessels?: Vessel[];
  riskZones: RiskZone[];
  activeLayers: {
    vessels: boolean;
    incidents: boolean;
    darkContacts: boolean;
    riskZones: boolean;
    heatmap: boolean;
    satellite: boolean;
  };
  satelliteBlend: number; // 0 (Chart) to 100 (Satellite)
  measuringMode: boolean;
  activeSatellitePasses?: SatellitePass[];
  onSelectVessel?: (vessel: Vessel) => void;
  onSelectIncident?: (incident: Incident) => void;
}

// Custom Center Controller
function MapCenterController({ vessels }: { vessels: Vessel[] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    (window as any).centerOnFleet = () => {
      if (vessels && vessels.length > 0) {
        const bounds = L.latLngBounds(vessels.map((v) => [v.lat, v.lng]));
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    };
  }, [map, vessels]);
  return null;
}

// Measuring Tool Controller
function MeasureToolHandler({ isMeasuring }: { isMeasuring: boolean }) {
  const map = useMap();
  const [points, setPoints] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!isMeasuring) {
      setPoints([]);
      return;
    }

    const handleClick = (e: L.LeafletMouseEvent) => {
      setPoints((prev) => {
        if (prev.length >= 2) return [[e.latlng.lat, e.latlng.lng]];
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, isMeasuring]);

  if (points.length < 2) return null;

  const distanceKm = calculateDistanceKm(points[0][0], points[0][1], points[1][0], points[1][1]);
  const distanceNm = (distanceKm * 0.539957).toFixed(1);

  return (
    <>
      <Polyline positions={points} pathOptions={{ color: '#00E5FF', weight: 2.5, dashArray: '6, 6' }} />
      <Popup position={[(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E5FF', fontWeight: 'bold' }}>
          DISTANCE: {distanceNm} NM ({distanceKm.toFixed(1)} KM)
        </div>
      </Popup>
    </>
  );
}

export default function LeafletMapClient({
  incidents = [],
  vessels = [],
  liveVessels = [],
  riskZones = [],
  activeLayers,
  satelliteBlend = 0,
  measuringMode = false,
  activeSatellitePasses = [],
  onSelectVessel,
  onSelectIncident,
}: LeafletMapClientProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // 3.2 Custom Rotating SVG Markers
  const createActiveVesselIcon = (heading: number) =>
    L.divIcon({
      html: `
        <div style="position:relative;width:28px;height:28px;display:flex;items:center;justify-content:center;">
          <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(0,229,255,0.4);animation:pulse-glow 2s infinite;"></div>
          <svg style="transform:rotate(${heading}deg);width:16px;height:16px;margin:auto;filter:drop-shadow(0 0 6px #00E5FF);" viewBox="0 0 24 24" fill="#00E5FF">
            <path d="M12 2L2 22l10-4 10 4L12 2z"/>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  const createDarkVesselIcon = () =>
    L.divIcon({
      html: `
        <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
          <div style="width:14px;height:14px;background:#FF3B5C;transform:rotate(45deg);border:2px solid #fff;box-shadow:0 0 10px #FF3B5C;animation:threat-pulse 1s infinite;"></div>
        </div>
      `,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

  const createIncidentIcon = (severity: string) => {
    const color = severity === 'critical' ? '#FF3B5C' : '#FFB020';
    return L.divIcon({
      html: `
        <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color};animation:pulse-glow 1.5s infinite;"></div>
          <div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #0A0E17;display:flex;align-items:center;justify-content:center;color:#0A0E17;font-weight:900;font-size:11px;font-family:monospace;box-shadow:0 0 12px ${color};">
            !
          </div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const satelliteOpacity = satelliteBlend / 100;
  const chartOpacity = 1 - satelliteOpacity * 0.7;

  return (
    <MapContainer
      center={[8, 48]}
      zoom={3}
      style={{ height: '100%', minHeight: '620px', width: '100%', background: '#0A0E17' }}
      zoomControl={false}
      minZoom={2}
      maxZoom={12}
    >
      <MapCenterController vessels={vessels} />
      <MeasureToolHandler isMeasuring={measuringMode} />

      {/* 3.1 Tactical Dark Basemap (Chart) */}
      <TileLayer
        attribution='&copy; Esri &mdash; Tactical Maritime Base'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={12}
        opacity={chartOpacity}
      />

      {/* 3.8 Satellite Imagery Blended Base Layer */}
      {satelliteOpacity > 0 && (
        <TileLayer
          attribution='&copy; Esri &mdash; World Imagery'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={12}
          opacity={satelliteOpacity}
        />
      )}

      {/* 3.6 Satellite Pass Coverage Overlays */}
      {activeLayers.satellite &&
        activeSatellitePasses.map((pass) => (
          <Polygon
            key={pass.id}
            positions={pass.bounds}
            pathOptions={{
              color: '#00E5FF',
              fillColor: '#00E5FF',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#F1F5F9' }}>
                <span style={{ color: '#00E5FF', fontWeight: 'bold' }}>SAR SATELLITE OVERPASS</span>
                <br />
                <strong>{pass.satelliteName}</strong>
                <br />
                Coverage: {pass.coverageArea}
                <br />
                Sensor: {pass.sensorType}
              </div>
            </Popup>
          </Polygon>
        ))}

      {/* 3.5 Heatmap Density Circles Layer */}
      {activeLayers.heatmap &&
        incidents.map((inc) => (
          <Circle
            key={`heat-${inc.id}`}
            center={[inc.lat, inc.lng]}
            radius={400000}
            pathOptions={{
              color: inc.severity === 'critical' ? '#FF3B5C' : '#FFB020',
              fillColor: inc.severity === 'critical' ? '#FF3B5C' : '#FFB020',
              fillOpacity: 0.22,
              weight: 0,
            }}
          />
        ))}

      {/* 3.4 Risk Zone Polygons */}
      {activeLayers.riskZones &&
        riskZones.map((zone) => (
          <Circle
            key={`zone-${zone.id}`}
            center={[zone.centerLat, zone.centerLng]}
            radius={350000}
            pathOptions={{
              color: zone.riskLevel > 0.75 ? '#FF3B5C' : '#FFB020',
              fillColor: zone.riskLevel > 0.75 ? '#FF3B5C' : '#FFB020',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6, 6',
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', minWidth: 200, fontSize: 11, color: '#F1F5F9' }}>
                <div style={{ color: '#64748B', marginBottom: 2 }}>TACTICAL RISK CORRIDOR</div>
                <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4, color: '#fff' }}>
                  {zone.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>RISK EVALUATION:</span>
                  <span
                    style={{
                      color: zone.riskLevel > 0.75 ? '#FF3B5C' : '#FFB020',
                      fontWeight: 'bold',
                    }}
                  >
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

      {/* 3.2 Incidents Markers */}
      {activeLayers.incidents &&
        incidents.map((incident) => (
          <Marker
            key={`inc-${incident.id}`}
            position={[incident.lat, incident.lng]}
            icon={createIncidentIcon(incident.severity)}
            eventHandlers={{
              click: () => onSelectIncident && onSelectIncident(incident),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace', minWidth: 220, fontSize: 11, color: '#F1F5F9' }}>
                <div style={{ color: '#FF3B5C', fontWeight: 'bold', marginBottom: 2 }}>
                  {incident.severity.toUpperCase()} PIRACY EVENT
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ color: '#94a3b8', marginBottom: 6 }}>
                  Target: {incident.vesselName || 'UNKNOWN'}
                </div>
                <button
                  type="button"
                  style={{
                    color: '#00E5FF',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                  onClick={() => onSelectIncident && onSelectIncident(incident)}
                >
                  OPEN SITUATION BRIEF &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* 3.2 & 3.7 Monitored Vessels Markers & React Portal Popup */}
      {activeLayers.vessels &&
        vessels
          .filter((v) => !v.isDark || activeLayers.darkContacts)
          .map((vessel) => (
            <Marker
              key={`ves-${vessel.id || vessel.mmsi}`}
              position={[vessel.lat, vessel.lng]}
              icon={vessel.isDark ? createDarkVesselIcon() : createActiveVesselIcon(vessel.heading || 0)}
              eventHandlers={{
                click: () => onSelectVessel && onSelectVessel(vessel),
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace', minWidth: 220, fontSize: 11, color: '#F1F5F9' }}>
                  <div
                    style={{
                      color: vessel.isDark ? '#FFB020' : '#00E5FF',
                      fontWeight: 'bold',
                      marginBottom: 2,
                    }}
                  >
                    {vessel.isDark ? 'DARK CONTACT (NO AIS)' : 'MONITORED VESSEL'}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4, color: '#fff' }}>
                    {vessel.name}
                  </div>
                  <div style={{ color: '#94a3b8', marginBottom: 2 }}>
                    MMSI: {vessel.mmsi} &middot; {vessel.speed.toFixed(1)} kts
                  </div>
                  <div style={{ color: '#94a3b8', marginBottom: 6 }}>
                    HDG: {vessel.heading.toFixed(1)}&deg; &middot; THREAT: {(vessel.riskScore * 100).toFixed(0)}%
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      style={{
                        color: '#00E5FF',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: 10,
                      }}
                      onClick={() => onSelectVessel && onSelectVessel(vessel)}
                    >
                      FULL DETAILS &rarr;
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
    </MapContainer>
  );
}
