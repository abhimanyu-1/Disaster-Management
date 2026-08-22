import { useState } from 'react';
import { 
  UserCheck, 
  CheckCircle, 
  Search, 
  XCircle, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function VerificationConsole({ assessment, onVerificationUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!assessment) return null;

  const currentStatus = assessment.final_decision?.status || 'PENDING';
  const assessmentId = assessment.assessment_id;

  const handleUpdateStatus = async (newStatus) => {
    if (!assessmentId) return;
    setIsUpdating(true);
    setStatusMessage(null);
    try {
      const updated = await api.updateVerification(assessmentId, newStatus);
      setStatusMessage({ type: 'success', text: `Status updated to ${newStatus}` });
      if (onVerificationUpdated) {
        onVerificationUpdated(updated);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update status' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'AUTO_APPROVED':
        return 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
      case 'REVIEW_REQUIRED':
      case 'PENDING':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      case 'FIELD_INSPECTION':
      case 'FIELD_INSPECTION_ORDERED':
        return 'bg-blue-950/80 border-blue-500/60 text-blue-300';
      case 'REJECTED':
        return 'bg-rose-950/80 border-rose-500/60 text-rose-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-xl border border-slate-700/60 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            HITL Verification Console
          </h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${getStatusBadge(currentStatus)}`}>
          {currentStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Review multi-agent evidence and record official human response decision to the database:
      </p>

      {/* Decision Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => handleUpdateStatus('APPROVED')}
          disabled={isUpdating}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/50 p-2.5 text-xs font-bold text-emerald-300 transition hover:shadow-lg hover:shadow-emerald-950/50 disabled:opacity-50"
        >
          {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
          <span>Approve Relief</span>
        </button>

        <button
          onClick={() => handleUpdateStatus('FIELD_INSPECTION')}
          disabled={isUpdating}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/50 p-2.5 text-xs font-bold text-blue-300 transition hover:shadow-lg hover:shadow-blue-950/50 disabled:opacity-50"
        >
          {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5 text-blue-400" />}
          <span>Order Field Inspection</span>
        </button>

        <button
          onClick={() => handleUpdateStatus('REJECTED')}
          disabled={isUpdating}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/50 p-2.5 text-xs font-bold text-rose-300 transition hover:shadow-lg hover:shadow-rose-950/50 disabled:opacity-50"
        >
          {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5 text-rose-400" />}
          <span>Reject / Flag</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
