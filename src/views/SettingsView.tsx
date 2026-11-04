import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Sliders,
  Bell,
  Cpu,
  Info,
  Save,
  RotateCcw,
  Shield,
  Radio,
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { thresholds, updateThresholds, devices, activeDevice, setActiveDevice } = useApp();

  const [formThresholds, setFormThresholds] = useState({ ...thresholds });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(formThresholds);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults = {
      temp_warning: 45,
      temp_critical: 58,
      smoke_warning: 250,
      smoke_critical: 450,
      humidity_low_warning: 25,
      buzzer_on_warning: false,
      auto_ventilation_enabled: true,
      auto_suppression_enabled: false
    };
    setFormThresholds(defaults);
    updateThresholds(defaults);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">System Settings & Calibration</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Configure safety thresholds, actuator triggers, IoT device registry, and application telemetry.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sensor Threshold Sliders & Limits */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Hazard Alert Thresholds</h2>
          </div>

          {/* Temperature Warning & Critical */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Temperature Warning (°C):
              </label>
              <input
                type="number"
                min="30"
                max="70"
                value={formThresholds.temp_warning}
                onChange={(e) => setFormThresholds({ ...formThresholds, temp_warning: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 45°C</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Temperature Critical (°C):
              </label>
              <input
                type="number"
                min="45"
                max="90"
                value={formThresholds.temp_critical}
                onChange={(e) => setFormThresholds({ ...formThresholds, temp_critical: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 58°C</span>
            </div>
          </div>

          {/* Smoke Warning & Critical */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Smoke Warning (ppm):
              </label>
              <input
                type="number"
                min="100"
                max="600"
                value={formThresholds.smoke_warning}
                onChange={(e) => setFormThresholds({ ...formThresholds, smoke_warning: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 250 ppm</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Smoke Critical (ppm):
              </label>
              <input
                type="number"
                min="300"
                max="1000"
                value={formThresholds.smoke_critical}
                onChange={(e) => setFormThresholds({ ...formThresholds, smoke_critical: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 450 ppm</span>
            </div>
          </div>

          {/* Dry Humidity Warning */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Low Relative Humidity Dry Warning (%):
            </label>
            <input
              type="number"
              min="10"
              max="40"
              value={formThresholds.humidity_low_warning}
              onChange={(e) => setFormThresholds({ ...formThresholds, humidity_low_warning: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Low humidity (&lt; 25%) accelerates combustion velocity.
            </span>
          </div>

          {/* Actuator Automation Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formThresholds.auto_ventilation_enabled}
                onChange={(e) =>
                  setFormThresholds({ ...formThresholds, auto_ventilation_enabled: e.target.checked })
                }
                className="h-4 w-4 rounded accent-cyan-500"
              />
              <div>
                <span className="text-xs font-bold text-white block">Automated Smoke Exhaust Fan Trigger</span>
                <span className="text-[11px] text-slate-400">
                  Automatically engage Relay 1 when risk score exceeds 65%
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formThresholds.buzzer_on_warning}
                onChange={(e) =>
                  setFormThresholds({ ...formThresholds, buzzer_on_warning: e.target.checked })
                }
                className="h-4 w-4 rounded accent-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-white block">Audible Pulse on Warning Level</span>
                <span className="text-[11px] text-slate-400">
                  Emit single soft beep when warning thresholds are breached
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-950"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* Right Column: Node Registry & Application Specs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Device Configuration */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Connected Node Registry</h2>
            </div>

            <div className="space-y-3">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => setActiveDevice(dev)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                    activeDevice.id === dev.id
                      ? 'border-cyan-500/60 bg-cyan-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Radio className={`h-4 w-4 ${activeDevice.id === dev.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-xs font-bold text-white">{dev.name}</p>
                      <p className="text-[10px] text-slate-400">
                        IP: {dev.ip_address} | MAC: {dev.mac_address}
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    {dev.firmware_version}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Information & Architecture */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Info className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">System Specification</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Backend Framework:</span>
                <span className="font-semibold text-white">FastAPI 0.110 (Python 3.10)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Database Engine:</span>
                <span className="font-semibold text-white">SQLite 3 (ACID compliant)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">AI Model:</span>
                <span className="font-semibold text-white">Random Forest (Scikit-learn)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Microcontroller:</span>
                <span className="font-semibold text-white">ESP32-WROOM-32 (2.4GHz WiFi)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Audio Subsystem:</span>
                <span className="font-semibold text-white">Web Audio API Piezo Synthesizer</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Safety Standards:</span>
                <span className="font-semibold text-white">NFPA 72 & ISO 7240 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
