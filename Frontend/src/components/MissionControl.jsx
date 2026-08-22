import { useState, useRef } from 'react';
import { 
  RotateCcw, 
  UploadCloud, 
  Flame, 
  Waves, 
  Sprout, 
  Building2, 
  AlertOctagon, 
  Zap, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { PRECONFIGURED_SCENARIOS } from '../data/sampleDatasets';

export default function MissionControl({ 
  onAnalyze, 
  isProcessing, 
  selectedScenario, 
  setSelectedScenario,
  onPreImageChange,
  onPostImageChange,
  postImageFile
}) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [preFileName, setPreFileName] = useState(null);
  const [postFileName, setPostFileName] = useState(null);

  const preInputRef = useRef(null);
  const postInputRef = useRef(null);

  const filteredScenarios = PRECONFIGURED_SCENARIOS.filter(s => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'SEISMIC') return s.type === 'EARTHQUAKE';
    if (categoryFilter === 'FLOOD') return s.type === 'FLOOD';
    if (categoryFilter === 'AGRI') return s.type === 'AGRICULTURE';
    if (categoryFilter === 'INFRA') return s.type === 'INFRASTRUCTURE';
    if (categoryFilter === 'EDGE') return s.type === 'FALSE_POSITIVE' || s.type === 'UNCERTAIN' || s.type === 'BASELINE';
    return true;
  });

  const handleScenarioTileClick = (scenario) => {
    setSelectedScenario(scenario);
    setPreFileName(null);
    setPostFileName(null);
  };

  const handlePreFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreFileName(file.name);
      if (onPreImageChange) onPreImageChange(file);
    }
  };

  const handlePostFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostFileName(file.name);
      if (onPostImageChange) onPostImageChange(file);
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const handleExecute = async () => {
    let finalImagePath = selectedScenario.postImage;
    if (postImageFile) {
      finalImagePath = await fileToBase64(postImageFile);
    }

    const payload = {
      asset_id: selectedScenario.asset_id,
      lat: selectedScenario.lat,
      lon: selectedScenario.lon,
      image_path: finalImagePath,
      claim_desc: selectedScenario.claim_desc,
      claim_amount: selectedScenario.claim_amount,
      field_report: selectedScenario.field_report,
    };

    onAnalyze(payload);
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'EARTHQUAKE': return <Flame className="h-3.5 w-3.5 text-orange-400" />;
      case 'FLOOD': return <Waves className="h-3.5 w-3.5 text-cyan-400" />;
      case 'AGRICULTURE': return <Sprout className="h-3.5 w-3.5 text-emerald-400" />;
      case 'INFRASTRUCTURE': return <Building2 className="h-3.5 w-3.5 text-blue-400" />;
      default: return <AlertOctagon className="h-3.5 w-3.5 text-purple-400" />;
    }
  };

  return (
    <aside className="rounded-xl border border-slate-800 bg-[#0E1626]/80 p-4 shadow-2xl flex flex-col justify-between space-y-4">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="rounded bg-orange-950/80 border border-orange-500/60 px-1.5 py-0.5 font-mono text-[11px] font-bold text-orange-400">
            01
          </span>
          <h2 className="font-mono text-xs font-black uppercase tracking-widest text-slate-200">
            MISSION CONTROL
          </h2>
          <span className="ml-auto text-[10px] font-mono text-slate-400 border border-slate-800 px-2 py-0.5 rounded bg-[#080D18]">
            {PRECONFIGURED_SCENARIOS.length} Scenarios
          </span>
        </div>

        {/* Category Filters */}
        <div>
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-mono font-bold">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'SEISMIC', label: 'SEISMIC' },
              { id: 'FLOOD', label: 'FLOOD' },
              { id: 'AGRI', label: 'CROPS' },
              { id: 'INFRA', label: 'INFRA' },
              { id: 'EDGE', label: 'EDGE CASES' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2 py-1 rounded transition cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Pre-Configured Scenarios */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredScenarios.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleScenarioTileClick(scenario)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-950/30 ring-1 ring-orange-500 shadow-md shadow-orange-950/40'
                      : 'border-slate-800 bg-[#080D18]/80 hover:border-slate-700 hover:bg-[#080D18]'
                  }`}
                >
                  <div className="shrink-0">
                    {getCategoryIcon(scenario.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold text-slate-100 truncate">
                      {scenario.shortLabel}
                    </p>
                    <p className="font-mono text-[9px] text-slate-500 truncate">
                      {scenario.code}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Active Scenario Summary */}
          <div className="rounded-lg border border-slate-800 bg-[#080D18] p-2.5 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between items-center text-slate-300 font-bold">
              <span className="truncate">{selectedScenario.label}</span>
              <span className="text-orange-400 shrink-0 ml-1">{selectedScenario.asset_id}</span>
            </div>
            <p className="text-slate-400 text-[9px] line-clamp-1">{selectedScenario.region} • Pop: {selectedScenario.population_affected}</p>
          </div>

          {/* Load Scenario Imagery Button */}
          <button
            type="button"
            onClick={() => {
              setPreFileName(null);
              setPostFileName(null);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700/60 bg-[#0B1220] py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 text-slate-400" />
            <span>Reload Scenario Feeds</span>
          </button>
        </div>

        {/* Section 2: Upload Custom Imagery */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            OR UPLOAD CUSTOM IMAGERY
          </label>

          {/* Drag and Drop Zone */}
          <div 
            onClick={() => postInputRef.current?.click()}
            className="rounded-xl border border-dashed border-slate-700/80 bg-[#080D18]/60 p-3 text-center cursor-pointer hover:border-orange-500/60 hover:bg-[#080D18] transition flex flex-col items-center justify-center gap-1"
          >
            <UploadCloud className="h-5 w-5 text-blue-400" />
            <p className="text-[11px] font-semibold text-slate-200">
              Drag & drop before / after imagery
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              PNG, JPG, WebP (up to 15MB)
            </p>
          </div>

          {/* Pre-Disaster Baseline */}
          <div className="space-y-0.5">
            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              PRE-DISASTER BASELINE
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => preInputRef.current?.click()}
                className="shrink-0 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
              >
                Browse Pre
              </button>
              <span className="text-[11px] text-slate-400 font-mono truncate">
                {preFileName || 'Select baseline image...'}
              </span>
              <input 
                ref={preInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePreFileSelected} 
              />
            </div>
          </div>

          {/* Post-Disaster Capture */}
          <div className="space-y-0.5">
            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              POST-DISASTER CAPTURE
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => postInputRef.current?.click()}
                className="shrink-0 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
              >
                Browse Post
              </button>
              <span className="text-[11px] text-slate-400 font-mono truncate">
                {postFileName || 'Select post image...'}
              </span>
              <input 
                ref={postInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePostFileSelected} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleExecute}
          disabled={isProcessing}
          className="w-full rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 py-3 text-xs font-mono font-black uppercase tracking-wider text-white shadow-xl shadow-orange-950/60 transition-all border border-orange-400/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
              <span>Analyzing Disaster Feed...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-amber-200" />
              <span>⌘ Execute AI Damage Assessment</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
