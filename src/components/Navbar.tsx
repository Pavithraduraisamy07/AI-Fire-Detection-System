import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import {
  Flame,
  Volume2,
  VolumeX,
  AlertOctagon,
  Cpu,
  User,
  LogOut,
  Menu,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    user,
    logout,
    currentReading,
    prevention,
    isMuted,
    toggleMute,
    emergencyStopAll,
    isDemoMode,
    setIsDemoMode,
    activeDevice
  } = useApp();

  const isAlarmActive = currentReading.fire_risk === 'HIGH RISK' || prevention.buzzer_active;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Critical Alarm Banner if Active */}
      {isAlarmActive && (
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-2 text-white animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 animate-bounce text-amber-200" />
            <span className="text-xs font-black uppercase tracking-wider sm:text-sm">
              EMERGENCY FIRE HAZARD DETECTED — {activeDevice.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={emergencyStopAll}
              className="flex items-center gap-1 rounded bg-black/40 px-3 py-1 text-xs font-bold text-white hover:bg-black/60 transition-colors"
            >
              <AlertOctagon className="h-3.5 w-3.5 text-red-200" />
              <span>DISENGAGE ALARM</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-amber-600 shadow-md shadow-red-950">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  AI FIRE SHIELD
                </span>
                <span className="hidden rounded bg-red-950/80 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30 sm:inline-block">
                  IoT + ML
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Smart Detection, AI Risk Prediction & Prevention Control
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Mode switch */}
          <div className="hidden md:flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-1 text-xs">
            <button
              onClick={() => setIsDemoMode(true)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all ${
                isDemoMode
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              <span>SIMULATED DEMO</span>
            </button>
            <button
              onClick={() => setIsDemoMode(false)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all ${
                !isDemoMode
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>REAL ESP32</span>
            </button>
          </div>

          {/* Current Risk Badge */}
          <div className="hidden sm:block">
            <StatusBadge level={currentReading.fire_risk} size="md" />
          </div>

          {/* Audio Mute toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio Buzzer' : 'Mute Audio Buzzer'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
              isMuted
                ? 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
                : 'border-red-500/40 bg-red-950/40 text-red-400 hover:bg-red-950/70 shadow-sm shadow-red-950'
            }`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Emergency Stop Button */}
          <button
            onClick={emergencyStopAll}
            title="Emergency Disengage All Relays and Alarms"
            className="flex items-center gap-1.5 rounded-lg border border-red-500/50 bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-600/30 transition-all active:scale-95 shadow-sm shadow-red-950"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">E-STOP</span>
          </button>

          {/* User profile dropdown / logout */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-semibold text-white">{user.full_name}</p>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Lock Console and Return to Login Page"
                className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-red-500/40 hover:bg-red-950/30 hover:text-red-300 transition-colors text-xs font-semibold"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
