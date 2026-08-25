import { 
  Eye, 
  MapPin, 
  FileCheck, 
  AlertOctagon, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Zap,
  Bot,
  Crosshair,
  Loader2,
  Activity,
  Sparkles
} from 'lucide-react';

export default function AgentPipeline({ 
  assessment, 
  isProcessing = false, 
  pipelineState = null 
}) {
  if (!assessment && !isProcessing) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0E1626]/60 p-6 text-center font-mono">
        <Bot className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-bounce" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Multi-Agent Telemetry Awaiting Ingestion
        </h4>
        <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
          Execute an assessment from Mission Control to orchestrate Gemini Vision, SAM Spatial Localization, Geo Context, Claim Fraud, and Relief Priority agents.
        </p>
      </div>
    );
  }

  const vision = assessment?.vision;
  const geo = assessment?.geo_context;
  const sev = assessment?.assessment;
  const claim = assessment?.claim_analysis;
  const priority = assessment?.priority;
  const verification = assessment?.verification;
  const decision = assessment?.final_decision;

  const completedSet = new Set(pipelineState?.completedAgents || []);
  if (!isProcessing && assessment) {
    if (vision) completedSet.add('vision');
    if (vision?.bounding_boxes) completedSet.add('sam');
    if (geo) completedSet.add('geo');
    if (claim) completedSet.add('claim');
    if (priority) completedSet.add('priority');
    if (verification || decision) completedSet.add('verification');
  }

  const isStepCompleted = (key) => completedSet.has(key);
  const isStepActive = (key) => isProcessing && pipelineState?.activeAgent === key;

  const pipelineSteps = [
    { key: 'vision', num: '01', name: 'Vision', model: 'Gemini Vision' },
    { key: 'sam', num: '02', name: 'SAM', model: 'Segment Anything' },
    { key: 'geo', num: '03', name: 'Geo', model: 'GIS Context' },
    { key: 'claim', num: '04', name: 'Claim', model: 'Fraud Engine' },
    { key: 'priority', num: '05', name: 'Priority', model: 'Triage Matrix' },
    { key: 'verification', num: '06', name: 'Guardrail', model: 'HITL Gatekeeper' },
  ];

  return (
    <div className="space-y-3 font-mono text-xs">
      
      {/* Pipeline Header with Real-time Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${isProcessing ? 'text-amber-400 animate-pulse' : 'text-orange-400'}`} />
          <h3 className="font-bold uppercase tracking-wider text-slate-200">
            Multi-Agent Telemetry & Decision Tree
          </h3>
        </div>
        <div className="flex items-center gap-2.5">
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded animate-pulse font-bold">
              <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
              <span>STEP {pipelineState?.activeStep || 1}/6: {pipelineState?.activeName || 'PROCESSING'}</span>
            </span>
          )}
          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded">
            ID: {assessment?.assessment_id || 'ASM-STREAM'}
          </span>
        </div>
      </div>

      {/* Progressive Stepper Bar */}
      {isProcessing && (
        <div className="rounded-xl bg-[#080D18] border border-slate-800 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>{pipelineState?.message || 'Orchestrating agents...'}</span>
            </span>
            <span className="text-orange-400 font-bold">
              {Math.round((completedSet.size / 6) * 100)}% COMPLETE
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {pipelineSteps.map((s) => {
              const done = isStepCompleted(s.key);
              const active = isStepActive(s.key);
              return (
                <div 
                  key={s.key}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    done ? 'bg-emerald-500' :
                    active ? 'bg-amber-400 animate-pulse' :
                    'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of 6 Real Backend Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Agent 01: Vision Agent */}
        <div className={`rounded-xl transition-all duration-300 p-3.5 flex flex-col justify-between space-y-2 ${
          isStepActive('vision')
            ? 'border-2 border-blue-400 bg-[#0E1626] shadow-lg shadow-blue-500/20 scale-[1.01]'
            : isStepCompleted('vision')
            ? 'border border-blue-500/30 bg-[#0E1626]/90'
            : 'border border-slate-800/60 bg-[#0A101D]/40 opacity-50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isStepActive('vision') ? 'bg-blue-900 border border-blue-400 text-blue-200 animate-pulse' :
                  isStepCompleted('vision') ? 'bg-blue-950/80 border border-blue-500/40 text-blue-400' :
                  'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-blue-400">Agent 01</span>
                  <h4 className="font-bold text-slate-200 text-xs">Vision Analysis</h4>
                </div>
              </div>
              {isStepActive('vision') ? (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-400 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Ingesting
                </span>
              ) : isStepCompleted('vision') ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> Gemini Vision
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Queued</span>
              )}
            </div>

            {isStepCompleted('vision') && vision ? (
              <div className="space-y-1.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Damage Detected:</span>
                  <span className={`font-bold ${vision.damage_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {vision.damage_detected ? 'YES' : 'NO'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Disaster Type:</span>
                  <span className="font-bold text-white uppercase">{vision.damage_type}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Damage Score:</span>
                    <span className="font-bold text-orange-400">{vision.damage_score}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700" 
                      style={{ width: `${Math.min(vision.damage_score * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-bold text-emerald-400">
                    {(vision.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 text-[11px] italic">
                {isStepActive('vision') ? 'Optical scan & feature extraction in progress...' : 'Awaiting mission trigger...'}
              </div>
            )}
          </div>
        </div>

        {/* Agent 02: SAM Spatial Refinement */}
        <div className={`rounded-xl transition-all duration-300 p-3.5 flex flex-col justify-between space-y-2 ${
          isStepActive('sam')
            ? 'border-2 border-cyan-400 bg-[#0E1626] shadow-lg shadow-cyan-500/20 scale-[1.01]'
            : isStepCompleted('sam')
            ? 'border border-cyan-500/30 bg-[#0E1626]/90'
            : 'border border-slate-800/60 bg-[#0A101D]/40 opacity-50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isStepActive('sam') ? 'bg-cyan-900 border border-cyan-400 text-cyan-200 animate-pulse' :
                  isStepCompleted('sam') ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-400' :
                  'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  <Crosshair className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-cyan-400">Agent 02</span>
                  <h4 className="font-bold text-slate-200 text-xs">SAM Localization</h4>
                </div>
              </div>
              {isStepActive('sam') ? (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Segmenting
                </span>
              ) : isStepCompleted('sam') ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> SAM Refined
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Queued</span>
              )}
            </div>

            {isStepCompleted('sam') ? (
              <div className="space-y-1.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Box Status:</span>
                  <span className="font-bold text-emerald-400">Refined ROI</span>
                </div>

                <div className="p-2 rounded-lg bg-[#080D18] border border-slate-800 text-[10px] space-y-0.5">
                  <span className="text-slate-500 block uppercase font-bold">Bounding Coordinates [0..1000]</span>
                  <p className="font-mono text-cyan-300">
                    [{vision?.bounding_boxes && vision.bounding_boxes.length > 0 ? vision.bounding_boxes[0].map(n => Math.round(n)).join(', ') : '0, 0, 0, 0'}]
                  </p>
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-400">Spatial Precision:</span>
                  <span className="font-bold text-slate-200">Sub-Pixel Tight</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 text-[11px] italic">
                {isStepActive('sam') ? 'Generating pixel-level mask & bounding ROI...' : 'Awaiting upstream vision box...'}
              </div>
            )}
          </div>
        </div>

        {/* Agent 03: Geo Agent */}
        <div className={`rounded-xl transition-all duration-300 p-3.5 flex flex-col justify-between space-y-2 ${
          isStepActive('geo')
            ? 'border-2 border-emerald-400 bg-[#0E1626] shadow-lg shadow-emerald-500/20 scale-[1.01]'
            : isStepCompleted('geo')
            ? 'border border-emerald-500/30 bg-[#0E1626]/90'
            : 'border border-slate-800/60 bg-[#0A101D]/40 opacity-50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isStepActive('geo') ? 'bg-emerald-900 border border-emerald-400 text-emerald-200 animate-pulse' :
                  isStepCompleted('geo') ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400' :
                  'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-emerald-400">Agent 03</span>
                  <h4 className="font-bold text-slate-200 text-xs">Geo Context</h4>
                </div>
              </div>
              {isStepActive('geo') ? (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-400 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Querying GIS
                </span>
              ) : isStepCompleted('geo') ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> GIS Ingested
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Queued</span>
              )}
            </div>

            {isStepCompleted('geo') && geo ? (
              <div className="space-y-1.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Population:</span>
                  <span className="font-bold text-white">{geo.population_affected?.toLocaleString() || '0'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Criticality Index:</span>
                    <span className="font-bold text-emerald-400">{geo.criticality}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                      style={{ width: `${Math.min(geo.criticality * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Flood Risk Zone:</span>
                  <span className={`font-semibold ${geo.flood_zone ? 'text-amber-400' : 'text-slate-400'}`}>
                    {geo.flood_zone ? '⚠️ Flood Zone' : 'Standard'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 text-[11px] italic">
                {isStepActive('geo') ? 'Querying geospatial databases & hazard maps...' : 'Awaiting coordinates ingestion...'}
              </div>
            )}
          </div>
        </div>

        {/* Agent 04: Claim Fraud Agent */}
        <div className={`rounded-xl transition-all duration-300 p-3.5 flex flex-col justify-between space-y-2 ${
          isStepActive('claim')
            ? 'border-2 border-purple-400 bg-[#0E1626] shadow-lg shadow-purple-500/20 scale-[1.01]'
            : isStepCompleted('claim')
            ? 'border border-purple-500/30 bg-[#0E1626]/90'
            : 'border border-slate-800/60 bg-[#0A101D]/40 opacity-50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isStepActive('claim') ? 'bg-purple-900 border border-purple-400 text-purple-200 animate-pulse' :
                  isStepCompleted('claim') ? 'bg-purple-950/80 border border-purple-500/40 text-purple-400' :
                  'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-purple-400">Agent 04</span>
                  <h4 className="font-bold text-slate-200 text-xs">Claim Triage</h4>
                </div>
              </div>
              {isStepActive('claim') ? (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-400 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Auditing Claim
                </span>
              ) : isStepCompleted('claim') ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> Audited
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Queued</span>
              )}
            </div>

            {isStepCompleted('claim') && claim ? (
              <div className="space-y-1.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Consistency:</span>
                  <span className={`font-bold flex items-center gap-1 ${claim.consistent ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {claim.consistent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {claim.consistent ? 'Consistent' : 'Mismatch'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Claim Risk:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    claim.risk === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                    claim.risk === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {claim.risk} RISK
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Damage Tier:</span>
                  <span className="font-bold text-slate-200">{sev?.severity || 'LOW'} ({sev?.severity_score ?? 0})</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 text-[11px] italic">
                {isStepActive('claim') ? 'Auditing field report & claim consistency...' : 'Awaiting severity calculation...'}
              </div>
            )}
          </div>
        </div>

        {/* Agent 05: Priority Dispatch Agent */}
        <div className={`rounded-xl transition-all duration-300 p-3.5 flex flex-col justify-between space-y-2 ${
          isStepActive('priority')
            ? 'border-2 border-rose-400 bg-[#0E1626] shadow-lg shadow-rose-500/20 scale-[1.01]'
            : isStepCompleted('priority')
            ? 'border border-rose-500/30 bg-[#0E1626]/90'
            : 'border border-slate-800/60 bg-[#0A101D]/40 opacity-50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isStepActive('priority') ? 'bg-rose-900 border border-rose-400 text-rose-200 animate-pulse' :
                  isStepCompleted('priority') ? 'bg-rose-950/80 border border-rose-500/40 text-rose-400' :
                  'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-rose-400">Agent 05</span>
                  <h4 className="font-bold text-slate-200 text-xs">Priority Dispatch</h4>
                </div>
              </div>
              {isStepActive('priority') ? (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-400 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Calculating
                </span>
              ) : isStepCompleted('priority') ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> Ranked
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Queued</span>
              )}
            </div>

            {isStepCompleted('priority') && priority ? (
              <div className="space-y-1.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Priority Level:</span>
                  <span className={`font-black uppercase ${
                    priority.level === 'CRITICAL' ? 'text-rose-400' :
                    priority.level === 'HIGH' ? 'text-orange-400' :
                    priority.level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {priority.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Priority Score:</span>
                    <span className="font-bold text-white">{priority.score}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500 rounded-full transition-all duration-700" 
                      style={{ width: `${Math.min(priority.score * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 text-[11px] italic">
                {isStepActive('priority') ? 'Synthesizing multi-variable priority score...' : 'Awaiting claim & geo outputs...'}
              </div>
            )}
          </div>
        </div>

        {/* Agent 06: Verification & Guardrails */}
        <div className={`rounded-xl transition-all duration-300 p-3.5 flex flex-col justify-between space-y-2 ${
          isStepActive('verification')
            ? 'border-2 border-amber-400 bg-[#0E1626] shadow-lg shadow-amber-500/20 scale-[1.01]'
            : isStepCompleted('verification')
            ? 'border border-amber-500/30 bg-[#0E1626]/90'
            : 'border border-slate-800/60 bg-[#0A101D]/40 opacity-50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isStepActive('verification') ? 'bg-amber-900 border border-amber-400 text-amber-200 animate-pulse' :
                  isStepCompleted('verification') ? 'bg-amber-950/80 border border-amber-500/40 text-amber-400' :
                  'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-amber-400">Agent 06</span>
                  <h4 className="font-bold text-slate-200 text-xs">HITL Guardrail</h4>
                </div>
              </div>
              {isStepActive('verification') ? (
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-400 animate-pulse">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Verifying Gates
                </span>
              ) : isStepCompleted('verification') ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> Gated
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Queued</span>
              )}
            </div>

            {isStepCompleted('verification') && (verification || decision) ? (
              <div className="space-y-1.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Review Required:</span>
                  <span className={`font-bold ${verification?.required ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {verification?.required ? 'YES (Triggered)' : 'NO (Auto-Approved)'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recommended Action:</span>
                  <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
                    {decision?.recommended_action?.replace(/_/g, ' ') || 'NONE'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Final Decision:</span>
                  <span className="font-bold text-orange-400">{decision?.status || 'REVIEW_REQUIRED'}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-600 text-[11px] italic">
                {isStepActive('verification') ? 'Executing confidence gates & HITL dispatch rules...' : 'Awaiting priority consensus...'}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
