import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SensorGauge } from '../components/SensorGauge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Thermometer,
  CloudFog,
  Droplets,
  Flame,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Radio,
  Sliders,
  Sparkles,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const LiveMonitoringView: React.FC = () => {
  const {
    currentReading,
    historyReadings,
    isStreaming,
    setIsStreaming,
    refreshRateMs,
    setRefreshRateMs,
    isDemoMode,
    setIsDemoMode,
    injectStimulus,
    activeDevice,
    devices,
    setActiveDevice,
    thresholds
  } = useApp();

  const [activeSensorGraph, setActiveSensorGraph] = useState<'all' | 'smoke' | 'temp' | 'humidity'>('all');

  const chartData = historyReadings.slice(-25).map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: r.temperature,
    smoke_ppm: r.smoke_ppm,
    humidity: r.humidity,
    risk_score: r.risk_score
  }));

  return (
    <div className="space-y-6">
      {/* Header and Telemetry Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            <h1 className="text-lg font-bold text-white">Live Sensor Monitoring Engine</h1>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-cyan-300">
              {isStreaming ? 'STREAMING ACTIVE' : 'PAUSED'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time telemetry stream from IoT nodes with automated threshold evaluation & ML classification.
          </p>
        </div>

        {/* Streaming Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hardware / Demo Mode Selector */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-semibold">
            <button
              onClick={() => setIsDemoMode(true)}
              className={`rounded px-2.5 py-1 transition-all ${
                isDemoMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400'
              }`}
            >
              Demo Simulation
            </button>
            <button
              onClick={() => setIsDemoMode(false)}
              className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                !isDemoMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400'
              }`}
            >
              <Cpu className="h-3 w-3" />
              <span>ESP32 Hardware</span>
            </button>
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
              isStreaming
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isStreaming ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Refresh interval selector */}
          <select
            value={refreshRateMs}
            onChange={(e) => setRefreshRateMs(Number(e.target.value))}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value={1000}>1.0 sec (Fast)</option>
            <option value={2000}>2.0 sec (Standard)</option>
            <option value={5000}>5.0 sec (Power Save)</option>
          </select>
        </div>
      </div>

      {/* Target Node Selection */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
          Target Sensor Node:
        </span>
        {devices.map((dev) => (
          <button
            key={dev.id}
            onClick={() => setActiveDevice(dev)}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeDevice.id === dev.id
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-950'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${activeDevice.id === dev.id ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{dev.name}</span>
            <span className="font-mono text-[10px] text-slate-400">({dev.ip_address})</span>
          </button>
        ))}
      </div>

      {/* Real-time Sensor Values */}
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
          subtitle={`Warning > ${thresholds.temp_warning}°C`}
        />

        <SensorGauge
          label="MQ-2 Smoke & Gas"
          value={currentReading.smoke_ppm}
          unit="ppm"
          icon={CloudFog}
          min={0}
          max={1000}
          thresholdWarning={thresholds.smoke_warning}
          thresholdCritical={thresholds.smoke_critical}
          colorScheme="red"
          subtitle={`Warning > ${thresholds.smoke_warning} ppm`}
        />

        <SensorGauge
          label="Humidity (DHT11)"
          value={currentReading.humidity}
          unit="%"
          icon={Droplets}
          min={10}
          max={90}
          thresholdWarning={thresholds.humidity_low_warning}
          thresholdCritical={18}
          inverseRisk={true}
          colorScheme="blue"
          subtitle="Relative Moisture"
        />

        {/* Flame IR Sensor Live Status */}
        <div
          className={`rounded-xl border p-5 transition-all ${
            currentReading.flame_detected
              ? 'border-red-500 bg-red-950/40 shadow-lg shadow-red-950/60'
              : 'border-slate-800 bg-slate-900/90'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Flame IR Sensor (YG1006)
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black ${
                    currentReading.flame_detected ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {currentReading.flame_detected ? 'FLAME ACTIVE' : 'NO COMBUSTION'}
                </span>
              </div>
            </div>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                currentReading.flame_detected
                  ? 'border-red-500 bg-red-500/20 text-red-400 animate-bounce'
                  : 'border-slate-700 bg-slate-800 text-emerald-400'
              }`}
            >
              <Flame className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Analog IR Intensity:</span>
            <span className="font-mono text-white">{currentReading.flame_raw} ADC</span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                currentReading.flame_detected ? 'bg-red-500 w-full' : 'bg-emerald-500 w-1/12'
              }`}
            />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
            <span className="text-slate-400">Digital Pin DO</span>
            <span className="font-mono font-bold text-slate-200">
              {currentReading.flame_detected ? 'LOW (0V - ACTIVE)' : 'HIGH (3.3V - CLEAR)'}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Condition Injection Test Bench */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Live Environmental Scenario Injection (Demo Mode)</h2>
          </div>
          <span className="text-xs text-slate-400">Click any condition below to inject it into the live stream</span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => injectStimulus('NORMAL')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs font-bold text-emerald-300 hover:bg-emerald-950/40 transition-all hover:scale-[1.02]"
          >
            <RotateCcw className="h-5 w-5 text-emerald-400" />
            <span>Normal Ambient</span>
            <span className="text-[10px] text-emerald-400/80">24°C | 65 ppm | No Flame</span>
          </button>

          <button
            onClick={() => injectStimulus('SMOKE')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs font-bold text-amber-300 hover:bg-amber-950/40 transition-all hover:scale-[1.02]"
          >
            <CloudFog className="h-5 w-5 text-amber-400" />
            <span>Smoke Puff Spike</span>
            <span className="text-[10px] text-amber-400/80">36°C | 380 ppm Smoke</span>
          </button>

          <button
            onClick={() => injectStimulus('FLAME')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-all hover:scale-[1.02]"
          >
            <Flame className="h-5 w-5 text-rose-400" />
            <span>Lighter / Match Flame</span>
            <span className="text-[10px] text-rose-400/80">IR Triggered | 290 ppm</span>
          </button>

          <button
            onClick={() => injectStimulus('OVERHEAT')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-950/20 p-3 text-xs font-bold text-orange-300 hover:bg-orange-950/40 transition-all hover:scale-[1.02]"
          >
            <Thermometer className="h-5 w-5 text-orange-400" />
            <span>Thermal Flashover</span>
            <span className="text-[10px] text-orange-400/80">65°C | Smoldering</span>
          </button>

          <button
            onClick={() => injectStimulus('EXTREME_FIRE')}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-red-500 bg-red-950/60 p-3 text-xs font-black text-red-200 hover:bg-red-900/60 transition-all hover:scale-[1.02] animate-pulse"
          >
            <Flame className="h-5 w-5 text-red-400" />
            <span>Catastrophic Fire</span>
            <span className="text-[10px] text-red-300">78°C | 650 ppm | Flame</span>
          </button>
        </div>
      </div>

      {/* Live Continuous Telemetry Graph */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Streaming Sensor Waveforms (Live Ticker)</span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </h2>
            <p className="text-xs text-slate-400">Continuous sampling synchronized with ESP32 node</p>
          </div>

          {/* Chart Filter tabs */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            <button
              onClick={() => setActiveSensorGraph('all')}
              className={`rounded px-2.5 py-1 font-semibold ${
                activeSensorGraph === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setActiveSensorGraph('smoke')}
              className={`rounded px-2.5 py-1 font-semibold ${
                activeSensorGraph === 'smoke' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'
              }`}
            >
              Smoke MQ-2
            </button>
            <button
              onClick={() => setActiveSensorGraph('temp')}
              className={`rounded px-2.5 py-1 font-semibold ${
                activeSensorGraph === 'temp' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setActiveSensorGraph('humidity')}
              className={`rounded px-2.5 py-1 font-semibold ${
                activeSensorGraph === 'humidity' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
              }`}
            >
              Humidity
            </button>
          </div>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              {(activeSensorGraph === 'all' || activeSensorGraph === 'smoke') && (
                <Line
                  type="monotone"
                  dataKey="smoke_ppm"
                  name="Smoke (ppm)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {(activeSensorGraph === 'all' || activeSensorGraph === 'temp') && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {(activeSensorGraph === 'all' || activeSensorGraph === 'humidity') && (
                <Line
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live ESP32 JSON Payload Inspector */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">ESP32 REST Ingestion Packet (HTTP POST Payload)</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">Endpoint: POST /api/sensor/readings</span>
        </div>

        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre>{JSON.stringify({
            device_id: currentReading.device_id,
            temperature: currentReading.temperature,
            humidity: currentReading.humidity,
            smoke_ppm: currentReading.smoke_ppm,
            flame_detected: currentReading.flame_detected,
            flame_raw: currentReading.flame_raw,
            fire_risk: currentReading.fire_risk,
            risk_score: currentReading.risk_score,
            is_simulated: currentReading.is_simulated,
            timestamp: currentReading.timestamp
          }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
