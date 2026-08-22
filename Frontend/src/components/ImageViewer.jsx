import { useState, useRef } from 'react';
import { 
  Crosshair, 
  RotateCcw, 
  ImageIcon,
  Eye
} from 'lucide-react';

export default function ImageViewer({ 
  imageUrl, 
  assessment, 
  isProcessing, 
  userBBox, 
  setUserBBox 
}) {
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
    if (!containerRef.current || !imageUrl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 1000;
    setIsDrawing(true);
    setDragStart({ x, y });
    setUserBBox([y, x, y, x]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !containerRef.current || !imageUrl) return;
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
    <div className="rounded-2xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl flex flex-col space-y-3 font-mono text-xs">
      
      {/* Viewer Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-orange-400" />
          <h2 className="font-bold uppercase tracking-wider text-slate-200">
            02 Spatial Damage Localization & Visual Feed
          </h2>
        </div>

        {severity && (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            severity === 'CRITICAL' || severity === 'HIGH'
              ? 'bg-rose-950 border border-rose-500/60 text-rose-300'
              : severity === 'MEDIUM'
              ? 'bg-amber-950 border border-amber-500/60 text-amber-300'
              : 'bg-emerald-950 border border-emerald-500/60 text-emerald-300'
          }`}>
            {severity} SEVERITY
          </span>
        )}
      </div>

      {/* Main Image Canvas Container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-full h-[420px] md:h-[500px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center select-none ${
          imageUrl ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Disaster Scene"
              className="h-full w-full object-cover pointer-events-none"
              draggable="false"
            />

            {/* Processing Scanline Animation */}
            {isProcessing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden bg-orange-950/20">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] animate-scanline" />
              </div>
            )}

            {/* AI / SAM Refined Bounding Box */}
            {damageDetected && aiBBox && !userBBox && (
              <div
                className="absolute border-[2.5px] border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(239,68,68,0.5)] pointer-events-none"
                style={getBoxStyle(aiBBox)}
              >
                <div className="absolute -top-7 left-[-2px] bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                  <span>{damageType.toUpperCase()} (SAM REFINED)</span>
                </div>
                {confidence && (
                  <div className="absolute -bottom-6 right-[-2px] bg-slate-950 text-rose-400 border border-rose-500/50 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {confidence}% CONFIDENCE
                  </div>
                )}
              </div>
            )}

            {/* User Drawn HITL Override Box */}
            {userBBox && (
              <div
                className="absolute border-[2.5px] border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.5)] pointer-events-none"
                style={getBoxStyle(userBBox)}
              >
                <div className="absolute -top-7 left-[-2px] bg-amber-500 text-slate-950 font-mono text-[10px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                  HITL OVERRIDE
                </div>
              </div>
            )}

            {/* Helper Badge */}
            <div className="absolute bottom-3 left-3 bg-[#080D18]/90 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pointer-events-none backdrop-blur">
              <Crosshair className="h-3 w-3 text-orange-400" />
              <span>Click & drag to draw manual HITL ROI override</span>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">
                Awaiting Disaster Image Ingestion
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload a disaster image on the left panel and click &ldquo;Execute Assessment&rdquo; to visualize damage localization.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reset HITL Override Button */}
      {userBBox && (
        <div className="flex justify-end">
          <button
            onClick={() => setUserBBox(null)}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset HITL Bounding Box</span>
          </button>
        </div>
      )}

      {/* Vision Evidence Tags returned from backend */}
      {evidenceList.length > 0 && (
        <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Vision Agent Detected Evidence:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {evidenceList.map((ev, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]"
              >
                • {ev}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
