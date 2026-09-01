'use client';

import { useState, useEffect, useRef } from 'react';
import type { Vessel } from '@/lib/mock-data';
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
const MAX_VESSELS = 250; // Limit the number of live vessels in memory

// Simulated initial vessels for zero-config live demonstrations
const SEED_SIMULATED_VESSELS: Vessel[] = [
  {
    id: 901,
    mmsi: '538006842',
    name: 'MAERSK KALAMATA',
    type: 'Container Ship',
    flag: 'Marshall Islands',
    lat: 12.65,
    lng: 44.80,
    speed: 18.2,
    heading: 85,
    isDark: false,
    riskScore: 0.28,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 902,
    mmsi: '636015993',
    name: 'MSC ANNA',
    type: 'Ultra Large Container',
    flag: 'Liberia',
    lat: 13.05,
    lng: 47.10,
    speed: 19.5,
    heading: 90,
    isDark: false,
    riskScore: 0.32,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 903,
    mmsi: '999841201',
    name: 'SKIKDA PIRACY SKIFF A',
    type: 'Fast Attack Skiff',
    flag: 'Unknown',
    lat: 12.92,
    lng: 45.45,
    speed: 29.4,
    heading: 175,
    isDark: true,
    riskScore: 0.96,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 904,
    mmsi: '477312900',
    name: 'COSCO SHIPPING PLANET',
    type: 'Container Ship',
    flag: 'Hong Kong',
    lat: 4.80,
    lng: 5.20,
    speed: 15.6,
    heading: 135,
    isDark: false,
    riskScore: 0.52,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 905,
    mmsi: '636098112',
    name: 'NIGER DELTA TANKER 03',
    type: 'Bunkering Vessel',
    flag: 'Nigeria',
    lat: 4.10,
    lng: 6.45,
    speed: 7.2,
    heading: 270,
    isDark: true,
    riskScore: 0.88,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 906,
    mmsi: '563110200',
    name: 'EVER GLORY',
    type: 'Container Ship',
    flag: 'Singapore',
    lat: 2.95,
    lng: 102.30,
    speed: 16.8,
    heading: 315,
    isDark: false,
    riskScore: 0.20,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 907,
    mmsi: '357220199',
    name: 'PANAMA TRADER IX',
    type: 'General Cargo',
    flag: 'Panama',
    lat: 11.80,
    lng: 112.50,
    speed: 13.4,
    heading: 55,
    isDark: false,
    riskScore: 0.35,
    lastSeenAt: new Date().toISOString(),
  },
];

export function useAisStream() {
  const [liveVessels, setLiveVessels] = useState<Map<string, Vessel>>(() => {
    const initialMap = new Map<string, Vessel>();
    SEED_SIMULATED_VESSELS.forEach((v) => initialMap.set(v.mmsi, v));
    return initialMap;
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;

    // Continuous simulation ticker for background motion
    simIntervalRef.current = setInterval(() => {
      setLiveVessels((prev) => {
        const next = new Map(prev);
        next.forEach((vessel, mmsi) => {
          const rad = ((vessel.heading || 0) * Math.PI) / 180;
          const deltaSpeed = (Math.random() - 0.5) * 0.4;
          const newSpeed = Math.max(2, Math.min(32, (vessel.speed || 10) + deltaSpeed));
          const speedDegPerSec = (newSpeed * 1.852) / (111.32 * 3600);
          const newLat = (vessel.lat || 0) + Math.cos(rad) * speedDegPerSec * 4;
          const newLng = (vessel.lng || 0) + Math.sin(rad) * speedDegPerSec * 4;

          const updatedVessel: Vessel = {
            ...vessel,
            lat: parseFloat(newLat.toFixed(5)),
            lng: parseFloat(newLng.toFixed(5)),
            speed: parseFloat(newSpeed.toFixed(1)),
            heading: ((vessel.heading || 0) + (Math.random() - 0.5) * 2 + 360) % 360,
            lastSeenAt: new Date().toISOString(),
          };

          const anomaly = analyzeVesselAnomaly(updatedVessel);
          updatedVessel.riskScore = anomaly.riskScore;

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

              const candidateVessel: Vessel = {
                id: meta.MMSI,
                mmsi: String(meta.MMSI),
                name: meta.ShipName?.trim() || `VESSEL_${meta.MMSI}`,
                type: 'Commercial Transit',
                flag: 'International',
                lat: report.Latitude,
                lng: report.Longitude,
                speed: report.Sog,
                heading: report.TrueHeading,
                isDark: false,
                riskScore: 0.1,
                lastSeenAt: new Date(meta.time_utc).toISOString(),
              };

              const anomaly = analyzeVesselAnomaly(candidateVessel);
              candidateVessel.riskScore = anomaly.riskScore;

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
          setError('WebSocket connection fallback to simulation');
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
