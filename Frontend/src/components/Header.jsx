import { useState } from 'react';
import { 
  Settings, 
  Check, 
  RefreshCw,
  FileDown,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

export default function Header({ 
  backendStatus, 
  onRefresh, 
  isRefreshing, 
  onStatusChange,
  currentAssessment,
  onDownloadReport,
  isDownloading
}) {
  const [showConfig, setShowConfig] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
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
          
          {/* Download Official Report Button (Visible when assessment is loaded) */}
          {currentAssessment && (
            <div className="relative">
              <div className="flex items-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg shadow-orange-950/50 border border-orange-400/40">
                <button
                  onClick={() => onDownloadReport && onDownloadReport('pdf')}
                  disabled={isDownloading}
                  className="px-3 py-1.5 font-bold text-white flex items-center gap-1.5 hover:from-orange-500 hover:to-amber-500 transition cursor-pointer disabled:opacity-50"
                  title="Download Official Assessment PDF"
                >
                  <FileDown className={`h-3.5 w-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Downloading...' : 'Download PDF Dossier'}</span>
                </button>

                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-1.5 py-1.5 border-l border-orange-500/50 hover:bg-orange-500/30 text-white transition cursor-pointer"
                  title="More Formats"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Dropdown for other formats */}
              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-50 text-[11px]">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onDownloadReport('pdf');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 font-bold transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Official PDF</span>
                    <span className="text-[9px] text-orange-400 font-mono">.pdf</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onDownloadReport('json');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Raw JSON Data</span>
                    <span className="text-[9px] text-cyan-400 font-mono">.json</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onDownloadReport('markdown');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Markdown Doc</span>
                    <span className="text-[9px] text-emerald-400 font-mono">.md</span>
                  </button>
                </div>
              )}
            </div>
          )}

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
                className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <Check className="h-3.5 w-3.5" /> : null}
                {savedSuccess ? 'Saved!' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={() => setShowConfig(false)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
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
