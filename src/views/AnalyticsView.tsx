import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Filter,
  Flame,
  Thermometer,
  CloudFog,
  Droplets,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { historyReadings } = useApp();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('24h');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  // Filter readings based on time range
  const sliceCount = timeRange === '1h' ? 8 : timeRange === '6h' ? 18 : 48;
  const dataSlice = historyReadings.slice(-sliceCount);

  const formattedData = dataSlice.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    smoke_ppm: r.smoke_ppm,
    humidity: r.humidity,
    risk_score: r.risk_score
  }));

  // Statistics calculation
  const temps = dataSlice.map((d) => d.temperature);
  const smokes = dataSlice.map((d) => d.smoke_ppm);
  const hums = dataSlice.map((d) => d.humidity);

  const maxTemp = Math.max(...temps, 0);
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / (temps.length || 1)).toFixed(1);
  const maxSmoke = Math.max(...smokes, 0);
  const avgSmoke = (smokes.reduce((a, b) => a + b, 0) / (smokes.length || 1)).toFixed(0);
  const minHum = Math.min(...hums, 100);

  const exportAnalyticsCSV = () => {
    const headers = ['Timestamp', 'Temperature (°C)', 'Smoke MQ-2 (ppm)', 'Humidity (%)', 'Fire Risk Score (%)'];
    const rows = dataSlice.map((d) => [
      d.timestamp,
      d.temperature,
      d.smoke_ppm,
      d.humidity,
      d.risk_score
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sensor_Analytics_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">Sensor Analytics & Trend Forecasts</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Historical environmental patterns, diurnal variations, and predictive threshold deviations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Filter */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-semibold">
            {(['1h', '6h', '24h', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded px-2.5 py-1 uppercase transition-all ${
                  timeRange === r ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={exportAnalyticsCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Temperature</span>
            <Thermometer className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{maxTemp}°C</div>
          <span className="text-[10px] text-slate-400">Avg: {avgTemp}°C</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Smoke Density</span>
            <CloudFog className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{maxSmoke} ppm</div>
          <span className="text-[10px] text-slate-400">Avg: {avgSmoke} ppm</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lowest Humidity</span>
            <Droplets className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{minHum}%</div>
          <span className="text-[10px] text-slate-400">Flaggability risk index</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Logged Data Points</span>
            <BarChart2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{dataSlice.length}</div>
          <span className="text-[10px] text-slate-400">Stored in local SQLite cache</span>
        </div>
      </div>

      {/* Main Chart 1: Combined Temperature & Smoke Density */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Temperature (°C) & Smoke MQ-2 (ppm) Profile</span>
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Smoke (ppm)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="areaTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaSmoke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis yAxisId="left" stroke="#06b6d4" fontSize={10} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#06b6d4"
                fill="url(#areaTemp)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="smoke_ppm"
                name="Smoke MQ-2 (ppm)"
                stroke="#f43f5e"
                fill="url(#areaSmoke)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Chart 2: Fire Risk Index Over Time */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-400" />
            <span>AI Fire Risk Composite Score History (%)</span>
          </h2>
          <span className="text-xs font-mono text-purple-400">Classified by Random Forest Engine</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="risk_score"
                name="Risk Score (%)"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
