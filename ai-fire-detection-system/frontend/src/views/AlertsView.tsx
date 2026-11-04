import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { AlertItem, RiskLevel } from '../types';
import {
  BellRing,
  CheckCircle,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Download,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, clearResolvedAlerts, toggleBuzzer, prevention } = useApp();

  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterRisk !== 'ALL' && alert.risk_level !== filterRisk) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.device_id.toLowerCase().includes(q) ||
        alert.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolveSubmit = (alertId: string) => {
    resolveAlert(alertId, resolutionNote || 'Inspection verified. Area secured.');
    setResolvingId(null);
    setResolutionNote('');
  };

  const exportAlertsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Device', 'Risk Level', 'Title', 'Temp (°C)', 'Smoke (ppm)', 'Flame', 'Resolved', 'Notes'];
    const rows = alerts.map((a) => [
      a.id,
      a.timestamp,
      a.device_id,
      a.risk_level,
      `"${a.title.replace(/"/g, '""')}"`,
      a.sensor_snapshot.temperature,
      a.sensor_snapshot.smoke_ppm,
      a.sensor_snapshot.flame_detected ? 'YES' : 'NO',
      a.resolved ? 'YES' : 'NO',
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fire_System_Alerts_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-amber-400" />
            <h1 className="text-lg font-bold text-white">Alert Audit & Incident Management</h1>
            {unresolvedCount > 0 && (
              <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/40 animate-pulse">
                {unresolvedCount} Active Incidents
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time alarm dispatch logs, sensor snapshots, acknowledgement queues, and compliance audits.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportAlertsCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={clearResolvedAlerts}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-red-500/40 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Resolved</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by title, sensor device, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs font-semibold">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-2 mr-1" />
          {['ALL', 'HIGH RISK', 'WARNING'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`rounded-lg px-3 py-1 transition-all ${
                filterRisk === lvl ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400/80 mb-2" />
            <h3 className="text-sm font-bold text-white">No Matching Incidents</h3>
            <p className="text-xs text-slate-400 mt-1">All sensor streams are within configured safety bounds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.risk_level === 'HIGH RISK';
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-5 transition-all ${
                  alert.resolved
                    ? 'border-slate-800/80 bg-slate-900/40 opacity-75'
                    : isHigh
                    ? 'border-red-500/60 bg-gradient-to-r from-red-950/40 to-slate-900/90 shadow-md shadow-red-950/30'
                    : 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 to-slate-900/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge level={alert.risk_level} size="sm" />
                      <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                        {alert.device_id}
                      </span>
                      {alert.resolved ? (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          RESOLVED
                        </span>
                      ) : alert.acknowledged ? (
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          ACKNOWLEDGED
                        </span>
                      ) : (
                        <span className="rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                          OPEN ALARM
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm font-bold text-white">{alert.title}</h2>
                    <p className="text-xs text-slate-300 max-w-2xl">{alert.message}</p>

                    {/* Sensor snapshot pill */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/60 rounded-lg p-2 border border-slate-800/60 w-fit">
                      <span>Temp: <strong className="text-white">{alert.sensor_snapshot.temperature}°C</strong></span>
                      <span>Smoke: <strong className="text-white">{alert.sensor_snapshot.smoke_ppm} ppm</strong></span>
                      <span>Flame IR: <strong className={alert.sensor_snapshot.flame_detected ? 'text-red-400' : 'text-emerald-400'}>
                        {alert.sensor_snapshot.flame_detected ? 'TRIGGERED' : 'CLEAR'}
                      </strong></span>
                      <span>Humidity: <strong className="text-white">{alert.sensor_snapshot.humidity}%</strong></span>
                    </div>

                    {alert.resolved && alert.notes && (
                      <p className="text-[11px] text-emerald-400/90 italic">
                        Resolution Note: "{alert.notes}" (at {new Date(alert.resolved_at || alert.timestamp).toLocaleTimeString()})
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                    {!alert.acknowledged && !alert.resolved && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}

                    {!alert.resolved && (
                      <button
                        onClick={() => setResolvingId(resolvingId === alert.id ? null : alert.id)}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Resolve Incident</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Resolve Note Editor */}
                {resolvingId === alert.id && (
                  <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Incident Resolution Notes (Audit trail):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Fire extinguished with CO2. Electrical breaker tripped. Area ventilated."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setResolvingId(null)}
                        className="rounded px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolveSubmit(alert.id)}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        Confirm Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
