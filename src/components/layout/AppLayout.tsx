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
  Settings,
  Moon,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PageId = 'dashboard' | 'map' | 'incidents' | 'vessels' | 'alerts' | 'analytics' | 'rules';

interface NavItem {
  name: string;
  id: PageId;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  unreadAlertsCount?: number;
  onOpenCommandPalette?: () => void;
}

export function AppLayout({
  children,
  activePage,
  onNavigate,
  unreadAlertsCount = 4,
  onOpenCommandPalette,
}: AppLayoutProps) {
  const [time, setTime] = useState('');
  const [satCountdown, setSatCountdown] = useState(18 * 60 + 24);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isTouch, setIsTouch] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'midnight'>('dark');

  // Mouse Flashlight Glow Tracking
  useEffect(() => {
    const handleTouch = () => setIsTouch(true);
    window.addEventListener('touchstart', handleTouch, { once: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isTouch) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [isTouch]);

  // Real-time clock & Sat pass countdown timer
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toUTCString().replace('GMT', 'UTC'));
      setSatCountdown((prev) => (prev > 0 ? prev - 1 : 18 * 60));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Live Map', id: 'map', icon: Radar },
    { name: 'Incidents', id: 'incidents', icon: AlertTriangle },
    { name: 'Vessel Tracker', id: 'vessels', icon: Ship },
    { name: 'Alerts', id: 'alerts', icon: Bell, badge: unreadAlertsCount },
    { name: 'Analytics', id: 'analytics', icon: BarChart3 },
    { name: 'Alert Rules', id: 'rules', icon: Sliders },
  ];

  const getPageTitle = (page: PageId) => {
    switch (page) {
      case 'dashboard':
        return 'COMMAND DASHBOARD';
      case 'map':
        return 'TACTICAL RADAR GRID';
      case 'incidents':
        return 'INCIDENT INTELLIGENCE DESK';
      case 'vessels':
        return 'FLEET VESSEL TRACKER';
      case 'alerts':
        return 'INTELLIGENCE ALERTS FEED';
      case 'analytics':
        return 'STRATEGIC ANALYTICS';
      case 'rules':
        return 'SURVEILLANCE RULES';
    }
  };

  return (
    <div
      className={`flex h-screen w-full overflow-hidden text-[#CBD5E1] font-sans ${
        themeMode === 'midnight' ? 'bg-[#060910]' : 'bg-[#0A0E17]'
      } command-grid-bg relative`}
    >
      {/* 1.3 Cursor Ambient "Flashlight" Radial Glow Layer */}
      {!isTouch && (
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(360px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.05), transparent 80%)`,
          }}
        />
      )}

      {/* Skip to Main Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:p-3 focus:bg-[#00E5FF] focus:text-black focus:font-bold focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* 1.4 Operations Console Sidebar (280px on desktop, 64px on tablet) */}
      <aside
        className="hidden md:flex flex-col border-r border-[rgba(0,229,255,0.08)] bg-[#111827]/90 backdrop-blur-xl shrink-0 transition-all duration-300 w-16 lg:w-[280px] z-40 select-none"
        role="navigation"
        aria-label="Operations Console"
      >
        {/* Brand Logo & Animated Gradient Header */}
        <div className="p-4 lg:p-5 flex items-center gap-3 border-b border-[rgba(0,229,255,0.08)] shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
            <Shield className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div className="hidden lg:block truncate">
            <span className="font-display font-bold tracking-wider text-base brand-text-gradient block leading-tight">
              OCEANSHIELD
            </span>
            <span className="font-mono text-[9px] text-[#00E5FF] tracking-widest uppercase">
              MARITIME OPS CONSOLE
            </span>
          </div>
        </div>

        {/* 1.4 Horizontal "SYSTEM STATUS" Bar */}
        <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-[#0A0E17]/60 border-b border-[rgba(0,229,255,0.06)] font-mono text-[9px]">
          <span className="text-[#64748B] font-bold">SYSTEM STATUS:</span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1" title="Satellite SAR Grid: Online">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-slate-300">SAT</span>
            </div>
            <div className="flex items-center gap-1" title="Global AIS Telemetry: Connected">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-slate-300">AIS</span>
            </div>
            <div className="flex items-center gap-1" title="Tactical Comms: Active Relay">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020]" />
              <span className="text-slate-300">COM</span>
            </div>
            <div className="flex items-center gap-1" title="Synthetic Aperture Radar: Ingesting">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-slate-300">SAR</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 lg:px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-heading font-semibold transition-all duration-200 w-full text-left group relative cursor-pointer ${
                  isActive
                    ? 'active-nav-glow text-[#00E5FF]'
                    : 'text-[#64748B] hover:text-[#F1F5F9] hover:bg-white/[0.03]'
                }`}
                title={item.name}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#00E5FF]' : 'text-[#64748B] group-hover:text-slate-200'
                  }`}
                  strokeWidth={1.5}
                />
                <span className="hidden lg:inline truncate text-sm tracking-wide">{item.name}</span>

                {/* Badge if present */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="hidden lg:flex ml-auto px-1.5 py-0.5 rounded-full bg-[#FF3B5C] text-white font-mono text-[10px] font-bold shadow-[0_0_8px_rgba(255,59,92,0.5)]">
                    {item.badge}
                  </span>
                )}

                {/* Dot for collapsed mode on tablet */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="lg:hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF3B5C] animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 1.4 Bottom Section: THREAT LEVEL Segmented Bar & User Profile */}
        <div className="p-3.5 border-t border-[rgba(0,229,255,0.08)] bg-[#0A0E17]/80 hidden lg:block space-y-3 shrink-0">
          {/* 5-Segment Threat Level Bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
              <span className="text-[#64748B]">GLOBAL DEFCON:</span>
              <span className="text-[#FFB020] font-bold tracking-wider">ELEVATED (LVL 3)</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'].map((level, idx) => {
                const isCurrent = level === 'ELEVATED';
                const isPassed = idx <= 2;
                return (
                  <div
                    key={level}
                    className={`h-1.5 rounded-xs transition-all ${
                      isCurrent
                        ? 'bg-[#FFB020] shadow-[0_0_8px_#FFB020]'
                        : isPassed
                        ? 'bg-[#FFB020]/40'
                        : 'bg-slate-800'
                    }`}
                    title={`Threat Level: ${level}`}
                  />
                );
              })}
            </div>
          </div>

          {/* User Profile & Settings */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] font-display text-xs font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                CM
              </div>
              <div className="text-left">
                <span className="font-heading font-bold text-xs text-[#F1F5F9] block leading-tight">
                  ADMIRAL R. VANE
                </span>
                <span className="text-[9px] font-mono text-[#00E5FF] block">TASK FORCE 151</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md"
              title="Command Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
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
          <aside className="relative w-[280px] bg-[#111827] border-r border-slate-800 h-full flex flex-col z-10 p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00E5FF]" />
                <span className="font-display font-bold text-white text-base brand-text-gradient">
                  OCEANSHIELD
                </span>
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all w-full text-left cursor-pointer ${
                      isActive
                        ? 'active-nav-glow text-[#00E5FF]'
                        : 'text-[#64748B] hover:text-[#F1F5F9] hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-[#64748B]'}`} />
                    <span>{item.name}</span>
                    {Boolean(item.badge && item.badge > 0) && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#FF3B5C] text-white text-[10px] font-bold">
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

      {/* Main Tactical Command Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* 1.5 Header — Tactical Strip (48px height) */}
        <header className="h-12 border-b border-[rgba(0,229,255,0.1)] bg-[#111827]/90 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
          {/* Left: Breadcrumbs Context */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64748B]">
              <span className="hidden sm:inline">OPS CENTER</span>
              <ChevronRight className="w-3 h-3 text-[#00E5FF]/60 hidden sm:inline" />
              <span className="text-[#F1F5F9] font-bold font-heading tracking-wide">
                {getPageTitle(activePage)}
              </span>
            </div>
          </div>

          {/* Center: Live Feed & Satellite Pass Status */}
          <div className="hidden md:flex items-center gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-2 bg-[#0A0E17]/80 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#FF3B5C] animate-ping" />
              <span className="text-[#F1F5F9] font-bold tracking-wider">LIVE FEED</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Satellite className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
              <span>
                SAT PASS: <strong className="text-[#00E5FF]">{formatCountdown(satCountdown)}</strong>
              </span>
            </div>
          </div>

          {/* Right: Global Spotlight Search, Notifications, Theme */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            {/* Spotlight Command Search Trigger Button */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 bg-[#0A0E17]/90 hover:bg-[#1A2332] border border-[rgba(0,229,255,0.15)] hover:border-[#00E5FF]/50 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all text-[11px] cursor-pointer"
              title="Open Command Palette (Cmd+K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">Search contacts, MMSI...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell with Red Badge */}
            <button
              type="button"
              onClick={() => onNavigate('alerts')}
              className="relative p-2 rounded-lg text-slate-400 hover:text-[#00E5FF] hover:bg-white/[0.04] transition-colors cursor-pointer"
              aria-label={`Alert Notifications (${unreadAlertsCount} unread)`}
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF3B5C] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,59,92,0.6)]">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Dark / Midnight Theme Switcher */}
            <button
              type="button"
              onClick={() => setThemeMode((m) => (m === 'dark' ? 'midnight' : 'dark'))}
              className="p-2 rounded-lg text-slate-400 hover:text-[#00E5FF] hover:bg-white/[0.04] transition-colors cursor-pointer hidden sm:inline-flex"
              title={`Switch variant (Current: ${themeMode.toUpperCase()})`}
            >
              {themeMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#00E5FF]" />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 relative tactical-contour-bg"
        >
          <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;