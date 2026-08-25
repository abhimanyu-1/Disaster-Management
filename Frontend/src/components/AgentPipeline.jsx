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
  Download
} from 'lucide-react';

export default function AgentPipeline({ assessment }) {
  if (!assessment) {
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

  const vision = assessment.vision;
  const geo = assessment.geo_context;
  const sev = assessment.assessment;
  const claim = assessment.claim_analysis;
  const priority = assessment.priority;
  const verification = assessment.verification;
  const decision = assessment.final_decision;

  return (
    <div className="space-y-3 font-mono text-xs">
      
      {/* Pipeline Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-400" />
          <h3 className="font-bold uppercase tracking-wider text-slate-200">
            Multi-Agent Telemetry & Decision Tree
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded">
            ID: {assessment.assessment_id}
          </span>
          <a
            href={`http://localhost:8000/api/assessments/${assessment.assessment_id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-900/80 transition-colors font-bold tracking-wider"
          >
            <Download className="h-3 w-3" />
            EXPORT PDF
          </a>
        </div>
      </div>

      {/* Grid of 6 Real Backend Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Agent 01: Vision Agent */}
        <div className="rounded-xl border border-blue-500/30 bg-[#0E1626]/90 p-3.5 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-blue-400">Agent 01</span>
                  <h4 className="font-bold text-slate-200 text-xs">Vision Analysis</h4>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                Gemini Vision
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
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
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" 
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
          </div>
        </div>

        {/* Agent 02: SAM Spatial Refinement */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0E1626]/90 p-3.5 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Crosshair className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-cyan-400">Agent 02</span>
                  <h4 className="font-bold text-slate-200 text-xs">SAM Localization</h4>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                Segment Anything
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Box Status:</span>
                <span className="font-bold text-emerald-400">Refined ROI</span>
              </div>

              <div className="p-2 rounded-lg bg-[#080D18] border border-slate-800 text-[10px] space-y-0.5">
                <span className="text-slate-500 block uppercase font-bold">Bounding Coordinates [0..1000]</span>
                <p className="font-mono text-cyan-300">
                  [{vision.bounding_boxes && vision.bounding_boxes.length > 0 ? vision.bounding_boxes[0].map(n => Math.round(n)).join(', ') : '0, 0, 0, 0'}]
                </p>
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-400">Spatial Precision:</span>
                <span className="font-bold text-slate-200">Sub-Pixel Tight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent 03: Geo Agent */}
        <div className="rounded-xl border border-emerald-500/30 bg-[#0E1626]/90 p-3.5 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-emerald-400">Agent 03</span>
                  <h4 className="font-bold text-slate-200 text-xs">Geo Context</h4>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                GIS Engine
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Population:</span>
                <span className="font-bold text-white">{geo.population_affected.toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Criticality Index:</span>
                  <span className="font-bold text-emerald-400">{geo.criticality}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
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
          </div>
        </div>

        {/* Agent 04: Claim Fraud Agent */}
        <div className="rounded-xl border border-purple-500/30 bg-[#0E1626]/90 p-3.5 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-purple-400">Agent 04</span>
                  <h4 className="font-bold text-slate-200 text-xs">Claim Triage</h4>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                Fraud Engine
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
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
                <span className="font-bold text-slate-200">{sev.severity} ({sev.severity_score})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent 05: Priority Dispatch Agent */}
        <div className="rounded-xl border border-rose-500/30 bg-[#0E1626]/90 p-3.5 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-rose-400">Agent 05</span>
                  <h4 className="font-bold text-slate-200 text-xs">Priority Dispatch</h4>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                Triage Matrix
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
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
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500 rounded-full" 
                    style={{ width: `${Math.min(priority.score * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent 06: Verification & Guardrails */}
        <div className="rounded-xl border border-amber-500/30 bg-[#0E1626]/90 p-3.5 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-amber-400">Agent 06</span>
                  <h4 className="font-bold text-slate-200 text-xs">HITL Guardrail</h4>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                Gatekeeper
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Review Required:</span>
                <span className={`font-bold ${verification.required ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {verification.required ? 'YES (Triggered)' : 'NO (Auto-Approved)'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recommended Action:</span>
                <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
                  {decision.recommended_action?.replace(/_/g, ' ') || 'NONE'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Final Decision:</span>
                <span className="font-bold text-orange-400">{decision.status}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
