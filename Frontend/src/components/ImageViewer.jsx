import { useState, useRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Crosshair, 
  Tag, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

export default function ImageViewer({ 
  imageUrl, 
  assessment, 
  isProcessing, 
  userBBox, 
  setUserBBox,
  onQuickSampleSelect
}) {
  const [showAiBox, setShowAiBox] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Normalized bbox: [ymin, xmin, ymax, xmax] where coords are 0..1000
  const getBoxStyle = (bbox) => {
    if (!bbox || bbox.length !== 4) return { display: 'none' };
    const [ymin, xmin, ymax, xmax] = bbox;
    if (ymin === 0 && xmin === 0 && ymax === 0 && xmax === 0) return { display: 'none' };
    return {
      top: `${(ymin / 1000) * 100}%`,
      left: `${(xmin / 1000) * 100}%`,
      height: `${((ymax - ymin) / 1000) * 100}%`,
      width: `${((xmax - xmin) / 1000) * 100}%`,
    };
  };

  const handlePointerDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 1000;
    setIsDrawing(true);
    setDragStart({ x, y });
    setUserBBox([y, x, y, x]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1000, ((e.clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(0, Math.min(1000, ((e.clientY - rect.top) / rect.height) * 1000));

    setUserBBox([
      Math.min(dragStart.y, y),
      Math.min(dragStart.x, x),
      Math.max(dragStart.y, y),
      Math.max(dragStart.x, x),
    ]);
  };

  const handlePointerUp = (e) => {
    setIsDrawing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const aiBBox = assessment?.vision?.bounding_box;
  const damageDetected = assessment?.vision?.damage_detected;
  const damageType = assessment?.vision?.damage_type || 'Damage';
  const confidence = assessment?.vision?.confidence !== undefined 
    ? (assessment.vision.confidence * 100).toFixed(0) 
    : null;
  const evidenceList = assessment?.vision?.evidence || [];
  const severity = assessment?.assessment?.severity;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col">
      {/* Top Bar / Controls */}
      <div className="border-b border-slate-700/70 bg-slate-950/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Imagery Analysis & Spatial Localization
          </h3>
          {severity && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              severity === 'CRITICAL' || severity === 'HIGH' 
                ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300' 
                : severity === 'MEDIUM' 
                ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300' 
                : 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
            }`}>
              {severity} SEVERITY
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {userBBox && (
            <button
              onClick={() => setUserBBox(null)}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Clear HITL Box
            </button>
          )}

          {aiBBox && (
            <button
              onClick={() => setShowAiBox(!showAiBox)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              {showAiBox ? <Eye className="h-3 w-3 text-emerald-400" /> : <EyeOff className="h-3 w-3 text-slate-500" />}
              <span>AI Box</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Canvas */}
      <div className="relative bg-slate-950 min-h-[380px] md:min-h-[460px] flex items-center justify-center overflow-hidden select-none">
        {imageUrl ? (
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-[380px] md:h-[460px] cursor-crosshair touch-none flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt="Disaster Scene"
              className="w-full h-full object-contain pointer-events-none"
              draggable="false"
            />

            {/* Scanning line animation during processing */}
            {isProcessing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden bg-orange-950/20 backdrop-blur-[1px]">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] animate-scanline" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-950/80 border border-orange-500/50 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-orange-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-orange-200 tracking-wider">
                      VISION AGENT LOCALIZING DAMAGE GEOMETRY...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Bounding Box */}
            {showAiBox && damageDetected && aiBBox && !userBBox && (
              <div
                className="absolute border-[2.5px] border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(239,68,68,0.4)] pointer-events-none transition-all duration-500"
                style={getBoxStyle(aiBBox)}
              >
                <div className="absolute -top-7 left-[-2px] bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>{damageType.toUpperCase()} DETECTED</span>
                </div>
                {confidence && (
                  <div className="absolute -bottom-6 right-[-2px] bg-slate-950/90 text-rose-400 border border-rose-500/50 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    {confidence}% CONFIDENCE
                  </div>
                )}
              </div>
            )}

            {/* User HITL Drawn Bounding Box */}
            {userBBox && (
              <div
                className="absolute border-[2.5px] border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.5)] pointer-events-none"
                style={getBoxStyle(userBBox)}
              >
                <div className="absolute -top-7 left-[-2px] bg-amber-500 text-slate-950 font-mono text-[10px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                  <span>HITL REGION OVERRIDE</span>
                </div>
                <div className="absolute -bottom-6 left-[-2px] bg-slate-950/90 text-amber-300 border border-amber-500/50 font-mono text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  [{userBBox.map(n => Math.round(n)).join(', ')}]
                </div>
              </div>
            )}

            {/* Helper overlay instruction */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-medium text-slate-400 pointer-events-none flex items-center gap-1.5 backdrop-blur">
              <Crosshair className="h-3 w-3 text-slate-400" />
              <span>Click & drag to manually delineate damage zone (HITL Override)</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No Image Loaded</p>
            <p className="text-xs text-slate-500 mt-1">Select a preset or upload satellite imagery to begin.</p>
          </div>
        )}
      </div>

      {/* Quick Sample Switcher Strip */}
      <div className="border-t border-slate-800 bg-slate-950/70 px-3 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-orange-400" /> Samples:
        </span>
        <div className="flex items-center gap-1.5">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onQuickSampleSelect && onQuickSampleSelect(sample)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/70 hover:bg-slate-800 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                sample.category === 'Flood' ? 'bg-blue-400' :
                sample.category === 'Earthquake' ? 'bg-amber-400' :
                sample.category === 'Hurricane' ? 'bg-cyan-400' :
                sample.category === 'Wildfire' ? 'bg-rose-400' : 'bg-emerald-400'
              }`} />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Evidence Tags and Findings Drawer */}
      {evidenceList.length > 0 && (
        <div className="border-t border-slate-700/60 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Tag className="h-3.5 w-3.5 text-orange-400" />
            <span>AI Identified Visual Evidence:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {evidenceList.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="border-t border-slate-800 bg-slate-950/40 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300">Severity Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px]">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-[11px]">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-[11px]">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
