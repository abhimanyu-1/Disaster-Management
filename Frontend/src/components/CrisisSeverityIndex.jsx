import { 
  Shield, 
  AlertTriangle, 
  Home, 
  Flame, 
  CheckCircle, 
  Search, 
  XCircle, 
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';

export default function CrisisSeverityIndex({ 
  assessment, 
  dashboardStats, 
  onSelectQueueItem, 
  onVerificationUpdated,
  inferenceTime 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  const priorityScore = assessment?.priority?.score !== undefined 
    ? Math.round(assessment.priority.score * 100) 
    : null;

  const priorityLevel = assessment?.priority?.level || 'LOW';

  // Damage percentage breakdown derived dynamically from backend damage_score / severity
  const damageScore = assessment?.vision?.damage_score ?? 0;
  
  let destroyedPct = 0;
  let majorPct = 0;
  let minorPct = 0;
  let noDamagePct = 100;

  if (damageScore > 0.8) {
    destroyedPct = Math.round(damageScore * 100);
    majorPct = Math.round((1 - damageScore) * 60);
    minorPct = Math.round((1 - damageScore) * 40);
    noDamagePct = 0;
  } else if (damageScore > 0.4) {
    majorPct = Math.round(damageScore * 100);
    minorPct = Math.round((1 - damageScore) * 50);
    noDamagePct = Math.max(0, 100 - majorPct - minorPct);
  } else if (damageScore > 0) {
    minorPct = Math.round(damageScore * 100);
    noDamagePct = Math.max(0, 100 - minorPct);
  }

  const handleUpdateStatus = async (status) => {
    if (!assessment?.assessment_id) return;
    setIsUpdating(true);
    setStatusFeedback(null);
    try {
      const updated = await api.updateVerification(assessment.assessment_id, status);
      setStatusFeedback({ type: 'success', text: `Recorded: ${status}` });
      if (onVerificationUpdated) onVerificationUpdated(updated);
    } catch (err) {
      setStatusFeedback({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  const getThreatStatus = () => {
    if (!assessment) return { text: 'STABLE / LOW IMPACT', color: 'text-emerald-400', dot: 'bg-emerald-500' };
    if (priorityLevel === 'CRITICAL') return { text: 'CRITICAL DISASTER', color: 'text-rose-400', dot: 'bg-rose-500' };
    if (priorityLevel === 'HIGH') return { text: 'HIGH THREAT LEVEL', color: 'text-orange-400', dot: 'bg-orange-500' };
    if (priorityLevel === 'MEDIUM') return { text: 'ELEVATED RISK', color: 'text-amber-400', dot: 'bg-amber-500' };
    return { text: 'STABLE / LOW IMPACT', color: 'text-emerald-400', dot: 'bg-emerald-500' };
  };

  const threatStatus = getThreatStatus();
  const queue = dashboardStats?.priority_queue || [];

  return (
    <aside className="rounded-xl border border-slate-800 bg-[#0E1626]/80 p-4 shadow-2xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <h2 className="font-mono text-xs font-black uppercase tracking-widest text-slate-200">
            CRISIS SEVERITY INDEX
          </h2>
        </div>
        <span className="font-mono text-[10px] text-slate-400 border border-slate-800 px-2 py-0.5 rounded bg-[#080D18]">
          Triage Level
        </span>
      </div>

      {/* Emergency Threat Score Section */}
      <div className="rounded-xl border border-slate-800 bg-[#080D18]/80 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              EMERGENCY THREAT SCORE
            </p>
            <div className="mt-1 flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-black text-white">
                {priorityScore !== null ? priorityScore : '—'}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="mt-2 flex items-center gap-2 font-mono text-[11px] font-bold">
              <span className={`h-2 w-2 rounded-full ${threatStatus.dot} animate-pulse`} />
              <span className={threatStatus.color}>{threatStatus.text}</span>
            </div>
          </div>

          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Shield className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* 2x2 Damage Breakdown Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* No Damage */}
        <div className="rounded-xl border border-slate-800 bg-[#080D18]/70 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              NO DAMAGE
            </span>
            <Shield className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                style={{ width: `${noDamagePct}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs font-bold text-emerald-400">
              {noDamagePct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Minor */}
        <div className="rounded-xl border border-slate-800 bg-[#080D18]/70 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              MINOR
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-700" 
                style={{ width: `${minorPct}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs font-bold text-amber-400">
              {minorPct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Major */}
        <div className="rounded-xl border border-slate-800 bg-[#080D18]/70 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              MAJOR
            </span>
            <Home className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-700" 
                style={{ width: `${majorPct}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs font-bold text-orange-400">
              {majorPct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Destroyed */}
        <div className="rounded-xl border border-slate-800 bg-[#080D18]/70 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              DESTROYED
            </span>
            <Flame className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-rose-600 rounded-full transition-all duration-700" 
                style={{ width: `${destroyedPct}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs font-bold text-rose-400">
              {destroyedPct.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Summary Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-800 py-3 font-mono">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL STRUCTURES
          </p>
          <p className="text-sm font-bold text-slate-200 mt-0.5">
            {assessment ? (assessment.geo_context?.population_affected || '1') : '—'}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            INFERENCE TIME
          </p>
          <p className="text-sm font-bold text-slate-200 mt-0.5">
            {inferenceTime ? `${inferenceTime}s` : '— s'}
          </p>
        </div>
      </div>

      {/* Ranked Response Sectors / Priority Queue from Backend DB */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              RANKED RESPONSE SECTORS
            </span>
          </div>
          <span className="font-mono text-[9px] text-slate-500 uppercase">
            {queue.length > 0 ? `${queue.length} Queued` : 'STANDBY'}
          </span>
        </div>

        {queue.length > 0 ? (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {queue.slice(0, 4).map((item, idx) => (
              <div
                key={item.assessment_id || idx}
                onClick={() => onSelectQueueItem && onSelectQueueItem(item.assessment_id)}
                className="p-2 rounded-lg border border-slate-800 bg-[#080D18] hover:border-slate-700 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer font-mono text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                  <span className="font-bold text-slate-200 truncate">{item.asset_id}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    item.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                    item.priority === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-500/40' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {item.priority}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-slate-800 bg-[#080D18]/50 text-center font-mono text-[10px] text-slate-500">
            Awaiting assessment trigger
          </div>
        )}
      </div>

      {/* HITL Quick Verification Actions */}
      {assessment && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
            <span>HITL DISPATCH ACTIONS</span>
            <span className="text-orange-400">{assessment.final_decision?.status || 'PENDING'}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => handleUpdateStatus('APPROVED')}
              disabled={isUpdating}
              className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="h-3 w-3" />
              <span>Approve</span>
            </button>

            <button
              onClick={() => handleUpdateStatus('FIELD_INSPECTION')}
              disabled={isUpdating}
              className="p-2 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/50 text-blue-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Search className="h-3 w-3" />
              <span>Inspect</span>
            </button>

            <button
              onClick={() => handleUpdateStatus('REJECTED')}
              disabled={isUpdating}
              className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="h-3 w-3" />
              <span>Reject</span>
            </button>
          </div>

          {statusFeedback && (
            <p className="text-[10px] font-mono text-center text-emerald-400 pt-1">
              ✓ {statusFeedback.text}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
