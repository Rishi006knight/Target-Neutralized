'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Navigation, ShieldAlert, Target } from 'lucide-react';
import { formatCoordinate } from '@/lib/utils-maritime';
import type { Incident, Vessel, RiskZone } from '@/lib/mock-data';

// We need to dynamically import Leaflet to avoid SSR issues
interface LeafletMapProps {
  incidents: Incident[];
  vessels: Vessel[];
  riskZones: RiskZone[];
  activeTab: string;
}

function LeafletMapInner({ incidents, vessels, riskZones, activeTab }: LeafletMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Dynamic import of leaflet CSS and components
    const loadMap = async () => {
      // Import leaflet CSS
      if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Dynamically import react-leaflet
      const { MapContainer, TileLayer, Marker, Popup, Circle } = await import('react-leaflet');
      const L = await import('leaflet');

      // Set default marker icon
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      setMapReady(true);
    };
    loadMap();
  }, []);

  if (!mapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <Skeleton className="w-full h-full bg-muted/10" />
      </div>
    );
  }

  return <LeafletMapLoaded incidents={incidents} vessels={vessels} riskZones={riskZones} activeTab={activeTab} />;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactLeaflet = typeof window !== 'undefined' ? require('react-leaflet') : null;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const leafletLib = typeof window !== 'undefined' ? require('leaflet') : null;

function LeafletMapLoaded({ incidents, vessels, riskZones, activeTab }: LeafletMapProps) {
  if (!reactLeaflet || !leafletLib) return null;
  const { MapContainer, TileLayer, Marker, Popup, Circle } = reactLeaflet;
  const L = leafletLib;

  const renderIncidents = activeTab === 'all' || activeTab === 'incidents';
  const renderVessels = activeTab === 'all' || activeTab === 'vessels' || activeTab === 'dark';

  const createVesselIcon = (isDark: boolean) => L.divIcon({
    html: `<div style="width:10px;height:10px;transform:rotate(45deg);background:${isDark ? '#f59e0b' : 'hsl(196, 100%, 50%)'};border:1px solid rgba(0,0,0,0.5);box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`,
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
      {riskZones.map(zone => (
        <Circle
          key={`zone-${zone.id}`}
          center={[zone.centerLat, zone.centerLng]}
          radius={300000}
          pathOptions={{
            color: zone.riskLevel > 0.7 ? '#ef4444' : '#eab308',
            fillColor: zone.riskLevel > 0.7 ? '#ef4444' : '#eab308',
            fillOpacity: 0.08,
            weight: 1,
            dashArray: '6',
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--app-font-sans, sans-serif)', minWidth: 200, fontSize: 12 }}>
              <div style={{ fontFamily: 'monospace', color: '#888', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                RISK ZONE
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{zone.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RISK LEVEL:</span><span>{Math.round(zone.riskLevel * 100)}%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>INCIDENTS:</span><span>{zone.incidentCount}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TREND:</span><span>{zone.trend.toUpperCase()}</span></div>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Incidents */}
      {renderIncidents && incidents.map(incident => (
        <Marker
          key={`inc-${incident.id}`}
          position={[incident.lat, incident.lng]}
          icon={createIncidentIcon(incident.severity)}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--app-font-sans, sans-serif)', minWidth: 200, fontSize: 12 }}>
              <div style={{ fontFamily: 'monospace', color: '#ef4444', marginBottom: 4, fontWeight: 'bold' }}>
                {incident.severity.toUpperCase()} ALERT
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{incident.incidentType.replace(/_/g, ' ').toUpperCase()}</div>
              <div style={{ color: '#888', marginBottom: 8, fontSize: 11 }}>{new Date(incident.occurredAt).toUTCString()}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>VESSEL:</span><span>{incident.vesselName || 'UNKNOWN'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>POS:</span><span>{formatCoordinate(incident.lat, true)}, {formatCoordinate(incident.lng, false)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SOURCE:</span><span>{incident.dataSource}</span></div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Vessels */}
      {renderVessels && vessels.map(vessel => (
        <Marker
          key={`ves-${vessel.id}`}
          position={[vessel.lat, vessel.lng]}
          icon={createVesselIcon(vessel.isDark)}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--app-font-sans, sans-serif)', minWidth: 200, fontSize: 12 }}>
              <div style={{ fontFamily: 'monospace', color: vessel.isDark ? '#f59e0b' : 'hsl(196, 100%, 50%)', marginBottom: 4, fontWeight: 'bold' }}>
                {vessel.isDark ? 'DARK VESSEL' : 'ACTIVE VESSEL'}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{vessel.name}</div>
              <div style={{ color: '#888', marginBottom: 8, fontSize: 11, textTransform: 'uppercase' }}>{vessel.type.replace(/_/g, ' ')} &middot; {vessel.flag}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>MMSI:</span><span>{vessel.mmsi}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SPEED:</span><span>{vessel.speed.toFixed(1)} kts</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>HDG:</span><span>{vessel.heading}&deg;</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RISK:</span><span>{(vessel.riskScore * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

interface MapPageProps {
  incidents: Incident[];
  vessels: Vessel[];
  riskZones: RiskZone[];
  loading: boolean;
}

export default function MapPage({ incidents, vessels, riskZones, loading }: MapPageProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-4">
        <Skeleton className="h-10 w-80 bg-muted/20" />
        <Skeleton className="flex-1 w-full bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tactical Map</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">GLOBAL ASSET AND THREAT VISUALIZATION</p>
        </div>

        <div className="flex bg-card border border-border rounded-md p-1 font-mono text-xs">
          {['all', 'incidents', 'vessels', 'dark'].map(tab => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                activeTab === tab
                  ? tab === 'dark' ? 'bg-amber-500 text-black' : 'bg-primary text-primary-foreground'
                  : tab === 'dark' ? 'text-amber-500/70 hover:text-amber-400' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dark' && <AlertCircle className="w-3 h-3" />}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-border relative" style={{ minHeight: 500 }}>
        <LeafletMapInner
          incidents={incidents}
          vessels={vessels}
          riskZones={riskZones}
          activeTab={activeTab}
        />

        {/* Tactical legend overlay */}
        <div className="absolute top-4 right-4 z-[1000] bg-black/70 border border-border backdrop-blur-md p-3 rounded-md font-mono text-[10px] text-muted-foreground space-y-2 pointer-events-none">
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary" /> ACTIVE VESSEL</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500" /> DARK VESSEL</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> CRITICAL INCIDENT</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> HIGH INCIDENT</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 border border-destructive bg-destructive/20" /> RISK ZONE</div>
        </div>
      </Card>
    </div>
  );
}