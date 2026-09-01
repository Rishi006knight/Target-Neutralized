'use client';

import React, { useState, useEffect } from 'react';
import { Target, Activity, Map as MapIcon, Shield, Radio, Bell, Satellite } from 'lucide-react';

export type PageId = 'dashboard' | 'map' | 'incidents' | 'vessels' | 'alerts';

const navItems: { name: string; id: PageId; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Dashboard', id: 'dashboard', icon: Activity },
  { name: 'Live Map', id: 'map', icon: MapIcon },
  { name: 'Incidents', id: 'incidents', icon: Shield },
  { name: 'Vessel Tracker', id: 'vessels', icon: Radio },
  { name: 'Alerts', id: 'alerts', icon: Bell },
];

export function AppLayout({
  children,
  activePage,
  onNavigate,
}: {
  children: React.ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}) {
  const [time, setTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="p-6 flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-wider text-sm">
            OCEANSHIELD <span className="text-primary font-mono text-xs">OPS</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        </button>
        <Target className="w-5 h-5 text-primary" />
        <span className="font-bold tracking-wider text-sm">
          OCEANSHIELD <span className="text-primary font-mono text-xs">OPS</span>
        </span>
        <div className="ml-auto font-mono text-[10px] text-muted-foreground">{time.slice(17, 25)}</div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border flex flex-col">
            <div className="p-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <span className="font-bold tracking-wider text-sm">OCEANSHIELD OPS</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left ${
                      isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar (desktop) */}
        <header className="hidden md:flex h-14 border-b border-border bg-card items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Live Feed</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Satellite className="w-3 h-3" />
              <span>SAT PASS: IN PROGRESS</span>
            </div>
          </div>
          <div className="font-mono text-sm tracking-wider text-foreground">{time}</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 pt-18 md:pt-6">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}