import { useState, useRef, useEffect } from 'react';
import { 
  Crosshair, 
  RotateCcw, 
  ImageIcon,
  X,
  Save
} from 'lucide-react';

export default function ImageViewer({ 
  imageUrl, 
  assessment, 
  isProcessing,
  onSaveBBox
}) {
  const [editableBoxes, setEditableBoxes] = useState([]);
  const [dragState, setDragState] = useState({ mode: 'none' });
  const containerRef = useRef(null);

  // Initialize editable boxes when assessment finishes
  useEffect(() => {
    if (assessment?.vision?.bounding_boxes) {
      setEditableBoxes([...assessment.vision.bounding_boxes]);
    } else {
      setEditableBoxes([]);
    }
  }, [assessment]);

  const getCoords = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1000, ((e.clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(0, Math.min(1000, ((e.clientY - rect.top) / rect.height) * 1000));
    return { x, y };
  };

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

  const handleCanvasPointerDown = (e) => {
    if (isProcessing || !assessment || !imageUrl) return;
    const { x, y } = getCoords(e);
    setDragState({ mode: 'draw', startX: x, startY: y });
    setEditableBoxes([...editableBoxes, [y, x, y, x]]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleBoxPointerDown = (e, index) => {
    e.stopPropagation();
    if (isProcessing || !assessment) return;
    const { x, y } = getCoords(e);
    setDragState({ 
      mode: 'move', 
      boxIndex: index, 
      startX: x, 
      startY: y, 
      originalBox: [...editableBoxes[index]] 
    });
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handleHandlePointerDown = (e, index, hX, hY) => {
    e.stopPropagation();
    if (isProcessing || !assessment) return;
    const { x, y } = getCoords(e);
    setDragState({ 
      mode: 'resize', 
      boxIndex: index, 
      handleX: hX, 
      handleY: hY, 
      startX: x, 
      startY: y, 
      originalBox: [...editableBoxes[index]] 
    });
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (dragState.mode === 'none') return;
    const { x, y } = getCoords(e);

    if (dragState.mode === 'draw') {
      const newBoxes = [...editableBoxes];
      const i = newBoxes.length - 1;
      newBoxes[i] = [
        Math.min(dragState.startY, y),
        Math.min(dragState.startX, x),
        Math.max(dragState.startY, y),
        Math.max(dragState.startX, x),
      ];
      setEditableBoxes(newBoxes);
    } 
    else if (dragState.mode === 'move') {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;
      const box = dragState.originalBox;
      
      let newYmin = box[0] + dy;
      let newXmin = box[1] + dx;
      let newYmax = box[2] + dy;
      let newXmax = box[3] + dx;
      
      if (newXmin < 0) { newXmax -= newXmin; newXmin = 0; }
      if (newYmin < 0) { newYmax -= newYmin; newYmin = 0; }
      if (newXmax > 1000) { newXmin -= (newXmax - 1000); newXmax = 1000; }
      if (newYmax > 1000) { newYmin -= (newYmax - 1000); newYmax = 1000; }
      
      const newBoxes = [...editableBoxes];
      newBoxes[dragState.boxIndex] = [newYmin, newXmin, newYmax, newXmax];
      setEditableBoxes(newBoxes);
    } 
    else if (dragState.mode === 'resize') {
      const box = [...dragState.originalBox];
      if (dragState.handleY === -1) box[0] = Math.max(0, Math.min(box[2] - 10, y));
      if (dragState.handleX === -1) box[1] = Math.max(0, Math.min(box[3] - 10, x));
      if (dragState.handleY === 1) box[2] = Math.min(1000, Math.max(box[0] + 10, y));
      if (dragState.handleX === 1) box[3] = Math.min(1000, Math.max(box[1] + 10, x));
      
      const newBoxes = [...editableBoxes];
      newBoxes[dragState.boxIndex] = box;
      setEditableBoxes(newBoxes);
    }
  };

  const handlePointerUp = (e) => {
    setDragState({ mode: 'none' });
    try {
      if (containerRef.current && e.pointerId) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
  };

  const handleDeleteBox = (e, index) => {
    e.stopPropagation();
    setEditableBoxes(editableBoxes.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (assessment?.vision?.bounding_boxes) {
      setEditableBoxes([...assessment.vision.bounding_boxes]);
    } else {
      setEditableBoxes([]);
    }
  };

  const damageType = assessment?.vision?.damage_type || 'Damage';
  const confidence = assessment?.vision?.confidence !== undefined 
    ? (assessment.vision.confidence * 100).toFixed(0) 
    : null;
  const evidenceList = assessment?.vision?.evidence || [];
  const severity = assessment?.assessment?.severity;

  // Render resize handles
  const renderHandles = (idx) => {
    if (isProcessing) return null;
    const positions = [
      { top: '-4px', left: '-4px', cursor: 'nwse-resize', hX: -1, hY: -1 },
      { top: '-4px', right: '-4px', cursor: 'nesw-resize', hX: 1, hY: -1 },
      { bottom: '-4px', left: '-4px', cursor: 'nesw-resize', hX: -1, hY: 1 },
      { bottom: '-4px', right: '-4px', cursor: 'nwse-resize', hX: 1, hY: 1 },
      { top: '50%', left: '-4px', marginTop: '-4px', cursor: 'ew-resize', hX: -1, hY: 0 },
      { top: '50%', right: '-4px', marginTop: '-4px', cursor: 'ew-resize', hX: 1, hY: 0 },
      { left: '50%', top: '-4px', marginLeft: '-4px', cursor: 'ns-resize', hX: 0, hY: -1 },
      { left: '50%', bottom: '-4px', marginLeft: '-4px', cursor: 'ns-resize', hX: 0, hY: 1 },
    ];
    return positions.map((pos, i) => (
      <div
        key={i}
        onPointerDown={(e) => handleHandlePointerDown(e, idx, pos.hX, pos.hY)}
        className="absolute w-2.5 h-2.5 bg-amber-400 border border-slate-900 rounded-sm z-10 hover:scale-125 transition-transform"
        style={{ ...pos }}
      />
    ));
  };

  // Compare editableBoxes to original boxes to show unsaved changes state
  const hasChanges = JSON.stringify(editableBoxes) !== JSON.stringify(assessment?.vision?.bounding_boxes || []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl flex flex-col space-y-3 font-mono text-xs">
      
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

      <div 
        ref={containerRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative w-full h-[420px] md:h-[500px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center select-none ${
          imageUrl && assessment && !isProcessing ? 'cursor-crosshair' : 'cursor-default'
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

            {isProcessing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden bg-orange-950/20 z-20">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] animate-scanline" />
              </div>
            )}

            {/* Editable Bounding Boxes */}
            {editableBoxes.map((bbox, idx) => {
              const isEdited = hasChanges;
              const boxColor = isEdited ? 'amber' : 'rose';
              const label = isEdited ? 'HITL OVERRIDE' : `${damageType.toUpperCase()} (SAM REFINED)`;
              
              return (
                <div
                  key={idx}
                  onPointerDown={(e) => handleBoxPointerDown(e, idx)}
                  className={`absolute border-[2.5px] shadow-[0_0_20px_rgba(239,68,68,0.3)] ${
                    isProcessing ? 'pointer-events-none' : 'cursor-move hover:bg-white/10'
                  } group`}
                  style={{
                    ...getBoxStyle(bbox),
                    borderColor: isEdited ? '#fbbf24' : '#f43f5e',
                    backgroundColor: isEdited ? 'rgba(251,191,36,0.1)' : 'rgba(244,63,94,0.1)',
                  }}
                >
                  <div 
                    className="absolute -top-7 left-[-2.5px] text-slate-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1"
                    style={{ backgroundColor: isEdited ? '#fbbf24' : '#f43f5e', color: isEdited ? '#0f172a' : '#ffffff' }}
                  >
                    <span>{label}</span>
                  </div>
                  
                  {!isEdited && confidence && idx === 0 && (
                    <div className="absolute -bottom-6 right-[-2.5px] bg-slate-950 text-rose-400 border border-rose-500/50 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none">
                      {confidence}% CONFIDENCE
                    </div>
                  )}

                  {/* Delete Box Button */}
                  {!isProcessing && (
                    <button
                      onClick={(e) => handleDeleteBox(e, idx)}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Remove Box"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {renderHandles(idx)}
                </div>
              );
            })}

            <div className="absolute bottom-3 left-3 bg-[#080D18]/90 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-400 flex flex-col gap-0.5 pointer-events-none backdrop-blur">
              <div className="flex items-center gap-1.5">
                <Crosshair className="h-3 w-3 text-orange-400" />
                <span>{isProcessing ? 'Processing image...' : 'Click & drag canvas to draw. Drag boxes to move.'}</span>
              </div>
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

      {/* Action Buttons for HITL Override */}
      {hasChanges && !isProcessing && (
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Discard Edits</span>
          </button>
          
          <button
            onClick={() => onSaveBBox && onSaveBBox(editableBoxes)}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-1.5 rounded-lg transition cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.4)]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save HITL Adjustments</span>
          </button>
        </div>
      )}

      {evidenceList.length > 0 && (
        <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800 space-y-1.5 mt-2">
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
