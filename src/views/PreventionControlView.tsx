import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Fan,
  Flame,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertOctagon,
  ZapOff
} from 'lucide-react';

export const PreventionControlView: React.FC = () => {
  const {
    prevention,
    toggleBuzzer,
    toggleExhaustFan,
    toggleSuppressionArmed,
    triggerSuppressionValve,
    emergencyStopAll
  } = useApp();

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedFireClass, setSelectedFireClass] = useState<'A' | 'B' | 'C' | 'D' | 'K'>('A');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleActuation = () => {
    // Enforce fire class warning:
    if (selectedFireClass === 'B' || selectedFireClass === 'C' || selectedFireClass === 'D' || selectedFireClass === 'K') {
      setStatusMessage({
        text: `CRITICAL SAFETY PROTOCOL: Water cannot be discharged onto Class ${selectedFireClass} fires! Switch suppression agent to CO2 / Clean Agent before deploying.`,
        isError: true
      });
      setConfirmModalOpen(false);
      return;
    }

    const res = triggerSuppressionValve();
    setStatusMessage({
      text: res.message,
      isError: !res.success
    });
    setConfirmModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h1 className="text-lg font-bold text-white">Fire Prevention & Actuator Controls</h1>
              <span className="rounded bg-red-950/80 px-2 py-0.5 text-xs font-bold text-red-300 border border-red-500/40">
                Safety Interlocked
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Hardware relay control, audible evacuation buzzer, smoke extraction fan, and safety-gated suppression valves.
            </p>
          </div>

          <button
            onClick={emergencyStopAll}
            className="flex items-center gap-2 rounded-xl border border-red-500 bg-red-600/30 px-4 py-2 text-xs font-black text-red-200 hover:bg-red-600/50 shadow-md shadow-red-950 transition-all active:scale-95"
          >
            <AlertOctagon className="h-4 w-4 text-red-400 animate-spin" />
            <span>GLOBAL EMERGENCY STOP</span>
          </button>
        </div>
      </div>

      {/* Status feedback message */}
      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-xs font-bold flex items-start gap-2.5 ${
            statusMessage.isError
              ? 'border-red-500 bg-red-950/80 text-red-200 shadow-md'
              : 'border-emerald-500 bg-emerald-950/80 text-emerald-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{statusMessage.text}</p>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Actuator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Actuator 1: Piezo Buzzer Alarm */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  prevention.buzzer_active
                    ? 'border-red-500 bg-red-500/20 text-red-400 animate-bounce'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                {prevention.buzzer_active ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Piezo Buzzer (GPIO 26)</h2>
                <p className="text-xs text-slate-400">Auditory Evacuation Siren</p>
              </div>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                prevention.buzzer_active ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {prevention.buzzer_active ? 'ACTIVE' : 'MUTED'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Synthesized Web Audio alarm in demo mode; drives 5V piezoelectric transducer on physical ESP32 pin 26.
          </p>

          <button
            onClick={() => toggleBuzzer()}
            className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all shadow-sm ${
              prevention.buzzer_active
                ? 'border border-red-500 bg-red-600 text-white hover:bg-red-500'
                : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {prevention.buzzer_active ? 'Silence Buzzer' : 'Manual Buzzer Test'}
          </button>
        </div>

        {/* Actuator 2: Relay 1 - Exhaust Ventilation Fan */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  prevention.relay_exhaust_fan
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-950'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <Fan className={`h-6 w-6 ${prevention.relay_exhaust_fan ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Exhaust Fan (Relay 1 - GPIO 27)</h2>
                <p className="text-xs text-slate-400">Toxic Smoke Extraction</p>
              </div>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                prevention.relay_exhaust_fan
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {prevention.relay_exhaust_fan ? 'EXTRACTING' : 'OFF'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Engages 12V ventilation duct fan to vent hazardous carbon monoxide and reduce thermal convective currents.
          </p>

          <button
            onClick={() => toggleExhaustFan()}
            className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all shadow-sm ${
              prevention.relay_exhaust_fan
                ? 'border border-cyan-500 bg-cyan-600 text-white hover:bg-cyan-500'
                : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {prevention.relay_exhaust_fan ? 'Stop Ventilation Fan' : 'Start Exhaust Fan'}
          </button>
        </div>

        {/* Actuator 3: Relay 2 - Fire Suppression Solenoid Valve */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  prevention.relay_suppression
                    ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                    : prevention.suppression_armed
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Suppression Valve (Relay 2 - GPIO 32)</h2>
                <p className="text-xs text-slate-400">Safety Interlocked Actuator</p>
              </div>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                prevention.relay_suppression
                  ? 'bg-red-500 text-white animate-pulse'
                  : prevention.suppression_armed
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {prevention.relay_suppression ? 'DISCHARGING' : prevention.suppression_armed ? 'ARMED' : 'LOCKED'}
            </span>
          </div>

          {/* Safety Interlock Arming Switch */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {prevention.suppression_armed ? (
                <Unlock className="h-4 w-4 text-amber-400" />
              ) : (
                <Lock className="h-4 w-4 text-slate-400" />
              )}
              <span className="font-semibold text-slate-300">Safety Armed Switch</span>
            </div>
            <button
              onClick={() => toggleSuppressionArmed()}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                prevention.suppression_armed
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {prevention.suppression_armed ? 'DISARM' : 'ARM SWITCH'}
            </button>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={!prevention.suppression_armed}
            className={`w-full rounded-xl py-2.5 text-xs font-black transition-all ${
              prevention.suppression_armed
                ? 'border border-red-500/80 bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-950'
                : 'border border-slate-800 bg-slate-950/60 text-slate-600 cursor-not-allowed'
            }`}
          >
            ACTUATE SUPPRESSION VALVE
          </button>
        </div>
      </div>

      {/* Critical Fire Class Safety Advisory Guide */}
      <div className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            CRITICAL PROTOCOL: Fire Classification & Suppression Agent Mandate
          </h2>
        </div>

        <p className="text-xs text-slate-300">
          <strong>Never assume water is suitable for all fires.</strong> Spraying water onto inappropriate fuels
          leads to lethal shock hazards, explosive boiling expansion, and uncontrollable toxic vapor clouds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Class A */}
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-3.5 space-y-1">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              CLASS A
            </span>
            <p className="font-bold text-white mt-1">Ordinary Combustibles</p>
            <p className="text-[11px] text-slate-400">Wood, Paper, Fabric, Trash, Plastics</p>
            <div className="pt-2 text-[11px] font-semibold text-emerald-400">
              ✓ Water, Mist, ABC Dry Chemical
            </div>
          </div>

          {/* Class B */}
          <div className="rounded-xl border border-red-500/30 bg-slate-950/70 p-3.5 space-y-1">
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
              CLASS B
            </span>
            <p className="font-bold text-white mt-1">Flammable Liquids</p>
            <p className="text-[11px] text-slate-400">Gasoline, Solvents, Oil, Paints</p>
            <div className="pt-2 text-[11px] font-semibold text-red-400">
              ✗ WATER PROHIBITED (Boilover hazard). Use CO2 or Foam.
            </div>
          </div>

          {/* Class C */}
          <div className="rounded-xl border border-red-500/30 bg-slate-950/70 p-3.5 space-y-1">
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
              CLASS C
            </span>
            <p className="font-bold text-white mt-1">Energized Electrical</p>
            <p className="text-[11px] text-slate-400">Server Racks, Circuit Panels, Wiring</p>
            <div className="pt-2 text-[11px] font-semibold text-red-400">
              ✗ WATER PROHIBITED (Lethal Shock). Use Clean Agent FM-200 or CO2.
            </div>
          </div>

          {/* Class D */}
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-3.5 space-y-1">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              CLASS D
            </span>
            <p className="font-bold text-white mt-1">Combustible Metals</p>
            <p className="text-[11px] text-slate-400">Magnesium, Lithium batteries, Sodium</p>
            <div className="pt-2 text-[11px] font-semibold text-amber-400">
              ✗ WATER PROHIBITED (Explosive H2 generation). Use Class D Powder.
            </div>
          </div>

          {/* Class K */}
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-3.5 space-y-1">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              CLASS K
            </span>
            <p className="font-bold text-white mt-1">Cooking Oils & Fryers</p>
            <p className="text-[11px] text-slate-400">Kitchen vegetable oils, animal fats</p>
            <div className="pt-2 text-[11px] font-semibold text-amber-400">
              ✗ WATER PROHIBITED (Grease Fireball). Use Wet Chemical Agent.
            </div>
          </div>
        </div>
      </div>

      {/* Arming Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-500 bg-slate-900 p-6 shadow-2xl shadow-red-950 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertOctagon className="h-6 w-6" />
              <h2 className="text-base font-black text-white">MANDATORY SUPPRESSION VERIFICATION</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to actuate <strong>Relay 2 (Solenoid Suppression Valve)</strong>. Before proceeding,
              you MUST confirm the fuel classification present in the affected zone:
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-200 block">Select On-Site Fuel Classification:</label>
              {(['A', 'B', 'C', 'D', 'K'] as const).map((fc) => (
                <label
                  key={fc}
                  className={`flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-colors ${
                    selectedFireClass === fc
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fireClass"
                      checked={selectedFireClass === fc}
                      onChange={() => setSelectedFireClass(fc)}
                      className="accent-cyan-500"
                    />
                    <span className="font-bold">Class {fc}</span>
                    <span className="text-[11px] text-slate-400">
                      {fc === 'A'
                        ? '(Wood, Paper, Ordinary Combustibles - Safe for Water)'
                        : fc === 'B'
                        ? '(Flammable Liquids - WATER DANGEROUS)'
                        : fc === 'C'
                        ? '(Energized Electrical - WATER LETHAL)'
                        : fc === 'D'
                        ? '(Combustible Metals - WATER EXPLOSIVE)'
                        : '(Commercial Cooking Oils - WATER PROHIBITED)'}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleActuation}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-500 shadow-md shadow-red-950"
              >
                Confirm & Discharge Valve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
