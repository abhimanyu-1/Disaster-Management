import { useState, useRef } from 'react';
import { 
  Columns, 
  Split, 
  Layers, 
  Crosshair, 
  RotateCcw 
} from 'lucide-react';

export default function DualSatelliteViewer({ 
  preImageUrl, 
  postImageUrl, 
  assessment, 
  isProcessing, 
  userBBox, 
  setUserBBox 
}) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'curtain' | 'overlay'
  const [curtainPos, setCurtainPos] = useState(50); // 0 to 100%
  const [isCurtainDragging, setIsCurtainDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const postContainerRef = useRef(null);

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
    if (!postContainerRef.current) return;
    const rect = postContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 1000;
    setIsDrawing(true);
    setDragStart({ x, y });
    setUserBBox([y, x, y, x]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !postContainerRef.current) return;
    const rect = postContainerRef.current.getBoundingClientRect();
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

  const handleCurtainMove = (e) => {
    if (!isCurtainDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setCurtainPos((x / rect.width) * 100);
  };

  const aiBBox = assessment?.vision?.bounding_box;
  const damageDetected = assessment?.vision?.damage_detected;
  const damageType = assessment?.vision?.damage_type || 'Damage';
  const confidence = assessment?.vision?.confidence !== undefined 
    ? (assessment.vision.confidence * 100).toFixed(0) 
    : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0E1626]/80 p-4 shadow-2xl flex flex-col space-y-3">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <h2 className="font-mono text-xs font-black uppercase tracking-widest text-slate-200">
            DUAL-SATELLITE OPTICAL FEED
          </h2>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1.5 bg-[#080D18] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="h-3 w-3" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('curtain')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold transition cursor-pointer ${
              viewMode === 'curtain'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="h-3 w-3" />
            <span>Swipe Curtain</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[11px] font-bold transition cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Overlay Only</span>
          </button>
        </div>
      </div>

      {/* Main Imagery Display */}
      <div className="relative min-h-[440px] md:min-h-[520px] bg-[#080D18] rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
        
        {/* Mode 1: Split View */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 w-full h-[440px] md:h-[520px] divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Pre-Event Baseline */}
            <div className="relative h-full w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 rounded border border-blue-500/40 bg-[#080D18]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-300 backdrop-blur">
                PRE-EVENT BASELINE
              </div>
              <img
                src={preImageUrl || '/samples/before.jpg'}
                alt="Pre Disaster Baseline"
                className="h-full w-full object-cover pointer-events-none"
                draggable="false"
              />
            </div>

            {/* Post-Event AI Damage */}
            <div 
              ref={postContainerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative h-full w-full overflow-hidden bg-slate-950 flex items-center justify-center cursor-crosshair touch-none"
            >
              <div className="absolute top-3 left-3 z-10 rounded border border-orange-500/40 bg-[#080D18]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-orange-300 backdrop-blur">
                POST-EVENT AI DAMAGE
              </div>

              {/* Floating Damage Classes Legend */}
              <div className="absolute top-3 right-3 z-20 rounded-xl border border-slate-700/80 bg-[#080D18]/95 p-3 shadow-2xl backdrop-blur font-mono text-[11px]">
                <p className="mb-2 font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>DAMAGE CLASSES</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                </p>
                <div className="space-y-1.5 text-[10px] font-medium">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">No Damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-300">Minor Damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span className="text-slate-300">Major Damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-300">Destroyed</span>
                  </div>
                </div>
              </div>

              {/* Image */}
              <img
                src={postImageUrl || '/samples/earthquake.jpg'}
                alt="Post Disaster AI Damage"
                className="h-full w-full object-cover pointer-events-none"
                draggable="false"
              />

              {/* Scanning Beam Animation during processing */}
              {isProcessing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden bg-orange-950/20">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] animate-scanline" />
                </div>
              )}

              {/* AI Bounding Box */}
              {damageDetected && aiBBox && !userBBox && (
                <div
                  className="absolute border-[2.5px] border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(239,68,68,0.5)] pointer-events-none"
                  style={getBoxStyle(aiBBox)}
                >
                  <div className="absolute -top-7 left-[-2px] bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                    {damageType.toUpperCase()} DETECTED
                  </div>
                  {confidence && (
                    <div className="absolute -bottom-6 right-[-2px] bg-slate-950 text-rose-400 border border-rose-500/50 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {confidence}% CONFIDENCE
                    </div>
                  )}
                </div>
              )}

              {/* User Drawn HITL Box */}
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

              {/* Bottom bar helper */}
              <div className="absolute bottom-3 left-3 bg-[#080D18]/90 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pointer-events-none backdrop-blur">
                <Crosshair className="h-3 w-3 text-orange-400" />
                <span>Click & drag to manually override bbox</span>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Swipe Curtain */}
        {viewMode === 'curtain' && (
          <div 
            onMouseDown={() => setIsCurtainDragging(true)}
            onMouseUp={() => setIsCurtainDragging(false)}
            onMouseLeave={() => setIsCurtainDragging(false)}
            onMouseMove={handleCurtainMove}
            className="relative w-full h-[440px] md:h-[520px] overflow-hidden cursor-ew-resize select-none"
          >
            {/* Background Post-Image */}
            <img
              src={postImageUrl || '/samples/earthquake.jpg'}
              alt="Post Disaster"
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              draggable="false"
            />

            {/* Foreground Pre-Image clipped by curtainPos */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden" 
              style={{ width: `${curtainPos}%` }}
            >
              <img
                src={preImageUrl || '/samples/before.jpg'}
                alt="Pre Disaster"
                className="absolute inset-y-0 left-0 h-full max-w-none object-cover pointer-events-none"
                style={{ width: '100vw', height: '100%' }}
                draggable="false"
              />
            </div>

            {/* Curtain Divider Line */}
            <div 
              className="absolute inset-y-0 w-1 bg-orange-500 shadow-[0_0_15px_#f97316]"
              style={{ left: `${curtainPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 h-8 w-8 rounded-full bg-orange-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold font-mono">
                ⇄
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 z-10 rounded bg-[#080D18]/90 border border-blue-500/40 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-300">
              PRE-EVENT
            </div>
            <div className="absolute top-3 right-3 z-10 rounded bg-[#080D18]/90 border border-orange-500/40 px-2.5 py-1 font-mono text-[10px] font-bold text-orange-300">
              POST-EVENT
            </div>
          </div>
        )}

        {/* Mode 3: Overlay Only */}
        {viewMode === 'overlay' && (
          <div className="relative w-full h-[440px] md:h-[520px] overflow-hidden flex items-center justify-center">
            <img
              src={postImageUrl || '/samples/earthquake.jpg'}
              alt="Overlay Damage Feed"
              className="h-full w-full object-cover pointer-events-none"
              draggable="false"
            />
            {damageDetected && aiBBox && (
              <div
                className="absolute border-[3px] border-rose-500 bg-rose-500/20 shadow-[0_0_25px_rgba(239,68,68,0.6)] pointer-events-none"
                style={getBoxStyle(aiBBox)}
              >
                <div className="absolute -top-7 left-0 bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {damageType.toUpperCase()} OVERLAY
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Clear HITL override button if drawn */}
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
    </div>
  );
}
