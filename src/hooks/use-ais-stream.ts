'use client';

import { useState, useEffect, useRef } from 'react';
import type { AbyssalVessel, VesselStatus } from '@/lib/mock-data';
import { seedVessels } from '@/lib/mock-data';
import { analyzeVesselAnomaly } from '@/lib/anomaly-detector';

// Define the expected AISstream message structure for a PositionReport
interface AISMessage {
  MessageType: string;
  Message: {
    PositionReport?: {
      UserID: number; // MMSI
      TrueHeading: number;
      Sog: number; // Speed over ground
      Latitude: number;
      Longitude: number;
      NavigationalStatus: number;
    };
  };
  MetaData: {
    MMSI: number;
    ShipName: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
}

const AISSTREAM_URL = 'wss://stream.aisstream.io/v0/stream';
const MAX_VESSELS = 250;

export function useAisStream() {
  const [liveVessels, setLiveVessels] = useState<Map<string, AbyssalVessel>>(() => {
    const initialMap = new Map<string, AbyssalVessel>();
    seedVessels.forEach((v) => initialMap.set(v.mmsi, v));
    return initialMap;
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;

    // Continuous ticker for background motion & ping age calculation
    simIntervalRef.current = setInterval(() => {
      setLiveVessels((prev) => {
        const next = new Map(prev);
        next.forEach((vessel, mmsi) => {
          if (vessel.status === 'ANCHORED') {
            return;
          }

          const rad = ((vessel.heading || 0) * Math.PI) / 180;
          const deltaSpeed = (Math.random() - 0.5) * 0.3;
          const newSpeed = Math.max(1.5, Math.min(32, (vessel.speed || 10) + deltaSpeed));
          const speedDegPerSec = (newSpeed * 1.852) / (111.32 * 3600);
          const newLat = (vessel.lat || 0) + Math.cos(rad) * speedDegPerSec * 4;
          const newLng = (vessel.lng || 0) + Math.sin(rad) * speedDegPerSec * 4;

          const updatedVessel: AbyssalVessel = {
            ...vessel,
            lat: parseFloat(newLat.toFixed(5)),
            lng: parseFloat(newLng.toFixed(5)),
            speed: parseFloat(newSpeed.toFixed(1)),
            heading: ((vessel.heading || 0) + (Math.random() - 0.5) * 1.5 + 360) % 360,
            lastPingAge: Math.max(0, vessel.lastPingAge + 4),
            lastSeenAt: new Date().toISOString(),
          };

          const anomaly = analyzeVesselAnomaly(updatedVessel);
          updatedVessel.riskScore = anomaly.riskScore;
          if (anomaly.isDark) {
            updatedVessel.status = 'DARK';
          }

          next.set(mmsi, updatedVessel);
        });
        return next;
      });
    }, 4000);

    if (!apiKey) {
      setIsSimulated(true);
      return () => {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      };
    }

    // Real AISStream WebSocket connection
    const connect = () => {
      try {
        const ws = new WebSocket(AISSTREAM_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setIsSimulated(false);
          setError(null);
          const subscriptionMessage = {
            Apikey: apiKey,
            BoundingBoxes: [
              [[10, 43], [15, 52]], // Gulf of Aden
              [[0, 0], [7, 10]], // Gulf of Guinea
              [[1, 98], [7, 105]], // Strait of Malacca
              [[-5, 45], [10, 55]], // Somali Basin
              [[2, 118], [9, 125]], // Sulu-Celebes Sea
              [[8, -75], [16, -60]], // Caribbean
              [[5, 110], [16, 120]], // South China Sea
              [[10, 80], [20, 95]], // Bay of Bengal
            ],
            FilterMessageTypes: ['PositionReport'],
          };
          ws.send(JSON.stringify(subscriptionMessage));
        };

        ws.onmessage = async (event) => {
          try {
            let payload = event.data;
            if (payload instanceof Blob) {
              payload = await payload.text();
            }
            const data: AISMessage = JSON.parse(payload);

            if (data.MessageType === 'PositionReport' && data.Message.PositionReport) {
              const report = data.Message.PositionReport;
              const meta = data.MetaData;

              const speed = report.Sog || 0;
              let status: VesselStatus = 'ACTIVE';
              if (speed < 0.8) {
                status = 'ANCHORED';
              }

              const candidateVessel: AbyssalVessel = {
                id: meta.MMSI,
                mmsi: String(meta.MMSI),
                name: meta.ShipName?.trim() || `VESSEL_${meta.MMSI}`,
                type: 'Commercial Transit',
                flag: 'International',
                lat: report.Latitude,
                lng: report.Longitude,
                speed,
                heading: report.TrueHeading >= 360 ? 0 : report.TrueHeading,
                status,
                riskScore: 0.1,
                lastPingAge: 0,
                lastSeenAt: new Date(meta.time_utc).toISOString(),
              };

              const anomaly = analyzeVesselAnomaly(candidateVessel);
              candidateVessel.riskScore = anomaly.riskScore;
              if (anomaly.isDark) {
                candidateVessel.status = 'DARK';
              }

              setLiveVessels((prev) => {
                const next = new Map(prev);
                next.set(candidateVessel.mmsi, candidateVessel);
                if (next.size > MAX_VESSELS) {
                  const firstKey = next.keys().next().value;
                  if (firstKey) next.delete(firstKey);
                }
                return next;
              });
            }
          } catch (e) {
            console.error('Failed to parse AIS message', e);
          }
        };

        ws.onerror = (e) => {
          console.error('AISStream WebSocket error', e);
          setError('WebSocket fallback to simulation');
        };

        ws.onclose = () => {
          setTimeout(connect, 6000);
        };
      } catch (err) {
        console.error('Failed to initialize WebSocket', err);
        setError('Failed to initialize WebSocket');
      }
    };

    connect();

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    liveVessels: Array.from(liveVessels.values()),
    isConnected,
    isSimulated,
    error,
  };
}
