import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  FileCode,
  FileText,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { downloadProjectZip, PROJECT_MANIFEST, ProjectFileEntry } from '../utils/projectZip';

export const ProjectExportView: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [selectedFile, setSelectedFile] = useState<ProjectFileEntry>(PROJECT_MANIFEST[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      setDownloadPercent(10);
      setStatusText('Bundling project tree & artifacts...');
      await downloadProjectZip((percent, file) => {
        setDownloadPercent(percent);
        setStatusText(`Packaging: ${file}`);
      });
      setStatusText('Download completed successfully!');
      setTimeout(() => {
        setDownloading(false);
        setDownloadPercent(0);
        setStatusText('');
      }, 3000);
    } catch (e) {
      console.error(e);
      setDownloading(false);
      setStatusText('Download failed. Please try again.');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero ZIP Download Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 sm:p-8 shadow-xl shadow-cyan-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                READY-TO-RUN ZIP ARCHIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">AI_Fire_Detection_and_Prevention_System.zip</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Export Complete Full-Stack IoT & ML Project
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Contains 100% of the project source code: React 19 Vite Frontend, Python FastAPI Backend, SQLite Database
              setup, Scikit-learn Machine Learning pipeline with 1,000-sample dataset, ESP32 Arduino C++ firmware,
              documentation, and a one-click <code className="text-cyan-300">start_project.bat</code> launcher for Windows VS Code!
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-sm font-black text-white hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-950 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Download className={`h-5 w-5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? `PACKAGING ${downloadPercent}%` : 'DOWNLOAD COMPLETE PROJECT (.ZIP)'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Clean archive: Excludes node_modules, Python venv & temporary caches
            </span>
          </div>
        </div>

        {downloading && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-cyan-300">
              <span>{statusText}</span>
              <span>{downloadPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${downloadPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* VS Code Windows 10/11 Step-by-Step Execution Guide */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Visual Studio Code Execution Instructions (Windows 10/11)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs">1</span>
              <span>Extract & Open</span>
            </div>
            <p className="text-slate-400">
              Extract <code className="text-slate-200">AI_Fire_Detection_and_Prevention_System.zip</code>. Open the extracted folder in VS Code via <code className="text-cyan-300">File -&gt; Open Folder</code>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs">2</span>
              <span>One-Click Launch</span>
            </div>
            <p className="text-slate-400">
              Double-click <code className="text-emerald-400 font-bold">start_project.bat</code> or run it in VS Code integrated terminal:
              <pre className="mt-1 rounded bg-slate-900 p-1 text-[11px] font-mono text-cyan-300">.\start_project.bat</pre>
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs">3</span>
              <span>Auto Setup & Train</span>
            </div>
            <p className="text-slate-400">
              The batch script creates Python venv, installs <code className="text-slate-200">requirements.txt</code>, trains the ML model on <code className="text-slate-200">fire_sensor_data.csv</code>, and initializes SQLite.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs">4</span>
              <span>Open in Browser</span>
            </div>
            <p className="text-slate-400">
              Dashboard: <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-cyan-400 underline">http://localhost:3000</a>
              <br />
              FastAPI Docs: <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-cyan-400 underline">http://localhost:8000/docs</a>
              <br />
              Login: <span className="font-mono text-white">admin / admin123</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Project File Explorer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderArchive className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Project File Explorer & Manifest Inspector</h2>
          </div>
          <span className="text-xs text-slate-400">{PROJECT_MANIFEST.length} Bundled Source Files</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File list tree */}
          <div className="lg:col-span-4 space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {PROJECT_MANIFEST.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFile(file)}
                className={`flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-xs transition-all ${
                  selectedFile.path === file.path
                    ? 'border border-cyan-500/50 bg-cyan-950/30 text-white'
                    : 'border border-transparent bg-slate-950/50 text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                }`}
              >
                {file.path.endsWith('.py') || file.path.endsWith('.ts') ? (
                  <FileCode className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                ) : file.path.endsWith('.ino') ? (
                  <Cpu className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : file.path.endsWith('.bat') ? (
                  <Terminal className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div className="truncate">
                  <p className="font-mono font-medium truncate">{file.path}</p>
                  <p className="text-[10px] text-slate-400 truncate">{file.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Selected file preview */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{selectedFile.path}</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-400">
                  {selectedFile.category}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[420px] font-mono text-xs text-slate-300">
              <pre>{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
