import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Flame, 
  CheckCircle, 
  Search, 
  XCircle,
  Activity,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  Building2,
  FileCheck,
  Download
} from 'lucide-react';
import { api } from '../services/api';

export default function CrisisSeverityIndex({ 
  assessment, 
  inferenceTime,
  onVerificationUpdated
}) {
  const [localStatus, setLocalStatus] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Reset local state whenever a new assessment is loaded
  useEffect(() => {
    setLocalStatus(null);
    setFeedback(null);
  }, [assessment?.assessment_id]);

  const priorityScore = assessment?.priority?.score !== undefined 
    ? Math.round(assessment.priority.score * 100) 
    : null;

  const priorityLevel = assessment?.priority?.level || 'STANDBY';
  const severityLevel = assessment?.assessment?.severity || 'STANDBY';
  const damageScore = assessment?.vision?.damage_score ?? 0;

  const handleUpdateStatus = (newStatus) => {
    setLocalStatus(newStatus);
    setFeedback({ type: 'success', text: `HITL Decision Recorded: ${newStatus}` });
    if (onVerificationUpdated) {
      onVerificationUpdated(newStatus);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const getThreatColor = () => {
    if (priorityLevel === 'CRITICAL') return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/50' };
    if (priorityLevel === 'HIGH') return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/50' };
    if (priorityLevel === 'MEDIUM') return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/50' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/50' };
  };

  const threat = getThreatColor();
  const currentStatus = localStatus === 'CHANGE_MODE' 
    ? 'REVIEW_REQUIRED' 
    : (localStatus || assessment?.final_decision?.status || 'AWAITING_TRIGGER');

  const isActioned = localStatus !== 'CHANGE_MODE' && ['APPROVED', 'FIELD_INSPECTION', 'REJECTED'].includes(
    localStatus || (assessment?.final_decision?.status && !['REVIEW_REQUIRED', 'PENDING', 'AUTO_APPROVED', 'AWAITING_TRIGGER'].includes(assessment.final_decision.status) ? assessment.final_decision.status : null)
  );

  return (
    <aside className="rounded-2xl border border-slate-800 bg-[#0E1626]/90 p-4 shadow-2xl flex flex-col space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-400" />
          <h2 className="font-bold uppercase tracking-wider text-slate-200">
            03 Crisis Severity Index
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 bg-[#080D18] border border-slate-800 px-2 py-0.5 rounded">
          Multi-Factor Triage
        </span>
      </div>

      {/* Emergency Threat Score Display */}
      <div className="rounded-xl border border-slate-800 bg-[#080D18] p-4 flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Emergency Threat Index
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">
              {priorityScore !== null ? priorityScore : '—'}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-bold">
            <span className={`h-2 w-2 rounded-full ${threat.bg} animate-pulse`} />
            <span className={threat.text}>{priorityLevel} PRIORITY</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Damage Severity
          </span>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
            severityLevel === 'HIGH' || severityLevel === 'CRITICAL'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
              : severityLevel === 'MEDIUM'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
          }`}>
            {severityLevel}
          </span>
        </div>
      </div>

      {/* Damage Score Progress Meter */}
      <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-slate-400 uppercase">Vision Damage Score:</span>
          <span className="text-orange-400 font-mono">{(damageScore * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(damageScore * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Core Backend Fields Grid */}
      {assessment && (
        <div className="space-y-2">
          
          {/* Geo Context Summary */}
          <div className="p-2.5 rounded-xl bg-[#080D18] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Affected Population</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {assessment.geo_context?.population_affected?.toLocaleString() || '0'} residents
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Criticality</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {assessment.geo_context?.criticality}
              </span>
            </div>
          </div>

          {/* Claim Risk & Consistency */}
          <div className="p-2.5 rounded-xl bg-[#080D18] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Claim Consistency</span>
              <span className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${
                assessment.claim_analysis?.consistent ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {assessment.claim_analysis?.consistent ? '✓ Evidence Aligns' : '⚠️ Discrepancy Found'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Claim Risk</span>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                assessment.claim_analysis?.risk === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                assessment.claim_analysis?.risk === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {assessment.claim_analysis?.risk} RISK
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Latency & Telemetry */}
      {inferenceTime && (
        <div className="p-2.5 rounded-xl bg-[#080D18] border border-slate-800 flex items-center justify-between text-slate-400">
          <span>Inference Latency:</span>
          <span className="font-bold text-cyan-400 font-mono">{inferenceTime}s</span>
        </div>
      )}

      {/* Human-In-The-Loop Dispatch Console */}
      {assessment && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>HITL DISPATCH ACTIONS</span>
            <span className="text-orange-400 font-mono">{currentStatus}</span>
          </div>

          {isActioned ? (
            <div className="space-y-2 pt-0.5">
              <a
                href={`${api.getBaseUrl()}/api/assessments/${assessment.assessment_id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 text-white font-bold transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer text-[11px] tracking-wider uppercase group"
              >
                <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Export Assessment PDF</span>
              </a>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Action: <b className={
                    currentStatus === 'APPROVED' ? 'text-emerald-400' :
                    currentStatus === 'FIELD_INSPECTION' ? 'text-blue-400' :
                    'text-rose-400'
                  }>{currentStatus}</b></span>
                </span>
                <button
                  type="button"
                  onClick={() => setLocalStatus('CHANGE_MODE')}
                  className="text-slate-400 hover:text-slate-200 underline decoration-slate-600 hover:decoration-slate-300 transition-colors cursor-pointer"
                >
                  Change Decision
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => handleUpdateStatus('APPROVED')}
                className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('FIELD_INSPECTION')}
                className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/50 text-blue-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Inspect</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('REJECTED')}
                className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {feedback && (
            <p className="text-[10px] text-center text-emerald-400 font-bold pt-1">
              ✓ {feedback.text}
            </p>
          )}
        </div>
      )}

    </aside>
  );
}
