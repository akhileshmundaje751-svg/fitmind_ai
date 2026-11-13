import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Flame,
  Globe,
  HelpCircle,
  Laptop,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { UnitSystem, UserProfile } from '../../types';

interface SettingsViewProps {
  units: UnitSystem;
  onSetUnits: (units: UnitSystem) => void;
  onResetData: () => Promise<void>;
  onEditProfile: () => void;
  geminiConnected: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  units,
  onSetUnits,
  onResetData,
  onEditProfile,
  geminiConnected,
}) => {
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    window.location.href = '/api/export';
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Failed to import database file.');
      }
    } catch (err) {
      alert('Invalid JSON file format.');
    }
  };

  const executeReset = async () => {
    setIsResetting(true);
    try {
      await onResetData();
      setConfirmReset(false);
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            System & Data Preferences
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
          Settings & Local Management
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Configure units, export your full biometric and workout archive, manage database persistence, or prepare for desktop packaging.
        </p>
      </div>

      <div className="space-y-6">
        {/* Unit Preferences */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Measurement Unit System
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Toggle between Metric (kilograms, centimeters) and Imperial (pounds, inches).
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              <button
                onClick={() => onSetUnits('metric')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  units === 'metric'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                onClick={() => onSetUnits('imperial')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  units === 'imperial'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Imperial (lbs/in)
              </button>
            </div>
          </div>
        </div>

        {/* AI Engine Status & Configuration */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Gemini 3.8 Flash AI Engine
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Powers structured meal and workout generation, single-meal replacements, and conversational fitness reasoning.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                geminiConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${geminiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
              {geminiConnected ? 'Connected & Active' : 'Deterministic Mode Ready'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
            <div className="font-semibold text-zinc-200">How FitMind AI handles intelligence:</div>
            <ul className="space-y-1 list-disc pl-4 text-zinc-400 text-[11px]">
              <li><strong>Mathematical Isolation:</strong> BMI, US Navy body fat, Mifflin-St Jeor BMR, and TDEE are computed deterministically. AI never invents calculations.</li>
              <li><strong>Zero Cloud Data Leak:</strong> API keys are held strictly in server environment variables and never sent to client browsers.</li>
              <li><strong>Offline Fallbacks:</strong> If the model endpoint is temporarily unavailable, certified fallback plans generate instantaneously without breaking the app.</li>
            </ul>
          </div>
        </div>

        {/* Desktop Application Architecture */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              Windows Desktop Application Packaging (Phase 7 Ready)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            FitMind AI is built with an decoupled REST backend and persistent local JSON database, making it 100% turnkey to bundle into a native Windows 10/11 desktop executable using <strong>Electron</strong> or <strong>Tauri</strong>.
          </p>
          <div className="p-3.5 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800/80 space-y-1 overflow-x-auto">
            <p className="text-zinc-500"># To bundle into Windows desktop .exe with Tauri / Electron:</p>
            <p className="text-emerald-400">npm run build</p>
            <p className="text-emerald-400">npx tauri build  # or npx electron-builder --win</p>
          </div>
        </div>

        {/* Data Backup & Migration */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Database Backup & Data Portability</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Export your full user profile, anthropometric records, and saved plans as a single JSON file.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Database (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import Database Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Danger Zone: Reset Profile */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Danger Zone: Reset All Personal Data
            </h3>
            <p className="text-xs text-red-400/80 mt-0.5">
              Permanently purges all saved measurements, diet plans, workout schedules, progress records, and conversation history.
            </p>
          </div>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset FitMind AI Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={executeReset}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold transition-all"
              >
                {isResetting ? 'Purging...' : 'Confirm Permanent Deletion'}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
