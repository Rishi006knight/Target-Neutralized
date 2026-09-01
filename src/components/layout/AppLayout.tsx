'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Radar,
  AlertTriangle,
  Ship,
  Bell,
  BarChart3,
  Sliders,
  Search,
  Satellite,
  Shield,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type PageId = 'dashboard' | 'map' | 'incidents' | 'vessels' | 'alerts' | 'analytics' | 'rules';

interface NavItem {
  name: string;
  id: PageId;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  unreadAlertsCount?: number;
  onGlobalSearch?: (query: string) => void;
}

export default function AppLayout({
  children,
  activePage,
  onNavigate,
  unreadAlertsCount = 4,
  onGlobalSearch,
}: AppLayoutProps) {
  const [time, setTime] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: NavItem[] = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Live Map', id: 'map', icon: Radar },
    { name: 'Incidents', id: 'incidents', icon: AlertTriangle },
    { name: 'Vessel Tracker', id: 'vessels', icon: Ship },
    { name: 'Alerts', id: 'alerts', icon: Bell, badge: unreadAlertsCount },
    { name: 'Analytics', id: 'analytics', icon: BarChart3 },
    { name: 'Alert Rules', id: 'rules', icon: Sliders },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGlobalSearch && searchQuery.trim()) {
      onGlobalSearch(searchQuery.trim());
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#060b14] text-slate-100 font-sans command-grid-bg">
      {/* Skip to Content link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:p-3 focus:bg-cyan-500 focus:text-black focus:font-bold focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop & Tablet Collapsible Sidebar */}
      <aside
        className="hidden md:flex flex-col border-r border-slate-800/80 glass-panel shrink-0 transition-all duration-300 w-16 lg:w-64 z-20"
        role="navigation"
        aria-label="Main Command Navigation"
      >
        {/* Brand Logo & Title */}
        <div className="p-4 lg:p-5 flex items-center gap-3 border-b border-slate-800/60 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="hidden lg:block truncate">
            <span className="font-display font-bold tracking-wider text-base text-white block leading-tight">
              OCEANSHIELD
            </span>
            <span className="font-mono text-[10px] text-cyan-400 tracking-widest uppercase">
              MARITIME OPS GRID
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all w-full text-left group relative cursor-pointer ${
                  isActive
                    ? 'active-nav-glow text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
                title={item.name}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="hidden lg:inline truncate">{item.name}</span>

                {/* Badge if present */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="hidden lg:flex ml-auto px-1.5 py-0.5 rounded-full bg-red-500/90 text-white font-mono text-[9px] font-bold">
                    {item.badge}
                  </span>
                )}

                {/* Dot for collapsed mode on tablet */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="lg:hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 hidden lg:block text-[10px] font-mono text-slate-500 shrink-0">
          <div className="flex items-center justify-between">
            <span>GRID SYSTEM</span>
            <span className="text-cyan-400">v2.4.0-SEC</span>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-64 bg-[#0c1322] border-r border-slate-800 h-full flex flex-col z-10 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="font-display font-bold text-white text-base">OCEANSHIELD OPS</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all w-full text-left cursor-pointer ${
                      isActive
                        ? 'active-nav-glow text-cyan-300'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                    {Boolean(item.badge && item.badge > 0) && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Command Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800/80 glass-panel flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-72 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search MMSI, vessel, or threat zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs font-mono bg-[#0c1322]/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-lg focus:border-cyan-400"
              />
            </form>
          </div>

          {/* Right Header Icons & User Status */}
          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Notification Bell with Red Dot Badge */}
            <button
              type="button"
              onClick={() => onNavigate('alerts')}
              className="relative p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label={`Alert Notifications (${unreadAlertsCount} unread)`}
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Time Indicator */}
            <div className="hidden sm:block text-slate-400 text-[11px] font-mono border-l border-slate-800 pl-3">
              {time}
            </div>

            {/* User Avatar & Command Role */}
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden lg:block text-left">
                <span className="font-bold text-[11px] text-white block leading-tight">COMMANDER</span>
                <span className="text-[9px] text-cyan-400 block">TASK FORCE 151</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Threat Status & Live Feed Sub-Banner */}
        <div
          className="h-8 border-b border-slate-800/80 bg-gradient-to-r from-red-950/30 via-slate-900/60 to-slate-950/90 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 font-mono text-[10px]"
          aria-live="polite"
        >
          {/* Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-400 font-bold uppercase tracking-wider">LIVE SATELLITE FEED</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">&middot;</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span>SENTINEL-1A SAR OVERPASS: ACTIVE INGEST</span>
            </div>
          </div>

          {/* Elevated Threat Level Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden sm:inline">GLOBAL DEFCON:</span>
            <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              THREAT LEVEL: ELEVATED
            </span>
          </div>
        </div>

        {/* Main Scrollable Content Area */}
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 relative"
        >
          <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col pb-16">{children}</div>
        </main>
      </div>
    </div>
  );
}