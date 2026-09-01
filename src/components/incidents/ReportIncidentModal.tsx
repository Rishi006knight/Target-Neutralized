'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Ship, AlertTriangle, MapPin, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Incident, Vessel } from '@/lib/mock-data';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: Vessel[];
  onSubmitIncident: (incident: Partial<Incident>) => void;
}

export default function ReportIncidentModal({
  isOpen,
  onClose,
  vessels = [],
  onSubmitIncident,
}: ReportIncidentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [vesselSearch, setVesselSearch] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  const [formData, setFormData] = useState({
    vesselName: '',
    vesselType: 'Container Ship',
    vesselFlag: 'Marshall Islands',
    incidentType: 'approach',
    severity: 'critical',
    lat: '12.85',
    lng: '45.10',
    description: '',
    evidenceFile: null as string | null,
    dataSource: 'Manual Operator Ingest',
  });

  const filteredVessels = (vessels || []).filter(
    (v) =>
      v.name.toLowerCase().includes(vesselSearch.toLowerCase()) ||
      v.mmsi.includes(vesselSearch)
  );

  const handleSelectVessel = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setFormData((prev) => ({
      ...prev,
      vesselName: vessel.name,
      vesselType: vessel.type,
      vesselFlag: vessel.flag,
      lat: String(vessel.lat),
      lng: String(vessel.lng),
    }));
  };

  const handleFinalSubmit = () => {
    const payload: Partial<Incident> = {
      id: Date.now(),
      lat: parseFloat(formData.lat) || 12.85,
      lng: parseFloat(formData.lng) || 45.10,
      incidentType: formData.incidentType,
      severity: formData.severity,
      description: formData.description || 'Emergency incident recorded by operator.',
      vesselName: formData.vesselName || (selectedVessel ? selectedVessel.name : 'UNKNOWN VESSEL'),
      vesselType: formData.vesselType,
      vesselFlag: formData.vesselFlag,
      occurredAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
      dataSource: formData.dataSource,
      responseStatus: 'New',
      timeline: [
        { time: 'T-00:00', title: 'Report Ingested', description: 'Operator logged incident into tactical grid.' },
      ],
    };

    onSubmitIncident(payload);
    toast.success('Incident successfully reported and dispatched to task force.', {
      description: `ID #${payload.id} — ${payload.vesselName}`,
    });

    onClose();
    // Reset form
    setStep(1);
    setSelectedVessel(null);
    setFormData({
      vesselName: '',
      vesselType: 'Container Ship',
      vesselFlag: 'Marshall Islands',
      incidentType: 'approach',
      severity: 'critical',
      lat: '12.85',
      lng: '45.10',
      description: '',
      evidenceFile: null,
      dataSource: 'Manual Operator Ingest',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] bg-[#0c1322] border border-slate-700/80 text-slate-100 shadow-2xl p-6 rounded-xl font-mono">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <DialogTitle className="font-display text-lg text-cyan-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            TACTICAL INCIDENT DISPATCH REPORT
          </DialogTitle>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between pt-3 gap-2">
            {[
              { num: 1, label: 'Target Asset' },
              { num: 2, label: 'Threat Type' },
              { num: 3, label: 'Coordinates' },
              { num: 4, label: 'Situation Narrative' },
            ].map((s) => (
              <div key={s.num} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      step > s.num
                        ? 'bg-emerald-500 text-black'
                        : step === s.num
                        ? 'bg-cyan-400 text-black'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </div>
                  {s.num < 4 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 transition-colors ${
                        step > s.num ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[9px] mt-1 font-mono hidden sm:block ${
                    step === s.num ? 'text-cyan-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Select Vessel */}
        {step === 1 && (
          <div className="space-y-3 pt-2 text-xs">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-cyan-400" /> STEP 1: SELECT TARGET VESSEL
            </label>
            <Input
              placeholder="Search by MMSI or Vessel Name..."
              value={vesselSearch}
              onChange={(e) => setVesselSearch(e.target.value)}
              className="bg-[#131d31] border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs"
            />

            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-800 rounded-lg p-2 bg-slate-950/60">
              {filteredVessels.slice(0, 8).map((v) => (
                <div
                  key={v.mmsi}
                  onClick={() => handleSelectVessel(v)}
                  className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between border ${
                    selectedVessel?.mmsi === v.mmsi
                      ? 'bg-cyan-950/70 border-cyan-500 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-bold block text-xs">{v.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      MMSI: {v.mmsi} &middot; {v.flag} &middot; {v.type}
                    </span>
                  </div>
                  {selectedVessel?.mmsi === v.mmsi && (
                    <span className="text-cyan-400 text-xs font-bold font-mono">SELECTED</span>
                  )}
                </div>
              ))}
              <div
                onClick={() => {
                  setSelectedVessel(null);
                  setFormData((prev) => ({ ...prev, vesselName: 'UNREGISTERED CONTACT' }));
                }}
                className={`p-2 rounded cursor-pointer transition-colors border text-center ${
                  formData.vesselName === 'UNREGISTERED CONTACT'
                    ? 'bg-cyan-950/70 border-cyan-500 text-white'
                    : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                + Specify Unregistered / Unknown Contact
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedVessel && !formData.vesselName}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs"
              >
                PROCEED TO THREAT CLASSIFICATION &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Threat Classification */}
        {step === 2 && (
          <div className="space-y-4 pt-2 text-xs">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" /> STEP 2: THREAT CLASSIFICATION &amp; SEVERITY
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">INCIDENT CATEGORY</label>
                <Select
                  value={formData.incidentType}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, incidentType: v }))}
                >
                  <SelectTrigger className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                    <SelectItem value="boarding">ARMED BOARDING</SelectItem>
                    <SelectItem value="hijack">VESSEL HIJACK</SelectItem>
                    <SelectItem value="approach">AGGRESSIVE SKIFF APPROACH</SelectItem>
                    <SelectItem value="ais_gap">AIS GAP / SUSPICIOUS DROPOUT</SelectItem>
                    <SelectItem value="suspicious">SUSPICIOUS LOITERING</SelectItem>
                    <SelectItem value="other">OTHER KINETIC THREAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">SEVERITY LEVEL</label>
                <Select
                  value={formData.severity}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, severity: v }))}
                >
                  <SelectTrigger className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                    <SelectItem value="critical">CRITICAL (RED ALERT)</SelectItem>
                    <SelectItem value="high">HIGH PRIORITY</SelectItem>
                    <SelectItem value="medium">MEDIUM RISK</SelectItem>
                    <SelectItem value="low">LOW / INFORMATIONAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block mb-0.5">TARGET ASSET SELECTED</span>
              <span className="text-cyan-300 font-bold">
                {selectedVessel ? `${selectedVessel.name} (MMSI ${selectedVessel.mmsi})` : formData.vesselName}
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs"
              >
                &larr; BACK
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs"
              >
                PROCEED TO GEOLOCATION &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Location Coordinates */}
        {step === 3 && (
          <div className="space-y-4 pt-2 text-xs">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> STEP 3: INCIDENT GEOLOCATION
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">LATITUDE (DECIMAL DEG)</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lat: e.target.value }))}
                  className="bg-[#131d31] border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">LONGITUDE (DECIMAL DEG)</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lng}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lng: e.target.value }))}
                  className="bg-[#131d31] border-slate-700 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Quick Maritime Zone Preset Buttons */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5">QUICK HOTSPOT PRESETS:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { name: 'Gulf of Aden', lat: '12.85', lng: '45.10' },
                  { name: 'Gulf of Guinea', lat: '4.15', lng: '6.28' },
                  { name: 'Strait of Malacca', lat: '1.25', lng: '103.75' },
                  { name: 'Somali Basin', lat: '-1.50', lng: '51.00' },
                  { name: 'Sulu Sea', lat: '5.60', lng: '119.30' },
                  { name: 'Bab-el-Mandeb', lat: '13.80', lng: '42.80' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, lat: preset.lat, lng: preset.lng }))}
                    className="p-1.5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500 rounded text-[10px] text-slate-300 font-mono text-left truncate transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs"
              >
                &larr; BACK
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs"
              >
                PROCEED TO SITUATION NARRATIVE &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Description + Evidence Upload */}
        {step === 4 && (
          <div className="space-y-4 pt-2 text-xs">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> STEP 4: SITUATION REPORT &amp; EVIDENCE
            </label>

            <div>
              <label className="text-slate-400 text-[10px] block mb-1">DETAILED SITUATION LOG</label>
              <Textarea
                placeholder="Detail time of contact, assailant vessel description, weaponry observed, actions taken by master, and status of crew citadel..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-[#131d31] border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs h-24 resize-none"
              />
            </div>

            {/* Simulated Evidence Upload Area */}
            <div className="p-3 border border-dashed border-slate-700 rounded-lg bg-slate-950/40 text-center space-y-1">
              <Upload className="w-5 h-5 mx-auto text-cyan-400" />
              <span className="text-[11px] text-slate-300 font-bold block">
                {formData.evidenceFile || 'ATTACH RADAR LOG / SATELLITE IMAGE'}
              </span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, evidenceFile: 'SAR_CAPTURE_2026_LOG.tiff' }))}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Simulate attaching radar sensor telemetry (.tiff / .log)
              </button>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs"
              >
                &larr; BACK
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs gap-1.5"
              >
                <Check className="w-4 h-4" /> DISPATCH INCIDENT TO RADAR
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
