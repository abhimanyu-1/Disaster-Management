import { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Eye, 
  ClipboardList, 
  DollarSign, 
  ShieldAlert, 
  Flame, 
  Waves, 
  Building2, 
  Sprout, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Compass
} from 'lucide-react';
import { PRECONFIGURED_SCENARIOS } from '../data/sampleDatasets';

export default function GeospatialOps({ 
  onSelectIncident, 
  onNavigateTab 
}) {
  const [selectedIncident, setSelectedIncident] = useState(PRECONFIGURED_SCENARIOS[0]);
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  
  // Layer toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showInundation, setShowInundation] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'satellite'

  const filteredIncidents = PRECONFIGURED_SCENARIOS.filter((item) => {
    const matchRegion = regionFilter === 'ALL' || item.region.includes(regionFilter);
    const matchType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchSeverity = severityFilter === 'ALL' || item.ground_truth_severity === severityFilter;
    return matchRegion && matchType && matchSeverity;
  });

  // Coordinate projection mapping to 0-100% SVG coordinates
  // Mapping Lat (-90 to 90) and Lon (-180 to 180) to X, Y percentages
  const projectCoords = (lat, lon) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(12, Math.min(88, y)) };
  };

  const getSeverityPinColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return { bg: 'bg-rose-500', ring: 'ring-rose-500/50', border: 'border-rose-400', text: 'text-rose-400' };
      case 'HIGH': return { bg: 'bg-orange-500', ring: 'ring-orange-500/50', border: 'border-orange-400', text: 'text-orange-400' };
      case 'MEDIUM': return { bg: 'bg-amber-400', ring: 'ring-amber-400/50', border: 'border-amber-300', text: 'text-amber-400' };
      case 'UNCERTAIN': return { bg: 'bg-purple-500', ring: 'ring-purple-500/50', border: 'border-purple-400', text: 'text-purple-400' };
      default: return { bg: 'bg-emerald-500', ring: 'ring-emerald-500/50', border: 'border-emerald-400', text: 'text-emerald-400' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Layer Control Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-orange-400" /> Filters:
          </span>

          {/* Region */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Regions</option>
            <option value="America">Americas</option>
            <option value="Asia">South Asia</option>
            <option value="Gulf">Gulf Coast</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Disaster Types</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="FLOOD">Flood</option>
            <option value="AGRICULTURE">Agricultural Crop</option>
            <option value="INFRASTRUCTURE">Critical Infrastructure</option>
            <option value="FALSE_POSITIVE">False Positive Test</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#080D18] px-2.5 py-1 text-slate-200 focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="NO_DAMAGE">No Damage</option>
          </select>
        </div>

        {/* Tactical Layer Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-blue-400" /> Layers:
          </span>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer ${
              showHeatmap ? 'bg-orange-950/80 border-orange-500/70 text-orange-300' : 'bg-[#080D18] border-slate-800 text-slate-500'
            }`}
          >
            Heatmap
          </button>

          <button
            onClick={() => setShowInundation(!showInundation)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer ${
              showInundation ? 'bg-blue-950/80 border-blue-500/70 text-blue-300' : 'bg-[#080D18] border-slate-800 text-slate-500'
            }`}
          >
            Flood Zones
          </button>

          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer ${
              showCorridors ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300' : 'bg-[#080D18] border-slate-800 text-slate-500'
            }`}
          >
            Corridors
          </button>
        </div>

      </div>

      {/* Main Map + Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Interactive Tactical Map Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#080D18] p-3 shadow-2xl relative min-h-[560px] flex flex-col justify-between overflow-hidden select-none">
          
          {/* Map Header Overlay */}
          <div className="absolute top-5 left-5 z-20 flex items-center gap-3 bg-[#0B111E]/90 border border-slate-700/80 rounded-xl px-3.5 py-2 backdrop-blur font-mono text-xs">
            <Compass className="h-4 w-4 text-orange-400 animate-spin" style={{ animationDuration: '15s' }} />
            <div>
              <span className="font-bold text-white uppercase">GIS Tactical Overview</span>
              <span className="text-[10px] text-slate-400 block">{filteredIncidents.length} Plotted Incidents</span>
            </div>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-5 left-5 z-20 bg-[#0B111E]/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur font-mono text-[10px] space-y-1.5">
            <span className="font-bold text-slate-300 uppercase block mb-1">Threat Priority Tiers</span>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" /><span className="text-rose-300">Tier 1 (Critical Collapse)</span></div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /><span className="text-orange-300">Tier 2 (High Inundation)</span></div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="text-amber-300">Tier 3 (Moderate Impact)</span></div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-emerald-300">Baseline / Zero Damage</span></div>
          </div>

          {/* SVG Map Grid & Interactive Markers */}
          <div className="relative w-full h-[540px] rounded-lg overflow-hidden bg-[#060911] border border-slate-900">
            {/* Background Tactical Grid */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />

            {/* SVG Overlays (Continents outline / zones) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Latitude / Longitude Guidelines */}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

              {/* Priority Zones Radii */}
              {showHeatmap && filteredIncidents.map((inc) => {
                const { x, y } = projectCoords(inc.lat, inc.lon);
                const isCrit = inc.ground_truth_severity === 'CRITICAL';
                return (
                  <g key={`heat-${inc.id}`}>
                    <circle 
                      cx={`${x}%`} 
                      cy={`${y}%`} 
                      r={isCrit ? '45' : '30'} 
                      fill={isCrit ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.08)'} 
                      stroke={isCrit ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.2)'} 
                      strokeWidth="1" 
                      strokeDasharray="3 3"
                    />
                  </g>
                );
              })}

              {/* Evacuation Corridors Lines */}
              {showCorridors && (
                <g stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                  <line x1="22%" y1="48%" x2="35%" y2="52%" />
                  <line x1="72%" y1="36%" x2="80%" y2="40%" />
                </g>
              )}
            </svg>

            {/* Clickable Incident Pins */}
            {filteredIncidents.map((incident) => {
              const { x, y } = projectCoords(incident.lat, incident.lon);
              const isSelected = selectedIncident.id === incident.id;
              const color = getSeverityPinColor(incident.ground_truth_severity);

              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                >
                  {/* Glowing Radar Pulse */}
                  <div className={`absolute -inset-2 rounded-full ${color.bg} opacity-30 group-hover:opacity-75 animate-ping`} />

                  {/* Pin Badge */}
                  <div className={`relative h-7 w-7 rounded-xl border-2 ${color.border} ${isSelected ? 'bg-white text-slate-950 scale-125 ring-4 ring-orange-500/50' : `${color.bg} text-white`} flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-110`}>
                    <MapPin className="h-4 w-4" />
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-9 hidden group-hover:flex items-center gap-1.5 rounded bg-slate-950/95 border border-slate-700 px-2 py-1 shadow-2xl whitespace-nowrap font-mono text-[10px] text-white z-40">
                    <span className="font-bold">{incident.shortLabel}</span>
                    <span className={color.text}>({incident.ground_truth_severity})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Detail Card & Cross-Workflow Action Panel (4 cols on lg) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl flex flex-col justify-between space-y-4 font-mono">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  {selectedIncident.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {selectedIncident.label}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedIncident.region}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getSeverityPinColor(selectedIncident.ground_truth_severity).border} ${getSeverityPinColor(selectedIncident.ground_truth_severity).text}`}>
                {selectedIncident.ground_truth_severity}
              </span>
            </div>

            {/* Satellite Imagery Thumbnail Preview */}
            <div className="relative h-36 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={selectedIncident.postImage}
                alt={selectedIncident.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#080D18]/90 border border-slate-700 px-2 py-0.5 rounded text-[9px] text-slate-200">
                Asset ID: {selectedIncident.asset_id}
              </div>
              <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold">
                {(selectedIncident.predicted_confidence * 100).toFixed(0)}% AI Conf.
              </div>
            </div>

            {/* Key Telemetry Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#080D18] p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">GPS Location</span>
                <span className="text-slate-200 font-bold text-[10px]">
                  {selectedIncident.lat.toFixed(4)}°N, {selectedIncident.lon.toFixed(4)}°W
                </span>
              </div>

              <div className="bg-[#080D18] p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">Population Impact</span>
                <span className="text-white font-bold">{selectedIncident.population_affected.toLocaleString()} residents</span>
              </div>

              <div className="bg-[#080D18] p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">Claim Estimate</span>
                <span className="text-orange-400 font-bold">${selectedIncident.claim_amount.toLocaleString()}</span>
              </div>

              <div className="bg-[#080D18] p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">Ground Verdict</span>
                <span className="text-emerald-400 font-bold truncate block">{selectedIncident.structural_integrity}</span>
              </div>
            </div>

            {/* Field Notes Snapshot */}
            <div className="bg-[#080D18] p-2.5 rounded-lg border border-slate-800 text-[10px] space-y-1">
              <span className="text-slate-500 font-bold uppercase block">Field Summary:</span>
              <p className="text-slate-300 leading-relaxed line-clamp-3">
                {selectedIncident.field_report}
              </p>
            </div>
          </div>

          {/* Workflow Deep-Link Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (onSelectIncident) onSelectIncident(selectedIncident);
                if (onNavigateTab) onNavigateTab('recon');
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 py-2 text-xs font-bold text-white transition shadow cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Analyze in Optical Recon</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onSelectIncident) onSelectIncident(selectedIncident);
                  if (onNavigateTab) onNavigateTab('field');
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 py-1.5 text-[11px] text-slate-300 transition cursor-pointer"
              >
                <ClipboardList className="h-3.5 w-3.5 text-blue-400" />
                <span>Field Report</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectIncident) onSelectIncident(selectedIncident);
                  if (onNavigateTab) onNavigateTab('claims');
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 py-1.5 text-[11px] text-slate-300 transition cursor-pointer"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>Claims Triage</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
