import React from 'react';
import { useApp } from '../context/AppContext';
import { SensorGauge } from '../components/SensorGauge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Thermometer,
  CloudFog,
  Droplets,
  Flame,
  ShieldCheck,
  BellRing,
  Cpu,
  Fan,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    currentReading,
    historyReadings,
    devices,
    alerts,
    prevention,
    toggleBuzzer,
    toggleExhaustFan,
    injectStimulus,
    thresholds,
    isDemoMode
  } = useApp();

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  // Format chart data for mini sparkline
  const chartData = historyReadings.slice(-20).map((r, i) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temp: r.temperature,
    smoke: r.smoke_ppm,
    risk: r.risk_score
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Risk Condition Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${
          currentReading.fire_risk === 'HIGH RISK'
            ? 'border-red-500/60 bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/60 shadow-xl shadow-red-950/50'
            : currentReading.fire_risk === 'WARNING'
            ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 shadow-lg shadow-amber-950/30'
            : 'border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-md'
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Safety Assessment
              </span>
              <StatusBadge level={currentReading.fire_risk} size="lg" />
              <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs font-mono text-cyan-300 border border-slate-700/60">
                Risk Score: {currentReading.risk_score}%
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentReading.fire_risk === 'HIGH RISK'
                ? 'EMERGENCY: Physical Combustion or Flashover Surge Detected'
                : currentReading.fire_risk === 'WARNING'
                ? 'ADVISORY: Smoldering or Elevated Thermal Indices Observed'
                : 'All Environmental & Combustion Indices Nominal'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Real-time multi-sensor telemetry corroborated by Random Forest Machine Learning classifier.
              Monitored by active IoT node <span className="font-mono text-slate-300">{currentReading.device_id}</span>.
            </p>
          </div>

          {/* Quick Actuator Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <button
              onClick={() => toggleBuzzer()}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                prevention.buzzer_active
                  ? 'border border-red-500 bg-red-600 text-white animate-pulse shadow-red-950'
                  : 'border border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
              }`}
            >
              {prevention.buzzer_active ? (
                <>
                  <Volume2 className="h-4 w-4 text-white" />
                  <span>BUZZER: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 text-slate-400" />
                  <span>TEST BUZZER</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleExhaustFan()}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                prevention.relay_exhaust_fan
                  ? 'border border-cyan-500 bg-cyan-600/30 text-cyan-300 shadow-cyan-950'
                  : 'border border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Fan className={`h-4 w-4 ${prevention.relay_exhaust_fan ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>FAN RELAY: {prevention.relay_exhaust_fan ? 'ACTIVE' : 'IDLE'}</span>
            </button>

            <button
              onClick={() => onNavigate('prevention')}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-3.5 py-2.5 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors"
            >
              <span>Controls</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test Stimulus Tray (Demo Mode) */}
      {isDemoMode && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Interactive Sensor Stimulus Simulator (Demo Mode)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Inject hardware sensor conditions to test AI risk prediction & relays:
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => injectStimulus('NORMAL')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Normal Ambient</span>
            </button>

            <button
              onClick={() => injectStimulus('SMOKE')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-amber-400 hover:border-amber-500/40 hover:bg-amber-950/20 transition-all"
            >
              <CloudFog className="h-3.5 w-3.5" />
              <span>Smoke Puff Test</span>
            </button>

            <button
              onClick={() => injectStimulus('FLAME')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/20 transition-all"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>IR Flame Match</span>
            </button>

            <button
              onClick={() => injectStimulus('OVERHEAT')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-orange-400 hover:border-orange-500/40 hover:bg-orange-950/20 transition-all"
            >
              <Thermometer className="h-3.5 w-3.5" />
              <span>Overheat Spike</span>
            </button>

            <button
              onClick={() => injectStimulus('EXTREME_FIRE')}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/50 bg-red-950/50 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-all animate-pulse"
            >
              <Flame className="h-3.5 w-3.5 text-red-400" />
              <span>Flashover Fire</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Primary Sensor Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorGauge
          label="Temperature (DHT11)"
          value={currentReading.temperature}
          unit="°C"
          icon={Thermometer}
          min={0}
          max={100}
          thresholdWarning={thresholds.temp_warning}
          thresholdCritical={thresholds.temp_critical}
          colorScheme="amber"
          subtitle={`Critical: ${thresholds.temp_critical}°C`}
        />

        <SensorGauge
          label="Smoke & Gas (MQ-2)"
          value={currentReading.smoke_ppm}
          unit="ppm"
          icon={CloudFog}
          min={0}
          max={1000}
          thresholdWarning={thresholds.smoke_warning}
          thresholdCritical={thresholds.smoke_critical}
          colorScheme="red"
          subtitle={`Critical: ${thresholds.smoke_critical} ppm`}
        />

        <SensorGauge
          label="Relative Humidity (DHT11)"
          value={currentReading.humidity}
          unit="%"
          icon={Droplets}
          min={10}
          max={90}
          thresholdWarning={thresholds.humidity_low_warning}
          thresholdCritical={18}
          inverseRisk={true}
          colorScheme="blue"
          subtitle="Low humidity dry risk"
        />

        {/* Optical Flame IR Indicator Card */}
        <div
          className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
            currentReading.flame_detected
              ? 'border-red-500 bg-gradient-to-b from-red-950/40 to-slate-900/90 shadow-lg shadow-red-950/50'
              : 'border-slate-800 bg-slate-900/90'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Optical Flame Sensor
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-extrabold tracking-tight ${
                    currentReading.flame_detected ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {currentReading.flame_detected ? 'FIRE DETECTED' : 'CLEAR'}
                </span>
              </div>
            </div>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                currentReading.flame_detected
                  ? 'border-red-500/50 bg-red-500/20 text-red-400 animate-bounce'
                  : 'border-slate-700/50 bg-slate-800/80 text-emerald-400'
              }`}
            >
              <Flame className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>IR Analog ADC:</span>
            <span className="font-mono text-white">{currentReading.flame_raw} / 1023</span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                currentReading.flame_detected ? 'bg-red-500 w-full' : 'bg-emerald-500 w-1/12'
              }`}
            />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
            <span className="text-slate-400">IR Photodiode</span>
            <span
              className={`font-semibold ${
                currentReading.flame_detected ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {currentReading.flame_detected ? 'OPTICAL COMBUSTION' : 'NO RADIATION'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Mini Telemetry Chart & Actuator Relay Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Telemetry Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Live Environmental Indices (Last 20 Samples)</span>
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400">Correlated Temperature (°C) and Smoke MQ-2 (ppm)</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="smokeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="smoke"
                  name="Smoke (ppm)"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#smokeGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  name="Temperature (°C)"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#tempGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Actuators & Devices Snapshot */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Hardware Actuators</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">GPIO Relays</span>
            </h2>

            <div className="space-y-3 text-xs">
              {/* Buzzer */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      prevention.buzzer_active ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Piezo Buzzer (GPIO 26)</p>
                    <p className="text-[10px] text-slate-400">Auditory Evacuation Alarm</p>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    prevention.buzzer_active
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {prevention.buzzer_active ? 'SOUNDING' : 'MUTED'}
                </span>
              </div>

              {/* Fan Relay */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      prevention.relay_exhaust_fan ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Fan className={`h-4 w-4 ${prevention.relay_exhaust_fan ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Exhaust Fan (Relay 1 - GPIO 27)</p>
                    <p className="text-[10px] text-slate-400">Smoke Extraction System</p>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    prevention.relay_exhaust_fan
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {prevention.relay_exhaust_fan ? 'RUNNING' : 'STANDBY'}
                </span>
              </div>

              {/* Suppression Relay */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      prevention.relay_suppression ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Suppression Valve (Relay 2 - GPIO 32)</p>
                    <p className="text-[10px] text-slate-400">Safety Interlocked Actuator</p>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    prevention.relay_suppression
                      ? 'bg-red-500 text-white animate-pulse'
                      : prevention.suppression_armed
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {prevention.relay_suppression ? 'DISCHARGING' : prevention.suppression_armed ? 'ARMED' : 'DISARMED'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Node Registry Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300">Monitored Zones</span>
              <span className="font-mono text-cyan-400">{devices.length} Active Nodes</span>
            </div>
            <div className="space-y-1.5">
              {devices.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-md bg-slate-950/50 p-2 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium text-slate-200">{d.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{d.ip_address}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Alerts Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Recent System Alerts & Audits</h2>
            {unresolvedAlerts.length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {unresolvedAlerts.length} Unresolved
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Manage All Alerts</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Zone / Device</th>
                <th className="pb-3 font-semibold">Risk Level</th>
                <th className="pb-3 font-semibold">Sensor Snapshot</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 font-medium text-white">{alert.device_id}</td>
                  <td className="py-3">
                    <StatusBadge level={alert.risk_level} size="sm" />
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    T: {alert.sensor_snapshot.temperature}°C | S: {alert.sensor_snapshot.smoke_ppm}ppm | F:{' '}
                    {alert.sensor_snapshot.flame_detected ? 'YES' : 'NO'}
                  </td>
                  <td className="py-3">
                    {alert.resolved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="h-3 w-3" />
                        Resolved
                      </span>
                    ) : alert.acknowledged ? (
                      <span className="text-amber-400 font-semibold">Acknowledged</span>
                    ) : (
                      <span className="text-red-400 font-bold animate-pulse">Open Hazard</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => onNavigate('alerts')}
                      className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
