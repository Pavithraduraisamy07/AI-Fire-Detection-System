import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveAs } from 'file-saver';
import {
  Cpu,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  Radio,
  Wifi,
  ExternalLink,
  Table,
  ShieldCheck,
  Send
} from 'lucide-react';
import { PROJECT_MANIFEST } from '../utils/projectZip';

export const IoTIntegrationView: React.FC = () => {
  const { devices, activeDevice, currentReading } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [testPayload, setTestPayload] = useState({
    device_id: 'ESP32-FIRE-ZONE-01',
    temperature: 52.5,
    humidity: 28.0,
    smoke_ppm: 420.0,
    flame_detected: true,
    flame_raw: 180,
    is_simulated: false
  });
  const [responseLog, setResponseLog] = useState<string | null>(null);

  const esp32CodeEntry = PROJECT_MANIFEST.find((f) => f.path.endsWith('.ino'));
  const esp32Code = esp32CodeEntry ? esp32CodeEntry.content : '// ESP32 Code';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(esp32Code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadIno = () => {
    const blob = new Blob([esp32Code], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'fire_detection_esp32.ino');
  };

  const simulateHardwarePost = () => {
    const res = {
      status: 200,
      timestamp: new Date().toISOString(),
      received_payload: testPayload,
      database_status: 'ROW_INSERTED_SQLITE',
      ml_inference: {
        risk_level: testPayload.flame_detected ? 'HIGH RISK' : testPayload.smoke_ppm > 250 ? 'WARNING' : 'NORMAL',
        confidence: 96.5,
        risk_score: testPayload.flame_detected ? 92.0 : 45.0
      },
      actuator_commands: {
        buzzer_active: testPayload.flame_detected,
        relay_fan: testPayload.flame_detected || testPayload.smoke_ppm > 300,
        relay_suppression: false
      }
    };
    setResponseLog(JSON.stringify(res, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-white">ESP32 IoT Node Integration Hub</h1>
            <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
              HTTP REST Ingestion
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Bidirectional interface between physical ESP32-WROOM microcontrollers and the FastAPI SQLite backend.
          </p>
        </div>

        <button
          onClick={downloadIno}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download .INO Sketch</span>
        </button>
      </div>

      {/* Grid: Pinout Table & Interactive API Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hardware Pinout Schematics Table */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">ESP32 GPIO Wiring Pinout Table</h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">ESP32-WROOM-32</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-2 font-semibold">Sensor / Actuator</th>
                  <th className="pb-2 font-semibold">Device Pin</th>
                  <th className="pb-2 font-semibold">ESP32 GPIO</th>
                  <th className="pb-2 font-semibold">Signal Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">DHT11 Temp / Humidity</td>
                  <td className="py-2.5 text-slate-400">DATA (Pin 2)</td>
                  <td className="py-2.5 text-cyan-400 font-bold">GPIO 4</td>
                  <td className="py-2.5 text-[11px]">Digital 1-Wire</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">MQ-2 Smoke & Gas</td>
                  <td className="py-2.5 text-slate-400">AOUT (Analog)</td>
                  <td className="py-2.5 text-amber-400 font-bold">GPIO 34 (ADC1)</td>
                  <td className="py-2.5 text-[11px]">Analog (0-3.3V)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">Optical Flame IR (YG1006)</td>
                  <td className="py-2.5 text-slate-400">DO (Digital)</td>
                  <td className="py-2.5 text-rose-400 font-bold">GPIO 14</td>
                  <td className="py-2.5 text-[11px]">Digital Active LOW</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">Optical Flame IR (YG1006)</td>
                  <td className="py-2.5 text-slate-400">AO (Analog)</td>
                  <td className="py-2.5 text-rose-400 font-bold">GPIO 35 (ADC1)</td>
                  <td className="py-2.5 text-[11px]">Analog (0-3.3V)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">Piezo Buzzer Siren</td>
                  <td className="py-2.5 text-slate-400">VCC (+)</td>
                  <td className="py-2.5 text-purple-400 font-bold">GPIO 26</td>
                  <td className="py-2.5 text-[11px]">Digital High / Tone</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">Relay 1: Exhaust Fan</td>
                  <td className="py-2.5 text-slate-400">IN1</td>
                  <td className="py-2.5 text-emerald-400 font-bold">GPIO 27</td>
                  <td className="py-2.5 text-[11px]">Active LOW Relay</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-bold text-white">Relay 2: Suppression Valve</td>
                  <td className="py-2.5 text-slate-400">IN2</td>
                  <td className="py-2.5 text-red-400 font-bold">GPIO 32</td>
                  <td className="py-2.5 text-[11px]">Active LOW Solenoid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Interactive Hardware HTTP Request Simulator */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">ESP32 REST Ingest Tester</h2>
            </div>
            <button
              onClick={simulateHardwarePost}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Simulate HTTP POST</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Simulate an incoming HTTP POST from an ESP32 node to <code className="text-cyan-300">/api/sensor/readings</code>:
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Temperature (°C):</label>
              <input
                type="number"
                value={testPayload.temperature}
                onChange={(e) => setTestPayload({ ...testPayload, temperature: parseFloat(e.target.value) })}
                className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Smoke MQ-2 (ppm):</label>
              <input
                type="number"
                value={testPayload.smoke_ppm}
                onChange={(e) => setTestPayload({ ...testPayload, smoke_ppm: parseFloat(e.target.value) })}
                className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Humidity (%):</label>
              <input
                type="number"
                value={testPayload.humidity}
                onChange={(e) => setTestPayload({ ...testPayload, humidity: parseFloat(e.target.value) })}
                className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="testFlameCheck"
                checked={testPayload.flame_detected}
                onChange={(e) => setTestPayload({ ...testPayload, flame_detected: e.target.checked })}
                className="h-4 w-4 rounded accent-red-500"
              />
              <label htmlFor="testFlameCheck" className="text-slate-300 font-semibold cursor-pointer">
                Flame IR Detected
              </label>
            </div>
          </div>

          {responseLog && (
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48">
              <pre>{responseLog}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Arduino IDE Code Viewer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Arduino IDE ESP32 Firmware Source Code</h2>
            <span className="text-xs font-mono text-slate-400">fire_detection_esp32.ino</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={downloadIno}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .INO</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
          <pre>{esp32Code}</pre>
        </div>
      </div>
    </div>
  );
};
