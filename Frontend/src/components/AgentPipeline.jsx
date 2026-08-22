import { 
  Bot, 
  Eye, 
  MapPin, 
  FileCheck, 
  AlertOctagon, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function AgentPipeline({ assessment }) {
  if (!assessment) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800">
        <Bot className="h-10 w-10 text-slate-600 mx-auto mb-2 animate-bounce" />
        <h4 className="text-sm font-bold text-slate-300">Multi-Agent Pipeline Idle</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Launch an assessment from Mission Control to orchestrate Vision, Geo, Claim Fraud, and Priority agents in real-time.
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
    <div className="space-y-4">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Multi-Agent Telemetry & Decision Tree
          </h3>
        </div>
        <span className="font-mono text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
          ID: {assessment.assessment_id}
        </span>
      </div>

      {/* Grid of Agent Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        
        {/* 1. Vision Agent */}
        <div className="glass-card rounded-xl p-4 border border-blue-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Agent 01</span>
                  <h4 className="text-xs font-bold text-slate-200">Vision Analysis</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                Gemini Vision
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Disaster Type:</span>
                <span className="font-bold text-white uppercase">{vision.damage_type}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Damage Score:</span>
                  <span className="font-mono font-bold text-orange-400">{vision.damage_score}</span>
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
                <span className="font-mono text-emerald-400 font-semibold">
                  {(vision.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Geo Agent */}
        <div className="glass-card rounded-xl p-4 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Agent 02</span>
                  <h4 className="text-xs font-bold text-slate-200">Geo Context</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                GIS Registry
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Affected Population:</span>
                <span className="font-mono font-bold text-white">{geo.population_affected.toLocaleString()}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Criticality Index:</span>
                  <span className="font-mono font-bold text-emerald-400">{geo.criticality}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(geo.criticality * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Flood Zone:</span>
                <span className={`font-semibold ${geo.flood_zone ? 'text-amber-400' : 'text-slate-400'}`}>
                  {geo.flood_zone ? '⚠️ High Risk Zone' : 'Standard Terrain'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Claim & Fraud Agent */}
        <div className="glass-card rounded-xl p-4 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Agent 03</span>
                  <h4 className="text-xs font-bold text-slate-200">Claim Verification</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                Fraud Engine
              </span>
            </div>

            <div className="space-y-2 text-xs">
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
                  claim.risk === 'HIGH' 
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/40' 
                    : claim.risk === 'MEDIUM'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
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

        {/* 4. Priority Dispatch Agent */}
        <div className="glass-card rounded-xl p-4 border border-rose-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Agent 04</span>
                  <h4 className="text-xs font-bold text-slate-200">Relief Prioritization</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                Dispatch
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Priority Level:</span>
                <span className={`font-black uppercase text-sm ${
                  priority.level === 'CRITICAL' ? 'text-rose-400' :
                  priority.level === 'HIGH' ? 'text-orange-400' :
                  priority.level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {priority.level}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Priority Score:</span>
                  <span className="font-mono font-bold text-white">{priority.score}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(priority.score * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Verification & Recommendation */}
        <div className="glass-card rounded-xl p-4 border border-amber-500/30 flex flex-col justify-between md:col-span-2 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Agent 05</span>
                  <h4 className="text-xs font-bold text-slate-200">Verification Engine & Final Action</h4>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                HITL Gatekeeper
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Verification Status:</span>
                <span className={`font-bold inline-flex items-center gap-1.5 ${
                  verification.required ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {verification.required ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {verification.required ? 'Human Review Required' : 'Auto-Approve Eligible'}
                </span>
              </div>

              <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Recommended Action:</span>
                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 inline-block">
                  {decision.recommended_action?.replace(/_/g, ' ') || 'NONE'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
