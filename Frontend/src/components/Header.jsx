import { useState } from 'react';
import { 
  Satellite, 
  Map, 
  ClipboardList, 
  FileText, 
  DollarSign, 
  BarChart3, 
  ScrollText, 
  Network, 
  Settings, 
  Check, 
  RefreshCw,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';
import { api } from '../services/api';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  backendStatus, 
  onRefresh, 
  isRefreshing, 
  onStatusChange,
  isOfflineMode,
  setIsOfflineMode,
  offlineQueueCount,
  onSyncOfflineQueue,
  onOpenExportModal
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

  const navTabs = [
    { id: 'recon', label: 'Optical Recon', icon: Satellite },
    { id: 'gis', label: 'Geospatial Ops', icon: Map },
    { id: 'field', label: 'Field Ops', icon: ClipboardList },
    { id: 'claims', label: 'Claims & Relief', icon: DollarSign },
    { id: 'model', label: 'Model Evaluation', icon: BarChart3 },
    { id: 'audit', label: 'Audit & Telemetry', icon: ScrollText },
    { id: 'arch', label: 'Architecture & Trust', icon: Network },
  ];

  return (
    <header className="mb-4 rounded-xl border border-slate-800 bg-[#0B111E]/95 px-4 py-3 shadow-2xl relative">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-950/50 border border-orange-400/30 shrink-0">
            <span className="text-xl">🛰️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">DisasterIQ</h1>
              <span className="rounded border border-blue-500/60 bg-blue-950/40 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-blue-300">
                Enterprise EOC v2.4
              </span>
              <span className="hidden sm:inline-block rounded border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                Restricted Boundary Active
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">
              AI Damage Intelligence, Geospatial Coordination & Claims Verification
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800/90 bg-[#080D18] p-1 shadow-inner overflow-x-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Indicators & Offline Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Offline Mode Simulator Toggle */}
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            title="Toggle Offline Field Simulation Mode"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition cursor-pointer ${
              isOfflineMode
                ? 'border-amber-500 bg-amber-950/50 text-amber-300 animate-pulse'
                : 'border-slate-800 bg-[#080D18] text-slate-400 hover:text-slate-200'
            }`}
          >
            {isOfflineMode ? <WifiOff className="h-3.5 w-3.5 text-amber-400" /> : <Wifi className="h-3.5 w-3.5 text-emerald-400" />}
            <span>{isOfflineMode ? 'OFFLINE MODE' : 'ONLINE'}</span>
          </button>

          {/* Pending Sync Count */}
          {offlineQueueCount > 0 && (
            <button
              onClick={onSyncOfflineQueue}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-950/80 border border-orange-500/70 text-orange-300 font-mono text-[11px] font-bold hover:bg-orange-900 transition cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-orange-400" />
              <span>Sync ({offlineQueueCount})</span>
            </button>
          )}

          {/* Engine Status */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#080D18] px-2.5 py-1.5 font-mono text-[11px]">
            <span className="text-[10px] font-bold text-slate-500">ENGINE</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              {backendStatus?.online ? 'LIVE' : 'STUB'}
            </span>
          </div>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
            className="p-1.5 rounded-lg border border-slate-800 bg-[#080D18] text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Export Report Dossier Button */}
          <button
            onClick={onOpenExportModal}
            title="Generate Official Disaster Assessment Dossier"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-[11px] font-bold transition shadow-md shadow-orange-950/40 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Dossier</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            title="Configure API Endpoint"
            className="p-1.5 rounded-lg border border-slate-800 bg-[#080D18] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <form onSubmit={handleSaveConfig} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Local API Endpoint URL (On-Prem / Private Boundary)
              </label>
              <input 
                type="text" 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                type="submit"
                className="rounded-lg bg-orange-600 hover:bg-orange-500 px-3.5 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="h-3.5 w-3.5" /> : null}
                {savedSuccess ? 'Saved!' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={() => setShowConfig(false)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
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
