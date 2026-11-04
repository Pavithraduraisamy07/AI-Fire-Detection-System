import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Activity,
  BrainCircuit,
  BellRing,
  ShieldCheck,
  Cpu,
  LineChart,
  Settings,
  Download,
  Flame,
  Radio,
  FileCode2,
  X,
  LogOut
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'live-monitoring'
  | 'ai-prediction'
  | 'alerts'
  | 'prevention'
  | 'iot-device'
  | 'analytics'
  | 'settings'
  | 'export-zip';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { alerts, prevention, currentReading, isDemoMode, logout } = useApp();

  const unresolvedAlertsCount = alerts.filter((a) => !a.resolved).length;
  const isHighRisk = currentReading.fire_risk === 'HIGH RISK';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      badge: isHighRisk ? 'HAZARD' : undefined,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'live-monitoring' as ActiveTab,
      label: 'Live Sensor Telemetry',
      icon: Activity,
      badge: 'LIVE',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
    },
    {
      id: 'ai-prediction' as ActiveTab,
      label: 'AI Risk Prediction & ML',
      icon: BrainCircuit,
      badge: '98% ACC',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Alert Management',
      icon: BellRing,
      badge: unresolvedAlertsCount > 0 ? String(unresolvedAlertsCount) : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse'
    },
    {
      id: 'prevention' as ActiveTab,
      label: 'Fire Prevention Control',
      icon: ShieldCheck,
      badge: prevention.buzzer_active || prevention.relay_exhaust_fan ? 'ACTIVE' : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    {
      id: 'iot-device' as ActiveTab,
      label: 'IoT ESP32 Integration',
      icon: Cpu,
      badge: 'ARDUINO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Sensor Analytics',
      icon: LineChart
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Settings',
      icon: Settings
    },
    {
      id: 'export-zip' as ActiveTab,
      label: 'Download Project ZIP',
      icon: Download,
      badge: 'ZIP',
      badgeColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5 lg:hidden">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            <span className="font-bold text-white">Menu Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Device Status Pill */}
        <div className="p-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-400">Node Status</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">ESP32-FIRE-ZONE-01</p>
                <p className="text-[10px] text-slate-400">Main Electrical & Server</p>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                {isDemoMode ? 'SIM' : 'HW'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500/20 via-slate-900 to-slate-900 text-white border border-red-500/40 shadow-sm shadow-red-950/40'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Explicit Sign Out / Return to Login Page Button */}
          <div className="pt-2 border-t border-slate-800/60 mt-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-400 border border-transparent transition-all"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-400" />
                <span>Lock Console / Sign Out</span>
              </div>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                EXIT
              </span>
            </button>
          </div>
        </nav>

        {/* Quick Footer info */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-lg bg-slate-900/60 p-3 text-[11px] text-slate-400 border border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>FastAPI Backend</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              SQLite + Scikit-Learn Model Ready
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>Port: 8000 / 3000</span>
              <span className="text-emerald-400 font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
