import { useState } from 'react';
import { 
  Settings, 
  Check, 
  RefreshCw,
  Activity,
  Radio
} from 'lucide-react';
import { api } from '../services/api';

export default function Header({ 
  backendStatus, 
  onRefresh, 
  isRefreshing, 
  onStatusChange 
}) {
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    api.setBaseUrl(apiUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    if (onStatusChange) {
      const health = await api.checkHealth();
      onStatusChange(health);
    }
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <header className="mb-4 rounded-2xl border border-slate-800 bg-[#0B111E]/95 px-5 py-3.5 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-950/50 border border-orange-400/30 shrink-0">
            <span className="text-xl">🛰️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">DisasterAI</h1>
              <span className="rounded-md border border-orange-500/40 bg-orange-950/40 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-orange-400">
                Multi-Agent Intelligence
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">
              Multimodal Damage Assessment, Spatial Bounding Box Localization & Relief Triage
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          {/* Live Backend Connection Indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#080D18] px-3 py-1.5">
            <span className="text-[10px] font-bold text-slate-500">API BACKEND:</span>
            <span className={`flex items-center gap-1.5 font-bold ${
              backendStatus?.online ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                backendStatus?.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`} />
              {backendStatus?.online ? (
                <span>CONNECTED {backendStatus.latency ? `(${backendStatus.latency}ms)` : ''}</span>
              ) : (
                <span>OFFLINE</span>
              )}
            </span>
          </div>

          {/* Refresh Health */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Check API Health"
            className="p-2 rounded-xl border border-slate-800 bg-[#080D18] text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            title="Configure Backend URL"
            className="p-2 rounded-xl border border-slate-800 bg-[#080D18] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <form onSubmit={handleSaveConfig} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                FastAPI Backend URL
              </label>
              <input 
                type="text" 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                type="submit"
                className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="h-3.5 w-3.5" /> : null}
                {savedSuccess ? 'Saved!' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={() => setShowConfig(false)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
