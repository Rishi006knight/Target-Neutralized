'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  MapPin,
  Crosshair,
  Ship,
} from 'lucide-react';
import {
  type AbyssalIncident,
  type AbyssalVessel,
  type IncidentCluster,
  getSeverityColor,
  formatCoords,
  formatUtcTime,
} from '@/lib/mock-data';

interface RightDockProps {
  incidents: AbyssalIncident[];
  vessels: AbyssalVessel[];
  clusters: IncidentCluster[];
  selectedIncident: AbyssalIncident | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectIncident: (incident: AbyssalIncident) => void;
  onDeselectIncident: () => void;
  onHighlightVessel: (mmsi: string) => void;
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = getSeverityColor(severity as any);
  return (
    <span
      className="mono-data"
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: '2px 6px',
        borderRadius: 3,
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}44`,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {severity}
    </span>
  );
}

function SourceTag({ source }: { source: string }) {
  return (
    <span
      className="mono-data text-11"
      style={{ color: '#5E7A8A' }}
    >
      {source}
    </span>
  );
}

// ── FEED CARD ──
function IncidentFeedCard({
  incident,
  onClick,
}: {
  incident: AbyssalIncident;
  onClick: () => void;
}) {
  const stripeClass =
    incident.severity === 'critical' ? 'stripe-critical' :
    incident.severity === 'high' ? 'stripe-high' :
    incident.severity === 'elevated' ? 'stripe-elevated' :
    incident.severity === 'medium' ? 'stripe-medium' : 'stripe-low';

  return (
    <button
      onClick={onClick}
      className={`slide-in w-full text-left ${stripeClass}`}
      style={{
        background: 'rgba(8, 20, 28, 0.6)',
        padding: '10px 12px',
        borderRadius: 4,
        border: '1px solid #0E2A38',
        borderLeft: undefined, // handled by stripe class
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(14, 42, 56, 0.5)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(8, 20, 28, 0.6)'; }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <span style={{ fontSize: 12, color: '#C9D6DF', fontWeight: 600 }}>
            {incident.type}
          </span>
        </div>
        <SourceTag source={incident.source} />
      </div>
      <div style={{ fontSize: 12, color: '#C9D6DF', lineHeight: 1.35, marginBottom: 4 }}>
        {incident.verdict}
      </div>
      <div className="flex items-center gap-3 mono-data text-11" style={{ color: '#5E7A8A' }}>
        <span>{formatUtcTime(incident.occurredAt)}</span>
        <span>·</span>
        <span>{incident.vesselName || 'Unknown'}</span>
      </div>
    </button>
  );
}

// ── DOSSIER ──
function InvestigationDossier({
  incident,
  vessels,
  clusters,
  onBack,
  onHighlightVessel,
}: {
  incident: AbyssalIncident;
  vessels: AbyssalVessel[];
  clusters: IncidentCluster[];
  onBack: () => void;
  onHighlightVessel: (mmsi: string) => void;
}) {
  const cluster = clusters.find((c) => c.id === incident.clusterId);
  const linkedVesselData = incident.linkedVessels
    .map((mmsi) => vessels.find((v) => v.mmsi === mmsi))
    .filter(Boolean) as AbyssalVessel[];

  return (
    <div className="flex flex-col h-full">
      {/* Back button + Locate button */}
      <div className="flex items-center justify-between px-3" style={{ height: 40, borderBottom: '1px solid #0E2A38' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 p-1 rounded hover:text-white"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#5E7A8A',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <ArrowLeft size={14} />
          <span className="hud-label" style={{ fontSize: 10 }}>BACK TO FEED</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).centerMapOnCoords) {
              (window as any).centerMapOnCoords(incident.lat, incident.lng);
            }
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#22D3EE]/15 hover:bg-[#22D3EE]/25 border border-[#22D3EE]/30 text-[#22D3EE] font-mono text-[10px] cursor-pointer"
          title="Center map on incident"
        >
          <Crosshair size={11} />
          <span>LOCATE</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: 'thin' }}>
        {/* 1. VERDICT */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={incident.severity} />
            <span className="mono-data text-11" style={{ color: '#22D3EE' }}>
              {incident.id}
            </span>
          </div>
          <div className="verdict-headline">
            {incident.verdict}
          </div>
        </div>

        {/* 2. FACT STRIP */}
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 rounded"
          style={{ background: 'rgba(14, 42, 56, 0.3)', border: '1px solid #0E2A3866' }}
        >
          <div>
            <div className="hud-label" style={{ fontSize: 10, marginBottom: 2 }}>TYPE</div>
            <div className="mono-data text-13" style={{ color: '#22D3EE' }}>{incident.type}</div>
          </div>
          <div>
            <div className="hud-label" style={{ fontSize: 10, marginBottom: 2 }}>SOURCE</div>
            <div className="mono-data text-13" style={{ color: '#C9D6DF' }}>{incident.source}</div>
          </div>
          <div>
            <div className="hud-label" style={{ fontSize: 10, marginBottom: 2 }}>COORDS</div>
            <div className="mono-data text-13" style={{ color: '#22D3EE' }}>
              {formatCoords(incident.lat, incident.lng)}
            </div>
          </div>
          <div>
            <div className="hud-label" style={{ fontSize: 10, marginBottom: 2 }}>CONFIDENCE</div>
            <div className="mono-data text-13" style={{ color: '#22D3EE' }}>{incident.confidence}%</div>
          </div>
          <div className="col-span-2">
            <div className="hud-label" style={{ fontSize: 10, marginBottom: 2 }}>UTC</div>
            <div className="mono-data text-13" style={{ color: '#C9D6DF' }}>
              {formatUtcTime(incident.occurredAt)}
            </div>
          </div>
        </div>

        {/* 3. EVENT TIMELINE */}
        {incident.timeline.length > 0 && (
          <div className="mb-4">
            <div className="hud-label" style={{ marginBottom: 8 }}>EVENT TIMELINE</div>
            <div className="flex flex-col gap-0">
              {incident.timeline.map((evt, i) => (
                <div key={i} className="flex gap-3 pb-3">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center" style={{ width: 12 }}>
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: 8,
                        height: 8,
                        background: i === 0 ? '#22D3EE' : '#0E2A38',
                        border: `2px solid ${i === 0 ? '#22D3EE' : '#1B3A4A'}`,
                        marginTop: 2,
                      }}
                    />
                    {i < incident.timeline.length - 1 && (
                      <div
                        className="flex-1"
                        style={{
                          width: 1,
                          background: '#0E2A38',
                          minHeight: 16,
                        }}
                      />
                    )}
                  </div>
                  {/* Content */}
                  <div>
                    <div className="mono-data text-11" style={{ color: '#5E7A8A', marginBottom: 1 }}>
                      {evt.time}
                    </div>
                    <div style={{ fontSize: 12, color: '#C9D6DF', lineHeight: 1.3 }}>
                      {evt.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. VESSEL CHIPS */}
        {linkedVesselData.length > 0 && (
          <div className="mb-4">
            <div className="hud-label" style={{ marginBottom: 8 }}>LINKED VESSELS</div>
            <div className="flex flex-wrap gap-2">
              {linkedVesselData.map((v) => (
                <button
                  key={v.mmsi}
                  onClick={() => onHighlightVessel(v.mmsi)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                  style={{
                    background: 'rgba(14, 42, 56, 0.4)',
                    border: '1px solid #0E2A38',
                    color: v.status === 'DARK' ? '#F43F5E' : '#C9D6DF',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Ship size={11} />
                  <span>{v.name}</span>
                  {v.status === 'DARK' && (
                    <span className="mono-data" style={{ fontSize: 9, color: '#F43F5E' }}>DARK</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. RISK FACTORS — METER BARS */}
        {incident.riskFactors.length > 0 && (
          <div className="mb-4">
            <div className="hud-label" style={{ marginBottom: 8 }}>RISK FACTORS</div>
            <div className="flex flex-col gap-2">
              {incident.riskFactors.map((rf, i) => {
                const rfColor =
                  rf.value >= 80 ? '#F43F5E' :
                  rf.value >= 60 ? '#F59E0B' :
                  rf.value >= 40 ? '#22D3EE' : '#2DD4BF';
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: 11, color: '#C9D6DF' }}>{rf.label}</span>
                      <span className="mono-data text-11" style={{ color: rfColor }}>{rf.value}%</span>
                    </div>
                    <div style={{ height: 4, background: '#0E2A38', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${rf.value}%`,
                          height: '100%',
                          background: rfColor,
                          borderRadius: 2,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. LINKED EVENTS (CLUSTER) */}
        {cluster && (
          <div>
            <div className="hud-label" style={{ marginBottom: 8 }}>LINKED EVENTS</div>
            <div
              className="p-3 rounded"
              style={{ background: 'rgba(14, 42, 56, 0.3)', border: '1px solid #0E2A3866' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 12, color: '#C9D6DF', fontWeight: 600 }}>{cluster.label}</span>
                <span className="mono-data text-11" style={{ color: '#22D3EE' }}>
                  {(cluster.linkScore * 100).toFixed(0)}% linked
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {cluster.incidentIds.map((cid) => (
                  <span
                    key={cid}
                    className="mono-data"
                    style={{
                      fontSize: 10,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: cid === incident.id ? '#22D3EE22' : '#0E2A3866',
                      color: cid === incident.id ? '#22D3EE' : '#5E7A8A',
                      border: `1px solid ${cid === incident.id ? '#22D3EE44' : '#0E2A38'}`,
                    }}
                  >
                    {cid}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN DOCK COMPONENT ──
export default function RightDock({
  incidents,
  vessels,
  clusters,
  selectedIncident,
  collapsed,
  onToggleCollapse,
  onSelectIncident,
  onDeselectIncident,
  onHighlightVessel,
}: RightDockProps) {
  const sortedIncidents = [...incidents].sort((a, b) => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, elevated: 2, medium: 3, low: 4 };
    const sevDiff = (sevOrder[a.severity] ?? 5) - (sevOrder[b.severity] ?? 5);
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });

  return (
    <>
      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="fixed z-50 glass-panel flex items-center justify-center"
        style={{
          top: 64,
          right: collapsed ? 8 : 380,
          width: 24,
          height: 40,
          borderRadius: '4px 0 0 4px',
          cursor: 'pointer',
          color: '#5E7A8A',
          transition: 'right 0.3s ease',
          border: '1px solid #0E2A38',
          borderRight: 'none',
        }}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Dock panel */}
      <aside
        className="glass-panel fixed z-40 flex flex-col"
        style={{
          top: 48,
          right: collapsed ? -380 : 0,
          width: 380,
          height: 'calc(100vh - 48px)',
          transition: 'right 0.3s ease',
          borderLeft: '1px solid #0E2A38',
        }}
      >
        {selectedIncident ? (
          <InvestigationDossier
            incident={selectedIncident}
            vessels={vessels}
            clusters={clusters}
            onBack={onDeselectIncident}
            onHighlightVessel={onHighlightVessel}
          />
        ) : (
          <>
            {/* Feed header */}
            <div
              className="flex items-center justify-between px-3 flex-shrink-0"
              style={{ height: 40, borderBottom: '1px solid #0E2A38' }}
            >
              <div className="hud-label">LIVE INCIDENT FEED</div>
              <span className="mono-data text-11" style={{ color: '#22D3EE' }}>
                {incidents.length} TOTAL
              </span>
            </div>
            {/* Feed list */}
            <div
              className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
              style={{ scrollbarWidth: 'thin' }}
            >
              {sortedIncidents.map((inc) => (
                <IncidentFeedCard
                  key={inc.id}
                  incident={inc}
                  onClick={() => onSelectIncident(inc)}
                />
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
