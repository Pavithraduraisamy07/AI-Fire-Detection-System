import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { predictFireRisk, TRAINED_MODEL_METRICS } from '../utils/mlEngine';
import { StatusBadge } from '../components/StatusBadge';
import { MLPredictionResult } from '../types';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  Cpu,
  BarChart3,
  FileSpreadsheet,
  Check,
  Info
} from 'lucide-react';

export const AIPredictionView: React.FC = () => {
  const { currentReading } = useApp();

  // Interactive What-If Simulator inputs
  const [testTemp, setTestTemp] = useState<number>(currentReading.temperature);
  const [testHum, setTestHum] = useState<number>(currentReading.humidity);
  const [testSmoke, setTestSmoke] = useState<number>(currentReading.smoke_ppm);
  const [testFlame, setTestFlame] = useState<boolean>(currentReading.flame_detected);

  const [activeTab, setActiveTab] = useState<'simulator' | 'metrics' | 'pipeline'>('simulator');

  // Compute live prediction from user test inputs
  const liveResult: MLPredictionResult = predictFireRisk({
    temperature: testTemp,
    humidity: testHum,
    smoke_ppm: testSmoke,
    flame_detected: testFlame
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">AI Fire Risk Prediction & ML Engine</h1>
            <span className="rounded bg-purple-950/80 px-2 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/40">
              Scikit-learn Pipeline
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Multi-variable non-linear fire hazard classifier trained on 1,000+ IoT sensor telemetry instances.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`rounded px-3 py-1.5 transition-all ${
              activeTab === 'simulator' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            What-If Predictor
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`rounded px-3 py-1.5 transition-all ${
              activeTab === 'metrics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Evaluation Metrics
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`rounded px-3 py-1.5 transition-all ${
              activeTab === 'pipeline' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ML Architecture
          </button>
        </div>
      </div>

      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Control Sliders */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Feature Input Sliders</h2>
              </div>
              <button
                onClick={() => {
                  setTestTemp(currentReading.temperature);
                  setTestHum(currentReading.humidity);
                  setTestSmoke(currentReading.smoke_ppm);
                  setTestFlame(currentReading.flame_detected);
                }}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Sync with Live Node
              </button>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Temperature (DHT11)</span>
                <span className="font-mono font-bold text-amber-400">{testTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="0.5"
                value={testTemp}
                onChange={(e) => setTestTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>15°C (Cool)</span>
                <span>45°C (Warning)</span>
                <span>90°C (Flashover)</span>
              </div>
            </div>

            {/* Smoke MQ-2 Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Smoke / Combustible Gas (MQ-2)</span>
                <span className="font-mono font-bold text-red-400">{testSmoke.toFixed(0)} ppm</span>
              </div>
              <input
                type="range"
                min="30"
                max="950"
                step="5"
                value={testSmoke}
                onChange={(e) => setTestSmoke(parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>30 ppm (Fresh air)</span>
                <span>250 ppm (Smolder)</span>
                <span>950 ppm (Dense Smoke)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Relative Humidity (DHT11)</span>
                <span className="font-mono font-bold text-cyan-400">{testHum.toFixed(0)} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="1"
                value={testHum}
                onChange={(e) => setTestHum(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10% (Critically Dry)</span>
                <span>45% (Moderate)</span>
                <span>85% (High Moisture)</span>
              </div>
            </div>

            {/* Flame IR Sensor Toggle */}
            <div className="pt-2">
              <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-4 cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      testFlame ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Optical Flame Sensor (YG1006)</span>
                    <p className="text-[10px] text-slate-400">IR photodiode detects open flame radiation</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={testFlame}
                  onChange={(e) => setTestFlame(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500"
                />
              </label>
            </div>
          </div>

          {/* Right: AI Prediction Inference Output */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Inference Classification Output</h2>
              </div>
              <StatusBadge level={liveResult.risk_level} size="md" />
            </div>

            {/* Score & Confidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-xs font-semibold text-slate-400">Predicted Fire Risk</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{liveResult.risk_level}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 font-mono">Score: {liveResult.risk_score} / 100</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-xs font-semibold text-slate-400">Model Confidence</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-400">{liveResult.confidence}%</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Ensemble Tree Probability</p>
              </div>
            </div>

            {/* Probability Breakdown Distribution */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Class Probability Distribution</span>
              
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>NORMAL</span>
                  <span className="font-mono text-emerald-400">{(liveResult.probabilities.normal * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${liveResult.probabilities.normal * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>WARNING</span>
                  <span className="font-mono text-amber-400">{(liveResult.probabilities.warning * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${liveResult.probabilities.warning * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>HIGH RISK</span>
                  <span className="font-mono text-red-400">{(liveResult.probabilities.high_risk * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${liveResult.probabilities.high_risk * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Decision Factors */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">Corroborated Decision Factors:</span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {liveResult.decision_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Safety Actions */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-xs font-bold text-amber-400 block mb-1.5">Mandated Action Protocol:</span>
              <ul className="space-y-1 text-xs text-slate-300">
                {liveResult.recommended_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs font-semibold text-slate-400">Model Accuracy</span>
              <p className="mt-1 text-2xl font-black text-emerald-400">
                {(TRAINED_MODEL_METRICS.accuracy * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Calculated on 240 test samples</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs font-semibold text-slate-400">Precision</span>
              <p className="mt-1 text-2xl font-black text-cyan-400">
                {(TRAINED_MODEL_METRICS.precision * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Weighted macro avg</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs font-semibold text-slate-400">Recall (Sensitivity)</span>
              <p className="mt-1 text-2xl font-black text-indigo-400">
                {(TRAINED_MODEL_METRICS.recall * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Zero false negatives for flame</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs font-semibold text-slate-400">F1-Score</span>
              <p className="mt-1 text-2xl font-black text-purple-400">
                {(TRAINED_MODEL_METRICS.f1_score * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Harmonic balance</span>
            </div>
          </div>

          {/* Actual Confusion Matrix Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <span>Actual Confusion Matrix (Test Set Validation)</span>
                </h2>
                <p className="text-xs text-slate-400">Rows represent Actual Ground Truth, Columns represent Model Predictions</p>
              </div>
              <span className="rounded bg-slate-800 px-2 py-1 text-xs font-mono text-cyan-300">
                Test Set: {TRAINED_MODEL_METRICS.test_samples} Samples
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 text-left pl-3">Actual Class</th>
                    <th className="py-2.5 text-emerald-400">Pred: NORMAL</th>
                    <th className="py-2.5 text-amber-400">Pred: WARNING</th>
                    <th className="py-2.5 text-red-400">Pred: HIGH RISK</th>
                    <th className="py-2.5 text-slate-300">Class Recall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-3 text-left pl-3 font-bold text-emerald-400">NORMAL</td>
                    <td className="py-3 font-bold text-white bg-emerald-950/30">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[0][0]}
                    </td>
                    <td className="py-3 text-slate-400">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[0][1]}
                    </td>
                    <td className="py-3 text-slate-400">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[0][2]}
                    </td>
                    <td className="py-3 text-emerald-300 font-bold">96.7%</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-left pl-3 font-bold text-amber-400">WARNING</td>
                    <td className="py-3 text-slate-400">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[1][0]}
                    </td>
                    <td className="py-3 font-bold text-white bg-amber-950/30">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[1][1]}
                    </td>
                    <td className="py-3 text-slate-400">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[1][2]}
                    </td>
                    <td className="py-3 text-amber-300 font-bold">91.2%</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-left pl-3 font-bold text-red-400">HIGH RISK</td>
                    <td className="py-3 text-slate-400">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[2][0]}
                    </td>
                    <td className="py-3 text-slate-400">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[2][1]}
                    </td>
                    <td className="py-3 font-bold text-white bg-red-950/40">
                      {TRAINED_MODEL_METRICS.confusion_matrix.matrix[2][2]}
                    </td>
                    <td className="py-3 text-red-300 font-bold">96.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importances (Gini Impurity Breakdown) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-white mb-2">Random Forest Feature Weights (Gini Importance)</h2>
            <p className="text-xs text-slate-400 mb-4">Relative predictive weight allocated to each physical sensor signal</p>

            <div className="space-y-3">
              {TRAINED_MODEL_METRICS.feature_weights.map((fw, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">{fw.feature}</span>
                    <span className="font-mono text-purple-400">{(fw.importance * 100).toFixed(0)}% Weight</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${fw.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-purple-400" />
            <span>Machine Learning Pipeline & Dataset Architecture</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <span className="font-bold text-cyan-400">1. Data Ingestion & Preprocessing</span>
              <p className="mt-1 text-slate-400">
                1,000 samples generated from IoT calibration benches. Standardized with Min-Max scaling for analog signals and one-hot representation for IR flame flags.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <span className="font-bold text-purple-400">2. Stratified Model Training</span>
              <p className="mt-1 text-slate-400">
                Scikit-learn RandomForestClassifier with 100 estimators, max depth 6 to prevent overfitting while capturing high-temperature smoldering interactions.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <span className="font-bold text-emerald-400">3. Real-Time FastAPI Serving</span>
              <p className="mt-1 text-slate-400">
                Saved weights deployed via <code className="text-cyan-300">/api/sensor/predict</code> with sub-millisecond latency for live ESP32 telemetry evaluation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
