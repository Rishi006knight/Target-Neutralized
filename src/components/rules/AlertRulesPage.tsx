'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sliders, Plus, Bell, Trash2, ShieldCheck, Mail, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { mockDefaultAlertRules, type AlertRule } from '@/lib/mock-data';

export default function AlertRulesPage() {
  const [rules, setRules] = useState<AlertRule[]>(mockDefaultAlertRules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    ruleType: 'ais_gap' as const,
    zoneName: 'Gulf of Aden',
    thresholdValue: 30,
    channel: 'In-App Dashboard' as const,
  });

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    toast.success('Alert rule status updated.');
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.info('Alert rule deleted.');
  };

  const handleCreateRule = () => {
    if (!newRule.name) {
      toast.error('Please specify a rule name.');
      return;
    }

    const created: AlertRule = {
      id: `RULE-${Date.now().toString().slice(-4)}`,
      name: newRule.name,
      ruleType: newRule.ruleType,
      zoneName: newRule.zoneName,
      thresholdValue: newRule.thresholdValue,
      channel: newRule.channel,
      conditionDescription: `Trigger when ${
        newRule.ruleType === 'ais_gap'
          ? `AIS transmitter disabled > ${newRule.thresholdValue} mins`
          : newRule.ruleType === 'speed_anomaly'
          ? `Speed exceeds ${newRule.thresholdValue} kts`
          : `Threat score exceeds ${newRule.thresholdValue}%`
      } in ${newRule.zoneName}`,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setRules((prev) => [created, ...prev]);
    setIsCreateOpen(false);
    setNewRule({
      name: '',
      ruleType: 'ais_gap',
      zoneName: 'Gulf of Aden',
      thresholdValue: 30,
      channel: 'In-App Dashboard',
    });
    toast.success('New alert rule deployed to monitoring engine.');
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Tactical SMS':
        return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
      case 'Encrypted Email':
        return <Mail className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Webhook':
        return <Globe className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" /> Automated Threat Alert Rules
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            CONDITIONAL SURVEILLANCE &amp; DISPATCH TRIGGERS
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono text-xs gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
              <Plus className="w-4 h-4" /> CREATE RULE
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#0c1322] border border-slate-700 text-slate-100 shadow-2xl p-6 rounded-xl font-mono text-xs">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-white">
                CONFIGURE SURVEILLANCE RULE
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-slate-300 font-bold block mb-1">RULE IDENTIFIER</label>
                <Input
                  placeholder="e.g. Dark Tanker in Malacca Strait"
                  value={newRule.name}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-[#131d31] border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">TRIGGER CONDITION</label>
                  <Select
                    value={newRule.ruleType}
                    onValueChange={(v: any) => setNewRule((prev) => ({ ...prev, ruleType: v }))}
                  >
                    <SelectTrigger className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                      <SelectItem value="ais_gap">AIS Transponder Gap</SelectItem>
                      <SelectItem value="speed_anomaly">High Speed Anomaly</SelectItem>
                      <SelectItem value="threat_threshold">Composite Threat Threshold</SelectItem>
                      <SelectItem value="zone_entry">High-Risk Zone Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">TARGET CORRIDOR</label>
                  <Select
                    value={newRule.zoneName}
                    onValueChange={(v) => setNewRule((prev) => ({ ...prev, zoneName: v }))}
                  >
                    <SelectTrigger className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                      <SelectItem value="Gulf of Aden">Gulf of Aden</SelectItem>
                      <SelectItem value="Gulf of Guinea">Gulf of Guinea</SelectItem>
                      <SelectItem value="Straits of Malacca">Straits of Malacca</SelectItem>
                      <SelectItem value="Somali Basin">Somali Basin</SelectItem>
                      <SelectItem value="Global">Global All Corridors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  THRESHOLD VALUE ({newRule.ruleType === 'ais_gap' ? 'Minutes' : newRule.ruleType === 'speed_anomaly' ? 'Knots' : '% Score'})
                </label>
                <Input
                  type="number"
                  value={newRule.thresholdValue}
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, thresholdValue: parseInt(e.target.value) || 0 }))
                  }
                  className="bg-[#131d31] border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">NOTIFICATION CHANNEL</label>
                <Select
                  value={newRule.channel}
                  onValueChange={(v: any) => setNewRule((prev) => ({ ...prev, channel: v }))}
                >
                  <SelectTrigger className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131d31] border-slate-700 text-white font-mono text-xs">
                    <SelectItem value="In-App Dashboard">In-App Tactical Radar Banner</SelectItem>
                    <SelectItem value="Tactical SMS">Tactical SMS Dispatch</SelectItem>
                    <SelectItem value="Encrypted Email">Encrypted Email Alert</SelectItem>
                    <SelectItem value="Webhook">Command API Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleCreateRule}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                >
                  DEPLOY RULE
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className={`bg-card border transition-all ${
              rule.isActive ? 'border-cyan-500/40 bg-slate-900/60' : 'border-slate-800 opacity-60'
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
              <div className="flex items-start gap-3 flex-1 min-w-[240px]">
                <div
                  className={`p-2.5 rounded-lg border ${
                    rule.isActive
                      ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{rule.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {rule.id}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{rule.conditionDescription}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="flex items-center gap-1 text-[11px] text-slate-300">
                      {getChannelIcon(rule.channel)} {rule.channel}
                    </span>
                    <span className="text-slate-600">&middot;</span>
                    <span className="text-[10px] text-slate-500">Zone: {rule.zoneName}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Switch */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rule.isActive ? 'ACTIVE' : 'MUTED'}
                  </span>
                  <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRule(rule.id)}
                  className="text-slate-500 hover:text-red-400 hover:bg-slate-800 h-8 w-8 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
